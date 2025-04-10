"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { FormChatAppDetail } from "@/components/app-detail/form-chat-app-detail"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { getAppIconById } from "@/lib/app-icons"

export default function FormChatAppPage() {
  const params = useParams()
  const [appConfig, setAppConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const response = await fetch(`/api/apps/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch app config")
        }
        const data = await response.json()
        setAppConfig(data)
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

  // 获取应用图标
  const appIcon = getAppIconById(params.id as string)

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