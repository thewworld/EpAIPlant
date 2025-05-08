"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Share2, Star, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"
import { useToast } from "@/components/ui/use-toast"

interface AppDetailDialogProps {
  app: {
    id: number | string
    name: string
    description: string
    category: string
    apiKey: string
    inputType: string
    outputType: string
    chatModel: string
    type: string
    logo?: string
    icon?: string
    formConfig?: string
    isFromCommunity?: boolean
    longDescription?: string
    features?: string[]
    useCases?: string[]
    usageCount?: number
    tags?: string[]
  }
  isOpen: boolean
  onClose: () => void
  onAppClick: (appId: string) => void
  relatedApps?: any[]
}

export function AppDetailDialog({ app, isOpen, onClose, onAppClick, relatedApps = [] }: AppDetailDialogProps) {
  const { toast } = useToast()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteApps, setFavoriteApps] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("快捷应用")
  const router = useRouter()

  // 初始化收藏状态
  useEffect(() => {
    if (app) {
      try {
        const storedFavorites = localStorage.getItem("favoriteApps")
        if (storedFavorites) {
          const favorites = JSON.parse(storedFavorites) as string[]
          setFavoriteApps(favorites)
          setIsFavorited(favorites.includes(app.id.toString()))
        }
      } catch (e) {
        console.error("Failed to parse favorites", e)
      }
    }
  }, [app])

  // 根据应用类别确定背景颜色
  const getBgColor = () => {
    if (app.isFromCommunity) return "bg-gradient-to-br from-purple-500/20 to-indigo-500/20"

    switch (app.category) {
      case "科研":
        return "bg-gradient-to-br from-blue-500/20 to-indigo-500/20"
      case "写作":
        return "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20"
      case "管理":
        return "bg-gradient-to-br from-teal-500/20 to-cyan-500/20"
      case "教学":
        return "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
      case "健康":
        return "bg-gradient-to-br from-red-500/20 to-pink-500/20"
      case "办公":
        return "bg-gradient-to-br from-orange-500/20 to-amber-500/20"
      default:
        return "bg-gradient-to-br from-gray-500/20 to-slate-500/20"
    }
  }

  // 获取应用图标
  const getIconSrc = (appId: string | number) => {
    // 优先使用app对象上的logo属性（后端返回）
    if (app && app.logo) {
      // 检查logo是否已经是data:image开头的URL格式
      if (app.logo.startsWith('data:image')) {
        return app.logo;
      }
      
      // 检查是否是不同格式的base64编码
      // SVG通常以PD94/PHN2开头
      if (app.logo.startsWith('PD94') || app.logo.startsWith('PHN2')) {
        return `data:image/svg+xml;base64,${app.logo}`
      }
      
      // PNG通常以iVBORw0KGg开头
      if (app.logo.startsWith('iVBORw0KGg')) {
        return `data:image/png;base64,${app.logo}`
      }
      
      // JPEG/JPG通常以/9j/开头
      if (app.logo.startsWith('/9j/')) {
        return `data:image/jpeg;base64,${app.logo}`
      }
      
      // 如果是SVG文本内容，则进行URL编码
      if (app.logo.startsWith('<svg') || app.logo.startsWith('<?xml')) {
      try {
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(app.logo)}`
      } catch (e) {
        console.error('Logo编码错误:', e);
        // 编码失败时使用默认图标
        return '/icons/app-default.svg';
      }
      }
      
      // 如果无法识别格式但仍然是base64，尝试作为通用图片处理
      if (/^[A-Za-z0-9+/=]+$/.test(app.logo)) {
        return `data:image;base64,${app.logo}`
      }
      
      // 如果所有检测都失败，可能是一个URL，直接返回
      return app.logo;
    }
    
    // 使用app对象上的icon属性（如果存在）
    if (app && app.icon) {
      return app.icon
    }
    
    // 否则基于应用类型生成不同图标
    if (app) {
      const defaultIcons: Record<string, string> = {
        'Chat': '/icons/chat.svg',
        'Completion': '/icons/completion.svg',
        'Workflow': '/icons/workflow.svg'
      }
      
      return defaultIcons[app.type] || '/icons/app-default.svg'
    }
    
    // 如果传入的是appId，使用通用方法
    const svgIcon = getAppIconById(appId.toString())
    return svgToDataUrl(svgIcon)
  }

  // 生成应用描述（如果不存在）
  const generateAppDescription = (app: any) => {
    if (app.category === "科研") {
      return `${app.name}是一款专为科研人员设计的AI应用，旨在提高研究效率和质量。利用先进的大语言模型技术，它能够协助用户完成文献分析、数据整理、论文写作等科研任务，大幅节省时间和精力。该应用支持多种学科领域，能够根据用户的具体需求提供个性化的辅助服务。`
    } else if (app.category === "教学") {
      return `${app.name}是一款面向教育工作者的智能辅助工具，通过AI技术赋能教学过程。它可以帮助教师设计课程内容、生成教学材料、评估学生作业，并提供个性化的教学建议。该应用支持多种教学场景，适用于不同学科和教育阶段，是提升教学质量和效率的得力助手。`
    } else if (app.category === "管理") {
      return `${app.name}是一款智能管理辅助工具，专为提升组织和团队管理效率而设计。它利用AI技术帮助管理者优化资源分配、简化工作流程、提高决策质量。该应用支持项目管理、人员协调、数据分析等多种管理场景，能够根据组织特点提供定制化的管理解决方案。`
    } else if (app.category === "健康") {
      return `${app.name}是一款智能健康管理工具，旨在为用户提供专业的健康咨询和建议。它利用先进的医学知识库和AI技术，帮助用户了解健康状况、分析症状、提供健康建议。该应用注重隐私保护，所有健康数据都经过严格加密处理，为用户提供安全可靠的健康管理服务。`
    } else if (app.category === "办公") {
      return `${app.name}是一款智能办公辅助工具，专为提升工作效率和质量而设计。它利用AI技术帮助用户处理文档、生成报告、优化工作流程。该应用支持多种办公场景，能够根据用户需求提供个性化的办公解决方案，是现代职场人士的得力助手。`
    } else {
      return `${app.name}是一款功能强大的AI应用，旨在提供高效、智能的解决方案。它利用先进的大语言模型技术，能够理解用户需求并提供精准的服务。无论是日常工作还是专业任务，该应用都能够显著提升效率和质量，为用户带来全新的体验。`
    }
  }

  // 生成应用功能介绍（如果不存在）
  const generateAppFeatures = (app: any) => {
    if (app.category === "科研") {
      return [
        "智能文献检索与分析：快速找到相关研究文献，自动提取关键信息",
        "数据可视化与解读：将复杂数据转化为直观图表，发现潜在规律",
        "论文写作辅助：提供结构建议、语言润色、引用格式化等服务",
        "研究方法推荐：根据研究问题推荐适合的研究方法和工具",
        "学术交流支持：辅助准备学术报告、回应同行评议等",
      ]
    } else if (app.category === "教学") {
      return [
        "课程内容生成：根据教学目标自动生成教案、课件和练习",
        "学生作业评估：快速评阅学生作业，提供详细反馈",
        "个性化教学建议：根据学生表现提供针对性的教学策略",
        "互动教学工具：增强课堂参与度的互动问答和活动设计",
        "教学资源库：丰富的教学素材和案例，支持多种学科",
      ]
    } else if (app.category === "管理") {
      return [
        "项目规划与跟踪：智能制定项目计划，实时监控进度",
        "资源优化分配：根据任务需求和资源状况提供最优分配方案",
        "数据驱动决策：分析业务数据，提供决策支持",
        "团队协作增强：改善沟通效率，促进团队协同",
        "绩效评估与反馈：客观评估团队和个人表现，提供改进建议",
      ]
    } else if (app.category === "健康") {
      return [
        "健康状况评估：根据用户提供的信息评估健康状况",
        "症状分析与建议：分析用户描述的症状，提供初步建议",
        "健康知识普及：提供专业、易懂的健康知识",
        "生活方式指导：根据用户情况提供饮食、运动等生活方式建议",
        "健康记录管理：帮助用户记录和管理健康数据",
      ]
    } else if (app.category === "办公") {
      return [
        "文档智能处理：自动生成、编辑和优化各类办公文档",
        "会议效率提升：会议记录、会议摘要和行动项跟踪",
        "邮件辅助工具：智能撰写和回复邮件，提高沟通效率",
        "工作流程优化：分析工作流程，提供优化建议",
        "时间管理助手：帮助用户合理规划时间，提高工作效率",
      ]
    } else {
      return [
        "智能内容生成：根据需求快速生成高质量内容",
        "自动化处理：简化重复性任务，提高工作效率",
        "个性化推荐：根据用户偏好提供定制化服务",
        "多模态交互：支持文本、图像等多种交互方式",
        "持续学习优化：根据用户反馈不断改进服务质量",
      ]
    }
  }

  // 生成使用场景（如果不存在）
  const generateUseCases = (app: any) => {
    if (app.category === "科研") {
      return [
        "文献综述撰写：快速整理和分析大量文献，提取关键信息",
        "实验数据分析：处理和可视化实验数据，发现规律和趋势",
        "论文写作与修改：提供结构建议和语言润色，提高论文质量",
        "研究方案设计：辅助设计科学合理的研究方案和实验流程",
        "学术报告准备：生成清晰、专业的学术报告和演示材料",
      ]
    } else if (app.category === "教学") {
      return [
        "课程备课：根据教学大纲快速生成教案和教学材料",
        "作业批改：高效评阅学生作业，提供个性化反馈",
        "差异化教学：根据学生特点设计针对性的教学活动",
        "教学评估：分析教学效果，提供改进建议",
        "家校沟通：生成专业、清晰的家长沟通材料",
      ]
    } else if (app.category === "管理") {
      return [
        "项目管理：规划项目进度，分配资源，监控执行情况",
        "会议效率提升：自动记录会议内容，生成会议纪要",
        "团队协作：促进团队沟通，提高协作效率",
        "绩效管理：客观评估团队和个人表现，提供反馈",
        "战略规划：分析数据趋势，辅助制定战略决策",
      ]
    } else if (app.category === "健康") {
      return [
        "日常健康咨询：解答用户的健康问题和疑虑",
        "症状初步分析：根据用户描述的症状提供初步分析",
        "健康生活指导：提供饮食、运动、睡眠等健康生活建议",
        "慢性病管理：帮助用户管理慢性病，提供日常建议",
        "心理健康支持：提供心理健康知识和初步支持",
      ]
    } else if (app.category === "办公") {
      return [
        "文档创建与编辑：快速生成和优化各类办公文档",
        "演示文稿制作：设计专业、吸引人的演示文稿",
        "邮件沟通：撰写专业、得体的商务邮件",
        "数据分析报告：处理数据并生成直观的分析报告",
        "工作计划制定：帮助用户制定科学、合理的工作计划",
      ]
    } else {
      return [
        "日常工作辅助：提高工作效率，减少重复性劳动",
        "创意生成：提供灵感和创意，辅助创作过程",
        "信息整理：快速处理和组织大量信息",
        "决策支持：提供数据分析和建议，辅助决策",
        "学习与成长：提供个性化学习资源和建议",
      ]
    }
  }

  // 处理收藏/取消收藏
  const handleToggleFavorite = () => {
    if (!app) return

    let newFavorites: string[]

    if (isFavorited) {
      // 取消收藏
      newFavorites = favoriteApps.filter(id => id !== app.id.toString())
      toast({
        title: "已取消收藏",
        description: `${app.name} 已从收藏夹中移除`,
        duration: 2000,
      })
    } else {
      // 添加收藏
      newFavorites = [...favoriteApps, app.id.toString()]
      toast({
        title: "已添加收藏",
        description: `${app.name} 已添加到收藏夹`,
        duration: 2000,
      })
    }

    // 更新状态和本地存储
    setFavoriteApps(newFavorites)
    setIsFavorited(!isFavorited)
    localStorage.setItem("favoriteApps", JSON.stringify(newFavorites))
  }

  // 处理使用应用
  const handleUseApp = () => {
    if (!app) return;
    
    // 直接跳转到聊天页面
    router.push(`/app/chat/${app.id}`);
    
    // 关闭对话框
    onClose();
  };

  const appDescription = app.longDescription || generateAppDescription(app)
  const appFeatures = app.features || generateAppFeatures(app)
  const appUseCases = app.useCases || generateUseCases(app)

  // 获取应用表单配置（如果有）
  const getFormConfig = () => {
    if (!app || !app.formConfig) return []
    
    try {
      return JSON.parse(app.formConfig)
    } catch (e) {
      console.error("解析表单配置失败:", e)
      return []
    }
  }

  // 解析并显示表单字段
  const renderFormFields = () => {
    const formConfig = getFormConfig()
    if (formConfig.length === 0) return null
    
    return (
      <div className="mt-4">
        <h3 className="font-medium text-gray-800 dark:text-white mb-2">输入字段</h3>
        <div className="space-y-2">
          {formConfig.map((field: any, index: number) => (
            <div key={index} className="bg-gray-100 dark:bg-[#1e293b] p-2 rounded-md">
              <div className="flex justify-between">
                <span className="font-medium">{field.label}</span>
                <span className="text-sm text-gray-500">{field.type === 'text' ? '文本' : field.type === 'select' ? '选择' : field.type === 'file' ? '文件' : field.type}</span>
              </div>
              {field.required && <span className="text-xs text-red-500">必填</span>}
              {field.placeholder && <div className="text-xs text-gray-500">提示: {field.placeholder}</div>}
              {field.tip && <div className="text-xs text-gray-500">说明: {field.tip}</div>}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 获取标签
  const getTags = () => {
    // 确保即使app.tags是undefined或null也返回空数组
    return Array.isArray(app.tags) ? app.tags : [];
  }

  return (
    <>
      {/* Custom backdrop with white transparent background */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/80 dark:bg-black/50 backdrop-blur-sm z-40"
          onClick={() => onClose()}
          aria-hidden="true"
        />
      )}

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
        <DialogContent
          className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0 z-50 bg-white dark:bg-[#0f172a] border-gray-200 dark:border-[#1e293b]"
          aria-describedby="app-detail-description"
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{app.name} - 应用详情</DialogTitle>
            <DialogDescription id="app-detail-description">
              {app.name}是一款{app.category || ""}类应用，{app.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {/* 应用头部信息 */}
            <div className="p-6 border-b border-gray-200 dark:border-[#1e293b]">
              <div className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg ${getBgColor()} border border-gray-200 dark:border-[#334155]`}
                >
                  <img src={getIconSrc(app.id) || "/placeholder.svg"} alt={app.name} className="w-10 h-10" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{app.name}</h2>
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          <img
                            src="/placeholder.svg?height=20&width=20"
                            className="w-5 h-5 rounded-full mr-1"
                            alt="Developer"
                          />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">易智能AI平台</span>
                        </div>
                        <div className="flex items-center ml-4">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-4 w-4",
                                  star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                                )}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">{app.usageCount || 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="rounded-full text-gray-600 dark:text-gray-300">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "rounded-full",
                          isFavorited
                            ? "text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-500"
                            : "text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200",
                        )}
                        onClick={handleToggleFavorite}
                      >
                        <Star className="h-4 w-4" fill={isFavorited ? "currentColor" : "none"} />
                      </Button>
                      <Button
                        onClick={handleUseApp}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white"
                      >
                        立即使用
                      </Button>
                    </div>
                  </div>
                  <p className="mt-3 text-gray-600 dark:text-gray-300">{app.description}</p>

                  {/* Tags */}
                  <div className="flex mt-3 gap-2">
                    <div className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 mr-1"
                      >
                        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
                        <path d="M7 7h.01" />
                      </svg>
                      {app.category || "应用"}
                    </div>
                    {getTags().slice(0, 2).map((tag: string) => (
                        <div
                          key={tag}
                          className="flex items-center text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                        >
                          {tag}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 应用内容区 */}
            <div className="flex">
              {/* 左侧主内容 */}
              <div className="flex-1 border-r border-gray-200 dark:border-[#1e293b]">
                <Tabs defaultValue="快捷应用" className="w-full" onValueChange={setActiveTab}>
                  <div className="border-b border-gray-200 dark:border-[#1e293b] px-6">
                    <TabsList className="h-12 bg-transparent">
                      <TabsTrigger
                        value="快捷应用"
                        className="h-12 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-gray-700 dark:text-gray-300"
                      >
                        快捷应用
                      </TabsTrigger>
                      <TabsTrigger
                        value="功能"
                        className="h-12 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-gray-700 dark:text-gray-300"
                      >
                        功能
                      </TabsTrigger>
                      <TabsTrigger
                        value="作用"
                        className="h-12 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none text-gray-700 dark:text-gray-300"
                      >
                        作用
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="快捷应用" className="p-6">
                    <div className="bg-gray-50 dark:bg-[#0f172a]/50 rounded-lg p-6">
                      <div className="flex flex-col">
                        {/* 试一下 section */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-6 flex items-center">
                          <div className="flex items-center">
                            <div className="w-5 h-5 mr-2 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-blue-500 w-5 h-5"
                              >
                                <path d="m18 8-6 6-6-6" />
                              </svg>
                            </div>
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">试一下</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-center gap-4 mb-6">
                          <button className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300">
                            重置
                          </button>
                          <button className="px-4 py-2 bg-purple-500 text-white rounded-md text-sm">使用</button>
                        </div>

                        {/* Main content area */}
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Left side - Input */}
                          <div className="flex-1">
                            <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">应用简介</h3>
                            <div className="bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-[#334155] rounded-lg p-4">
                              <p className="text-sm text-gray-700 dark:text-gray-300">{app.description}</p>
                            </div>
                          </div>

                          {/* Right side - Output */}
                          <div className="flex-1 flex flex-col items-center">
                            <div
                              className={`w-16 h-16 ${getBgColor()} rounded-lg flex items-center justify-center mb-4 border border-gray-200 dark:border-[#334155]`}
                            >
                              <img
                                src={getIconSrc(app.id) || "/placeholder.svg"}
                                alt={app.name}
                                className="w-10 h-10"
                              />
                            </div>
                            <h3 className="text-xl font-bold text-center mb-2 text-gray-800 dark:text-white">
                              {app.name}
                            </h3>
                            <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                              点击"立即使用"按钮开始体验{" "}
                              <a href="#" className="text-blue-500 hover:underline">
                                了解更多 →
                              </a>
                            </p>

                            <Button
                              onClick={handleUseApp}
                              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white"
                            >
                              立即使用
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* App introduction section */}
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-500 w-5 h-5"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                          </svg>
                        </div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-white">应用介绍</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">{appDescription}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="功能" className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">功能介绍</h3>
                    <ul className="space-y-4">
                      {appFeatures.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="作用" className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">使用场景</h3>
                    <ul className="space-y-4">
                      {appUseCases.map((useCase: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">{index + 1}</span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300">{useCase}</p>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>

                {/* 应用介绍 */}
                <div className="p-6 border-t border-gray-200 dark:border-[#1e293b]">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">应用介绍</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{appDescription}</p>
                </div>
              </div>

              {/* 右侧相关推荐 */}
              <div className="w-72 p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">相关推荐</h3>
                <div className="space-y-4">
                  {relatedApps.map((relatedApp) => (
                    <Card
                      key={relatedApp.id}
                      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-[#1e293b] border-gray-200 dark:border-[#334155]"
                      onClick={() => onAppClick(relatedApp.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <img
                              src={getIconSrc(relatedApp.id) || "/placeholder.svg"}
                              alt={relatedApp.name}
                              className="w-6 h-6"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-800 dark:text-white">{relatedApp.name}</h4>
                            <div className="flex mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "h-3 w-3",
                                    star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                                  )}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                              {relatedApp.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* 类型和模型信息 */}
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center rounded-md bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                类型: {app.type}
              </div>
              <div className="inline-flex items-center rounded-md bg-purple-100 dark:bg-purple-900/30 px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                模式: {app.chatModel === 'sse' ? '流式' : app.chatModel === 'block' ? '阻塞式' : app.chatModel}
              </div>
              <div className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-700/50 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                分类: {app.category}
              </div>
            </div>

            {/* 表单配置信息 */}
            {renderFormFields()}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

