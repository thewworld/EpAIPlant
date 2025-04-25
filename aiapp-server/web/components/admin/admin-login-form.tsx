"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function AdminLoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const searchParams = useSearchParams()

  // 获取回调URL，如果存在的话
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard'
  
  // 修改 handleSubmit 函数，使用API路由
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        toast({
          title: "登录成功",
          description: "欢迎回到运维管理平台",
        })

        // 使用window.location进行页面重定向，强制页面重新加载
        // 这样可以确保服务器端渲染时能正确读取cookie状态
        window.location.href = callbackUrl
      } else {
        setError(data.message || "用户名或密码错误")
        toast({
          variant: "destructive",
          title: "登录失败",
          description: data.message || "用户名或密码错误",
        })
      }
    } catch (err) {
      setError("登录过程中发生错误，请稍后再试")
      toast({
        variant: "destructive",
        title: "登录失败",
        description: "登录过程中发生错误，请稍后再试",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              placeholder="请输入用户名"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              placeholder="请输入密码"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="remember">记住我</Label>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <Button disabled={isLoading}>{isLoading ? "正在登录..." : "登录"}</Button>
        </div>
      </form>
    </div>
  )
}
