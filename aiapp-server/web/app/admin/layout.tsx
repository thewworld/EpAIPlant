import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "易智能运维管理平台",
  description: "Dify应用的创建、配置、监控全生命周期管理",
}

// 创建一个特定的登录页布局
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 登录页面直接通过文件路径自动识别，
  // 中间件保证了只有登录页面和已登录用户能够访问admin路径
  // 直接根据子组件判断布局
  return children
}
