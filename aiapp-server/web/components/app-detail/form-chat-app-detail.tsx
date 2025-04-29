"use client"

import { useState, useRef, useEffect } from "react"
import type { AppConfig } from "@/types/app-config"
import { FieldType, AppType } from "@/types/app-config"
import { Message } from "@/components/chat/message"
import { CombinedIntro } from "@/components/chat/combined-intro"
import { DynamicForm } from "@/components/app-detail/dynamic-form"
import { useToast } from "@/components/ui/use-toast"
import { Paperclip } from "lucide-react"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"
import { SimpleChatInput } from "@/components/chat/simple-chat-input"
import { callDifyApi, type DifyApiParams, type DifyApiResponse, fetchSuggestedQuestions } from "@/lib/dify-api"
import { API_BASE_URL } from "@/lib/constants"
import { SuggestedQuestions } from "@/components/chat/suggested-questions"

// 添加上传文件类型定义
interface UploadedFile {
  id: string // Temporary frontend ID or server ID after upload
  name: string
  type: string
  size: number
  url?: string // Local preview URL (optional)
  preview?: string // Local image preview URL (optional)
  uploadFileId?: string // Server-provided ID after successful upload
  uploading?: boolean
  error?: string
}

interface FormChatAppDetailProps {
  appConfig: AppConfig
  className?: string
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  files?: UploadedFile[] // 添加文件属性
  isStreaming?: boolean // 添加流式状态标记
}

// 添加API请求参数接口
interface ApiRequestParams {
  query: string
  inputs?: Record<string, any>
  files?: Array<{
    type: string
    transfer_method: string
    url: string
    upload_file_id: string
  }>
  user?: string
  conversation_id?: string
  response_mode?: string
  auto_generate_name?: boolean
}

export function FormChatAppDetail({ appConfig, className }: FormChatAppDetailProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [submittedInputs, setSubmittedInputs] = useState<Record<string, any> | null>(null);
  const [currentFormInputs, setCurrentFormInputs] = useState<Record<string, any>>({});  // 新增：当前表单数据
  const [submittedFiles, setSubmittedFiles] = useState<any[]>([]); // Initialize as empty array
  const [chatUploadedFiles, setChatUploadedFiles] = useState<UploadedFile[]>([]);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null); // 添加输入框引用
  // 添加会话ID状态变量
  const [conversationId, setConversationId] = useState<string>('');
  // 添加建议问题状态
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  // 添加最后消息ID状态
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  // 添加正在获取建议问题的标志
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
  // 添加聊天文件状态
  const [chatFiles, setChatFiles] = useState<UploadedFile[]>([]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 在现有的 useEffect 后添加
  useEffect(() => {
    // 确保组件完全挂载后再显示输入框
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

  // 处理表单字段变化 - 添加字段实时监听功能
  const handleFormFieldChange = (fieldData: Record<string, any>) => {
    // 实时更新当前表单数据
    setCurrentFormInputs(prev => ({
      ...prev,
      ...fieldData
    }));
  };

  // 添加获取建议问题函数
  const fetchSuggestedQuestionsAfterAnswer = async (messageId: string) => {
    // 如果不是聊天类型应用，则不获取建议问题
    if (!messageId || isFetchingSuggestions) {
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

  // 处理发送消息 (聊天输入框)
  const handleSendMessage = async (content: string) => {
    if (!content.trim() && chatUploadedFiles.filter(f => !f.error && f.uploadFileId).length === 0) {
      return
    }

    // 处理聊天输入框上传的文件
    const chatFilesToSend = chatUploadedFiles
      .filter(f => f.uploadFileId && !f.error)
      .map(f => ({
        type: f.type.startsWith("image/") ? "image" : "document",
        transfer_method: "local_file",
        url: "",
        upload_file_id: f.uploadFileId!,
      }))

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    // 清空之前的建议问题
    setSuggestedQuestions([])
    // 重置获取建议问题的标志
    setIsFetchingSuggestions(false)

    // 立即添加一个正在思考的助手消息
    const thinkingMessageId = `thinking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const thinkingMessage: ChatMessage = {
      id: thinkingMessageId,
      content: '正在思考...',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true
    }
    setMessages(prev => [...prev, thinkingMessage])

    // 流式响应中最后一个有效的会话ID和消息ID
    let lastReceivedConversationId: string | null = null;
    let currentMessageId: string | null = null;

    try {
      // 判断是否使用会话ID (仅当AppType为CHAT时使用)
      const shouldUseConversationId = appConfig.type === AppType.CHAT && conversationId !== '';

      // 组合使用已提交的表单参数和当前表单状态
      const combinedInputs = {
        ...(submittedInputs || {}),
        ...currentFormInputs
      };
      
      // 确保inputs中的文件字段格式正确（对象而不是数组）
      Object.keys(combinedInputs).forEach(key => {
        if (Array.isArray(combinedInputs[key]) && 
            combinedInputs[key].length > 0 && 
            combinedInputs[key][0].upload_file_id) {
          // 如果是单文件字段但错误地存储为数组，则取第一个元素
          if (combinedInputs[key].length === 1) {
            combinedInputs[key] = combinedInputs[key][0];
          }
        }
      });
      
      // 构建完整的请求参数，包含表单参数和聊天输入框参数
      const apiParams: DifyApiParams = {
        query: content,
        user: "test_user",
        // 仅当AppType为CHAT时传递会话ID
        conversation_id: shouldUseConversationId ? conversationId : '',
        inputs: combinedInputs, // 使用合并后的表单参数
        files: chatFilesToSend, // 聊天输入框上传的文件
        response_mode: appConfig.chatModel === "sse" ? "streaming" : "blocking",
        auto_generate_name: true,
      }

      const response = await callDifyApi(
        apiParams,
        {
          appId: appConfig.id,
          appType: appConfig.type,
          chatModel: appConfig.chatModel || "block",
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
          // 流式响应结束时，更新会话ID
          if (lastReceivedConversationId) {
            setConversationId(lastReceivedConversationId);
            
            // 如果有最后消息ID，获取建议问题 - 仅在流式响应模式时调用
            if (currentMessageId) {
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
        }

        setIsLoading(false)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "处理消息时出错"
      
      // 检查是否是会话过期错误
      if (errorMessage.includes("SESSION_EXPIRED")) {
        setConversationId('');
        toast({
          title: "会话已重置",
          description: "之前的会话已过期，已为您开始新对话",
          variant: "default",
        });
      }
      
      // 移除正在思考的消息
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId))
       const errorChatMessage: ChatMessage = {
        id: `err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          role: "assistant",
          content: `错误: ${errorMessage}`,
          timestamp: new Date(),
          isStreaming: false,
       }
      setMessages(prev => [...prev, errorChatMessage])
      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setChatUploadedFiles([])
    }
  }

  // 处理表单提交
  const handleFormSubmit = async (formData: Record<string, any>) => {
    console.log("表单提交触发")
    setIsFormSubmitting(true)
    setIsLoading(true)
    // 清空之前的建议问题
    setSuggestedQuestions([])
    // 重置获取建议问题的标志
    setIsFetchingSuggestions(false)

    const userContentParts: string[] = ["提交表单:"]
    const processedFormInputs: Record<string, any> = {}
    let thinkingMessageId: string | undefined

    // 流式响应中最后一个有效的会话ID和消息ID
    let lastReceivedConversationId: string | null = null;
    let currentMessageId: string | null = null;

    try {
      for (const fieldId in formData) {
        const fieldConfig = appConfig.formConfig?.fields.find((f) => f.id === fieldId)
        const value = formData[fieldId]

        if (fieldConfig?.type === FieldType.FILE && Array.isArray(value)) {
          const uploadedFilesArray = value as UploadedFile[]
          const successfulUploads = uploadedFilesArray.filter(f => f.uploadFileId && !f.error)

          if (successfulUploads.length > 0) {
            userContentParts.push(`${fieldConfig?.label || fieldId}: ${successfulUploads.map(f => f.name).join(', ')}`)
                
            // 处理表单文件字段
            // 检查原始字段数据以确定文件处理方式
            const originalData = fieldConfig.originalData || {};
            const controlType = Object.keys(originalData).find(key => 
              ['file', 'file-list'].includes(key)
            );
            
            if (controlType === 'file-list') {
              // 文件列表类型 - 处理多个文件 - 转换为正确的格式
              processedFormInputs[fieldId] = successfulUploads.map(file => ({
                type: file.type.startsWith("image/") ? "image" : "document",
                transfer_method: "local_file",
                url: "",
                upload_file_id: file.uploadFileId
              }));
            } else {
              // 单文件类型 - 使用第一个文件 - 确保是对象而不是数组
              processedFormInputs[fieldId] = {
                type: successfulUploads[0].type.startsWith("image/") ? "image" : "document",
                transfer_method: "local_file",
                url: "",
                upload_file_id: successfulUploads[0].uploadFileId
              };
            }
          } else {
            userContentParts.push(`${fieldConfig?.label || fieldId}: (无有效上传文件)`)
          }
        } else if (fieldConfig?.type === FieldType.FILE && value && typeof value === 'object' && value.uploadFileId) {
          // 处理单文件直接存储为对象的情况
          userContentParts.push(`${fieldConfig?.label || fieldId}: ${value.name}`);
          
          // 转换为正确的文件对象格式
          processedFormInputs[fieldId] = {
            type: value.type.startsWith("image/") ? "image" : "document",
            transfer_method: "local_file",
            url: "",
            upload_file_id: value.uploadFileId
          };
        } else {
          userContentParts.push(`${fieldConfig?.label || fieldId}: ${value}`)
          processedFormInputs[fieldId] = value
        }
      }

      const formContent = userContentParts.join('\n')

      // 创建用户消息
    const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      role: "user",
        content: formContent,
      timestamp: new Date(),
    }

      // 添加用户消息到会话
      setMessages(prev => [...prev, userMessage])

      // 生成思考消息 ID
      thinkingMessageId = `thinking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const thinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        content: '正在思考...',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true
      }
      setMessages(prev => [...prev, thinkingMessage])

      // 判断是否使用会话ID (仅当AppType为CHAT时使用)
      const shouldUseConversationId = appConfig.type === AppType.CHAT && conversationId !== '';
      
      console.log(
        shouldUseConversationId 
          ? `继续对话，使用会话ID: ${conversationId}` 
          : '开始新对话，会话ID将由系统生成'
      );

      // 准备API请求参数
      const apiParams: ApiRequestParams = {
        query: formContent.length > 0 ? formContent : " ", // 确保至少有一个空格，避免空字符串
        inputs: processedFormInputs,
        user: "test_user",
        // 仅当AppType为CHAT时传递会话ID
        conversation_id: shouldUseConversationId ? conversationId : '',
        response_mode: appConfig.chatModel === "sse" ? "streaming" : "blocking"
      }

      // 发送请求
      const response = await callDifyApi(
        apiParams,
        {
          appId: appConfig.id,
          appType: appConfig.type,
          chatModel: appConfig.chatModel || "block",
        },
        // 流式数据处理
        (content, rawData) => {
          // 处理流式响应中的会话ID (仅当AppType为CHAT时)
          if (appConfig.type === AppType.CHAT && rawData) {
            try {
              const data = JSON.parse(rawData);
              
              // 检查是否有会话过期错误
              if (data.error && data.error_code === "SESSION_EXPIRED") {
                console.warn("会话已过期，将重置会话ID");
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
              console.error("解析流式数据中的会话ID失败:", e);
            }
          }

            setMessages(prev => prev.map(msg =>
              msg.id === thinkingMessageId
                ? { ...msg, content, isStreaming: true }
                : msg
            ))
          setIsLoading(false) // 收到首个响应时关闭加载状态
        },
        // 流式结束处理
        () => {
          // 流式响应结束时，更新会话ID
          if (lastReceivedConversationId) {
            console.log(`流式响应结束，保存会话ID: ${lastReceivedConversationId}`);
            setConversationId(lastReceivedConversationId);
            
            // 如果有最后消息ID，获取建议问题
            if (currentMessageId) {
              console.log(`流式响应结束后获取消息ID: ${currentMessageId} 的建议问题`);
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

      // 阻塞响应处理
      if (response && thinkingMessageId) {
        setMessages(prev => prev.map(msg =>
          msg.id === thinkingMessageId
            ? { ...msg, content: response.content, isStreaming: false }
            : msg
        ))

        // 处理阻塞式响应的会话ID (仅当AppType为CHAT时)
        if (appConfig.type === AppType.CHAT && response.conversationId) {
          console.log(`阻塞式响应，保存会话ID: ${response.conversationId}`);
          setConversationId(response.conversationId);
        }
      }

      // 保存已提交的表单输入，用于后续聊天参考
      setSubmittedInputs(processedFormInputs);
      
      // 保存已经上传的文件信息
      const submittedFiles = Object.values(formData)
        .filter(value => Array.isArray(value))
        .flatMap(files => files)
        .filter((file: any) => file && file.uploadFileId)
      
      if (submittedFiles.length > 0) {
        setSubmittedFiles(submittedFiles);
      }
    } catch (error) {
      console.error("表单提交错误:", error)
      const errorMessage = error instanceof Error ? error.message : "处理表单时出错"
      
      // 检查是否是会话过期错误
      if (errorMessage.includes("SESSION_EXPIRED")) {
        console.warn("会话已过期，将重置会话ID");
        setConversationId('');
        toast({
          title: "会话已重置",
          description: "之前的会话已过期，已为您开始新对话",
          variant: "default",
        });
      }
      
      if (thinkingMessageId) {
        // 更新思考消息为错误消息
        setMessages(prev => prev.map(msg => 
          msg.id === thinkingMessageId 
            ? { 
                ...msg, 
                content: `错误: ${errorMessage}`, 
                isStreaming: false 
              } 
            : msg
        ))
      } else {
        // 如果没有思考消息，添加一个错误消息
       const errorChatMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `错误: ${errorMessage}`,
          timestamp: new Date(),
       }
      setMessages(prev => [...prev, errorChatMessage])
      }
      
      toast({
        title: "错误",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsFormSubmitting(false)
      setIsLoading(false)
    }
  }

  // 处理表单重置
  const handleFormReset = () => {
    // 清除已提交的表单状态
    setSubmittedInputs(null);
    // 清除当前表单数据
    setCurrentFormInputs({});
    setSubmittedFiles([]);
    
    // 清除聊天文件上传
    setChatUploadedFiles([]);
    
    // 清除会话ID，开始新对话
    if (conversationId) {
      setConversationId('');
      toast({
        title: "会话已重置",
        description: "表单重置，将开始新对话",
        duration: 2000,
      });
    } else {
      // 通知用户表单已重置
      toast({
        title: "表单已重置",
        description: "所有字段已重置为默认值",
        duration: 2000,
      });
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

  // 确保应用配置包含表单配置
  if (!appConfig.formConfig) {
    return <div>错误：此应用缺少表单配置</div>
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

  // <<< NEW: Handler for form file upload - Updates context automatically >>>
  const handleFileUploadForForm = async (fieldId: string, file: File): Promise<UploadedFile | null> => {
    const tempId = `temp_form_${Date.now()}_${file.name}`;
    const fileData: UploadedFile = {
      id: tempId, // Use tempId for UI updates within DynamicForm
      name: file.name,
      type: file.type,
      size: file.size,
      uploading: true,
      // preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined, // Preview handled by DynamicForm potentially
    };

    // DynamicForm handles its own UI for uploading state

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user", "test_user");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dify/files/upload?appId=${appConfig.id}`,
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error(`上传失败: ${response.status} ${await response.text()}`);

      const result = await response.json();
      if (!result.id) throw new Error("上传成功，但响应中缺少文件 ID");

      const uploadedFileInfo: UploadedFile = {
        ...fileData,
        uploadFileId: result.id,
        uploading: false,
        url: result.url || undefined,
      };

      // <<< Automatically update submittedInputs and submittedFiles state >>>
      setSubmittedInputs(prevInputs => {
         const newInputs = { ...(prevInputs || {}) };
         
         // 获取字段配置，检查是否为file-list类型
         const fieldConfig = appConfig.formConfig?.fields.find(f => f.id === fieldId);
         const originalData = fieldConfig?.originalData || {};
         const controlType = Object.keys(originalData).find(key => 
           ['file', 'file-list'].includes(key)
         );
         
         // 创建正确格式的文件对象
         const inputData = {
             type: file.type.startsWith("image/") ? "image" : "document",
             transfer_method: "local_file",
             url: "",
             upload_file_id: result.id,
         };

         // 处理file-list类型（支持多文件）
         if (controlType === 'file-list') {
           // 如果已经有文件，则添加到数组中
           if (Array.isArray(newInputs[fieldId])) {
             newInputs[fieldId] = [...newInputs[fieldId], inputData];
           } else {
             // 否则创建新数组
             newInputs[fieldId] = [inputData];
           }
         } else {
           // 单文件类型，使用正确格式的对象，直接替换
           newInputs[fieldId] = inputData;
         }
         
         return newInputs;
      });

      // 更新submittedFiles，确保格式正确
      setSubmittedFiles(prevFiles => {
          const newFileEntry = {
              type: file.type.startsWith("image/") ? "image" : "document",
              transfer_method: "local_file",
              url: "",
              upload_file_id: result.id,
          };
          
          // 添加到文件列表中
          const updatedFiles = [...prevFiles, newFileEntry];
          return updatedFiles;
      });

      toast({ title: "成功", description: `${file.name} 上传成功 (表单)。` });
      
      // 返回给DynamicForm的文件信息
      return { ...uploadedFileInfo, id: tempId }; // Return with the original tempId

    } catch (error) {
      console.error("表单文件上传失败:", error);
      const errorMessage = error instanceof Error ? error.message : "未知上传错误";
      toast({ title: "上传失败", description: `${file.name} 上传失败: ${errorMessage}`, variant: "destructive" });
      // Return error info to DynamicForm
      return { ...fileData, uploading: false, error: errorMessage, id: tempId };
    }
  };

  // <<< NEW: Handler for form file removal - Updates context automatically >>>
  const handleRemoveFileForForm = (fieldId: string, fileIdToRemove: string) => {
      let uploadFileIdToRemove: string | undefined = undefined;
      
      // 获取字段配置，检查是否为file-list类型
      const fieldConfig = appConfig.formConfig?.fields.find(f => f.id === fieldId);
      const originalData = fieldConfig?.originalData || {};
      const controlType = Object.keys(originalData).find(key => 
        ['file', 'file-list'].includes(key)
      );

      // Update the submittedInputs state
      setSubmittedInputs(prevInputs => {
          if (!prevInputs || !prevInputs[fieldId]) return prevInputs; // No state or field not found

          // 处理不同类型的文件字段
          if (controlType === 'file-list') {
            // 对于file-list类型，移除数组中的特定文件
            if (Array.isArray(prevInputs[fieldId])) {
              const updatedFiles = prevInputs[fieldId].filter((fileInput: any) => 
                fileInput.upload_file_id !== fileIdToRemove
              );
              
              const newInputs = { ...prevInputs };
              if (updatedFiles.length > 0) {
                newInputs[fieldId] = updatedFiles;
              } else {
                delete newInputs[fieldId]; // 如果没有文件了，则删除整个条目
              }
              return newInputs;
            }
          } else {
            // 对于单文件类型，检查是否匹配然后删除整个条目
            const fieldInputData = prevInputs[fieldId];
            if (typeof fieldInputData === 'object' && fieldInputData?.upload_file_id === fileIdToRemove) {
                uploadFileIdToRemove = fieldInputData.upload_file_id; // Store the ID for filtering files array
                const newInputs = { ...prevInputs };
                delete newInputs[fieldId]; // Remove the input entry for this field
                return newInputs;
            }
          }

          return prevInputs; // No change if file doesn't match
      });

      // Update the submittedFiles state
      if (fileIdToRemove) {
         setSubmittedFiles(prevFiles => {
             const updatedFiles = prevFiles.filter(f => f.upload_file_id !== fileIdToRemove);
             return updatedFiles;
         });
      }

      // Add logic here if you need to call a backend API to delete the uploaded file from the server.
  };

  // <<< Chat file handlers remain separate >>>
  const handleChatFileUpload = async (file: File): Promise<UploadedFile | null> => {
    const tempId = `temp_chat_${Date.now()}_${file.name}`
    const fileData: UploadedFile = {
      id: tempId,
      name: file.name,
      type: file.type,
      size: file.size,
      uploading: true,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined, // 添加本地预览
    }
    
    // 立即更新 UI 以显示上传中的文件
    setChatUploadedFiles((prev) => [...prev, fileData]);

    const formData = new FormData()
    formData.append("file", file)
    formData.append("user", "test_user") // 替换为实际用户

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dify/files/upload?appId=${appConfig.id}`, // 使用上传端点
        {
          method: "POST",
          body: formData,
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

      const uploadedFileInfo: UploadedFile = {
        ...fileData,
        uploadFileId: result.id,
        uploading: false,
        url: result.url || undefined, // 如果API返回URL
      }
      // 更新状态，替换临时文件对象为包含服务器ID的完整对象
      setChatUploadedFiles((prev) => prev.map(f => f.id === tempId ? uploadedFileInfo : f));
      toast({
        title: "成功",
        description: `${file.name} 上传成功。`,
      })
      return uploadedFileInfo // 返回结果给 SimpleChatInput

    } catch (error) {
      console.error("聊天文件上传失败:", error)
      const errorMessage = error instanceof Error ? error.message : "未知上传错误"
      // 更新状态，标记文件上传失败
       setChatUploadedFiles((prev) => prev.map(f => f.id === tempId ? { ...fileData, uploading: false, error: errorMessage } : f));
      toast({
        title: "上传失败",
        description: `${file.name} 上传失败: ${errorMessage}`,
        variant: "destructive",
      })
       // 释放预览 URL
       if (fileData.preview) {
         URL.revokeObjectURL(fileData.preview);
       }
      // 返回带错误标记的对象
      return { ...fileData, uploading: false, error: errorMessage }
    }
  }
  const handleChatFileRemove = (fileIdToRemove: string) => {
      setChatUploadedFiles((prev) => {
          // 查找要移除的文件以释放可能的预览 URL
          const fileToRemove = prev.find(f => f.id === fileIdToRemove);
          if (fileToRemove?.preview) {
              URL.revokeObjectURL(fileToRemove.preview);
          }
          // 过滤掉要移除的文件
          return prev.filter(file => file.id !== fileIdToRemove);
      });
      // 这里可以添加调用后端删除文件的逻辑（如果需要）
  }

  // 处理开场问题点击
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
    <div className={`flex flex-col h-full bg-white dark:bg-[#0f172a] ${className} flex-grow min-h-0`}>
      {/* 应用内容 */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0">
          {/* 左侧表单区域 */}
          <div className="w-1/3 p-6 border-r border-gray-200 dark:border-[#1e293b] overflow-y-auto flex-shrink-0">
            {appConfig.formConfig && (
              <div className="space-y-6">
                {/* 表单组件 */}
                <DynamicForm
                  fields={appConfig.formConfig.fields}
                  submitButtonText={appConfig.formConfig.submitButtonText || "提交表单"}
                  resetButtonText={appConfig.formConfig.resetButtonText || "重置"}
                  onSubmit={handleFormSubmit}
                  onReset={handleFormReset}
                  isSubmitting={isFormSubmitting}
                  onFileUpload={handleFileUploadForForm}
                  onRemoveFile={handleRemoveFileForForm}
                  hideSubmitButton={appConfig.type === AppType.CHAT}
                  onFieldChange={handleFormFieldChange}
                />
              </div>
            )}
          </div>

          {/* 右侧聊天区域 */}
          <div className="w-2/3 flex flex-col min-h-0 flex-1">
            {/* 应用信息 */}
            <div className="flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 border border-gray-200 dark:border-[#334155] flex items-center justify-center mb-3">
                <img 
                  src={getIconSrc() || "/icons/app-default.svg"} 
                  alt={appConfig.name} 
                  className="w-10 h-10 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/icons/app-default.svg";
                  }}
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{appConfig.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 text-center text-sm">{appConfig.description}</p>
            </div>

            {/* 聊天区域 */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {/* 合并的介绍消息 */}
              <CombinedIntro
                messages={appConfig.introMessages}
                appIcon={getIconSrc()} // 传递应用图标
                suggestedQuestions={appConfig.suggestedQuestions}
                onQuestionClick={handleQuickQuestionClick}
                isLoading={isLoading}
                multiLine={false} // 使用单行模式显示快捷问题
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
                {/* 显示回答后的建议问题 */}
                {suggestedQuestions.length > 0 && !isLoading && messages.length > 0 && (
                  <div className="mt-2 mb-4 border-t border-gray-100 dark:border-gray-800 relative">
                    <div className="absolute top-0 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-white dark:bg-[#0f172a] px-3 py-0.5 text-xs text-gray-500 dark:text-gray-400 z-10 rounded-full border border-gray-100 dark:border-gray-700">
                      试着问问
                    </div>
                    <SuggestedQuestions
                      questions={suggestedQuestions}
                      onQuestionClick={handleQuickQuestionClick}
                      className="mt-3" // 增加顶部间距，为标签留出空间
                    />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 输入区域 - 添加背景阴影以区分 */}
            <div className="bg-gray-50 dark:bg-[#0c1525] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] flex-shrink-0 chat-input-area">
              {mounted && appConfig.type === AppType.CHAT && (
                <SimpleChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="对生成结果不满意？输入修改意见..."
                  appId={appConfig.id}
                  onFileUpload={handleChatFileUpload}
                  uploadedFiles={chatUploadedFiles}
                  onRemoveFile={handleChatFileRemove}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

