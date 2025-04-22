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
import { callDifyApi, type DifyApiParams } from "@/lib/dify-api"
import { API_BASE_URL } from "@/lib/constants"

// 更新 UploadedFile 类型定义
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

interface ChatAppDetailProps {
  appConfig: AppConfig
  className?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: UploadedFile[]
  isStreaming?: boolean
}

interface RequestData {
  inputs: string | Record<string, any>
  user: string
  conversation_id: string
  response_mode: string
  files?: Array<{
    type: string
    transfer_method: string
    url: string
    upload_file_id: string
  }>
}

export function ChatAppDetail({ appConfig, className }: ChatAppDetailProps) {
  const { toast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  // 处理工作流响应
  const handleWorkflowResponse = (data: any) => {
    if (data.error) {
      setError(data.error as string)
      return
    }

    const content = data.answer || data.text || ""
    updateMessageContent(content)
  }

  // 更新消息内容的函数
  const updateMessageContent = (content: string) => {
    setMessages(prevMessages => {
      const newMessages = [...prevMessages]
      const lastMessage = newMessages[newMessages.length - 1]
      if (lastMessage) {
        lastMessage.content = content
        lastMessage.isStreaming = false
      } else {
        newMessages.push({
          id: `msg-${Date.now()}`,
          content,
          role: 'assistant',
          timestamp: new Date(),
          isStreaming: false,
        })
      }
      return newMessages
    })
  }

  // 处理发送消息
  const handleSendMessage = async (message: string, files?: UploadedFile[]) => {
    setIsLoading(true)
    setError(null)

    // 添加用户消息到消息列表
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      content: message,
      role: 'user',
      timestamp: new Date(),
      files: files
    }
    setMessages(prev => [...prev, userMessage])

    // 立即添加一个正在思考的助手消息
    const thinkingMessageId = `thinking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    setMessages(prev => [...prev, {
      id: thinkingMessageId,
      content: '正在思考...',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    }])

    try {
      const response = await callDifyApi(
        {
          query: message,
          user: 'user',
          conversation_id: '',
          inputs: {},
          response_mode: appConfig.chatModel === 'sse' ? 'streaming' : 'blocking',
          files: files?.filter(f => f.uploadFileId && !f.error).map(file => ({
            type: file.type.startsWith('image/') ? 'image' : 'document',
            transfer_method: 'local_file',
            url: '',
            upload_file_id: file.uploadFileId || ''
          }))
        },
        {
          appId: appConfig.id,
          appType: AppType.CHAT,
          chatModel: appConfig.chatModel || 'sse',
        },
        // 流式数据处理
        (content) => {
          setMessages(prev => prev.map(msg =>
            msg.id === thinkingMessageId
              ? { ...msg, content, isStreaming: true }
              : msg
          ))
          // 当开始收到流式数据时，关闭加载状态
          if (content) {
            setIsLoading(false)
          }
        },
        // 流式结束处理
        () => {
          setMessages(prev => prev.map(msg =>
            msg.id === thinkingMessageId
              ? { ...msg, isStreaming: false }
              : msg
          ))
        }
      )

      if (response) {
        // 如果是阻塞式响应，更新消息内容
        setMessages(prev => prev.map(msg =>
          msg.id === thinkingMessageId
            ? { ...msg, content: response.content, isStreaming: false }
            : msg
        ))
        setIsLoading(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息时出错'
      setError(errorMessage)
      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive",
      })
      // 移除正在思考的消息
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId))
      setIsLoading(false)
    }
  }

  // 处理文件上传
  const handleFileUpload = async (file: File): Promise<UploadedFile | null> => {
    const tempId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`
    const fileData: UploadedFile = {
      id: tempId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploading: true,
    }

    // 立即更新 UI 以显示上传中的文件
    setUploadedFilesInfo(prev => [...prev, fileData])

    const formData = new FormData()
    formData.append('file', file)
    formData.append('user', 'test_user')

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dify/files/upload?appId=${appConfig.id}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`上传失败: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      if (!result.id) {
        throw new Error('上传成功，但响应中缺少文件 ID')
      }

      const uploadedFileInfo: UploadedFile = {
        ...fileData,
        uploadFileId: result.id,
        uploading: false,
      }

      setUploadedFilesInfo(prev => 
        prev.map(f => f.id === tempId ? uploadedFileInfo : f)
      )

      toast({
        title: '成功',
        description: `${file.name} 上传成功。`,
      })

      return uploadedFileInfo
    } catch (error) {
      console.error('文件上传失败:', error)
      const errorMessage = error instanceof Error ? error.message : '未知上传错误'
      
      setUploadedFilesInfo(prev =>
        prev.map(f => f.id === tempId ? { ...f, uploading: false, error: errorMessage } : f)
      )

      toast({
        title: '上传失败',
        description: `${file.name} 上传失败: ${errorMessage}`,
        variant: 'destructive',
      })

      return { ...fileData, uploading: false, error: errorMessage }
    }
  }

  // 处理文件移除
  const handleFileRemove = (fileId: string) => {
    setUploadedFilesInfo(prev => prev.filter(file => file.id !== fileId))
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
    // 优先使用应用配置中的logo属性（后端返回）
    if (appConfig.logo) {
      // 检查logo是否已经是data:image开头的URL格式
      if (appConfig.logo.startsWith('data:image')) {
        return appConfig.logo;
      }
      // 检查是否是base64编码
      if (appConfig.logo.startsWith('PD94') || appConfig.logo.startsWith('PHN2')) {
        return `data:image/svg+xml;base64,${appConfig.logo}`
      }
      // 否则将SVG进行URL编码
      try {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(appConfig.logo)}`
      } catch (e) {
        console.error('Logo编码错误:', e);
        // 编码失败时使用默认图标
        return '/icons/app-default.svg';
      }
    }
    
    // 使用内联SVG图标
    const svgIcon = getAppIconById(appConfig.id)
    return svgToDataUrl(svgIcon)
  }

  // 渲染消息内容
  const renderMessageContent = (content: any): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (typeof content === 'object') {
      try {
        return JSON.stringify(content, null, 2);
      } catch (e) {
        return String(content);
      }
    }
    return String(content);
  }

  return (
    <div className={cn("flex flex-col h-screen bg-white dark:bg-[#0c1525]", className)}>
      {/* 应用内容 */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* 应用信息 */}
        <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6 lg:px-8 flex-shrink-0">
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-gray-200 dark:border-[#334155] flex items-center justify-center mb-4">
            <img 
              src={getIconSrc() || "/icons/app-default.svg"} 
              alt={appConfig.name} 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                console.error('应用图标加载失败:', e);
                e.currentTarget.src = "/icons/app-default.svg";
              }} 
            />
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
                content={renderMessageContent(message.content)}
                timestamp={message.timestamp}
                appIcon={message.role === "assistant" ? getIconSrc() : undefined}
                onCopy={handleCopyMessage}
                onLike={handleLikeMessage}
                onDislike={handleDislikeMessage}
                isStreaming={message.isStreaming}
              />
            ))}
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
              onRemoveFile={handleFileRemove}
              isLoading={isLoading}
              placeholder="有问题，尽管问..."
            />
          </div>
        )}
      </div>
    </div>
  )
}

