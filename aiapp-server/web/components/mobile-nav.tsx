"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { Menu, X, Home, MessageSquare, Store, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { SafeArea } from "@/components/safe-area"

interface MobileNavProps {
  className?: string
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile } = useMobile()
  const pathname = usePathname()

  // 关闭侧边栏当路由变化时
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // 当侧边栏打开时禁止滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // 如果不是移动设备，不显示移动导航
  if (!isMobile) return null

  return (
    <>
      {/* 顶部导航栏 */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-40 h-14 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-[#1e293b] flex items-center px-4",
          className,
        )}
      >
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">打开菜单</span>
        </Button>

        <div className="mx-auto">
          <h1 className="text-lg font-semibold">EAI 平台</h1>
        </div>

        <Link href="/profile">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">个人资料</span>
          </Button>
        </Link>
      </div>

      {/* 侧边栏 */}
      <div className={cn("mobile-overlay", isOpen ? "open" : "closed")} onClick={() => setIsOpen(false)} />

      <SafeArea className={cn("mobile-sidebar", isOpen ? "open" : "closed")}>
        <div className="flex flex-col h-full">
          <div className="h-14 px-4 border-b border-gray-200 dark:border-[#1e293b] flex items-center justify-between">
            <h2 className="font-semibold text-xl">菜单</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">关闭菜单</span>
            </Button>
          </div>

          <nav className="flex-1 overflow-auto p-4">
            <ul className="space-y-2">
              <li>
                <Link href="/home">
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start", pathname === "/home" && "bg-gray-100 dark:bg-[#1e293b]")}
                  >
                    <Home className="mr-2 h-5 w-5" />
                    首页
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/chat">
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start", pathname === "/chat" && "bg-gray-100 dark:bg-[#1e293b]")}
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    AI 对话
                  </Button>
                </Link>
              </li>
              <li>
                <Link href="/marketplace">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === "/marketplace" && "bg-gray-100 dark:bg-[#1e293b]",
                    )}
                  >
                    <Store className="mr-2 h-5 w-5" />
                    应用市场
                  </Button>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </SafeArea>

      {/* 底部导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-[#1e293b] flex items-center justify-around px-4">
        <Link href="/home">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col h-14 w-16 items-center justify-center rounded-none"
          >
            <Home
              className={cn("h-5 w-5", pathname === "/home" ? "text-primary" : "text-gray-500 dark:text-gray-400")}
            />
            <span
              className={cn("text-xs mt-1", pathname === "/home" ? "text-primary" : "text-gray-500 dark:text-gray-400")}
            >
              首页
            </span>
          </Button>
        </Link>

        <Link href="/chat">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col h-14 w-16 items-center justify-center rounded-none"
          >
            <MessageSquare
              className={cn("h-5 w-5", pathname === "/chat" ? "text-primary" : "text-gray-500 dark:text-gray-400")}
            />
            <span
              className={cn("text-xs mt-1", pathname === "/chat" ? "text-primary" : "text-gray-500 dark:text-gray-400")}
            >
              对话
            </span>
          </Button>
        </Link>

        <Link href="/marketplace">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col h-14 w-16 items-center justify-center rounded-none"
          >
            <Store
              className={cn(
                "h-5 w-5",
                pathname === "/marketplace" ? "text-primary" : "text-gray-500 dark:text-gray-400",
              )}
            />
            <span
              className={cn(
                "text-xs mt-1",
                pathname === "/marketplace" ? "text-primary" : "text-gray-500 dark:text-gray-400",
              )}
            >
              应用
            </span>
          </Button>
        </Link>

        <Link href="/profile">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col h-14 w-16 items-center justify-center rounded-none"
          >
            <User
              className={cn("h-5 w-5", pathname === "/profile" ? "text-primary" : "text-gray-500 dark:text-gray-400")}
            />
            <span
              className={cn(
                "text-xs mt-1",
                pathname === "/profile" ? "text-primary" : "text-gray-500 dark:text-gray-400",
              )}
            >
              我的
            </span>
          </Button>
        </Link>
      </div>
    </>
  )
}

