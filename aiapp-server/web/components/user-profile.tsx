"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, History, Sliders, LogOut, ChevronDown, ChevronRight, Shield } from "lucide-react"
import Link from "next/link"

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 从本地存储获取用户数据
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUserData(JSON.parse(storedUser))
    }

    // 点击外部关闭菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    // 清除本地存储的用户数据和token
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("rememberMe")

    // 重定向到登录页面
    router.push("/login")
  }

  if (!userData) {
    return null
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 h-auto" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt={userData.name} />
            <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">个人空间</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-md border bg-white shadow-md z-50">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" alt={userData.name} />
                <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{userData.name}</p>
                <p className="text-xs text-muted-foreground">免费版</p>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start px-4 py-2 h-auto">
                <User className="mr-2 h-4 w-4" />
                <span>个人资料管理</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/security">
              <Button variant="ghost" className="w-full justify-start px-4 py-2 h-auto">
                <Shield className="mr-2 h-4 w-4" />
                <span>账号安全设置</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/notifications">
              <Button variant="ghost" className="w-full justify-start px-4 py-2 h-auto">
                <Bell className="mr-2 h-4 w-4" />
                <span>消息通知中心</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/history">
              <Button variant="ghost" className="w-full justify-start px-4 py-2 h-auto">
                <History className="mr-2 h-4 w-4" />
                <span>使用记录查看</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>

            <Link href="/preferences">
              <Button variant="ghost" className="w-full justify-start px-4 py-2 h-auto">
                <Sliders className="mr-2 h-4 w-4" />
                <span>偏好设置</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

