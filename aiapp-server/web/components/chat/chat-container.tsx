"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Loader2, Send } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: number | Date
  files?: any[] // 添加文件属性
}

interface ChatContainerProps {
  appId: string
  appType: string
  chatModel: string
  className?: string
  messages?: Message[] // 添加消息列表属性
  isLoading?: boolean // 添加加载状态属性
  onSendMessage?: (message: string, files?: any[]) => void // 添加发送消息回调
}

export function ChatContainer({ 
  appId, 
  appType, 
  chatModel, 
  className,
  messages: externalMessages,
  isLoading: externalLoading,
  onSendMessage: externalSendMessage
}: ChatContainerProps) {
  const { toast } = useToast()
  const [internalMessages, setInternalMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [internalLoading, setInternalLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 使用外部消息或内部消息
  const messages = externalMessages || internalMessages
  // 使用外部加载状态或内部加载状态
  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    if (externalSendMessage) {
      // 如果提供了外部发送消息方法，则使用它
      externalSendMessage(input, [])
      setInput("")
      return
    }

    // 否则使用内部发送消息逻辑
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now(),
    }

    setInternalMessages((prev) => [...prev, userMessage])
    setInput("")
    setInternalLoading(true)

    // 准备请求参数
    const requestBody = {
      query: input,
      user: "test_user", // 这里可以从用户上下文获取
      conversation_id: conversationId || undefined,
      inputs: {},
      files: [],
      response_mode: chatModel === "sse" ? "streaming" : "blocking",
      auto_generate_name: true,
    }

    // 根据应用类型选择API端点
    let apiEndpoint = ""
    switch (appType) {
      case "Chat":
        apiEndpoint = `/api/dify/chat-messages?appId=${appId}`
        break
      case "Workflow":
        apiEndpoint = `/api/dify/workflow-messages?appId=${appId}`
        break
      case "Completion":
        apiEndpoint = `/api/dify/completion-messages?appId=${appId}`
        break
      default:
        apiEndpoint = `/api/dify/chat-messages?appId=${appId}`
    }

    try {
      if (chatModel === "sse") {
        // 流式响应
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("SSE请求失败:", errorText)
          throw new Error(`请求失败: ${response.status} ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("无法读取响应流")

        let assistantMessage = ""
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          console.log("收到SSE数据块:", chunk) // 添加调试日志

          const lines = chunk.split("\n")
          for (const line of lines) {
            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.slice(5))
                console.log("解析的SSE数据:", data) // 添加调试日志

                if (data.event === "message") {
                  if (data.answer) {
                    assistantMessage += data.answer
                    setInternalMessages((prev) => {
                      const newMessages = [...prev]
                      const lastMessage = newMessages[newMessages.length - 1]
                      if (lastMessage && lastMessage.role === "assistant") {
                        lastMessage.content = assistantMessage
                      } else {
                        newMessages.push({
                          id: data.message_id || `msg-${Date.now()}`,
                          content: assistantMessage,
                          role: "assistant",
                          timestamp: Date.now(),
                        })
                      }
                      return newMessages
                    })
                  }
                } else if (data.event === "message_end" && data.conversation_id) {
                  setConversationId(data.conversation_id)
                }
              } catch (e) {
                console.error("解析SSE数据失败:", e, "原始数据:", line.slice(5))
              }
            }
          }
        }
      } else {
        // 阻塞式响应
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) throw new Error("请求失败")

        const data = await response.json()
        setInternalMessages((prev) => [
          ...prev,
          {
            id: data.message_id,
            content: data.answer,
            role: "assistant",
            timestamp: Date.now(),
          },
        ])
        setConversationId(data.conversation_id)
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("请求已取消")
      } else {
        console.error("发送消息失败:", error)
        toast({
          title: "错误",
          description: "发送消息失败，请稍后重试",
          variant: "destructive",
        })
      }
    } finally {
      setInternalLoading(false)
      abortControllerRef.current = null
    }
  }

  // 取消请求
  const cancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setInternalLoading(false)
    }
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
                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>

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
                ×
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 