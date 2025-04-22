import React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "运维管理平台 - 登录",
  description: "易智能平台运维管理系统登录",
}

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 登录页面使用简单布局，不包含侧边栏和顶部导航栏
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      {children}
    </div>
  )
}
