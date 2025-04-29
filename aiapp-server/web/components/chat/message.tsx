"use client"

import React from "react"

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
  textContent?: string // 添加可选的纯文本内容属性，用于复制
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
  textContent,
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
    // 优先使用传入的textContent
    let textToCopy = textContent || '';
    
    // 如果没有提供textContent，则尝试从content中提取
    if (!textToCopy) {
      if (typeof content === "string") {
        textToCopy = content;
      } else if (content && typeof content === "object") {
        if (React.isValidElement(content)) {
          // 如果是 React 元素，尝试获取其文本内容
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = content.toString();
          textToCopy = tempDiv.textContent || tempDiv.innerText || "";
        } else {
          // 如果是普通对象，转换为字符串
          try {
            textToCopy = JSON.stringify(content, null, 2);
          } catch (e) {
            textToCopy = String(content);
          }
        }
      } else {
        textToCopy = String(content || '');
      }
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      if (onCopy) onCopy(textToCopy);

      // 2秒后重置复制状态
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }).catch(error => {
      console.error('复制失败:', error);
    });
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
        "group py-3 flex items-start px-2 sm:px-3 md:px-5 lg:px-6 max-w-4xl mx-auto",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div className={cn("flex max-w-[90%] md:max-w-[85%]", isUser ? "flex-row-reverse" : "flex-row", "items-start gap-x-2")}>
        {/* 头像 */}
        <Avatar className={cn("h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 mt-0.5", isUser ? "ml-1 sm:ml-2" : "mr-1 sm:mr-2")}>
          {isUser ? (
            // 用户头像 - 使用新的默认用户头像
            <AvatarImage src={userAvatarUrl} alt="User" />
          ) : (
            // 系统或助手头像 - 使用应用图标
            <>
              {appIcon ? (
                <img 
                  src={appIcon} 
                  alt={role === "assistant" ? "AI" : "System"}
                  className="w-full h-full object-contain rounded-full"
                  onError={(e) => {
                    // 图标加载失败时使用默认图标
                    e.currentTarget.src = "/icons/app-default.svg";
                  }}
                />
              ) : (
                <AvatarFallback
                  className={cn(
                    "text-white",
                    role === "system"
                      ? "bg-purple-500 dark:bg-purple-600"
                      : "bg-pink-500 dark:bg-pink-600",
                  )}
                >
                  {role === "assistant" ? "AI" : "S"}
                </AvatarFallback>
              )}
            </>
          )}
          {!isUser && !appIcon && (
            <AvatarFallback
              className={cn(
                "text-white",
                role === "system"
                  ? "bg-purple-500 dark:bg-purple-600"
                  : "bg-pink-500 dark:bg-pink-600",
              )}
            >
              {role === "assistant" ? "AI" : "S"}
            </AvatarFallback>
          )}
          {isUser && (
            <AvatarFallback
              className="text-white bg-blue-600 dark:bg-blue-700"
            >
              U
            </AvatarFallback>
          )}
        </Avatar>

        {/* 消息内容 */}
        <div
          className={cn(
            "overflow-hidden rounded-lg py-2 px-3",
            isUser
              ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
              : "bg-[#f5f3ff] text-gray-800 dark:bg-[#1e1b4b]/20 dark:text-gray-200",
          )}
        >
          <div className="prose prose-sm max-w-none break-words">
            {icon && role === "system" && (
              <div className="flex items-start gap-2 mb-1">
                <span className="text-lg">{icon}</span>
              </div>
            )}
            {typeof content === "string" ? <div className="whitespace-pre-wrap">{content}</div> : content}
            {timestamp && (
              <div
                className={cn(
                  "text-xs mt-1.5",
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
            <div className="flex items-center mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 rounded-md" onClick={handleCopy}>
                      {copied ? (
                        <CheckCheck className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
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
                      className={cn("h-6 rounded-md", liked && "text-green-500")}
                      onClick={handleLike}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
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
                      className={cn("h-6 rounded-md", disliked && "text-red-500")}
                      onClick={handleDislike}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" />
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

