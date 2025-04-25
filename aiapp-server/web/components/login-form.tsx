"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Mail, Phone, Lock, User, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("password")
  const [showRegister, setShowRegister] = useState(false)

  // 登录表单数据
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
    phone: "",
    verificationCode: "",
    rememberMe: false,
  })

  // 注册表单数据
  const [registerData, setRegisterData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    organization: "",
    position: "",
    verificationCode: "",
    agreeTerms: false,
  })

  // 注册方式
  const [registerMethod, setRegisterMethod] = useState<"email" | "phone">("email")

  // 检查用户是否已登录
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      router.push("/marketplace")
    }
  }, [router])

  // 处理登录表单变化
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // 处理注册表单变化
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setRegisterData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // 处理登录提交
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      let response

      if (activeTab === "password") {
        // 账号密码登录
        response = await loginWithPassword(loginData.username, loginData.password)
      } else if (activeTab === "phone") {
        // 手机验证码登录
        response = await loginWithPhone(loginData.phone, loginData.verificationCode)
      }

      // 登录成功，存储用户信息和token
      localStorage.setItem("user", JSON.stringify(response.user))
      localStorage.setItem("token", response.token)

      // 记住登录状态
      if (loginData.rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }

      // 重定向到应用市场页面
      console.log("登录成功，正在跳转到应用市场...")
      router.push("/marketplace")
    } catch (err) {
      setError("登录失败，请检查您的输入信息")
    } finally {
      setIsLoading(false)
    }
  }

  // 处理注册提交
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // 验证密码匹配
    if (registerData.password !== registerData.confirmPassword) {
      setError("两次输入的密码不一致")
      setIsLoading(false)
      return
    }

    // 验证用户协议
    if (!registerData.agreeTerms) {
      setError("请阅读并同意用户协议与隐私政策")
      setIsLoading(false)
      return
    }

    try {
      let response

      if (registerMethod === "email") {
        // 邮箱注册
        response = await registerWithEmail(
          registerData.email,
          registerData.password,
          registerData.fullName,
          registerData.organization,
          registerData.position,
        )
      } else {
        // 手机号注册
        response = await registerWithPhone(
          registerData.phone,
          registerData.verificationCode,
          registerData.password,
          registerData.fullName,
          registerData.organization,
          registerData.position,
        )
      }

      // 注册成功，切换到登录页面
      setShowRegister(false)
      setActiveTab("password")
      setLoginData((prev) => ({
        ...prev,
        username: registerMethod === "email" ? registerData.email : registerData.phone,
      }))

      // 显示成功消息
      alert("注册成功，请登录您的账号")
    } catch (err) {
      setError("注册失败，请检查您的输入信息")
    } finally {
      setIsLoading(false)
    }
  }

  // 发送验证码
  const sendVerificationCode = async (target: string, type: "login" | "register") => {
    try {
      // 模拟发送验证码
      console.log(`向 ${target} 发送验证码，类型: ${type}`)
      alert(`验证码已发送至 ${target}`)
    } catch (err) {
      setError("验证码发送失败，请稍后重试")
    }
  }

  // 模拟账号密码登录
  const loginWithPassword = async (username: string, password: string) => {
    return new Promise<{ user: { name: string }; token: string }>((resolve, reject) => {
      setTimeout(() => {
        if (username === "admin" && password === "fTgnU7") {
          resolve({
            user: { name: username },
            token: "sample-jwt-token",
          })
        } else {
          reject(new Error("Invalid credentials"))
        }
      }, 1000)
    })
  }

  // 模拟手机验证码登录
  const loginWithPhone = async (phone: string, code: string) => {
    return new Promise<{ user: { name: string }; token: string }>((resolve, reject) => {
      setTimeout(() => {
        if (phone && code === "123456") {
          resolve({
            user: { name: `用户${phone.substring(phone.length - 4)}` },
            token: "sample-jwt-token",
          })
        } else {
          reject(new Error("Invalid code"))
        }
      }, 1000)
    })
  }

  // 模拟邮箱注册
  const registerWithEmail = async (
    email: string,
    password: string,
    fullName: string,
    organization: string,
    position: string,
  ) => {
    return new Promise<{ success: boolean }>((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          resolve({ success: true })
        } else {
          reject(new Error("Registration failed"))
        }
      }, 1000)
    })
  }

  // 模拟手机号注册
  const registerWithPhone = async (
    phone: string,
    code: string,
    password: string,
    fullName: string,
    organization: string,
    position: string,
  ) => {
    return new Promise<{ success: boolean }>((resolve, reject) => {
      setTimeout(() => {
        if (phone && code === "123456" && password) {
          resolve({ success: true })
        } else {
          reject(new Error("Registration failed"))
        }
      }, 1000)
    })
  }

  // 第三方登录
  const handleThirdPartyLogin = (provider: string) => {
    setIsLoading(true)
    console.log(`使用 ${provider} 登录`)

    // 模拟第三方登录成功
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ name: `${provider}用户` }))
      localStorage.setItem("token", "sample-jwt-token")
      router.push("/marketplace")
    }, 1000)
  }

  // 忘记密码
  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">{showRegister ? "注册账号" : "登录"}</CardTitle>
        <CardDescription>{showRegister ? "创建您的账户以访问应用市场" : "登录您的账户访问应用市场"}</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showRegister ? (
          // 注册表单
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <Tabs value={registerMethod} onValueChange={(v) => setRegisterMethod(v as "email" | "phone")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">邮箱注册</TabsTrigger>
                <TabsTrigger value="phone">手机号注册</TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      className="pl-8"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-phone">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="register-phone"
                      name="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      className="pl-8"
                      value={registerData.phone}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-verification-code">验证码</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="register-verification-code"
                      name="verificationCode"
                      placeholder="请输入验证码"
                      value={registerData.verificationCode}
                      onChange={handleRegisterChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendVerificationCode(registerData.phone, "register")}
                      disabled={!registerData.phone}
                    >
                      获取验证码
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="register-password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="请设置密码"
                  className="pl-8"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-confirm-password">确认密码</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-confirm-password"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="请再次输入密码"
                  className="pl-8"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-fullname">姓名</Label>
              <div className="relative">
                <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="register-fullname"
                  name="fullName"
                  placeholder="请输入您的姓名"
                  className="pl-8"
                  value={registerData.fullName}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-organization">所属机构</Label>
              <Input
                id="register-organization"
                name="organization"
                placeholder="请输入您的所属机构"
                value={registerData.organization}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="register-position">职位</Label>
              <Input
                id="register-position"
                name="position"
                placeholder="请输入您的职位"
                value={registerData.position}
                onChange={handleRegisterChange}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="register-terms"
                name="agreeTerms"
                checked={registerData.agreeTerms}
                onCheckedChange={(checked) => setRegisterData((prev) => ({ ...prev, agreeTerms: checked as boolean }))}
              />
              <label
                htmlFor="register-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                我已阅读并同意
                <Link href="/terms" className="text-primary hover:underline ml-1">
                  用户协议
                </Link>
                与
                <Link href="/privacy" className="text-primary hover:underline ml-1">
                  隐私政策
                </Link>
              </label>
            </div>
          </form>
        ) : (
          // 登录表单
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">账号密码登录</TabsTrigger>
                <TabsTrigger value="phone">手机验证码登录</TabsTrigger>
              </TabsList>

              <TabsContent value="password" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">用户名/邮箱</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="请输入用户名或邮箱"
                      className="pl-8"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">密码</Label>
                    <Button type="button" variant="link" className="px-0 h-auto text-xs" onClick={handleForgotPassword}>
                      忘记密码?
                    </Button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      className="pl-8"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-9 w-9"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
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
                      value={loginData.phone}
                      onChange={handleLoginChange}
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
                      value={loginData.verificationCode}
                      onChange={handleLoginChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => sendVerificationCode(loginData.phone, "login")}
                      disabled={!loginData.phone}
                    >
                      获取验证码
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                name="rememberMe"
                checked={loginData.rememberMe}
                onCheckedChange={(checked) => setLoginData((prev) => ({ ...prev, rememberMe: checked as boolean }))}
              />
              <label
                htmlFor="remember-me"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                记住我
              </label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">第三方账号登录</span>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => handleThirdPartyLogin("微信")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M8 10.5c0 1.5.5 2 2 2s2-.5 2-2-.5-2-2-2-2 .5-2 2z"></path>
                  <path d="M14 16.5c0 1.5.5 2 2 2s2-.5 2-2-.5-2-2-2-2 .5-2 2z"></path>
                  <path d="M8.5 9.5 6 11V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3.5"></path>
                  <path d="m17.5 15.5 2.5-1.5v5a2 2 0 0 1-2 2h-8a2 2 0 0 1-2-2v-3.5"></path>
                </svg>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => handleThirdPartyLogin("QQ")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-500"
                >
                  <path d="M12 2a10 10 0 0 0-6.88 17.28l-1.34 1.34a1 1 0 0 0 .7 1.71h7.52a10 10 0 0 0 0-20Z"></path>
                  <path d="M12 8v4"></path>
                  <path d="M12 16h.01"></path>
                </svg>
              </Button>
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col">
        <Button
          className="w-full mb-4"
          onClick={showRegister ? handleRegisterSubmit : handleLoginSubmit}
          disabled={isLoading}
        >
          {isLoading ? "处理中..." : showRegister ? "注册" : "登录"}
        </Button>

        <Button variant="link" className="px-0" onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? "已有账号？返回登录" : "没有账号？立即注册"}
        </Button>
      </CardFooter>
    </Card>
  )
}

