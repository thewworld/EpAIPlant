"use client"

import { useState, useRef, useEffect } from "react"
import type { AppConfig } from "@/types/app-config"
import { AppType } from "@/types/app-config"
import { Message } from "@/components/chat/message"
import { CombinedIntro } from "@/components/chat/combined-intro"
import { useToast } from "@/components/ui/use-toast"
import { Paperclip } from "lucide-react"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"
import { SimpleChatInput } from "@/components/chat/simple-chat-input"
import { cn } from "@/lib/utils"

// 更新 UploadedFile 类型定义
interface UploadedFile {
  id: string // 这个 id 可能是前端生成的临时 ID
  name: string
  type: string
  size: number
  url?: string
  preview?: string
  uploadFileId?: string // 从服务器获取的 ID
  uploading?: boolean // 上传状态
  error?: string // 上传错误信息
}

interface ChatAppDetailProps {
  appConfig: AppConfig
  className?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: UploadedFile[] // 这里可能需要调整，或保留用于显示
  isStreaming?: boolean
}

export function ChatAppDetail({ appConfig, className }: ChatAppDetailProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  // <<< 新增状态：存储已上传成功并包含服务器 ID 的文件信息 >>>
  const [uploadedFilesInfo, setUploadedFilesInfo] = useState<UploadedFile[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 在现有的 useEffect 后添加
  useEffect(() => {
    // 确保组件完全挂载后再显示输入框
    setMounted(true)
  }, [])

  // <<< 新增：处理文件上传的函数 >>>
  const handleFileUpload = async (file: File): Promise<UploadedFile | null> => {
    const tempId = `temp_${Date.now()}_${file.name}`
    const fileData: UploadedFile = {
      id: tempId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploading: true,
    }
    // 立即更新 UI 以显示上传中的文件
    setUploadedFilesInfo((prev) => [...prev, fileData])

    const formData = new FormData()
    formData.append("file", file)
    formData.append("user", "test_user") // 或者从用户上下文获取

    try {
      const response = await fetch(
        `http://localhost:8087/api/dify/files/upload?appId=${appConfig.id}`,
        {
          method: "POST",
          body: formData,
          // 注意：不需要手动设置 Content-Type，浏览器会自动处理 FormData
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`上传失败: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      if (!result.id) {
        throw new Error("上传成功，但响应中缺少文件 ID")
      }

      // 更新文件信息，包含服务器返回的 ID，并标记上传完成
      const uploadedFileInfo: UploadedFile = {
        ...fileData,
        uploadFileId: result.id,
        uploading: false,
      }
      setUploadedFilesInfo((prev) => 
        prev.map(f => f.id === tempId ? uploadedFileInfo : f)
      )
      toast({
        title: "成功",
        description: `${file.name} 上传成功。`,
      })
      return uploadedFileInfo // 返回包含服务器 ID 的文件信息

    } catch (error) {
      console.error("文件上传失败:", error)
      const errorMessage = error instanceof Error ? error.message : "未知上传错误"
      // 更新文件信息，标记上传失败
      setUploadedFilesInfo((prev) => 
        prev.map(f => f.id === tempId ? { ...fileData, uploading: false, error: errorMessage } : f)
      )
      toast({
        title: "上传失败",
        description: `${file.name} 上传失败: ${errorMessage}`,
        variant: "destructive",
      })
      return null // 上传失败返回 null
    }
  }

  // 处理发送消息
  const handleSendMessage = async (content: string, /* files?: UploadedFile[] */) => {
    // 注意：现在不再直接从 SimpleChatInput 接收 files 参数
    // 我们将使用 uploadedFilesInfo state

    // 添加用户消息（可以考虑是否仍在此处显示文件，或仅在输入框显示）
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      // files: uploadedFilesInfo, // 考虑是否需要显示在消息气泡中
    }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      // <<< 修改：构建包含文件信息的请求体 >>>
      const requestBody: any = {
        query: content,
        user: "test_user",
        conversation_id: "", // 可以添加会话ID管理
        inputs: {},
        response_mode: appConfig.chatModel === "sse" ? "streaming" : "blocking",
        auto_generate_name: true,
      }

      // 如果有上传成功的文件，构建 inputs 和 files 字段
      if (uploadedFilesInfo.length > 0) {
        const successfulUploads = uploadedFilesInfo.filter(f => f.uploadFileId && !f.error)
        if (successfulUploads.length > 0) {
          // 假设第一个文件是 paper1 (根据你的示例)
          // 如果需要处理多个文件或不同 input key，需要更复杂的逻辑
          const firstFile = successfulUploads[0]
          requestBody.inputs = {
             // 注意：这里的 key "paper1" 需要根据实际应用配置动态确定
            "paper1": { 
              "type": "document", 
              "transfer_method": "local_file", 
              "url": "", 
              "upload_file_id": firstFile.uploadFileId 
            }
          }
          requestBody.files = successfulUploads.map(file => ({
            type: "document", // 或根据 file.type 决定
            transfer_method: "local_file",
            url: "",
            upload_file_id: file.uploadFileId,
          }))
        } else {
           console.warn("没有成功上传的文件可用于发送。")
           // 可以选择是否继续发送不带文件的消息，或者提示用户
        }
      }

      // 根据应用类型选择API端点
      let apiEndpoint = ""
      switch (appConfig.type) {
        case AppType.CHAT:
          apiEndpoint = `http://localhost:8087/api/dify/chat-messages?appId=${appConfig.id}`
          break
        case AppType.FORM_CHAT:
          apiEndpoint = `http://localhost:8087/api/dify/form-chat-messages?appId=${appConfig.id}`
          break
        default:
          apiEndpoint = `http://localhost:8087/api/dify/chat-messages?appId=${appConfig.id}`
      }

      console.log("调用API端点:", apiEndpoint)
      console.log("请求参数:", requestBody)
      console.log(
        `检查 chatModel: 值='${appConfig.chatModel}', 类型=${typeof appConfig.chatModel}`
      );

      if (appConfig.chatModel === "sse") {
        console.log("路径：处理 SSE 流式响应");
        // 流式响应
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
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
        let buffer = "" // 用于存储不完整的数据行

        // 创建一个空的、标记为流式的助手消息
        const initialAssistantMessageId = `msg-${Date.now()}`
        setMessages((prev) => [
          ...prev,
          {
            id: initialAssistantMessageId,
            content: "",
            role: "assistant",
            timestamp: new Date(),
            isStreaming: true,
          },
        ])

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            buffer += chunk
            
            // 处理完整的行
            let lines = buffer.split("\n")
            // 最后一行可能不完整，保留到下一次处理
            buffer = lines.pop() || ""

            for (const line of lines) {
              if (line.trim() === "") continue // 跳过空行
              
              // 检查是否是SSE数据行
              if (line.startsWith("data:")) {
                try {
                  // 提取JSON部分，去除 "data:" 前缀，并处理可能的多余空格
                  const jsonStr = line.substring(5).trim()
                  if (!jsonStr) continue // 跳过空数据
                  
                  const data = JSON.parse(jsonStr)
                  console.log("解析的SSE数据:", data)

                  if ((data.event === "message" || data.event === "agent_message") && data.answer) {
                    assistantMessage += data.answer
                    // 更新最后一条流式消息的内容
                    setMessages((prev) => {
                      const newMessages = [...prev]
                      const lastMessage = newMessages[newMessages.length - 1]
                      // 确保更新的是正确的流式消息
                      if (lastMessage && lastMessage.id === initialAssistantMessageId) {
                        lastMessage.content = assistantMessage
                        return [...newMessages]
                      }
                      return newMessages
                    })
                  } else if (data.event === "message_end") {
                    console.log("会话结束，会话ID:", data.conversation_id)
                    // 找到对应的消息并标记为非流式
                    setMessages((prev) => prev.map(msg => 
                        msg.id === initialAssistantMessageId ? { ...msg, isStreaming: false } : msg
                    ))
                    setIsLoading(false)
                  }
                } catch (e) {
                  console.error("解析SSE数据失败:", e, "原始数据:", line)
                  continue // 跳过错误的数据，继续处理下一行
                }
              }
            }
          }
        } finally {
          // 如果流异常结束，确保最后一条消息标记为非流式
          setMessages((prev) => prev.map(msg => 
              msg.id === initialAssistantMessageId ? { ...msg, isStreaming: false } : msg
          ))
          reader.releaseLock()
          setIsLoading(false)
        }
      } else {
        console.log("路径：处理 Blocking 阻塞式响应");
        // 阻塞式响应
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("请求失败:", errorText)
          throw new Error(`请求失败: ${response.status} ${response.statusText}`)
        }

        // 克隆响应以读取文本，避免消耗原始响应体
        const responseText = await response.clone().text()
        console.log("收到的 Blocking 响应原始文本:", responseText)

        // 这里的 response.json() 可能是错误来源
        const data = await response.json()
        console.log("解析后的 Blocking 响应数据:", data)

        setMessages((prev) => [
          ...prev,
          {
            id: data.message_id || `msg-${Date.now()}`,
            content: data.answer || "无回复内容",
        role: "assistant",
        timestamp: new Date(),
            isStreaming: false,
          },
        ])
        setIsLoading(false)
      }

      // <<< 新增：发送成功后清空已上传文件信息 >>>
      setUploadedFilesInfo([])

    } catch (error) {
      console.error("发送消息失败 (Outer Catch):", error)
      toast({
        title: "错误",
        description:
          error instanceof Error ? error.message : "发送消息失败，请稍后重试",
        variant: "destructive",
      })
      setIsLoading(false)
      // 考虑是否在此处也清空 uploadedFilesInfo
      // setUploadedFilesInfo([]) 
    }
  }

  // 处理复制消息
  const handleCopyMessage = (content: string) => {
    toast({
      title: "已复制到剪贴板",
      description: "消息内容已成功复制",
      duration: 2000,
    })
  }

  // 处理点赞消息
  const handleLikeMessage = (id?: string) => {
    if (!id) return

    toast({
      title: "感谢您的反馈",
      description: "您的点赞将帮助我们改进服务",
      duration: 2000,
    })

    // 这里可以添加向后端发送点赞信息的逻辑
  }

  // 处理点踩消息
  const handleDislikeMessage = (id?: string) => {
    if (!id) return

    toast({
      title: "感谢您的反馈",
      description: "您的反馈将帮助我们改进服务",
      duration: 2000,
    })

    // 这里可以添加向后端发送点踩信息的逻辑
  }

  // 获取应用图标
  const getIconSrc = () => {
    // 使用内联SVG图标
    const svgIcon = getAppIconById(appConfig.id)
    return svgToDataUrl(svgIcon)
  }

  // 渲染消息内容，包括文件预览
  const renderMessageContent = (message: ChatMessage) => {
    return (
      <>
        <div className="whitespace-pre-wrap">{message.content}</div>

        {/* 文件预览 */}
        {message.files && message.files.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.files.map((file) => (
              <div key={file.id} className="relative">
                {file.preview ? (
                  // 图片预览
                  <div className="max-w-[200px] max-h-[150px] overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                    <img
                      src={file.preview || "/placeholder.svg"}
                      alt={file.name}
                      className="w-full h-full object-cover"
                      onClick={() => window.open(file.preview, "_blank")}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                ) : (
                  // 文件链接
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    )
  }

  return (
    <div className={cn("flex flex-col h-screen bg-white dark:bg-[#0c1525]", className)}>
      {/* 应用内容 */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* 应用信息 */}
        <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6 lg:px-8 flex-shrink-0">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-gray-200 dark:border-[#334155] flex items-center justify-center mb-4">
            <img src={getIconSrc() || "/placeholder.svg"} alt={appConfig.name} className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{appConfig.name}</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md">{appConfig.description}</p>
        </div>

        {/* 聊天区域 */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 min-h-0">
          {/* 合并的介绍消息 */}
          <CombinedIntro
            messages={appConfig.introMessages}
            appIcon={getIconSrc()}
          />

          {/* 聊天消息 */}
          <div>
            {messages.map((message) => (
              <Message
                key={message.id}
                id={message.id}
                role={message.role}
                content={renderMessageContent(message)}
                timestamp={message.timestamp}
                appIcon={message.role === "assistant" ? getIconSrc() : undefined}
                onCopy={handleCopyMessage}
                onLike={handleLikeMessage}
                onDislike={handleDislikeMessage}
                isStreaming={message.isStreaming}
              />
            ))}
            {isLoading && <Message role="assistant" content="正在思考..." isLoading={true} appIcon={getIconSrc()} />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        {mounted && (
          <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#0c1525] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
            <SimpleChatInput
              onSendMessage={handleSendMessage}
              appId={appConfig.id}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFilesInfo}
              onRemoveFile={(id: string) => setUploadedFilesInfo(prev => prev.filter(f => f.id !== id))}
              isLoading={isLoading}
              placeholder="有问题，尽管问..."
            />
          </div>
        )}
      </div>
    </div>
  )
}

