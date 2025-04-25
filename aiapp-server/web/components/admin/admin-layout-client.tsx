"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import AdminHeader from "@/components/admin/admin-header"

// 创建管理平台客户端布局
export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  // 使用客户端导航钩子
  const pathname = usePathname();
  
  // 检查当前路径是否为登录页
  const isLoginPath = pathname === "/admin/login" || pathname === "/admin/login/";
  
  // 如果是登录页，使用简单布局
  if (isLoginPath) {
    return <>{children}</>;
  }
  
  // 其他管理页面使用完整布局
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-gray-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-auto">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
} 