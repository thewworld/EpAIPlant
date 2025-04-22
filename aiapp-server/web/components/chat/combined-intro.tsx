"use client"

import type { IntroMessage } from "@/types/app-config"
import { Message } from "./message"
import { useToast } from "@/components/ui/use-toast"

interface CombinedIntroProps {
  messages: IntroMessage[]
  className?: string
  appIcon?: string // 添加应用图标属性
}

export function CombinedIntro({ messages, className, appIcon }: CombinedIntroProps) {
  const { toast } = useToast()

  // 合并所有介绍消息
  const combinedContent = messages
    .map((msg) => {
      const iconPrefix = msg.icon ? `${msg.icon} ` : ""
      return `${iconPrefix}${msg.content}`
    })
    .join("\n\n")

  // 处理复制消息
  const handleCopyMessage = (content: string) => {
    toast({
      title: "已复制到剪贴板",
      description: "消息内容已成功复制",
      duration: 2000,
    })
  }

  return (
    <div className={className}>
      <Message
        role="assistant"
        content={combinedContent}
        onCopy={handleCopyMessage}
        appIcon={appIcon} // 传递应用图标
      />
    </div>
  )
}

