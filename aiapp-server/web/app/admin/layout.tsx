import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "易智能运维管理平台",
  description: "Dify应用的创建、配置、监控全生命周期管理",
}

// 创建一个特定的登录页布局
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 获取当前URL路径
  const headersList = await headers()
  const url = headersList.get("x-url") || ""
  const pathname = headersList.get("x-pathname") || ""
  const isLoginPageHeader = headersList.get("x-is-login-page") === "true"
  
  // 通过URL判断是否为登录页面
  const isLoginPage = isLoginPageHeader || pathname.includes("/admin/login") || pathname === "/admin/login"
  
  console.log("Admin布局检测:", pathname, "是登录页:", isLoginPage)
  
  // 在服务器端检查认证状态
  const cookieStore = await cookies()
  const isLoggedIn = cookieStore.has("adminLoggedIn") || process.env.NODE_ENV === "development" // 开发环境下默认登录

  // 如果路径不是 /admin/login 且未登录，则重定向到登录页
  if (!isLoggedIn && !isLoginPage) {
    console.log("未登录，重定向到登录页")
    redirect("/admin/login")
  }

  // 如果是登录页面，使用简单布局，不显示侧边栏和顶部导航栏
  if (isLoginPage) {
    console.log("显示登录页面简单布局")
    return (
      <div className="min-h-screen w-full bg-gray-50">
        {children}
      </div>
    )
  }

  // 否则使用完整的管理布局
  console.log("显示完整管理布局")
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
