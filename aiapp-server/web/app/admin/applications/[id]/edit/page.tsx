"use client"

import { useState, useEffect } from "react"
import { ApplicationForm } from "@/components/admin/application-form"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import PageTitle from "@/components/page-title"
import { useParams } from "next/navigation"

// 应用表单数据类型
interface AppFormData {
  name: string;
  description: string;
  category: string;
  type: string;
  inputType: string;
  outputType: string;
  chatModel: string;
  openerContent: string;
  suggestedQuestions: string[]; // 开场问题列表
  newSuggestedQuestion: string; // 编辑中的开场问题
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  apiKey: string;
  logo: string;
  formConfig: string;
  tags: string[];
  inputTypes?: string[];
  outputTypes?: string[];
  modelSettings?: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
  };
}

export default function EditApplicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // 获取应用数据
  useEffect(() => {
    async function fetchApplication() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/dify-apps/${id}`)
        
        if (!response.ok) {
          throw new Error("获取应用数据失败")
        }
        
        const data = await response.json()
        setApplication(data)
      } catch (err) {
        console.error("获取应用数据出错:", err)
        setError(err instanceof Error ? err.message : "获取应用数据失败，请稍后重试")
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplication()
  }, [id])

  // 处理表单提交
  const handleSubmit = async (formData: any) => {
    try {
      setSaving(true)
      setSaveError(null)
      
      // 确保标签数据被正确提交
      const submitData = {
        ...formData,
        tags: formData.tags || [],
      };
      
      const response = await fetch(`/api/dify-apps/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "保存应用失败")
      }
      
      // 保存成功，返回应用详情页
      router.push(`/admin/applications/${id}`)
    } catch (err) {
      console.error("保存应用失败:", err)
      setSaveError(err instanceof Error ? err.message : "保存应用失败，请稍后重试")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-10 w-1/4 mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <PageTitle title="编辑应用" />
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/admin/applications")}>返回应用列表</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <PageTitle title="编辑应用" />
      <Separator className="my-6" />
      
      {saveError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}
      
      <ApplicationForm 
        mode="edit"
        initialData={application} 
        onSubmit={handleSubmit} 
        isSubmitting={saving}
      />
    </div>
  )
}
