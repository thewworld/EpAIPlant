"use client"

import type { IntroMessage } from "@/types/app-config"
import { Message } from "./message"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface CombinedIntroProps {
  messages: IntroMessage[]
  className?: string
  appIcon?: string // 添加应用图标属性
  suggestedQuestions?: string[]
  onQuestionClick?: (question: string) => void
  isLoading?: boolean
  multiLine?: boolean // 是否允许多行显示
}

export function CombinedIntro({ 
  messages, 
  className, 
  appIcon, 
  suggestedQuestions = [],
  onQuestionClick,
  isLoading = false,
  multiLine = false // 默认为单行显示
}: CombinedIntroProps) {
  const { toast } = useToast()
  const [expanded, setExpanded] = useState(true)
  const [showQuestions, setShowQuestions] = useState(false)
  const [clickedQuestionIndex, setClickedQuestionIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [charLimit, setCharLimit] = useState(40)
  const [visibleCharLimit, setVisibleCharLimit] = useState(35) // 增加省略符预留空间

  // 添加渐现动画效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestions(true);
    }, 500);
    
    // 清理定时器
    return () => clearTimeout(timer);
  }, []);

  // 根据容器宽度动态计算字符限制
  useEffect(() => {
    const calculateCharLimit = () => {
      const container = containerRef.current;
      if (container) {
        // 获取容器宽度，并基于此计算字符限制
        const containerWidth = container.clientWidth;
        // 设置按钮内边距
        const buttonPadding = 20;  // 增加按钮内边距以适应省略符
        // 设置按钮最大宽度
        const maxButtonWidth = 450; 
        // 计算有效宽度
        const effectiveWidth = Math.min(containerWidth * 0.7, maxButtonWidth) - buttonPadding;
        // 字符宽度估算
        const charWidth = 11; // 增加每个字符的估计宽度，确保不会过度填充
        // 计算总字符限制
        const calculatedLimit = Math.max(Math.floor(effectiveWidth / charWidth), 35); 
        
        // 设置总字符限制
        setCharLimit(calculatedLimit);
        
        // 设置可见字符限制，增加省略符预留空间为5个字符
        setVisibleCharLimit(calculatedLimit - 5);
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
  }, []);

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

  // 处理文本截断的工具函数 - 优化省略符显示
  const truncateText = (text: string) => {
    if (!text) return '';
    
    // 只在单行模式下处理
    if (!multiLine) {
      if (text.length <= visibleCharLimit) {
        return text; // 文本长度在可见限制内，完整显示
      } else {
        // 确保省略符完全显示
        // 使用更少的可见字符，为省略符留出更多空间
        return text.substring(0, visibleCharLimit) + '...';
      }
    }
    
    // 多行模式由CSS处理
    return text;
  };

  // 处理按钮点击
  const handleButtonClick = (question: string, index: number) => {
    if (onQuestionClick) {
      // 设置已点击状态
      setClickedQuestionIndex(index);
      // 调用点击回调
      onQuestionClick(question);
    }
  };

  // 渲染开场问题
  const renderSuggestedQuestions = () => {
    if (!suggestedQuestions || suggestedQuestions.length === 0 || !onQuestionClick) {
      return null;
    }

    return (
      <div 
        ref={containerRef}
        className={cn(
        "mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 w-full",
        "transition-all duration-500 ease-in-out",
        showQuestions ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-2"
      )}>
        <div className="flex flex-wrap gap-3 w-full">
          {suggestedQuestions.map((question, index) => (
            question && typeof question === 'string' && (
              <Button
                key={index}
                variant="outline"
                size="sm" 
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  "hover:scale-105 hover:shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700",
                  "cursor-pointer rounded-md font-medium text-sm",
                  "dark:hover:bg-blue-900/20 dark:hover:border-blue-800 dark:hover:text-blue-300",
                  "focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 dark:focus:ring-blue-700",
                  clickedQuestionIndex === index ? "opacity-50 pointer-events-none" : "opacity-100",
                  "text-left justify-start", // 移除固定内边距以防止空间不足
                  !multiLine && "overflow-hidden whitespace-nowrap text-ellipsis" // 单行显示才使用省略
                )}
                style={{
                  maxWidth: "450px", // 保持最大宽度
                  minHeight: "32px", // 保持最小高度
                  textAlign: "left", // 确保文本左对齐
                  justifyContent: "flex-start", // 内容左对齐
                  padding: "4px 12px", // 使用更精确的内边距控制
                  transition: "all 0.3s ease, transform 0.2s ease, opacity 0.3s ease",
                  ...(multiLine ? {
                    // 多行文本截断样式
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: 'auto',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    lineHeight: '1.3',
                    paddingTop: '0.25rem',
                    paddingBottom: '0.25rem',
                  } : {})
                }}
                onClick={() => handleButtonClick(question, index)}
                title={question} // 添加完整内容的title属性
              >
                {truncateText(question)}
              </Button>
            )
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <Message
        role="assistant"
        content={
          <>
            <div className="whitespace-pre-wrap">{combinedContent}</div>
            {renderSuggestedQuestions()}
          </>
        }
        onCopy={handleCopyMessage}
        appIcon={appIcon} // 传递应用图标
      />
    </div>
  )
}

