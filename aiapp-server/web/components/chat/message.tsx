"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Copy, ThumbsUp, ThumbsDown, CheckCheck } from "lucide-react"
import { getUserAvatarIcon, svgToDataUrl } from "@/lib/app-icons"

export interface MessageProps {
  id?: string
  role: "user" | "assistant" | "system"
  content: string | React.ReactNode
  icon?: string
  timestamp?: Date
  isLoading?: boolean
  isStreaming?: boolean
  className?: string
  appIcon?: string // 应用图标属性
  onCopy?: (content: string) => void
  onLike?: (id?: string) => void
  onDislike?: (id?: string) => void
}

export function Message({
  id,
  role,
  content,
  icon,
  timestamp,
  isLoading,
  isStreaming,
  className,
  appIcon, // 应用图标参数
  onCopy,
  onLike,
  onDislike,
}: MessageProps) {
  const isUser = role === "user"
  const [copied, setCopied] = useState(false)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)

  // 获取用户头像URL
  const userAvatarUrl = svgToDataUrl(getUserAvatarIcon())

  // 处理复制内容
  const handleCopy = () => {
    // 如果内容是字符串，直接复制
    if (typeof content === "string") {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true)
        if (onCopy) onCopy(content)

        // 2秒后重置复制状态
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    } else {
      // 如果内容是JSX，尝试提取文本内容
      const tempDiv = document.createElement("div")
      // 这里使用一个简单的方法来尝试提取文本
      // 注意：这种方法可能不完美，特别是对于复杂的JSX结构
      tempDiv.innerHTML = content.toString()
      const textContent = tempDiv.textContent || tempDiv.innerText || ""

      navigator.clipboard.writeText(textContent).then(() => {
        setCopied(true)
        if (onCopy) onCopy(textContent)

        // 2秒后重置复制状态
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
    }
  }

  // 处理点赞
  const handleLike = () => {
    if (disliked) setDisliked(false)
    setLiked(!liked)
    if (onLike) onLike(id)
  }

  // 处理点踩
  const handleDislike = () => {
    if (liked) setLiked(false)
    setDisliked(!disliked)
    if (onDislike) onDislike(id)
  }

  return (
    <div
      className={cn(
        "group py-4 flex items-start px-4 md:px-6 lg:px-8 max-w-3xl mx-auto",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div className={cn("flex max-w-[80%]", isUser ? "flex-row-reverse" : "flex-row", "items-start gap-x-3")}>
        {/* 头像 */}
        <Avatar className={cn("h-8 w-8 flex-shrink-0 mt-0.5", isUser ? "ml-2" : "mr-2")}>
          {isUser ? (
            // 用户头像 - 使用新的默认用户头像
            <AvatarImage src={userAvatarUrl} alt="User" />
          ) : (
            // 系统或助手头像 - 使用应用图标
            <>
              {appIcon ? (
                <AvatarImage src={appIcon} alt={role === "assistant" ? "AI" : "System"} />
              ) : (
                <AvatarImage src="/placeholder.svg" alt={role === "assistant" ? "AI" : "System"} />
              )}
            </>
          )}
          <AvatarFallback
            className={cn(
              "text-white",
              isUser
                ? "bg-blue-600 dark:bg-blue-700"
                : role === "system"
                  ? "bg-purple-500 dark:bg-purple-600"
                  : "bg-pink-500 dark:bg-pink-600",
            )}
          >
            {isUser ? "U" : role === "assistant" ? "AI" : "S"}
          </AvatarFallback>
        </Avatar>

        {/* 消息内容 */}
        <div
          className={cn(
            "overflow-hidden rounded-lg p-3",
            isUser
              ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              : "bg-[#f5f3ff] text-gray-800 dark:bg-[#1e1b4b]/20 dark:text-gray-200",
          )}
        >
          <div className="prose prose-sm max-w-none">
            {icon && role === "system" && (
              <div className="flex items-start gap-2 mb-1">
                <span className="text-lg">{icon}</span>
              </div>
            )}
            {typeof content === "string" ? <div className="whitespace-pre-wrap">{content}</div> : content}
            {timestamp && (
              <div
                className={cn(
                  "text-xs mt-2",
                  isUser ? "text-gray-500 dark:text-gray-400" : "text-gray-500 dark:text-gray-400",
                )}
              >
                {timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>

          {/* 交互按钮 */}
          {role === "assistant" && !isLoading && !isStreaming && (
            <div className="flex items-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 rounded-md" onClick={handleCopy}>
                      {copied ? (
                        <CheckCheck className="h-3.5 w-3.5 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1 text-gray-500 dark:text-gray-400" />
                      )}
                      <span className="text-xs">{copied ? "已复制" : "复制"}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{copied ? "已复制" : "复制"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-7 rounded-md", liked && "text-green-500")}
                      onClick={handleLike}
                    >
                      <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">有用</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{liked ? "取消点赞" : "点赞"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn("h-7 rounded-md", disliked && "text-red-500")}
                      onClick={handleDislike}
                    >
                      <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">无用</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{disliked ? "取消点踩" : "点踩"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

