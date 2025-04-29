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
import { API_BASE_URL } from "@/lib/constants"

export default function ChatAppPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null)

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        // 从后端获取应用配置，使用API基础URL
        const response = await fetch(`${API_BASE_URL}/api/dify-apps/${id}`)
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
            const parsedData = JSON.parse(data.formConfig)
            
            // 确保parsedData是数组
            if (Array.isArray(parsedData)) {
              // 处理新的表单格式：包含嵌套的控件类型对象
              const fields: FormField[] = parsedData.map((field: any) => {
                // 检查是否为新格式：对象的键是控件类型
                const controlKeys = Object.keys(field);
                const validControlType = controlKeys.find(key => 
                  ['text-input', 'paragraph', 'select', 'number', 'file', 'file-list'].includes(key)
                );
                
                let fieldData: any = field;
                let fieldType: FieldType = FieldType.TEXT; // 默认类型
                
                if (validControlType) {
                  // 新格式：从类型键获取字段数据
                  fieldData = field[validControlType];
                  
                  // 根据控件类型映射到FieldType
                  switch(validControlType) {
                    case 'text-input':
                      fieldType = FieldType.TEXT;
                      break;
                    case 'paragraph':
                      fieldType = FieldType.TEXTAREA;
                      break;
                    case 'select':
                      fieldType = FieldType.SELECT;
                      break;
                    case 'file':
                    case 'file-list':
                      fieldType = FieldType.FILE;
                      break;
                    case 'number':
                      fieldType = FieldType.TEXT; // 使用TEXT类型但设置输入类型为number
                      break;
                    default:
                      fieldType = FieldType.TEXT;
                  }
                } else {
                  // 旧格式：直接使用字段的type属性
                  fieldType = field.type === "file" ? FieldType.FILE : (field.type || "text") as FieldType;
                }
                
                return {
                  id: fieldData.variable || fieldData.name || `field_${Math.random().toString(36).slice(2, 9)}`,
                  type: fieldType,
                  label: fieldData.label || "字段",
                  placeholder: fieldData.placeholder || "",
                  required: !!fieldData.required,
                  defaultValue: fieldData.defaultValue !== undefined ? fieldData.defaultValue : "",
                  options: Array.isArray(fieldData.options) ? fieldData.options.map((opt: any) => {
                    // 处理options可能是简单字符串数组的情况
                    if (typeof opt === 'string' || typeof opt === 'number') {
                      return { label: String(opt), value: opt };
                    }
                    return opt;
                  }) : [],
                  min: fieldData.min,
                  max: fieldData.max_length || fieldData.max,
                  accept: fieldData.allowed_file_extensions ? fieldData.allowed_file_extensions.join(',') : (fieldData.accept || ""),
                  tip: fieldData.tip || "",
                  // 保留原始的字段数据，可能在处理特殊控件时有用
                  originalData: field
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
          logo: data.logo || undefined,
          introMessages: data.openerContent 
            ? [{ content: data.openerContent }] 
            : [{ content: "欢迎使用此应用！" }],
          formConfig: formConfig,
          chatModel: data.chatModel,
          // 确保suggestedQuestions是数组类型
          suggestedQuestions: Array.isArray(data.suggestedQuestions) 
            ? [...data.suggestedQuestions] 
            : (data.suggestedQuestions ? [data.suggestedQuestions] : [])
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

    if (id) {
      fetchAppConfig()
    }
  }, [id, router, toast])

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
  const appIcon = appConfig?.logo 
    ? (() => {
        // 检查logo是否已经是data:image开头的URL格式
        if (appConfig.logo?.startsWith('data:image')) {
          return appConfig.logo;
        }
        // 检查是否是base64编码
        if (appConfig.logo?.startsWith('PD94') || appConfig.logo?.startsWith('PHN2')) {
          return `data:image/svg+xml;base64,${appConfig.logo}`
        }
        // 否则将SVG进行URL编码
        try {
          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(appConfig.logo)}`
        } catch (e) {
          console.error('Logo编码错误:', e);
          // 编码失败时使用默认图标
          return getAppIconById(id);
        }
      })()
    : getAppIconById(id);

  return (
    <UserSpaceLayout
      title={appConfig.name}
      backUrl="/marketplace"
      appId={id}
      appDescription={appConfig.description}
      appIcon={appIcon}
    >
      {appConfig.formConfig && appConfig.formConfig.fields && appConfig.formConfig.fields.length > 0 ? (
        <FormChatAppDetail appConfig={appConfig} className="h-full" />
      ) : (
        <ChatAppDetail appConfig={appConfig} className="h-full" />
      )}
    </UserSpaceLayout>
  )
} 