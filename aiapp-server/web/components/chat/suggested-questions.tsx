"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Lightbulb } from "lucide-react"

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

  // 确保组件完全挂载后再显示，避免SSR水合问题
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !questions || questions.length === 0) {
    return null
  }

  return (
    <div className={cn("mt-4 flex flex-col space-y-2", className)}>
      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1">
        <Lightbulb className="h-4 w-4 mr-1.5" />
        <span>推荐追问</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <div
            key={`suggested-${index}`}
            className="animate-fadeIn"
            style={{ 
              animationDelay: `${index * 100}ms`,
              opacity: 0,
              animation: `fadeIn 0.3s ease forwards ${index * 0.1}s`
            }}
          >
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 transition-all hover:scale-105 hover:shadow-md dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white dark:border-gray-700 dark:hover:border-gray-600"
              onClick={() => onQuestionClick(question)}
            >
              {question}
            </Button>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
} 