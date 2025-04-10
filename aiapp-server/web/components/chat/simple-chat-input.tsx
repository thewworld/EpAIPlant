"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, RefreshCw, Image, Paperclip, X } from "lucide-react"
import { getUserAvatarIcon, svgToDataUrl } from "@/lib/app-icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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

interface SimpleChatInputProps {
  onSendMessage: (message: string, files?: UploadedFile[]) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
  appId?: string
  onFileUpload?: (file: File) => Promise<UploadedFile | null>
  uploadedFiles?: UploadedFile[]
  onRemoveFile?: (id: string) => void
}

export function SimpleChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "有问题，尽管问，shift+回车换行，回车发送",
  className,
  appId,
  onFileUpload,
  uploadedFiles = [],
  onRemoveFile,
}: SimpleChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // 获取用户头像URL
  const userAvatarUrl = svgToDataUrl(getUserAvatarIcon())

  // 在现有的 useEffect 之前添加一个新的 useEffect 用于初始化
  useEffect(() => {
    // 强制在组件挂载后重新计算布局
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
      }
    }, 0)

    return () => clearTimeout(timer)
  }, []) // 空依赖数组确保只在组件挂载时执行一次

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = () => {
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return
    onSendMessage(input.trim(), uploadedFiles.length > 0 ? uploadedFiles : undefined)
    setInput("")
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !onFileUpload) return

    for (const file of Array.from(files)) {
      await onFileUpload(file)
    }

    e.target.value = ""
  }

  const removeFile = (id: string) => {
    if (onRemoveFile) {
      onRemoveFile(id)
    }
  }

  return (
    <div className={`px-4 md:px-6 lg:px-8 py-4 bg-white dark:bg-[#0f172a] ${className}`}>
      <div className="flex flex-col max-w-3xl mx-auto">
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 ml-11">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="relative group bg-gray-100 dark:bg-gray-800 rounded-md p-1 flex items-center gap-2"
              >
                {file.uploading && (
                   <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-1"></div>
                )}
                {file.error && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                         <X className="w-4 h-4 text-red-500 mr-1" />
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs text-red-600">{file.error}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {!file.uploading && !file.error && (
                    file.type.startsWith("image/") ? (
                    <div className="w-8 h-8 relative overflow-hidden rounded">
                      <img
                        src={file.preview || file.url || "/placeholder.svg"}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Paperclip className="w-4 h-4 text-gray-500" />
                  )
                )}
                <span className="text-xs text-gray-700 dark:text-gray-300 max-w-[120px] truncate">{file.name}</span>
                <button
                  className="absolute -top-1 -right-1 bg-gray-200 dark:bg-gray-700 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFile(file.id)}
                  disabled={file.uploading}
                >
                  <X className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-x-3">
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={userAvatarUrl} alt="User" />
            <AvatarFallback className="bg-blue-600 dark:bg-blue-700 text-white">U</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="border border-gray-200 dark:border-[#334155] rounded-lg shadow-sm overflow-hidden relative">
              <Textarea
                ref={textareaRef}
                placeholder={placeholder}
                className="w-full resize-none min-h-[40px] max-h-[200px] border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pb-12"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
              />

              <div className="absolute bottom-2 right-2 flex items-center">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
                <input
                  type="file"
                  ref={imageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                  multiple
                />

                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>上传文件</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>上传图片</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    size="icon"
                    className="h-8 w-8 rounded-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white"
                    onClick={handleSendMessage}
                    disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

