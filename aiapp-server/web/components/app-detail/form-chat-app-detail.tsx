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
import { callDifyApi, type DifyApiParams, type DifyApiResponse } from "@/lib/dify-api"
import { API_BASE_URL } from "@/lib/constants"

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
  const [submittedFiles, setSubmittedFiles] = useState<any[]>([]); // Initialize as empty array
  const [chatUploadedFiles, setChatUploadedFiles] = useState<UploadedFile[]>([]);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 在现有的 useEffect 后添加
  useEffect(() => {
    // 确保组件完全挂载后再显示输入框
    setMounted(true)
  }, [])

  // 处理发送消息 (聊天输入框)
  const handleSendMessage = async (content: string) => {
    if (!content.trim() && chatUploadedFiles.filter(f => !f.error && f.uploadFileId).length === 0) {
      console.log("发送消息: 内容为空且没有有效文件，终止发送")
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

    try {
      // 构建完整的请求参数，包含表单参数和聊天输入框参数
      const apiParams: DifyApiParams = {
        query: content,
        user: "test_user",
        conversation_id: "",
        inputs: submittedInputs || {}, // 使用已提交的表单参数
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
    } catch (error) {
      console.error("发送消息失败:", error)
      const errorMessage = error instanceof Error ? error.message : "处理消息时出错"
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

    const userContentParts: string[] = ["提交表单:"]
    const currentFormInputs: Record<string, any> = {}
    let thinkingMessageId: string | undefined

    try {
       for (const fieldId in formData) {
        const fieldConfig = appConfig.formConfig?.fields.find((f) => f.id === fieldId)
        const value = formData[fieldId]

          if (fieldConfig?.type === FieldType.FILE && Array.isArray(value)) {
          const uploadedFilesArray = value as UploadedFile[]
          const successfulUploads = uploadedFilesArray.filter(f => f.uploadFileId && !f.error)

            if (successfulUploads.length > 0) {
            userContentParts.push(`${fieldConfig?.label || fieldId}: ${successfulUploads.map(f => f.name).join(', ')}`)
                
            // 处理表单文件字段，添加到 inputs 中
                    if (fieldId === "paper1" && successfulUploads[0]) {
                         currentFormInputs[fieldId] = {
                            type: "document",
                    transfer_method: "local_file",
                            url: "",
                            upload_file_id: successfulUploads[0].uploadFileId
              }
            } else {
              // 其他文件字段也按照相同格式处理
              currentFormInputs[fieldId] = {
                type: "document",
                transfer_method: "local_file",
                url: "",
                upload_file_id: successfulUploads[0].uploadFileId
              }
            }
          } else {
            userContentParts.push(`${fieldConfig?.label || fieldId}: (无有效上传文件)`)
          }
        } else {
          userContentParts.push(`${fieldConfig?.label || fieldId}: ${value}`)
          currentFormInputs[fieldId] = value
        }
      }

      // 保存表单参数，供后续聊天使用
      setSubmittedInputs(currentFormInputs)

    const userMessage: ChatMessage = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      role: "user",
        content: userContentParts.join("\n"),
      timestamp: new Date(),
    }

      setMessages(prev => [...prev, userMessage])

      // 立即添加一个正在思考的助手消息
      thinkingMessageId = `thinking-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const thinkingMessage: ChatMessage = {
        id: thinkingMessageId,
        content: '正在思考...',
        role: 'assistant',
        timestamp: new Date(),
        isStreaming: true
      }
      setMessages(prev => [...prev, thinkingMessage])

      // 构建完整的请求参数，包含表单参数和聊天输入框参数
      const apiParams: DifyApiParams = {
        query: "",
        user: "test_user",
        conversation_id: "",
        inputs: currentFormInputs, // 表单参数
        files: chatUploadedFiles.filter(f => f.uploadFileId && !f.error).map(f => ({
          type: f.type.startsWith("image/") ? "image" : "document",
          transfer_method: "local_file",
          url: "",
          upload_file_id: f.uploadFileId!,
        })), // 聊天输入框上传的文件
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
        (content) => {
          if (thinkingMessageId) {
            setMessages(prev => prev.map(msg =>
              msg.id === thinkingMessageId
                ? { ...msg, content, isStreaming: true }
                : msg
            ))
            // 当开始收到流式数据时，关闭加载状态
            if (content) {
              setIsLoading(false)
            }
          }
        },
        // 流式结束处理
        () => {
          if (thinkingMessageId) {
            setMessages(prev => prev.map(msg =>
              msg.id === thinkingMessageId
                ? { ...msg, isStreaming: false }
                : msg
            ))
          }
        }
      )

      if (response && thinkingMessageId) {
        // 如果是阻塞式响应，更新消息内容
        setMessages(prev => prev.map(msg =>
          msg.id === thinkingMessageId
            ? { ...msg, content: response.content, isStreaming: false }
            : msg
        ))
        setIsLoading(false)
      }
    } catch (error) {
      console.error("表单提交失败:", error)
      const errorMessage = error instanceof Error ? error.message : "处理表单时出错"
      // 移除正在思考的消息
      if (thinkingMessageId) {
        setMessages(prev => prev.filter(msg => msg.id !== thinkingMessageId))
      }
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
      setIsFormSubmitting(false)
      setIsLoading(false)
    }
  }

  // 处理表单重置
  const handleFormReset = () => {
    // 表单重置逻辑
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
         const inputData = {
             type: file.type.startsWith("image/") ? "image" : "document",
             transfer_method: "local_file",
             url: "",
             upload_file_id: result.id,
         };
         // Handle multiple files for one fieldId if form allows (e.g., store as array)
         // Simple case: Assume one file per field or overwrite
         newInputs[fieldId] = inputData; // Example: Directly set/overwrite for the fieldId
         // Specific logic for "paper1" if needed:
         // if (fieldId === "paper1") { newInputs[fieldId] = inputData; }

         console.log(`FormChatAppDetail: Auto-updating submittedInputs for field '${fieldId}'`, newInputs);
         return newInputs;
      });

      setSubmittedFiles(prevFiles => {
          const newFileEntry = {
              type: file.type.startsWith("image/") ? "image" : "document",
              transfer_method: "local_file",
              url: "",
              upload_file_id: result.id,
          };
          // Avoid duplicates if the same file is somehow uploaded again?
          // Simple approach: Add the new file entry.
          const updatedFiles = [...prevFiles, newFileEntry];
          console.log(`FormChatAppDetail: Auto-updating submittedFiles`, updatedFiles);
          return updatedFiles;
          // More robust: Filter out previous entries for the same fieldId before adding?
      });

      toast({ title: "成功", description: `${file.name} 上传成功 (表单)。` });
      // Return the info needed by DynamicForm to update *its* internal state
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
  const handleRemoveFileForForm = (fieldId: string, fileIdToRemove: string) => { // fileId here is likely the tempId or uploadFileId
      console.log(`FormChatAppDetail: Removing file from form: fieldId=${fieldId}, fileId=${fileIdToRemove}`);

      let uploadFileIdToRemove: string | undefined = undefined;

      // Update the submittedInputs state
      setSubmittedInputs(prevInputs => {
          if (!prevInputs || !prevInputs[fieldId]) return prevInputs; // No state or field not found

          const fieldInputData = prevInputs[fieldId];
          // Check if the input for this field matches the file being removed
          // This logic depends heavily on how you store file info in inputs (single object vs array)
          if (typeof fieldInputData === 'object' && fieldInputData?.upload_file_id === fileIdToRemove) {
              uploadFileIdToRemove = fieldInputData.upload_file_id; // Store the ID for filtering files array
              const newInputs = { ...prevInputs };
              delete newInputs[fieldId]; // Remove the input entry for this field
              console.log(`FormChatAppDetail: Auto-removing input for field '${fieldId}'`);
              return newInputs;
          }
          // Add logic here if fieldInputData is an array of files

          return prevInputs; // No change if file doesn't match
      });

      // Update the submittedFiles state using the uploadFileId found above
      // We need the *actual* uploadFileId, not just the tempId from the UI component
      // This requires that fileIdToRemove passed from DynamicForm IS the uploadFileId or we find it first.
      // Let's *assume* fileIdToRemove is the uploadFileId for now.
      // A more robust solution might involve DynamicForm passing back the full UploadedFile object on remove.
      if (fileIdToRemove) { // If we assume fileIdToRemove is the upload_file_id
         setSubmittedFiles(prevFiles => {
             const updatedFiles = prevFiles.filter(f => f.upload_file_id !== fileIdToRemove);
             if (updatedFiles.length !== prevFiles.length) {
                 console.log(`FormChatAppDetail: Auto-removing file entry with upload_file_id '${fileIdToRemove}'`);
             }
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
      console.log(`Removed chat file: ${fileIdToRemove}`);
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-[#0f172a] ${className} flex-grow min-h-0`}>
      {/* 应用内容 */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex flex-1 min-h-0">
          {/* 左侧表单区域 */}
          <div className="w-1/3 p-6 border-r border-gray-200 dark:border-[#1e293b] overflow-y-auto flex-shrink-0">
            <div className="mb-6">
              {appConfig.formConfig && (
                <DynamicForm
                  fields={appConfig.formConfig.fields}
                  submitButtonText={appConfig.formConfig.submitButtonText}
                  resetButtonText={appConfig.formConfig.resetButtonText}
                  onSubmit={handleFormSubmit}
                  onReset={handleFormReset}
                  isSubmitting={isFormSubmitting}
                  onFileUpload={handleFileUploadForForm}
                  onRemoveFile={handleRemoveFileForForm}
                  hideSubmitButton={appConfig.type === AppType.CHAT}
                />
              )}
            </div>
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
                    console.error('应用图标加载失败:', e);
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
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 输入区域 - 添加背景阴影以区分 */}
            <div className="bg-gray-50 dark:bg-[#0c1525] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)] flex-shrink-0">
              {mounted && (
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

