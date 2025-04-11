"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChatAppDetail } from "@/components/app-detail/chat-app-detail"
import { FormChatAppDetail } from "@/components/app-detail/form-chat-app-detail"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { getAppIconById } from "@/lib/app-icons"
import { useToast } from "@/components/ui/use-toast"
import type { AppConfig, IntroMessage, FormField } from "@/types/app-config"
import { AppType, FieldType } from "@/types/app-config"

export default function ChatAppPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        // 从后端获取应用配置，使用正确的端口8087
        const response = await fetch(`http://localhost:8087/api/dify-apps/${params.id}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to fetch app config")
        }
        const data = await response.json()
        
        if (!data || !data.id) {
          throw new Error("Invalid app configuration data")
        }

        // 解析formConfig字段
        let formConfig: { fields: FormField[]; submitButtonText: string; resetButtonText: string; } | undefined = undefined
        if (data.formConfig && data.formConfig.trim() !== "") {
          try {
            const parsedFields = JSON.parse(data.formConfig)
            
            // 确保parsedFields是数组
            if (Array.isArray(parsedFields)) {
              // 检查每个字段是否有必要的属性
              const fields: FormField[] = parsedFields.map((field: any) => {
                // 处理文件类型
                const fieldType = field.type === "file" ? FieldType.FILE : field.type || "text"
                
                return {
                  id: field.name || `field_${Math.random().toString(36).slice(2, 9)}`,
                  type: fieldType,
                  label: field.label || "字段",
                  placeholder: field.placeholder || "",
                  required: !!field.required,
                  defaultValue: field.defaultValue !== undefined ? field.defaultValue : "",
                  options: Array.isArray(field.options) ? field.options : [],
                  accept: field.accept || "",
                  tip: field.tip || "",
                  ...field
                }
              })
              
              formConfig = {
                fields,
                submitButtonText: "提交",
                resetButtonText: "重置"
              }
            }
          } catch (e) {
            console.error("Error parsing formConfig:", e)
            // 解析失败时不设置formConfig，让它保持undefined
          }
        }

        // 设置应用配置
        setAppConfig({
          id: data.id.toString(),
          name: data.name || "未命名应用",
          description: data.description || "无描述",
          type: data.type as AppType || AppType.CHAT,
          icon: getAppIconById(data.id.toString()) || "",
          introMessages: data.openerContent 
            ? [{ content: data.openerContent }] 
            : [{ content: "欢迎使用此应用！" }],
          formConfig: formConfig,
          chatModel: data.chatModel
        })
      } catch (error) {
        console.error("Error fetching app config:", error)
        toast({
          title: "加载失败",
          description: error instanceof Error ? error.message : "应用配置加载失败，请稍后重试",
          variant: "destructive",
        })
        router.push("/marketplace")
      } finally {
        setLoading(false)
      }
    }

    const id = params.id
    if (id) {
      fetchAppConfig()
    }
  }, [params.id, router, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0f172a]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!appConfig) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-[#0f172a]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">应用配置加载失败</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">无法加载应用配置，请稍后重试</p>
          <button
            onClick={() => router.push("/marketplace")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700"
          >
            返回应用市场
          </button>
        </div>
      </div>
    )
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
      {appConfig.formConfig ? (
        <FormChatAppDetail appConfig={appConfig} className="h-full" />
      ) : (
        <ChatAppDetail appConfig={appConfig} className="h-full" />
      )}
    </UserSpaceLayout>
  )
} 