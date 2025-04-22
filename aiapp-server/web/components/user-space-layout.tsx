"use client"

import { type ReactNode, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, PlayCircle, Info } from "lucide-react"
import { MobileNav } from "@/components/mobile-nav"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import { AppIntroDialog } from "@/components/app-intro-dialog"
import { API_BASE_URL } from "@/lib/constants"

interface UserSpaceLayoutProps {
  children: ReactNode
  title: string
  backUrl?: string
  appId?: string
  appDescription?: string
  appIcon?: string
}

export function UserSpaceLayout({
  children,
  title,
  backUrl = "/marketplace",
  appId,
  appDescription,
  appIcon,
}: UserSpaceLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [favoriteApps, setFavoriteApps] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"run" | "intro" | null>("run")
  const { isMobile, hasSafeArea } = useMobile()
  const { toast } = useToast()

  // 检查是否是应用页面
  const isAppPage = pathname.startsWith("/app/")

  // 检查当前应用是否已收藏
  const isFavorited = appId ? favoriteApps.includes(appId) : false

  // Initialize on mount
  useEffect(() => {
    setMounted(true)

    try {
      // 加载最近使用的应用
      const storedApps = localStorage.getItem("recentApps")
      let recentAppsList: any[] = []
      
      if (storedApps) {
        try {
          recentAppsList = JSON.parse(storedApps)
          setRecentApps(recentAppsList)
        } catch (error) {
          console.error("解析最近使用的应用数据失败:", error)
          recentAppsList = []
          setRecentApps([])
        }
      }
      
      // 如果当前访问的是应用页面，将当前应用添加到最近使用列表
      if (appId && isAppPage) {
        // 检查当前应用是否已在列表中
        const appExists = recentAppsList.some((app) => app.id === appId)
        
        // 如果应用不在列表中，或者在列表中但不是第一个，则更新列表
        if (!appExists || (appExists && recentAppsList[0]?.id !== appId)) {
          // 获取当前应用信息
          fetch(`${API_BASE_URL}/api/dify-apps/${appId}`)
            .then(response => response.json())
            .then(appData => {
              if (appData && appData.id) {
                // 创建应用对象
                const appInfo = {
                  id: appId,
                  name: title || appData.name,
                  description: appDescription || appData.description,
                  logo: appData.logo || null // 保存logo字段，如果appData.logo不存在则设为null
                }
                
                // 更新最近使用列表（移除现有的相同应用，将新应用添加到列表头部）
                const updatedRecentApps = [
                  appInfo, 
                  ...recentAppsList.filter((app) => app.id !== appId)
                ].slice(0, 5) // 只保留最近5个
                
                // 更新状态和本地存储
                setRecentApps(updatedRecentApps)
                localStorage.setItem("recentApps", JSON.stringify(updatedRecentApps))
              }
            })
            .catch(error => {
              console.error("获取应用信息失败:", error)
            })
        }
      }

      // 加载收藏的应用
      const storedFavorites = localStorage.getItem("favoriteApps")
      if (storedFavorites) {
        setFavoriteApps(JSON.parse(storedFavorites))
      }
    } catch (e) {
      console.error("Failed to parse stored data", e)
    }
  }, [appId, isAppPage, title, appDescription, appIcon])

  const handleAppClick = (appId: string) => {
    router.push(`/app/${appId}`)
  }

  // 处理运行应用
  const handleRunApp = () => {
    if (!appId) return

    setActiveTab("run")

    // 重新加载当前应用页面，模拟"运行"功能
    router.refresh()

    toast({
      title: "应用已启动",
      description: `${title} 已重新启动`,
      duration: 2000,
    })
  }

  // 处理应用介绍
  const handleAppIntro = () => {
    setActiveTab("intro")
    setIsInfoOpen(true)
  }

  // 处理收藏/取消收藏
  const handleToggleFavorite = () => {
    if (!appId) return

    let newFavorites: string[]

    if (isFavorited) {
      // 取消收藏
      newFavorites = favoriteApps.filter((id) => id !== appId)
      toast({
        title: "已取消收藏",
        description: `${title} 已从收藏夹中移除`,
        duration: 2000,
      })
    } else {
      // 添加收藏
      newFavorites = [...favoriteApps, appId]
      toast({
        title: "已添加收藏",
        description: `${title} 已添加到收藏夹`,
        duration: 2000,
      })
    }

    // 更新状态和本地存储
    setFavoriteApps(newFavorites)
    localStorage.setItem("favoriteApps", JSON.stringify(newFavorites))
  }

  // Show a simple loading state until mounted
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* 左侧边栏 - 仅在非移动设备上显示 */}
      <Sidebar 
        recentApps={recentApps} 
        onAppClick={handleAppClick} 
        className="h-screen" 
        favoriteApps={favoriteApps}
      />

      {/* 移动导航 - 仅在移动设备上显示 */}
      <MobileNav />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col h-screen">
        {/* 顶部导航 - 在移动设备上隐藏 */}
        {!isMobile && (
          <header className="flex-shrink-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex flex-col">
            <div className="flex items-center h-[60px] px-4">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => router.push(backUrl)} className="mr-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h1>
              </div>

              {/* 应用页面特有的按钮 - 放在中间 */}
              {isAppPage && (
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant={activeTab === "run" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-gray-700 dark:text-gray-300 flex items-center gap-1 transition-all",
                      activeTab === "run" && "bg-gray-200 dark:bg-gray-700",
                    )}
                    onClick={handleRunApp}
                  >
                    <PlayCircle className="h-4 w-4" />
                    运行
                  </Button>

                  <Button
                    variant={activeTab === "intro" ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-gray-700 dark:text-gray-300 flex items-center gap-1 transition-all",
                      activeTab === "intro" && "bg-gray-200 dark:bg-gray-700",
                    )}
                    onClick={handleAppIntro}
                  >
                    <Info className="h-4 w-4" />
                    应用介绍
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-gray-700 dark:text-gray-300 transition-all",
                      isFavorited && "text-yellow-500 dark:text-yellow-400",
                    )}
                    onClick={handleToggleFavorite}
                  >
                    <Star className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
                  </Button>
                </div>
              )}

              {/* 个人空间按钮 - 放在最右边 */}
              <div className="ml-auto flex items-center">
                <UserProfile />
              </div>
            </div>

            {isAppPage && <div className="h-1 w-full bg-gray-100 dark:bg-gray-700"></div>}
          </header>
        )}

        {/* 应用介绍对话框 */}
        {appId && (
          <AppIntroDialog
            open={isInfoOpen}
            onOpenChange={setIsInfoOpen}
            appId={appId}
            appName={title}
            appDescription={appDescription || ""}
            appIcon={appIcon}
          />
        )}

        {/* 主内容 - 根据设备类型调整样式 */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

