import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import AdminLayoutClient from "@/components/admin/admin-layout-client"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "易智能运维管理平台",
  description: "Dify应用的创建、配置、监控全生命周期管理",
}

// 创建管理平台布局 - 服务端组件
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 将布局逻辑委托给客户端组件
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
