"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageSquare, Store, Star, Home, Cpu } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface SidebarProps {
  recentApps: any[]
  onAppClick: (appId: string) => void
  className?: string
  favoriteApps?: string[]
}

export function Sidebar({ recentApps, onAppClick, className, favoriteApps = [] }: SidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const { isMobile } = useMobile()

  // Use a timeout to ensure React is fully initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // 在移动设备上不显示侧边栏
  if (isMobile) return null

  // Don't render full sidebar until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div
        className={cn(
          "w-60 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-[#1e293b] flex flex-col h-full",
          className,
        )}
      >
        <div className="h-[60px] px-4 border-b border-gray-200 dark:border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            <div className="w-24 h-6 bg-gray-200 dark:bg-[#1e293b] rounded"></div>
          </div>
          <div className="w-9 h-9"></div>
        </div>
        <div className="flex-1 p-2">
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 dark:bg-[#1e293b] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "w-60 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-[#1e293b] flex flex-col h-full relative overflow-hidden",
        className,
      )}
    >
      {/* 装饰性背景元素 - 只在深色模式显示 */}
      <div className="absolute inset-0 z-0 opacity-0 dark:opacity-10">
        <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-40 -right-20 w-60 h-60 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* 网格背景 - 只在深色模式显示 */}
      <div
        className="absolute inset-0 z-0 opacity-0 dark:opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      <div className="h-[60px] px-4 border-b border-gray-200 dark:border-[#1e293b] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Cpu className="h-4 w-4 text-white" />
          </div>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-white">EAI 平台</h2>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex-1 overflow-auto p-2 relative z-10">
        <ul className="space-y-1">
          <li>
            <Link href="/home">
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-700 dark:text-[#94a3b8] hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-[#1e293b] ${
                  pathname === "/home"
                    ? "bg-gray-100 text-gray-900 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 dark:text-white dark:border-l-2 dark:border-blue-500"
                    : ""
                }`}
              >
                <Home className="mr-2 h-4 w-4" />
                首页
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/chat">
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-700 dark:text-[#94a3b8] hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-[#1e293b] ${
                  pathname === "/chat"
                    ? "bg-gray-100 text-gray-900 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 dark:text-white dark:border-l-2 dark:border-blue-500"
                    : ""
                }`}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                AI 对话
              </Button>
            </Link>
          </li>
          <li>
            <Link href="/marketplace">
              <Button
                variant="ghost"
                className={`w-full justify-start text-gray-700 dark:text-[#94a3b8] hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-[#1e293b] ${
                  pathname === "/marketplace"
                    ? "bg-gray-100 text-gray-900 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 dark:text-white dark:border-l-2 dark:border-blue-500"
                    : ""
                }`}
              >
                <Store className="mr-2 h-4 w-4" />
                应用市场
              </Button>
            </Link>
          </li>
        </ul>

        {recentApps && recentApps.length > 0 && (
          <div className="mt-6">
            <h3 className="px-3 text-sm font-medium mb-2 text-gray-500 dark:text-[#64748b]">最近使用</h3>
            <ul className="space-y-1">
              {recentApps.map((app) => {
                // 检查app是否为有效对象且有id
                if (!app || !app.id) {
                  console.warn('发现无效的应用信息:', app);
                  return null; // 跳过无效的应用
                }
                
                // 获取应用图标 - 修改图标获取逻辑
                let iconUrl = "/icons/app-default.svg"; // 使用通用默认图标
                let iconSource = "default"; // 记录图标来源以便调试
                
                try {
                  // 优先使用应用配置中的logo属性（后端返回）
                  if (app.logo) {
                    iconSource = "app.logo";
                    // 检查logo是否已经是data:image开头的URL格式
                    if (app.logo.startsWith('data:image')) {
                      iconUrl = app.logo;
                    } 
                    // 检查是否是base64编码
                    else if (app.logo.startsWith('PD94') || app.logo.startsWith('PHN2')) {
                      iconUrl = `data:image/svg+xml;base64,${app.logo}`;
                    }
                    // 否则将SVG进行URL编码
                    else {
                      try {
                        iconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(app.logo)}`;
                      } catch (e) {
                        console.debug('Logo编码错误，使用备用图标:', e);
                        // 编码失败时使用备用方案
                        const svgIcon = getAppIconById(app.id);
                        if (svgIcon) {
                          iconSource = "getAppIconById after logo error";
                          iconUrl = svgToDataUrl(svgIcon);
                        }
                      }
                    }
                  } 
                  // 如果没有logo，尝试使用type和name生成默认图标
                  else {
                    // 首先尝试使用icon字段
                    if (app.icon) {
                      iconSource = "app.icon";
                      const dataUrl = svgToDataUrl(app.icon);
                      if (dataUrl) {
                        iconUrl = dataUrl;
                      }
                    } 
                    // 然后使用内联SVG图标生成器
                    else {
                      // 注意：这里使用的ID必须是字符串类型
                      const appId = String(app.id); 
                      const svgIcon = getAppIconById(appId);
                      // 如果成功生成了图标，转换为数据URL
                      if (svgIcon) {
                        iconSource = "getAppIconById";
                        iconUrl = svgToDataUrl(svgIcon);
                      }
                    }
                  }
                } catch (error) {
                  console.debug(`生成图标URL失败 (app ID: ${app.id})：`, error);
                  iconUrl = "/icons/app-default.svg";
                }

                // 如果所有方法都失败，确保至少有默认图标
                if (!iconUrl) {
                  iconUrl = "/icons/app-default.svg";
                }

                return (
                  <li key={app.id}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm h-9 text-gray-700 dark:text-[#94a3b8] hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-[#1e293b]"
                      onClick={() => onAppClick(app.id)}
                    >
                      <div 
                        className="w-5 h-5 mr-2 flex-shrink-0 flex items-center justify-center rounded-sm overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20"
                        title={`图标来源: ${iconSource}`}
                      >
                        <img
                          src={iconUrl}
                          alt={app.name || "应用"}
                          className="w-4 h-4 object-contain"
                          onError={(e) => {
                            console.debug(`图标加载失败，使用默认图标 (app ID: ${app.id}, source: ${iconSource})`);
                            (e.target as HTMLImageElement).src = "/icons/app-default.svg";
                          }}
                        />
                      </div>
                      <span className="truncate">{app.name || "未命名应用"}</span>
                    </Button>
                  </li>
                )
              }).filter(Boolean)}
            </ul>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1e293b] relative z-10">
        <Link href="/favorites">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-700 dark:text-[#94a3b8] hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-[#1e293b]"
          >
            <Star className="mr-2 h-4 w-4" />
            我的收藏
          </Button>
        </Link>
      </div>
    </div>
  )
}

