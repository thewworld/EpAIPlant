"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Globe, RefreshCw, Send } from "lucide-react"
import { getUserAvatarIcon, svgToDataUrl } from "@/lib/app-icons"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  placeholder?: string
  modelName?: string
  enableWebSearch?: boolean
  className?: string
}

export function ChatInput({
  onSendMessage,
  isLoading = false,
  placeholder = "有问题，尽管问，shift+回车换行，回车发送",
  modelName = "Gemini 2.0 Flash",
  enableWebSearch = false,
  className,
}: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 获取用户头像URL
  const userAvatarUrl = svgToDataUrl(getUserAvatarIcon())

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
    if (!input.trim() || isLoading) return
    onSendMessage(input.trim())
    setInput("")
  }

  return (
    <div className={`px-4 md:px-6 lg:px-8 py-4 bg-white dark:bg-[#0f172a] ${className}`}>
      <div className="flex items-start max-w-3xl mx-auto gap-x-3">
        {/* 用户头像 - 使用新的默认用户头像 */}
        <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
          <AvatarImage src={userAvatarUrl} alt="User" />
          <AvatarFallback className="bg-blue-600 dark:bg-blue-700 text-white">U</AvatarFallback>
        </Avatar>

        <div className="flex-1 overflow-hidden bg-white dark:bg-[#1e293b] rounded-lg border border-gray-200 dark:border-[#334155] shadow-sm">
          {/* 输入框 */}
          <div className="p-3">
            <Textarea
              ref={textareaRef}
              placeholder={placeholder}
              className="w-full border-0 bg-transparent focus-visible:ring-0 resize-none p-0 min-h-[40px] max-h-[200px] placeholder:text-gray-400 text-gray-700 dark:text-gray-300 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
          </div>

          {/* 按钮区域 */}
          <div className="flex items-center px-3 py-2 border-t border-gray-200 dark:border-[#334155]">
            {/* 模型选择 */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-sm font-normal h-8 px-2 text-gray-700 dark:text-gray-300"
              >
                {modelName}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 ml-1"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Button>
            </div>

            {/* 联网搜索按钮 */}
            {enableWebSearch && (
              <Button
                variant="outline"
                size="sm"
                className="ml-2 h-8 border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#1e293b]"
              >
                <Globe className="h-4 w-4 mr-1" />
                <span className="text-sm">联网搜索</span>
              </Button>
            )}

            {/* 发送按钮 */}
            <div className="ml-auto">
              <Button
                size="sm"
                className={`h-8 px-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white ${
                  !input.trim() || isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                发送
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

