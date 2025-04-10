"use client"

import { useEffect, useRef } from "react"

interface SpeechWaveProps {
  isActive: boolean
  className?: string
}

export function SpeechWave({ isActive, className = "" }: SpeechWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // 绘制波形
    const drawWave = () => {
      if (!canvas || !ctx) return

      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const width = canvas.offsetWidth
      const height = canvas.offsetHeight
      const centerY = height / 2

      // 设置波形样式
      ctx.lineWidth = 2
      ctx.strokeStyle = isActive ? "rgba(239, 68, 68, 0.8)" : "rgba(59, 130, 246, 0.5)"

      // 开始绘制路径
      ctx.beginPath()

      // 绘制波形
      const segments = 20
      const segmentWidth = width / segments

      for (let i = 0; i <= segments; i++) {
        const x = i * segmentWidth

        // 如果活跃，生成随机高度；否则，生成静态波形
        let amplitude
        if (isActive) {
          amplitude = Math.random() * 10 + 5
        } else {
          amplitude = 3 + Math.sin(i * 0.5) * 2
        }

        const y = centerY + Math.sin(Date.now() * 0.005 + i * 0.5) * amplitude

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      // 绘制路径
      ctx.stroke()

      // 继续动画
      animationRef.current = requestAnimationFrame(drawWave)
    }

    // 开始动画
    drawWave()

    // 清理
    return () => {
      window.removeEventListener("resize", setCanvasSize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])

  return <canvas ref={canvasRef} className={`w-full h-6 ${className}`} aria-hidden="true" />
}

