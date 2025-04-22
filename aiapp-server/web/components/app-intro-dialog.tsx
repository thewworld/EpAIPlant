"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"
import { MessageSquare, Globe, User } from "lucide-react"

interface AppIntroDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appId: string
  appName: string
  appDescription: string
  appIcon?: string
}

export function AppIntroDialog({ open, onOpenChange, appId, appName, appDescription, appIcon }: AppIntroDialogProps) {
  const [iconUrl, setIconUrl] = useState<string>("/placeholder.svg?height=80&width=80")
  const [activeTab, setActiveTab] = useState("intro")

  useEffect(() => {
    // 获取应用图标
    if (appIcon) {
      // 如果appIcon是URL，直接使用
      if (appIcon.startsWith('data:image') || appIcon.startsWith('http')) {
        setIconUrl(appIcon);
      } 
      // 如果是base64编码的SVG
      else if (appIcon.startsWith('PD94') || appIcon.startsWith('PHN2')) {
        setIconUrl(`data:image/svg+xml;base64,${appIcon}`);
      }
      // 否则尝试解析为SVG
      else {
        try {
          setIconUrl(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(appIcon)}`);
        } catch (e) {
          console.error('Logo编码错误:', e);
          const svgIcon = getAppIconById(appId);
          setIconUrl(svgToDataUrl(svgIcon));
        }
      }
    } else {
      // 无图标时使用基于ID生成的默认图标
      const svgIcon = getAppIconById(appId);
      setIconUrl(svgToDataUrl(svgIcon));
    }
  }, [appId, appIcon])

  // 生成功能亮点
  const generateFeatures = () => {
    const features = [
      {
        title: "智能对话",
        description: "基于先进的AI模型，提供流畅自然的对话体验，准确理解用户意图。",
      },
      {
        title: "专业知识",
        description: `在${appName}领域提供专业、准确的知识和建议，帮助用户解决实际问题。`,
      },
      {
        title: "个性化推荐",
        description: "根据用户需求和历史交互，提供个性化的内容和建议。",
      },
    ]

    // 根据应用ID添加特定功能
    if (appId === "ai-doctor") {
      features.push({
        title: "辅助医学诊断",
        description: "利用先进的人工智能工具进行医学诊断，为你提供可能的诊断结果。",
      })
    } else if (appId === "paper-outline-generator") {
      features.push({
        title: "论文结构生成",
        description: "快速生成学术论文大纲，提供结构化框架，帮助研究人员高效规划和组织学术写作。",
      })
    } else if (appId === "research-assistant") {
      features.push({
        title: "文献检索与分析",
        description: "帮助研究人员快速查找、整理和分析相关文献，提高研究效率。",
      })
    }

    return features
  }

  // 生成使用场景
  const generateScenarios = () => {
    const scenarios = [
      {
        title: "日常使用",
        description: `通过${appName}，你可以随时获取专业知识和建议，解决日常问题。`,
      },
      {
        title: "学习辅助",
        description: "作为学习工具，帮助你理解复杂概念，提供学习资源和指导。",
      },
    ]

    // 根据应用ID添加特定场景
    if (appId === "ai-doctor") {
      scenarios.push(
        {
          title: "个人健康管理",
          description: "通过AI医生，你可以对自身健康状况进行评估和分析，及早发现潜在的健康问题，并采取相应的措施。",
        },
        {
          title: "症状查询",
          description: "当你出现某些症状时，AI医生可以帮助你了解可能的原因，为你提供参考信息，减少不必要的恐慌和焦虑。",
        },
      )
    } else if (appId === "paper-outline-generator") {
      scenarios.push(
        {
          title: "学术写作",
          description: "在准备学术论文时，快速生成结构化大纲，帮助你组织思路和内容。",
        },
        {
          title: "研究规划",
          description: "在研究项目初期，帮助规划研究方向和方法，提高研究效率。",
        },
      )
    } else if (appId === "research-assistant") {
      scenarios.push(
        {
          title: "文献综述",
          description: "在进行文献综述时，帮助整理和分析大量文献，提取关键信息。",
        },
        {
          title: "研究方法选择",
          description: "根据研究问题，推荐适合的研究方法和工具，提高研究质量。",
        },
      )
    }

    return scenarios
  }

  // 生成使用步骤
  const generateSteps = () => {
    const steps = [
      "打开应用：点击运行按钮开始使用应用",
      "输入需求：在对话框中输入你的问题或需求",
      "获取回应：AI将根据你的输入提供相关信息和建议",
      "深入交流：你可以继续提问，深入探讨感兴趣的话题",
    ]

    // 根据应用ID添加特定步骤
    if (appId === "paper-outline-generator") {
      return [
        "打开论文大纲生成器应用",
        "在对话框中输入论文主题、关键词和领域",
        "点击提交，AI将生成一个结构完整的论文大纲",
        "根据需要调整和完善大纲，可以继续与AI交流获取建议",
      ]
    } else if (appId === "research-assistant") {
      return [
        "打开科研助手应用",
        "输入你的研究问题或需要查找的文献信息",
        "获取AI提供的相关文献、研究方法或分析结果",
        "根据AI的建议，进一步完善你的研究计划或论文",
      ]
    }

    return steps
  }

  const features = generateFeatures()
  const scenarios = generateScenarios()
  const steps = generateSteps()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto" 
        aria-describedby="app-intro-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 flex items-center justify-center">
              <img 
                src={iconUrl} 
                alt={`${appName}图标`} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  console.debug(`应用图标加载失败: ${appId}`);
                  (e.target as HTMLImageElement).src = "/icons/app-default.svg";
                }}
              />
            </div>
            {appName}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p id="app-intro-description" className="text-gray-600 dark:text-gray-300">{appDescription}</p>

          <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>Jimmy Fallon</span>
            <Globe className="h-4 w-4 ml-2" />
            <a href="#" className="text-blue-500 hover:underline">
              https://app.eai.ai/apps/{appId}
            </a>
          </div>

          <div className="flex gap-2 mt-4">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md">
              对话智能体
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md">
              高级中文
            </span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-md">
              职业
            </span>
          </div>
        </div>

        <Tabs defaultValue="intro" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="intro" className="text-sm">
              应用介绍
            </TabsTrigger>
            <TabsTrigger value="discussion" className="text-sm">
              交流讨论
            </TabsTrigger>
            <TabsTrigger value="review" className="text-sm">
              评价
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intro" className="space-y-6">
            <section>
              <h3 className="text-lg font-medium mb-2">功能简介</h3>
              <p className="text-gray-600 dark:text-gray-300">
                「{appName}」是一款先进的人工智能辅助应用。无论您是在寻求新的知识还是仅仅了解自己的情况，{appName}
                都将为您提供准确、快速的信息和指导。
              </p>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">亮点功能</h3>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <div>
                      <span className="font-medium">{feature.title}：</span>
                      <span className="text-gray-600 dark:text-gray-300">{feature.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">使用场景</h3>
              <ul className="space-y-2">
                {scenarios.map((scenario, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <div>
                      <span className="font-medium">{scenario.title}：</span>
                      <span className="text-gray-600 dark:text-gray-300">{scenario.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-2">使用步骤</h3>
              <ol className="space-y-2 list-decimal list-inside">
                {steps.map((step, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-300 pl-1">
                    {step}
                  </li>
                ))}
              </ol>
            </section>
          </TabsContent>

          <TabsContent value="discussion">
            <div className="flex flex-col items-center justify-center py-10">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无讨论内容</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">成为第一个发起讨论的用户</p>
            </div>
          </TabsContent>

          <TabsContent value="review">
            <div className="flex flex-col items-center justify-center py-10">
              <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">暂无评价内容</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">成为第一个评价此应用的用户</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

