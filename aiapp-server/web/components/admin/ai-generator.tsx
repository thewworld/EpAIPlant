"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, Loader2, Check } from "lucide-react"

// 组件属性类型
interface AIGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  formData: {
    name: string
    description: string
    logo?: string
    openerContent: string
    category?: string
  }
  onApply: (data: {
    name: string
    description: string
    logo: string
    openerContent: string
  }) => void
}

export function AIGenerator({ open, onOpenChange, formData, onApply }: AIGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<{
    name: string
    description: string
    logo: string
    openerContent: string
  } | null>(null)
  const [activeTab, setActiveTab] = useState("before")
  
  // 当弹窗关闭时重置状态
  useEffect(() => {
    if (!open) {
      setGeneratedData(null)
      setActiveTab("before")
    }
  }, [open])
  
  // 生成内容
  const generateContent = useCallback(() => {
    setIsGenerating(true)
    
    // 模拟延迟2秒
    setTimeout(() => {
      const optimized = {
        name: getOptimizedName(),
        description: getOptimizedDescription(),
        logo: getRandomLogo(),
        openerContent: getOptimizedOpenerContent(),
      }
      
      setGeneratedData(optimized)
      setIsGenerating(false)
      setActiveTab("after")
    }, 2000)
  }, [formData])
  
  // 应用生成的内容
  const handleApply = useCallback(() => {
    if (generatedData) {
      onApply(generatedData)
    }
    onOpenChange(false)
  }, [generatedData, onApply, onOpenChange])
  
  // 获取优化后的应用名称
  const getOptimizedName = useCallback(() => {
    const name = formData.name || ""
    const category = formData.category || ""
    
    if (name.length < 5) {
      // 如果名称太短，添加更多描述
      const prefixes: Record<string, string> = {
        "科研": "智能科研",
        "写作": "创意写作",
        "管理": "高效管理",
        "教育": "智慧教育"
      }
      
      const prefix = prefixes[category] || "智能"
      return `${prefix}${name || "助手"}`
    } else if (name.length > 20) {
      // 如果名称太长，缩短它
      return name.substring(0, 18) + "..."
    } else {
      // 一般情况下，添加一个形容词
      const adjectives = ["智能", "高效", "专业", "创新", "精准"]
      const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
      
      // 避免重复形容词
      if (!name.includes(randomAdjective)) {
        return `${randomAdjective}${name}`
      }
      return name || "智能助手"
    }
  }, [formData.name, formData.category])
  
  // 获取优化后的应用描述
  const getOptimizedDescription = useCallback(() => {
    const description = formData.description || ""
    const category = formData.category || ""
    
    if (description.length < 10) {
      // 根据类别返回默认描述
      const descriptions: Record<string, string> = {
        "科研": "专为科研工作者设计的智能助手，助力文献管理、实验设计和数据分析。提供精准的学术支持，让您的研究工作更高效、更专业。",
        "写作": "强大的AI写作助手，提供内容创作、文章润色和灵感激发。无论是商业文案、学术论文还是创意写作，都能得到专业支持。",
        "管理": "高效的管理工具，帮助您组织任务、分配资源和优化流程。提升团队协作效率，让管理工作更加轻松自如。",
        "教育": "智慧教育助手，为教师和学生提供个性化学习支持。包含知识点讲解、习题辅导和学习规划，让教与学更加高效有趣。"
      }
      
      return descriptions[category] || "智能AI助手，为您提供专业、高效的服务支持。通过自然语言交互，解决您在工作和生活中遇到的各类问题。"
    } else if (description.length > 200) {
      return description.substring(0, 198) + "..."
    } else {
      // 添加一些市场营销语言
      const suffix = "，提供高效、准确的智能服务，让您的工作更轻松。"
      if (description.endsWith("。")) {
        return description.slice(0, -1) + suffix
      } else {
        return description + suffix
      }
    }
  }, [formData.description, formData.category])
  
  // 获取优化后的开场白
  const getOptimizedOpenerContent = useCallback(() => {
    const content = formData.openerContent || ""
    
    if (content.length < 15) {
      // 返回默认开场白
      const openers = [
        "您好！我是您的智能助手，很高兴为您服务。请问有什么可以帮您解决的问题？",
        "欢迎使用智能助手！我可以回答您的问题，提供信息支持，让我们开始吧！",
        "您好，我是AI助手，为您提供专业、高效的服务。请告诉我您需要什么帮助？"
      ]
      
      return openers[Math.floor(Math.random() * openers.length)]
    } else {
      // 添加一些友好的表达
      if (!content.includes("您好") && !content.includes("你好")) {
        return `您好！${content}`
      }
      return content
    }
  }, [formData.openerContent])
  
  // 获取随机Logo
  const getRandomLogo = useCallback(() => {
    // 这里使用了一些固定的SVG数据URL，实际项目中可以接入真实的AI生成
    const logos = [
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIzMiIgZmlsbD0iIzhlYTdmZiIvPjxwYXRoIGQ9Ik0yMiAyMkgzMk0yMiAzMkgzMk0yMiA0Mkg0MiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIzMiIgZmlsbD0iI2E4NTVmNyIvPjxjaXJjbGUgY3g9IjMyIiBjeT0iMzIiIHI9IjE2IiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNCIvPjxwYXRoIGQ9Ik0zMiAxNlYzMkw0MSA0MSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjwvc3ZnPg==",
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIzMiIgZmlsbD0iIzQyYjg4MyIvPjxwYXRoIGQ9Ik0yMiAzMkw0MiAzMk00MiAzMkwzNCAyNE00MiAzMkwzNCA0MCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==",
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIzMiIgZmlsbD0iI2Y5N2IyNiIvPjxwYXRoIGQ9Ik0yMiAyMkgyN002MiAyMkg0MiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxwYXRoIGQ9Ik0yMiA0Mkw0MiA0Mk00MiA0Mkw1MiAzMiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg=="
    ]
    
    return logos[Math.floor(Math.random() * logos.length)]
  }, [])
  
  return (
    <Dialog open={open} onOpenChange={(value) => !isGenerating && onOpenChange(value)}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
            AI 优化应用信息
          </DialogTitle>
          <DialogDescription>
            AI 将优化您的应用信息，提高应用的吸引力和易用性
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="before">原始信息</TabsTrigger>
              <TabsTrigger value="after" disabled={isGenerating || !generatedData}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    优化中...
                  </>
                ) : "优化结果"}
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <TabsContent value="before" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original-name">应用名称</Label>
                  <Input 
                    id="original-name" 
                    value={formData.name || ""}
                    readOnly 
                    placeholder="未填写应用名称" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original-description">应用描述</Label>
                  <Textarea 
                    id="original-description" 
                    value={formData.description || ""}
                    readOnly 
                    placeholder="未填写应用描述" 
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original-logo">应用Logo</Label>
                  <div className="h-24 w-24 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                    {formData.logo ? (
                      <img 
                        src={formData.logo} 
                        alt="应用Logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 dark:text-gray-600 text-xs text-center p-2">
                        未设置Logo
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original-opener">开场白</Label>
                  <Textarea 
                    id="original-opener" 
                    value={formData.openerContent || ""}
                    readOnly 
                    placeholder="未填写开场白" 
                    rows={4}
                  />
                </div>
                
                <div className="pt-4">
                  <Button 
                    onClick={generateContent} 
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {isGenerating ? "正在优化..." : "AI 优化"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="after" className="space-y-4">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground text-center">
                      AI 正在优化您的应用信息，请稍等...
                    </p>
                  </div>
                ) : generatedData ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="optimized-name">优化后的应用名称</Label>
                      <Input 
                        id="optimized-name" 
                        value={generatedData.name}
                        readOnly 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="optimized-description">优化后的应用描述</Label>
                      <Textarea 
                        id="optimized-description" 
                        value={generatedData.description}
                        readOnly 
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="optimized-logo">优化后的应用Logo</Label>
                      <div className="h-24 w-24 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                        <img 
                          src={generatedData.logo} 
                          alt="优化后的Logo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="optimized-opener">优化后的开场白</Label>
                      <Textarea 
                        id="optimized-opener" 
                        value={generatedData.openerContent}
                        readOnly 
                        rows={4}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center h-full">
                    <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="mb-4">点击左侧"AI 优化"按钮开始生成优化结果</p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGenerating}>
            取消
          </Button>
          <Button 
            onClick={handleApply} 
            disabled={isGenerating || !generatedData}
            className="gap-2"
          >
            {generatedData ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            应用优化结果
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 