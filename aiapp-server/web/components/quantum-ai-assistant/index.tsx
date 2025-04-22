"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { QuantumFloatingButton } from "./quantum-floating-button"
import { QuantumChatInterface } from "./quantum-chat-interface"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Message } from "./types"
import { isSpeechSynthesisSupported, speakText } from "@/lib/speech-utils"

// 添加位置类型
interface Position {
  x: number
  y: number
}

export function QuantumAIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useLocalStorage<Message[]>("quantum-ai-messages", [
    {
      id: "welcome",
      content: "欢迎使用小易AI助手，我可以帮助您回答问题、提供研究建议或协助写作。请问有什么我可以帮您的？",
      role: "assistant",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  // 添加按钮位置状态
  const [buttonPosition, setButtonPosition] = useState<Position>({ x: 0, y: 0 })
  // 添加自动朗读设置
  const [autoSpeak, setAutoSpeak] = useState(false)
  const lastMessageRef = useRef<Message | null>(null)

  // 处理发送消息
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // 添加用户消息
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: "user",
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, userMessage])
    setInputValue("")
    setIsLoading(true)

    // 模拟AI响应
    setTimeout(() => {
      const aiResponse: Message = {
        id: `assistant-${Date.now()}`,
        content: getAIResponse(inputValue),
        role: "assistant",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiResponse])
      setIsLoading(false)

      // 保存最新消息用于自动朗读
      lastMessageRef.current = aiResponse
    }, 1000)
  }

  // 自动朗读最新的AI回复
  useEffect(() => {
    // 如果启用了自动朗读，且有新的AI回复
    if (autoSpeak && lastMessageRef.current && isSpeechSynthesisSupported()) {
      const message = lastMessageRef.current

      // 只朗读助手的消息
      if (message.role === "assistant") {
        speakText(message.content)
      }

      // 重置最新消息
      lastMessageRef.current = null
    }
  }, [messages, autoSpeak])

  // 清除对话历史
  const clearMessages = () => {
    setMessages([
      {
        id: "welcome",
        content: "对话已清除。有什么我可以帮您的？",
        role: "assistant",
        timestamp: new Date().toISOString(),
      },
    ])
  }

  // 模拟AI响应
  const getAIResponse = (query: string): string => {
    const responses = [
      "我正在分析您的问题，根据量子计算模型，这个问题有多种可能的解决方案...",
      "从研究数据来看，您提到的领域正在快速发展，最新的进展包括...",
      "这是一个很好的问题！根据最新的研究文献，我可以提供以下见解...",
      "我的神经网络分析表明，这个问题可以从多个角度来看...",
      "根据我的量子数据库，您的问题涉及到几个关键概念...",
      "这是一个复杂的问题，让我从基础原理开始解释...",
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  // 使用 useCallback 记忆位置更新函数，避免不必要的重新渲染
  const handlePositionChange = useCallback((position: Position) => {
    setButtonPosition(position)
  }, [])

  // 切换自动朗读设置
  const toggleAutoSpeak = useCallback(() => {
    setAutoSpeak((prev) => !prev)
  }, [])

  return (
    <>
      <QuantumFloatingButton
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        onPositionChange={handlePositionChange}
      />
      {isOpen && (
        <QuantumChatInterface
          messages={messages}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          clearMessages={clearMessages}
          buttonPosition={buttonPosition}
        />
      )}
    </>
  )
}

