"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FormChatAppDetail } from "@/components/app-detail/form-chat-app-detail"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { getAppIconById } from "@/lib/app-icons"
import { AppConfig } from "@/types/app-config"
import { API_BASE_URL } from "@/lib/constants"

export default function FormChatAppPage() {
  const params = useParams()
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        // 使用后端API获取应用配置
        const response = await fetch(`${API_BASE_URL}/api/dify-apps/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch app config")
        }
        const data = await response.json()
        
        // 转换为应用配置对象
        setAppConfig({
          id: data.id.toString(),
          name: data.name || "未命名应用",
          description: data.description || "无描述",
          type: data.type || "Chat",
          icon: getAppIconById(data.id.toString()) || "",
          logo: data.logo || undefined, // 添加logo字段
          introMessages: data.openerContent 
            ? [{ content: data.openerContent }] 
            : [{ content: "欢迎使用此应用！" }],
          formConfig: data.formConfig ? JSON.parse(data.formConfig) : undefined,
          chatModel: data.chatModel
        })
      } catch (error) {
        console.error("Error fetching app config:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAppConfig()
    }
  }, [params.id])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">加载中...</div>
  }

  if (!appConfig) {
    return <div className="flex items-center justify-center h-screen">应用配置加载失败</div>
  }

  // 获取应用图标，优先使用logo
  const appIcon = appConfig.logo 
    ? (() => {
        // 检查logo是否已经是data:image开头的URL格式
        if (appConfig.logo.startsWith('data:image')) {
          return appConfig.logo;
        }
        // 检查是否是base64编码
        if (appConfig.logo.startsWith('PD94') || appConfig.logo.startsWith('PHN2')) {
          return `data:image/svg+xml;base64,${appConfig.logo}`
        }
        // 否则将SVG进行URL编码
        try {
          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(appConfig.logo)}`
        } catch (e) {
          console.error('Logo编码错误:', e);
          // 编码失败时使用默认图标
          return getAppIconById(params.id as string);
        }
      })()
    : getAppIconById(params.id as string);

  return (
    <UserSpaceLayout
      title={appConfig.name}
      backUrl="/marketplace"
      appId={params.id as string}
      appDescription={appConfig.description}
      appIcon={appIcon}
    >
      <FormChatAppDetail appConfig={appConfig} className="h-full" />
    </UserSpaceLayout>
  )
} 