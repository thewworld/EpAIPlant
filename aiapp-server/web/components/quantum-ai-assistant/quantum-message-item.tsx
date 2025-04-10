"use client"

import { Bot, User } from "lucide-react"
import type { Message } from "./types"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { renderMarkdown } from "@/lib/markdown"

interface QuantumMessageItemProps {
  message: Message
}

export function QuantumMessageItem({ message }: QuantumMessageItemProps) {
  const isAI = message.role === "assistant"
  const formattedTime = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <div className={`flex ${isAI ? "items-start" : "items-start justify-end"}`}>
      {/* AI头像 */}
      {isAI && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mr-2 flex-shrink-0 shadow-lg shadow-blue-500/20 border border-blue-400/30">
          <Bot className="w-4 h-4 text-white" />
          <div className="absolute w-full h-full rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-500/20 animate-pulse"></div>
        </div>
      )}

      {/* 消息内容 */}
      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isAI
            ? "bg-blue-900/30 border border-blue-500/30 text-blue-100"
            : "bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white"
        }`}
      >
        {isAI ? (
          <div className="text-sm space-y-2" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
        <div className={`text-xs mt-1 ${isAI ? "text-blue-300/70" : "text-blue-100/70"}`}>{formattedTime}</div>
      </div>

      {/* 用户头像 */}
      {!isAI && (
        <div className="w-8 h-8 rounded-lg bg-blue-800/50 flex items-center justify-center ml-2 flex-shrink-0 border border-blue-500/30">
          <User className="w-4 h-4 text-blue-200" />
        </div>
      )}
    </div>
  )
}

