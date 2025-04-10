"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Bot, X } from "lucide-react"

// 添加位置类型和回调属性
interface Position {
  x: number
  y: number
}

interface QuantumFloatingButtonProps {
  isOpen: boolean
  onClick: () => void
  onPositionChange: (position: Position) => void
}

export function QuantumFloatingButton({ isOpen, onClick, onPositionChange }: QuantumFloatingButtonProps) {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLDivElement>(null)

  // 初始化位置
  useEffect(() => {
    // 默认位置在右下角
    const initialX = window.innerWidth - 80
    const initialY = window.innerHeight - 80

    // 只在组件首次挂载时设置初始位置
    setPosition({ x: initialX, y: initialY })

    // 使用 setTimeout 来确保在下一个渲染周期调用 onPositionChange
    const timer = setTimeout(() => {
      onPositionChange({ x: initialX, y: initialY })
    }, 0)

    return () => clearTimeout(timer)
  }, []) // 移除依赖项，只在组件挂载时执行一次

  // 处理拖拽开始
  const handleMouseDown = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  // 添加防抖引用
  const lastUpdateRef = useRef<number>(0)

  // 处理拖拽移动，添加防抖逻辑
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragOffset.x))
      const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragOffset.y))
      const newPosition = { x: newX, y: newY }

      // 更新本地位置状态
      setPosition(newPosition)

      // 添加防抖，限制通知父组件的频率
      const now = Date.now()
      if (now - lastUpdateRef.current > 50) {
        // 50ms 防抖
        onPositionChange(newPosition)
        lastUpdateRef.current = now
      }
    }
  }

  // 处理拖拽结束
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // 添加和移除事件监听器
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  // 脉冲动画
  const [pulseScale, setPulseScale] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale((prev) => (prev === 1 ? 1.1 : 1))
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={buttonRef}
      className="fixed z-50 cursor-pointer"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `scale(${pulseScale})`,
        transition: "transform 0.5s ease-in-out",
      }}
      onMouseDown={handleMouseDown}
      onClick={isDragging ? undefined : onClick}
    >
      <div className="relative">
        {/* 全息投影效果 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-md animate-pulse"></div>

        {/* 主按钮 */}
        <div className="relative w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-700 flex items-center justify-center shadow-lg backdrop-blur-sm border border-blue-400/30">
          <div className="absolute inset-1 rounded-full bg-gradient-to-r from-blue-600/80 to-purple-700/80 opacity-80 backdrop-blur-sm"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-500/20 animate-pulse"></div>

          {/* 图标 */}
          <div className="relative z-10">
            {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
          </div>

          {/* 量子核心效果 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-blue-300 animate-ping"></div>
          </div>
        </div>

        {/* 外环效果 */}
        <div className="absolute -inset-1 rounded-full border border-blue-400/30 opacity-70"></div>
        <div className="absolute -inset-2 rounded-full border border-purple-400/20 opacity-50"></div>
      </div>
    </div>
  )
}

