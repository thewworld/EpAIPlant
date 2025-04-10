"use client"

import type { IntroMessage } from "@/types/app-config"
import { Message } from "./message"

interface IntroMessagesProps {
  messages: IntroMessage[]
  className?: string
}

export function IntroMessages({ messages, className }: IntroMessagesProps) {
  return (
    <div className={className}>
      {messages.map((message, index) => (
        <Message key={index} role="system" content={message.content} icon={message.icon} />
      ))}
    </div>
  )
}

