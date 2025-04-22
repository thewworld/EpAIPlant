"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Star, Trash2 } from "lucide-react"
import { AppCard } from "@/components/app-card"
import { Sidebar } from "@/components/sidebar"
import { UserProfile } from "@/components/user-profile"
import { AppDetailDialog } from "@/components/app-detail-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useMobile } from "@/hooks/use-mobile"

export default function FavoritesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isMobile, hasSafeArea } = useMobile()
  const [searchQuery, setSearchQuery] = useState("")
  const [favoriteApps, setFavoriteApps] = useState<any[]>([])
  const [filteredApps, setFilteredApps] = useState<any[]>([])
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [allApps, setAllApps] = useState<any[]>([])

  // 从后端获取应用数据
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch('http://localhost:8087/api/dify-apps')
        const data = await response.json()
        setAllApps(data)
      } catch (error) {
        console.error('获取应用列表失败:', error)
      }
    }
    fetchApps()
  }, [])

  // 初始化
  useEffect(() => {
    setMounted(true)

    try {
      // 加载收藏的应用
      const storedFavorites = localStorage.getItem("favoriteApps")
      if (storedFavorites && allApps.length > 0) {
        const favoriteIds = JSON.parse(storedFavorites) as string[]

        // 获取收藏应用的详细信息
        const favorites = favoriteIds
          .map((id) => {
            const appData = allApps.find(app => app.id === id)
            if (appData) {
              return appData
            }
            return null
          })
          .filter(Boolean)

        setFavoriteApps(favorites)
        setFilteredApps(favorites)
      }

      // 加载最近使用的应用
      const storedRecentApps = localStorage.getItem("recentApps")
      if (storedRecentApps) {
        setRecentApps(JSON.parse(storedRecentApps))
      }
    } catch (e) {
      console.error("Failed to parse stored data", e)
    }
  }, [allApps])

  // 处理搜索
  useEffect(() => {
    if (searchQuery) {
      const filtered = favoriteApps.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredApps(filtered)
    } else {
      setFilteredApps(favoriteApps)
    }
  }, [searchQuery, favoriteApps])

  // 处理应用点击
  const handleAppClick = (appId: string) => {
    // 更新最近使用的应用
    const app = favoriteApps.find((a) => a.id === appId)
    if (app) {
      // 确保app对象包含id属性
      const appWithId = {
        ...app,
        id: appId, // 明确设置id属性
      }
      const updatedRecentApps = [appWithId, ...recentApps.filter((a) => a.id !== appId)].slice(0, 5)
      setRecentApps(updatedRecentApps)
      localStorage.setItem("recentApps", JSON.stringify(updatedRecentApps))
    }

    // 关闭详情对话框（如果打开）
    setIsDetailOpen(false)

    // 导航到应用使用页面
    router.push(`/app/${appId}`)
  }

  // 处理应用详情
  const handleAppDetails = (app: any) => {
    setSelectedApp(app)
    setIsDetailOpen(true)
  }

  // 处理移除收藏
  const handleRemoveFavorite = (appId: string, event?: React.MouseEvent) => {
    // 阻止事件冒泡，避免触发卡片点击
    if (event) {
      event.stopPropagation()
    }

    // 从收藏列表中移除
    const updatedFavorites = favoriteApps.filter((app) => app.id !== appId)
    setFavoriteApps(updatedFavorites)

    // 更新本地存储
    const favoriteIds = updatedFavorites.map((app) => app.id)
    localStorage.setItem("favoriteApps", JSON.stringify(favoriteIds))

    // 显示提示
    toast({
      title: "已移除收藏",
      description: "应用已从收藏夹中移除",
      duration: 2000,
    })
  }

  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  // 获取相关应用
  const getRelatedApps = (app: any) => {
    if (!app || allApps.length === 0) return []

    // 获取同类别的应用
    const sameCategory = allApps
      .filter((a) => a.id !== app.id && a.category === app.category)
      .slice(0, 4)

    return sameCategory
  }

  // 显示加载状态直到组件完全挂载
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div>加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* 左侧边栏 */}
      <Sidebar 
        recentApps={recentApps} 
        onAppClick={handleAppClick} 
        favoriteApps={favoriteApps.map(app => app.id)}
      />

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white dark:bg-[#0f172a] border-b dark:border-[#1e293b]">
          <div className="flex items-center justify-between h-[60px] px-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">我的收藏</h1>
            <UserProfile />
          </div>

          {/* 搜索横幅 */}
          <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-8 flex flex-col items-center justify-center">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mx-auto">
              <div className="flex items-center bg-white dark:bg-[#1e293b] rounded-md overflow-hidden">
                <Input
                  placeholder="搜索收藏的应用..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                >
                  <Search className="h-4 w-4 mr-1" />
                  搜索
                </Button>
              </div>
            </form>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4">
          {filteredApps.length > 0 ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  我的收藏应用
                </h2>
                <div className="text-sm text-gray-500 dark:text-gray-400">共 {filteredApps.length} 个收藏应用</div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredApps.map((app) => (
                  <div key={app.id} className="relative group">
                    <AppCard app={app} onAppClick={handleAppClick} onAppDetails={handleAppDetails} />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleRemoveFavorite(app.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">暂无收藏应用</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                您还没有收藏任何应用。浏览应用市场，找到喜欢的应用后点击星标收藏。
              </p>
              <Button
                onClick={() => router.push("/marketplace")}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white"
              >
                浏览应用市场
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* 应用详情对话框 */}
      {selectedApp && (
        <AppDetailDialog
          app={selectedApp}
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          onAppClick={handleAppClick}
          relatedApps={getRelatedApps(selectedApp)}
        />
      )}
    </div>
  )
}

