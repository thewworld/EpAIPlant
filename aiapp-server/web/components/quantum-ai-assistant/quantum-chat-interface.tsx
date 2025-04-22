"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { QuantumMessageItem } from "./quantum-message-item"
import { Send, Trash2, X, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import type { Message } from "./types"
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  createSpeechRecognition,
  speakText,
  stopSpeaking,
} from "@/lib/speech-utils"
import { SpeechWave } from "./speech-wave"

// 添加位置类型
interface Position {
  x: number
  y: number
}

// 更新接口以包含按钮位置
interface QuantumChatInterfaceProps {
  messages: Message[]
  inputValue: string
  setInputValue: (value: string) => void
  handleSendMessage: () => void
  isLoading: boolean
  onClose: () => void
  clearMessages: () => void
  buttonPosition: Position
}

export function QuantumChatInterface({
  messages,
  inputValue,
  setInputValue,
  handleSendMessage,
  isLoading,
  onClose,
  clearMessages,
  buttonPosition,
}: QuantumChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const chatWidth = 400
  const chatHeight = 500

  // 语音相关状态
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const [synthesisSupported, setSynthesisSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // 计算最终位置
  const calculateFinalPosition = () => {
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // 计算对话框位置
    let finalLeft, finalTop

    // 水平位置计算
    if (buttonPosition.x < windowWidth / 2) {
      // 按钮在左半边屏幕，对话框显示在右侧
      finalLeft = buttonPosition.x + 60
    } else {
      // 按钮在右半边屏幕，对话框显示在左侧
      finalLeft = buttonPosition.x - chatWidth - 20
    }

    // 垂直位置计算
    if (buttonPosition.y < windowHeight / 2) {
      // 按钮在上半部分屏幕，对话框显示在下方
      finalTop = buttonPosition.y
    } else {
      // 按钮在下半部分屏幕，对话框显示在上方
      finalTop = buttonPosition.y - chatHeight + 60
    }

    // 确保对话框不会超出屏幕边界
    finalLeft = Math.max(10, Math.min(windowWidth - chatWidth - 10, finalLeft))
    finalTop = Math.max(10, Math.min(windowHeight - chatHeight - 10, finalTop))

    return { finalLeft, finalTop }
  }

  // 使用按钮位置作为初始位置
  const [chatPosition, setChatPosition] = useState({
    left: buttonPosition.x,
    top: buttonPosition.y,
    scale: 0.01,
    opacity: 0,
  })

  // 初始化语音识别和合成
  useEffect(() => {
    // 检查浏览器支持
    const recognitionSupported = isSpeechRecognitionSupported()
    const synthSupported = isSpeechSynthesisSupported()

    setSpeechSupported(recognitionSupported)
    setSynthesisSupported(synthSupported)

    // 如果支持语音识别，初始化
    if (recognitionSupported) {
      try {
        const recognition = createSpeechRecognition()
        recognitionRef.current = recognition

        // 设置事件处理
        recognition.onresult = (event: any) => {
          const resultIndex = event.resultIndex
          const transcript = event.results[resultIndex][0].transcript

          if (event.results[resultIndex].isFinal) {
            // 最终结果
            setInputValue((prev) => prev + transcript)
          }
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsListening(false)
        }
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error)
        setSpeechSupported(false)
      }
    }

    // 清理函数
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // 忽略错误
        }
      }

      if (currentUtteranceRef.current) {
        stopSpeaking()
      }
    }
  }, [setInputValue])

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 自动聚焦输入框
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // 组件挂载时的动画效果 - 简化版本，减少抖动
  useEffect(() => {
    // 计算最终位置
    const { finalLeft, finalTop } = calculateFinalPosition()

    // 设置初始状态 - 从按钮中心开始
    setChatPosition({
      left: buttonPosition.x - 28, // 按钮中心位置 (28 = 按钮宽度的一半)
      top: buttonPosition.y - 28, // 按钮中心位置 (28 = 按钮高度的一半)
      scale: 0.01,
      opacity: 0,
    })

    // 使用单个setTimeout，避免多层嵌套导致的时序问题
    setTimeout(() => {
      setIsVisible(true)
      setChatPosition({
        left: finalLeft,
        top: finalTop,
        scale: 1,
        opacity: 1,
      })
    }, 50)
  }, [buttonPosition])

  // 处理按键事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // 处理语音识别开关
  const toggleSpeechRecognition = useCallback(() => {
    if (!speechSupported || !recognitionRef.current) return

    if (isListening) {
      // 停止监听
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      // 开始监听
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
      }
    }
  }, [isListening, speechSupported])

  // 朗读最新消息
  const speakLatestMessage = useCallback(() => {
    if (!synthesisSupported || messages.length === 0) return

    // 找到最新的助手消息
    const latestAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant")

    if (!latestAssistantMessage) return

    if (isSpeaking) {
      // 如果正在朗读，停止
      stopSpeaking()
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    } else {
      // 开始朗读
      try {
        const utterance = speakText(latestAssistantMessage.content)
        currentUtteranceRef.current = utterance
        setIsSpeaking(true)

        utterance.onend = () => {
          setIsSpeaking(false)
          currentUtteranceRef.current = null
        }

        utterance.onerror = () => {
          setIsSpeaking(false)
          currentUtteranceRef.current = null
        }
      } catch (error) {
        console.error("Failed to speak text:", error)
      }
    }
  }, [messages, synthesisSupported, isSpeaking])

  if (!isVisible) return null

  return (
    <div
      className="fixed z-40 w-[350px] sm:w-[400px] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl"
      style={{
        left: `${chatPosition.left}px`,
        top: `${chatPosition.top}px`,
        width: `${chatWidth}px`,
        height: `${chatHeight}px`,
        opacity: chatPosition.opacity,
        transform: `scale(${chatPosition.scale})`,
        transformOrigin: "center",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* 全息投影边框效果 */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 opacity-70"></div>
      <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 blur-sm"></div>

      {/* 主容器 */}
      <div className="relative flex flex-col h-full bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl overflow-hidden">
        {/* 背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMDQyN2IiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiBvcGFjaXR5PSIwLjEiLz48L3N2Zz4=')] opacity-20 z-0"></div>

        {/* 头部 */}
        <div className="relative flex items-center justify-between p-3 border-b border-blue-500/30 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-10">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
            <h3 className="text-blue-100 font-medium text-sm">小易AI助手</h3>
          </div>
          <div className="flex items-center space-x-2">
            {/* 语音合成按钮 */}
            {synthesisSupported && (
              <button
                onClick={speakLatestMessage}
                className="p-1.5 rounded-full hover:bg-blue-800/30 transition-colors"
                aria-label={isSpeaking ? "停止朗读" : "朗读消息"}
                title={isSpeaking ? "停止朗读" : "朗读消息"}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-blue-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-blue-300" />
                )}
              </button>
            )}

            <button
              onClick={clearMessages}
              className="p-1.5 rounded-full hover:bg-blue-800/30 transition-colors"
              aria-label="清除对话"
              title="清除对话"
            >
              <Trash2 className="w-4 h-4 text-blue-300" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-blue-800/30 transition-colors"
              aria-label="关闭"
              title="关闭"
            >
              <X className="w-4 h-4 text-blue-300" />
            </button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin scrollbar-thumb-blue-700 scrollbar-track-transparent">
          {messages.map((message) => (
            <QuantumMessageItem key={message.id} message={message} />
          ))}

          {/* 加载指示器 */}
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-300 text-xs">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse delay-200"></div>
              <span className="ml-2">小易思考中...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="relative p-3 border-t border-blue-500/30 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-10">
          <div className="flex items-center space-x-2">
            {/* 语音输入按钮 */}
            {speechSupported && (
              <button
                onClick={toggleSpeechRecognition}
                className={`p-2 rounded-lg ${
                  isListening ? "bg-red-600 text-white" : "bg-blue-800/30 text-blue-300 hover:bg-blue-700/40"
                } transition-colors`}
                aria-label={isListening ? "停止语音输入" : "开始语音输入"}
                title={isListening ? "停止语音输入" : "开始语音输入"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "正在聆听..." : "输入您的问题..."}
              className={`flex-1 bg-blue-950/50 text-blue-100 placeholder-blue-400/70 text-sm rounded-lg px-3 py-2 border border-blue-500/30 focus:outline-none focus:ring-1 focus:ring-blue-500/50 ${
                isListening ? "border-red-500/50 ring-1 ring-red-500/30" : ""
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={`p-2 rounded-lg ${
                !inputValue.trim() || isLoading
                  ? "bg-blue-800/30 text-blue-300/50"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
              } transition-colors`}
              aria-label="发送"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* 语音识别状态指示 */}
          {isListening && (
            <div className="absolute -top-10 left-0 right-0 flex justify-center">
              <div className="px-3 py-1 bg-red-600/80 rounded-t-lg text-white text-xs flex flex-col items-center">
                <div className="flex items-center mb-1">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-1"></div>
                  正在聆听...
                </div>
                <SpeechWave isActive={isListening} className="w-32" />
              </div>
            </div>
          )}

          {/* 脉冲效果 */}
          <div
            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-70"
            style={{ backgroundSize: "200% 100%", animation: "gradientMove 3s linear infinite" }}
          ></div>
        </div>
      </div>
    </div>
  )
}

