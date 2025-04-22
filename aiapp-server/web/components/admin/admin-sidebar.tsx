"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, AppWindow, Users, Bell, FileText, Settings, BarChart3, Shield, Layers } from "lucide-react"

const navItems = [
  { name: "仪表盘", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "应用管理", href: "/admin/applications", icon: AppWindow },
  { name: "用户权限", href: "/admin/users", icon: Users },
  { name: "监控告警", href: "/admin/alerts", icon: Bell },
  { name: "日志分析", href: "/admin/logs", icon: FileText },
  { name: "模块管理", href: "/admin/modules", icon: Layers },
  { name: "资源监控", href: "/admin/resources", icon: BarChart3 },
  { name: "安全设置", href: "/admin/security", icon: Shield },
  { name: "系统设置", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">易智能运维平台</h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">版本: v1.0.0</div>
      </div>
    </div>
  )
}
