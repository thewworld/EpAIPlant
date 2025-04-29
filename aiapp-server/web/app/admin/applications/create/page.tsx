"use client"

import { ApplicationForm } from "@/components/admin/application-form"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import PageTitle from "@/components/page-title";

export default function CreateApplicationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理表单提交
  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 准备要提交的数据
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        inputType: formData.inputType,
        outputType: formData.outputType,
        chatModel: formData.chatModel,
        openerContent: formData.openerContent,
        suggestedQuestions: formData.suggestedQuestions || [], // 添加开场问题数据
        suggestAfterAnswer: formData.suggestAfterAnswer, // 是否启用回答后推荐问题
        formConfig: formData.formConfig,
        apiKey: formData.apiKey,
        logo: formData.logo,
        tags: formData.tags || [], // 确保标签数据被正确提交
        status: "active", // 默认设置为启用状态
      };

      // 创建应用
      const response = await fetch('/api/dify-apps', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      // 检查响应类型
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API返回了非JSON格式的数据，可能是服务器错误");
      }

      if (!response.ok) {
        throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
      }

      await response.json();

      // 操作成功，显示成功消息
      alert("应用创建成功");

      // 重定向到应用列表页面
      router.push('/admin/applications');
    } catch (err) {
      console.error("创建应用失败:", err);
      setError(`创建应用失败，请稍后重试。错误详情: ${err instanceof Error ? err.message : String(err)}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageTitle title="创建新应用" />
      <Separator className="my-6" />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <ApplicationForm 
        mode="create" 
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
