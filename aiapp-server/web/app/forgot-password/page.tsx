"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Mail, Phone, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("email")

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    verificationCode: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // 模拟密码重置请求
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setSuccess(true)
    } catch (err) {
      setError("密码重置请求失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 发送验证码
  const sendVerificationCode = async (target: string) => {
    try {
      // 模拟发送验证码
      console.log(`向 ${target} 发送验证码`)
      alert(`验证码已发送至 ${target}`)
    } catch (err) {
      setError("验证码发送失败，请稍后重试")
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">重置密码邮件已发送</CardTitle>
            <CardDescription>我们已向您提供的邮箱/手机发送了密码重置指引，请按照指引完成密码重置。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Mail className="h-16 w-16 text-primary mb-4" />
            <p className="text-center text-muted-foreground">
              如果您没有收到邮件，请检查垃圾邮件文件夹或尝试重新发送。
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/login")}>
              返回登录
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">找回密码</h1>
          <p className="mt-2 text-gray-600">请选择找回密码的方式</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="mr-2" onClick={() => router.push("/login")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>找回密码</CardTitle>
            </div>
            <CardDescription>我们将向您发送密码重置链接</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email">邮箱找回</TabsTrigger>
                  <TabsTrigger value="phone">手机号找回</TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your.email@example.com"
                        className="pl-8"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="phone" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">手机号</Label>
                    <div className="relative">
                      <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="请输入手机号"
                        className="pl-8"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code">验证码</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="verification-code"
                        name="verificationCode"
                        placeholder="请输入验证码"
                        value={formData.verificationCode}
                        onChange={handleChange}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => sendVerificationCode(formData.phone)}
                        disabled={!formData.phone}
                      >
                        获取验证码
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "处理中..." : "重置密码"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

