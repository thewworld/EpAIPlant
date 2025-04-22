"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sidebar } from "@/components/sidebar"
import { UserProfile } from "@/components/user-profile"
import { Share2, ChevronDown, RefreshCw, Copy, Send, Bot, Globe } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [recentApps, setRecentApps] = useState<any[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const inputContainerRef = useRef<HTMLDivElement>(null)

  // 从本地存储加载最近使用的应用
  useEffect(() => {
    const storedRecentApps = localStorage.getItem("recentApps")
    if (storedRecentApps) {
      try {
        setRecentApps(JSON.parse(storedRecentApps))
      } catch (error) {
        console.error("解析最近使用的应用数据失败:", error)
        setRecentApps([])
      }
    }
  }, [])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  // 自动聚焦输入框
  useEffect(() => {
    if (textareaRef.current && messages.length === 0) {
      textareaRef.current.focus()
    }
  }, [messages.length])

  const handleAppClick = (appId: string) => {
    router.push(`/app/${appId}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // 模拟API调用延迟
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 添加助手回复
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input.trim()),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("发送消息失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 简单的AI响应生成函数
  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("你好") || lowerInput.includes("hi") || lowerInput.includes("hello")) {
      return "你好！我是小易，有什么我可以帮助你的吗？"
    }

    if (lowerInput.includes("名字")) {
      return "我的名字是小易，是EAI平台的智能助手。"
    }

    if (lowerInput.includes("天气")) {
      return "抱歉，我目前无法获取实时天气信息。但我可以帮你解答其他问题！"
    }

    if (lowerInput.includes("谢谢") || lowerInput.includes("感谢")) {
      return "不客气！如果还有其他问题，随时可以问我。"
    }

    return '我理解你的问题是关于"' + userInput + '"。请告诉我更多细节，这样我才能更好地帮助你。'
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 */}
      <Sidebar recentApps={recentApps} onAppClick={handleAppClick} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="sticky top-0 z-10 bg-white border-b flex items-center justify-between h-[60px] px-4">
          <h1 className="text-xl font-semibold text-gray-800">AI 对话</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
            <UserProfile />
          </div>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-4 pb-24">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center mb-6">
                <Bot className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Hi，我是小易</h2>
              <p className="text-gray-500 mb-10 max-w-md text-center">
                我是您的AI助手，可以回答问题、提供信息和帮助您完成各种任务。请在下方输入您的问题。
              </p>

              {/* 示例问题 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full mb-8">
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto text-left"
                  onClick={() => setInput("你能做什么？")}
                >
                  <div>
                    <p className="font-medium">你能做什么？</p>
                    <p className="text-sm text-muted-foreground">了解小易的功能和能力</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto text-left"
                  onClick={() => setInput("帮我写一篇短文")}
                >
                  <div>
                    <p className="font-medium">帮我写一篇短文</p>
                    <p className="text-sm text-muted-foreground">获取写作帮助和创意灵感</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto text-left"
                  onClick={() => setInput("解释一下量子计算")}
                >
                  <div>
                    <p className="font-medium">解释一下量子计算</p>
                    <p className="text-sm text-muted-foreground">获取科学概念的简明解释</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start p-4 h-auto text-left"
                  onClick={() => setInput("推荐几本好书")}
                >
                  <div>
                    <p className="font-medium">推荐几本好书</p>
                    <p className="text-sm text-muted-foreground">获取个性化推荐</p>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <Avatar className={`h-8 w-8 ${message.role === "user" ? "ml-2" : "mr-2"}`}>
                      {message.role === "assistant" ? (
                        <>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white">
                            小易
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback>U</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-gray-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          message.role === "user" ? "text-primary-foreground/70" : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 输入区域 - 调整后的版本 */}
        <div
          ref={inputContainerRef}
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent pt-10"
        >
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* 输入框 */}
              <div className="p-3">
                <Textarea
                  ref={textareaRef}
                  placeholder="有问题，尽管问，shift+回车换行，回车发送"
                  className="w-full border-0 bg-transparent focus-visible:ring-0 resize-none p-0 min-h-[40px] max-h-[200px] placeholder:text-gray-400 text-gray-700"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* 按钮区域 */}
              <div className="flex items-center px-3 py-2 border-t">
                {/* 模型选择 */}
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" className="text-sm font-normal h-8 px-2 text-gray-700">
                    DeepSeek
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* 深度思考按钮 */}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2 h-8 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                >
                  <span className="text-sm">深度思考(R1)</span>
                </Button>

                {/* 联网搜索按钮 */}
                <Button variant="outline" size="sm" className="ml-2 h-8">
                  <Globe className="h-4 w-4 mr-1" />
                  <span className="text-sm">联网搜索</span>
                </Button>

                {/* 右侧按钮组 */}
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                  </Button>

                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Copy className="h-4 w-4 text-gray-500" />
                  </Button>

                  <Button
                    size="icon"
                    className={`h-8 w-8 rounded-full bg-gray-100 hover:bg-gray-200 ${
                      !input.trim() || isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isLoading}
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 text-gray-500" />
                    )}
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

