"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Send, XCircle, X } from "lucide-react"
import { callDifyApi, type DifyApiParams } from "@/lib/dify-api"
import { AppType } from "@/types/app-config"

interface ChatMessage {
  id: string
  content: string | object
  role: "user" | "assistant"
  timestamp: number
  isStreaming?: boolean
}

interface ChatContainerProps {
  appId: string
  appType?: AppType
  chatModel?: string
  className?: string
  messages?: ChatMessage[]
  isLoading?: boolean
  onSendMessage?: (message: string, files?: UploadedFile[]) => void
}

// 添加类型定义
interface ApiResponse {
  message_id: string;
  answer: string;
  conversation_id: string;
  event?: string;
}

interface RequestBody {
  message: string;
  conversation_id?: string;
  files?: UploadedFile[];
  stream?: boolean;
}

// 导入或定义 UploadedFile 接口
interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url?: string
  preview?: string
  uploadFileId?: string
  uploading?: boolean
  error?: string
}

export function ChatContainer({ 
  appId,
  appType = AppType.CHAT,
  chatModel = "sse",
  className = "",
  messages: externalMessages = [],
  isLoading: externalLoading = false,
  onSendMessage: externalSendMessage,
}: ChatContainerProps) {
  const { toast } = useToast()
  const [internalMessages, setInternalMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [internalLoading, setInternalLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 计算当前消息列表
  const messages = externalMessages.length > 0 ? externalMessages : internalMessages
  const isLoading = externalLoading || internalLoading

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 处理文件上传
  const handleFileUpload = (files: UploadedFile[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  // 处理文件删除
  const handleFileDelete = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    // 如果提供了外部发送消息方法，使用它
    if (externalSendMessage) {
      externalSendMessage(input.trim(), uploadedFiles)
      setInput("")
      setUploadedFiles([])
      return
    }

    // 验证文件状态
    const validFiles = uploadedFiles.filter(file => !file.error && !file.uploading)
    if (uploadedFiles.length > 0 && validFiles.length === 0) {
      toast({
        title: "文件上传错误",
        description: "请等待文件上传完成或删除上传失败的文件",
        variant: "destructive",
      })
      return
    }

    setInternalLoading(true)
    const userMessage = input.trim()
    setInput("")
    setUploadedFiles([])

    // 添加用户消息
    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: userMessage,
      role: "user",
      timestamp: Date.now(),
    }
    setInternalMessages((prev) => [...prev, newUserMessage])

    // 如果是流式响应，先添加一个空的助手消息
    const initialAssistantMessageId = chatModel === "sse" ? `msg-${Date.now()}` : undefined
    if (initialAssistantMessageId) {
      setInternalMessages((prev) => [
        ...prev,
        {
          id: initialAssistantMessageId,
          content: "",
          role: "assistant",
          timestamp: Date.now(),
          isStreaming: true,
        },
      ])
    }

    try {
      const apiParams: DifyApiParams = {
        query: userMessage,
        user: "user",
        conversation_id: conversationId || undefined,
        inputs: {},
        files: validFiles,
        auto_generate_name: true,
      }

      const response = await callDifyApi(
        apiParams,
        {
          appId,
          appType,
          chatModel,
        },
        // 流式数据处理
        initialAssistantMessageId ? (content) => {
          setInternalMessages((prev) => prev.map((msg) =>
            msg.id === initialAssistantMessageId
              ? { ...msg, content }
              : msg
          ))
        } : undefined,
        // 流式结束处理
        initialAssistantMessageId ? () => {
          setInternalMessages((prev) => prev.map((msg) =>
            msg.id === initialAssistantMessageId
              ? { ...msg, isStreaming: false }
              : msg
          ))
        } : undefined
      )

      if (!initialAssistantMessageId && response) {
        const assistantMessage: ChatMessage = {
          id: response.messageId || `msg-${Date.now()}`,
          content: response.content,
          role: "assistant",
          timestamp: Date.now(),
          isStreaming: false,
        }
        setInternalMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      handleError(error)
    } finally {
      setInternalLoading(false)
      abortControllerRef.current = null
    }
  }

  // 处理错误
  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        console.log("请求已取消")
        toast({
          title: "已取消",
          description: "消息发送已取消",
          duration: 2000,
        })
      } else {
        console.error("发送消息失败:", error.message)
        toast({
          title: "错误",
          description: `发送消息失败: ${error.message}`,
          variant: "destructive",
        })
      }
    }
  }

  // 取消请求
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setInternalLoading(false)
    }
  }

  const handleCopyMessage = async (content: string) => {
    try {
      const textContent = typeof content === 'object' ? JSON.stringify(content) : String(content)
      await navigator.clipboard.writeText(textContent)
      toast({
        title: "已复制",
        description: "消息内容已复制到剪贴板",
        duration: 2000,
      })
    } catch (error) {
      console.error("复制失败:", error)
      toast({
        title: "复制失败",
        description: "无法复制消息内容",
        variant: "destructive",
      })
    }
  }

  // 渲染消息内容
  const renderMessageContent = (content: any): string => {
    if (typeof content === 'string') {
      return content
    }
    if (typeof content === 'object') {
      return JSON.stringify(content)
    }
    return String(content)
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`p-4 ${
              message.role === "user"
                ? "bg-blue-50 dark:bg-blue-900/20 ml-12"
                : "bg-gray-50 dark:bg-gray-800/50 mr-12"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {message.role === "user" ? "U" : "A"}
              </div>
              <div className="flex-1">
                <p 
                  className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded" 
                  onClick={() => handleCopyMessage(renderMessageContent(message.content))}
                  title="点击复制消息内容"
                >
                  {renderMessageContent(message.content)}
                </p>
              </div>
            </div>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 文件上传区域 */}
      {uploadedFiles.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded p-2"
              >
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                {file.uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : file.error ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <button
                    onClick={() => handleFileDelete(file.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder="输入消息..."
            className="min-h-[80px] resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="h-10 w-10 p-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            {isLoading && (
              <Button
                onClick={cancelRequest}
                variant="outline"
                className="h-10 w-10 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 