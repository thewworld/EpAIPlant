"use client"

import { useState, useRef, useEffect } from "react"
import type { AppConfig } from "@/types/app-config"
import { AppType } from "@/types/app-config"
import { Message } from "@/components/chat/message"
import { CombinedIntro } from "@/components/chat/combined-intro"
import { useToast } from "@/components/ui/use-toast"
import { Paperclip, Loader2 } from "lucide-react"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"
import { SimpleChatInput } from "@/components/chat/simple-chat-input"
import { cn } from "@/lib/utils"
import { callDifyApi, type DifyApiParams, fetchSuggestedQuestions } from "@/lib/dify-api"
import { API_BASE_URL } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { SuggestedQuestions } from "@/components/chat/suggested-questions"

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
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)
  // 添加会话ID状态变量
  const [conversationId, setConversationId] = useState<string>('');
  // 添加建议问题状态
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  // 添加最后消息ID状态
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  // 添加正在获取建议问题的标志
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 确保组件完全挂载后再显示输入框
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // 获取输入框引用的useEffect
  useEffect(() => {
    if (mounted) {
      // 获取输入框引用
      const timer = setTimeout(() => {
        const inputElement = document.querySelector('.chat-input-area textarea') as HTMLTextAreaElement;
        if (inputElement) {
          chatInputRef.current = inputElement;
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [mounted]);

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

  // 获取回答后的建议问题
  const fetchSuggestedQuestionsAfterAnswer = async (messageId: string) => {
    // 如果不是聊天类型应用，则不获取建议问题
    if (appConfig.type !== AppType.CHAT || !messageId || isFetchingSuggestions) {
      return;
    }
    
    try {
      // 设置标志位防止重复请求
      setIsFetchingSuggestions(true);
      
      const questions = await fetchSuggestedQuestions(
        appConfig.id,
        messageId,
        'user' // 用户标识，这里使用固定值，实际应用中可能需要从用户配置或会话中获取
      );
      
      // 更新建议问题状态
      setSuggestedQuestions(questions);
    } catch (error) {
      setSuggestedQuestions([]);
    } finally {
      // 重置标志位
      setIsFetchingSuggestions(false);
    }
  };

  // 处理发送消息
  const handleSendMessage = async (message: string, files?: UploadedFile[]) => {
    setIsLoading(true)
    setError(null)
    // 清空之前的建议问题
    setSuggestedQuestions([])
    // 重置获取建议问题的标志
    setIsFetchingSuggestions(false)

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

    // 流式响应中最后一个有效的会话ID
    let lastReceivedConversationId: string | null = null;
    // 存储识别SSE数据流中当前消息ID，用于确认会话ID来自同一条消息
    let currentMessageId: string | null = null;

    try {
      // 判断是否使用会话ID (仅当AppType为CHAT时使用)
      const shouldUseConversationId = appConfig.type === AppType.CHAT && conversationId !== '';
      
      const response = await callDifyApi(
        {
          query: message,
          user: 'user',
          // 仅当AppType为CHAT时传递会话ID
          conversation_id: shouldUseConversationId ? conversationId : '',
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
        (content, rawData) => {
          // 处理流式响应中的会话ID (仅当AppType为CHAT时)
          if (appConfig.type === AppType.CHAT && rawData) {
            try {
              const data = JSON.parse(rawData);
              
              // 检查是否有会话过期错误
              if (data.error && data.error_code === "SESSION_EXPIRED") {
                setConversationId('');
                toast({
                  title: "会话已重置",
                  description: "之前的会话已过期，已为您开始新对话",
                  variant: "default",
                });
              }
              
              // 提取会话ID和消息ID
              if (data.conversation_id) {
                // 如果是新消息或与当前消息ID匹配，则更新最后接收的会话ID
                if (!currentMessageId || (data.message_id && data.message_id === currentMessageId)) {
                  lastReceivedConversationId = data.conversation_id;
                  currentMessageId = data.message_id || currentMessageId;
                  
                  // 更新最后消息ID
                  if (data.message_id) {
                    setLastMessageId(data.message_id);
                  }
                }
              }
            } catch (e) {
              // 解析错误不影响主流程
            }
          }
          
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
          // 流式响应结束时，更新会话ID (仅在AppType为CHAT时)
          if (appConfig.type === AppType.CHAT && lastReceivedConversationId) {
            setConversationId(lastReceivedConversationId);
            
            // 如果有最后消息ID，获取建议问题 - 仅在流式响应模式时调用
            if (currentMessageId && appConfig.chatModel === 'sse') {
              fetchSuggestedQuestionsAfterAnswer(currentMessageId);
            }
          }
          
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
        
        // 处理阻塞式响应的会话ID (仅当AppType为CHAT时)
        if (appConfig.type === AppType.CHAT && response.conversationId) {
          setConversationId(response.conversationId);
          
          // 如果有消息ID，则获取建议问题 - 仅在阻塞响应模式时调用
          if (response.messageId && appConfig.chatModel !== 'sse') {
            setLastMessageId(response.messageId);
            fetchSuggestedQuestionsAfterAnswer(response.messageId);
          }
        }
        
        setIsLoading(false)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '发送消息时出错'
      
      // 检查是否是会话过期错误
      if (errorMessage.includes("SESSION_EXPIRED")) {
        setConversationId('');
        toast({
          title: "会话已重置",
          description: "之前的会话已过期，已为您开始新对话",
          variant: "default",
        });
      }
      
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

  // 处理快捷问题点击
  const handleQuickQuestionClick = (question: string) => {
    // 将问题设置到输入框并发送
    if (chatInputRef.current) {
      chatInputRef.current.value = question;
      
      // 聚焦输入框以提供视觉反馈
      chatInputRef.current.focus();
      
      // 添加短暂延迟使用户看到问题出现在输入框中
      setTimeout(() => {
        // 自动发送消息
        handleSendMessage(question);
        
        // 平滑滚动到消息输入区域
        setTimeout(() => {
          const inputArea = document.querySelector('.chat-input-area');
          if (inputArea) {
            inputArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }, 150);
    } else {
      // 如果无法获取输入框引用，直接发送消息
      handleSendMessage(question);
    }
  };

  // 只在开发环境下显示调试信息
  const isDevMode = process.env.NODE_ENV === 'development';

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
            suggestedQuestions={appConfig.suggestedQuestions}
            onQuestionClick={handleQuickQuestionClick}
            isLoading={isLoading}
            multiLine={false}
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
            
            {/* 显示回答后的建议问题 */}
            {suggestedQuestions.length > 0 && !isLoading && messages.length > 0 && (
              <div className="mt-2 mb-4 border-t border-gray-100 dark:border-gray-800 relative">
                <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-[#0c1525] px-3 py-0.5 text-xs text-gray-500 dark:text-gray-400 z-10 rounded-full border border-gray-100 dark:border-gray-700">
                  试着问问
                </div>
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onQuestionClick={handleQuickQuestionClick}
                  className="mt-3"
                />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        {mounted && (
          <div className="sticky bottom-0 left-0 right-0 z-10 border-t border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#0c1525] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] chat-input-area">
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

