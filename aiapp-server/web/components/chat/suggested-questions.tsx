"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SuggestedQuestionsProps {
  questions: string[]
  onQuestionClick: (question: string) => void
  className?: string
}

export function SuggestedQuestions({
  questions,
  onQuestionClick,
  className,
}: SuggestedQuestionsProps) {
  const [mounted, setMounted] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)
  const [clickedQuestionIndex, setClickedQuestionIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [charLimit, setCharLimit] = useState(40)
  const [visibleCharLimit, setVisibleCharLimit] = useState(35) // 增加省略符预留空间

  // 确保组件完全挂载后再显示，避免SSR水合问题
  useEffect(() => {
    setMounted(true)
    
    // 添加渐现动画效果
    const timer = setTimeout(() => {
      setShowQuestions(true);
    }, 200); // 稍微快一点，因为这是后续问题
    
    // 清理定时器
    return () => clearTimeout(timer);
  }, [])

  // 根据容器宽度动态计算字符限制
  useEffect(() => {
    if (!mounted) return;
    
    const calculateCharLimit = () => {
      const container = containerRef.current;
      if (container) {
        // 获取容器宽度，并基于此计算字符限制
        const containerWidth = container.clientWidth;
        // 设置按钮内边距
        const buttonPadding = 16; // 减小内边距以使按钮更紧凑
        // 设置按钮最大宽度
        const maxButtonWidth = 320; // 减小最大宽度使按钮更紧凑
        // 计算有效宽度
        const effectiveWidth = Math.min(containerWidth * 0.6, maxButtonWidth) - buttonPadding;
        // 字符宽度估算
        const charWidth = 10; // 调整字符宽度估计
        // 计算总字符限制
        const calculatedLimit = Math.max(Math.floor(effectiveWidth / charWidth), 30); 
        
        // 设置总字符限制
        setCharLimit(calculatedLimit);
        
        // 设置可见字符限制，增加省略符预留空间为3个字符
        setVisibleCharLimit(calculatedLimit - 3);
      }
    };

    // 初始计算
    calculateCharLimit();

    // 窗口大小改变时重新计算
    const handleResize = () => {
      calculateCharLimit();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted]);

  // 处理文本截断的工具函数
  const truncateText = (text: string) => {
    if (!text) return '';
    
    if (text.length <= visibleCharLimit) {
      return text; // 文本长度在可见限制内，完整显示
    } else {
      // 确保省略符完全显示
      return text.substring(0, visibleCharLimit) + '...';
    }
  };

  // 处理按钮点击
  const handleButtonClick = (question: string, index: number) => {
    // 设置已点击状态
    setClickedQuestionIndex(index);
    // 调用点击回调
    onQuestionClick(question);
  };

  if (!mounted || !questions || questions.length === 0) {
    return null
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full pt-2 flex justify-center", // 添加flex和居中对齐
        "transition-all duration-500 ease-in-out",
        showQuestions ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-2",
        className
      )}
    >
      <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto"> {/* 使用max-w-3xl限制宽度，居中显示，减小间距 */}
        {questions.map((question, index) => (
          question && typeof question === 'string' && (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={cn(
                "transition-all duration-300 ease-in-out",
                "hover:scale-105 hover:shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",
                "cursor-pointer rounded-md font-medium text-xs", // 减小字体大小为xs
                "dark:hover:bg-blue-900/20 dark:hover:border-blue-800 dark:hover:text-blue-300",
                "focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 dark:focus:ring-blue-700",
                clickedQuestionIndex === index ? "opacity-50 pointer-events-none" : "opacity-100",
                "text-left justify-start overflow-hidden whitespace-nowrap text-ellipsis",
                "my-1" // 增加上下间距
              )}
              style={{
                maxWidth: "320px", // 减小最大宽度
                minHeight: "28px", // 减小最小高度
                height: "auto", // 自动高度
                textAlign: "left",
                justifyContent: "flex-start",
                padding: "3px 10px", // 减小内边距
                transition: "all 0.3s ease, transform 0.2s ease, opacity 0.3s ease"
              }}
              onClick={() => handleButtonClick(question, index)}
              title={question}
            >
              {truncateText(question)}
            </Button>
          )
        ))}
      </div>
    </div>
  )
} 