"use client"

import { useState } from "react"
import { Bell, Search, User, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "登出成功",
          description: "您已成功退出系统",
        })
        // 使用硬跳转而不是客户端路由，确保页面完全重新加载，以正确显示登录页面（无导航栏）
        window.location.href = "/admin/login"
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "登出失败",
        description: "退出系统时发生错误，请稍后再试",
      })
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 py-3 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center w-1/3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="全局搜索..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="管理员" />
                  <AvatarFallback>管理</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">管理员</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>个人资料</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
