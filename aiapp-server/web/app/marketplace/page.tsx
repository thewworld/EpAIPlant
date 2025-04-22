"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { AppCategory } from "@/components/app-category"
import { Sidebar } from "@/components/sidebar"
import { UserProfile } from "@/components/user-profile"
import { AppDetailDialog } from "@/components/app-detail-dialog"
import { AppConfig, AppType } from "@/types/app-config"

export default function MarketplacePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredApps, setFilteredApps] = useState<any[]>([])
  const [allApps, setAllApps] = useState<any[]>([])
  const [recentApps, setRecentApps] = useState<any[]>([])
  const [favoriteApps, setFavoriteApps] = useState<string[]>([])
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("全部")

  // 从后端获取应用数据
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await fetch('http://localhost:8087/api/dify-apps')
        const data = await response.json()
        setAllApps(data)
        setFilteredApps(data)
        
        // 提取所有唯一的分类
        const uniqueCategories = Array.from(new Set(data.map((app: any) => app.category)))
        setCategories(['全部', ...uniqueCategories])
      } catch (error) {
        console.error('获取应用列表失败:', error)
      }
    }
    fetchApps()
  }, [])

  // 从本地存储加载最近使用的应用和收藏的应用
  useEffect(() => {
    // 加载最近使用的应用
    const storedRecentApps = localStorage.getItem("recentApps")
    if (storedRecentApps) {
      try {
        setRecentApps(JSON.parse(storedRecentApps))
      } catch (error) {
        console.error("解析最近使用的应用数据失败:", error)
        setRecentApps([])
      }
    }

    // 加载收藏的应用
    const storedFavorites = localStorage.getItem("favoriteApps")
    if (storedFavorites) {
      try {
        setFavoriteApps(JSON.parse(storedFavorites))
      } catch (error) {
        console.error("解析收藏的应用数据失败:", error)
        setFavoriteApps([])
      }
    }
  }, [])

  // 处理搜索和分类过滤
  useEffect(() => {
    let filtered = allApps
    
    // 应用搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // 应用分类过滤
    if (selectedCategory !== "全部") {
      filtered = filtered.filter(app => app.category === selectedCategory)
    }
    
    setFilteredApps(filtered)
  }, [searchQuery, selectedCategory, allApps])

  // 处理应用点击
  const handleAppClick = (appId: string) => {
    // 更新最近使用的应用
    const app = allApps.find((a) => a.id === appId)
    if (app) {
      // 创建一个包含必要字段的新对象，并确保所有字段的类型正确
      const appToSave = {
        id: appId, // 直接使用传入的字符串ID
        name: typeof app.name === 'string' ? app.name : '未命名应用',
        description: typeof app.description === 'string' ? app.description : '',
        category: typeof app.category === 'string' ? app.category : '',
        logo: app.logo || null, // logo可能是SVG字符串或URL
        type: typeof app.type === 'string' ? app.type : 'Chat'
      };
      
      const updatedRecentApps = [appToSave, ...recentApps.filter((a) => a.id !== appId)].slice(0, 5)
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

  // 获取相关应用
  const getRelatedApps = (app: any) => {
    if (!app) return []

    // 首先尝试获取同类别的应用
    const sameCategory = allApps.filter((a) => a.id !== app.id && a.category === app.category)

    // 如果同类别应用不足4个，添加其他类别的应用
    if (sameCategory.length < 4) {
      const otherApps = allApps.filter((a) => a.id !== app.id && a.category !== app.category)
      return [...sameCategory, ...otherApps].slice(0, 4)
    }

    return sameCategory.slice(0, 4)
  }

  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("搜索:", searchQuery)
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0f172a]">
      {/* 左侧边栏 */}
      <Sidebar recentApps={recentApps} onAppClick={handleAppClick} favoriteApps={favoriteApps} />

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white dark:bg-[#0f172a] border-b dark:border-[#1e293b]">
          <div className="flex items-center justify-between h-[60px] px-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">发现应用</h1>
            <UserProfile />
          </div>

          {/* 搜索横幅 */}
          <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-8 flex flex-col items-center justify-center">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl mx-auto">
              <div className="flex items-center bg-white dark:bg-[#1e293b] rounded-md overflow-hidden">
                <Input
                  placeholder="搜索应用..."
                  className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700"
                >
                  <Search className="h-4 w-4 mr-1" />
                  搜索
                </Button>
              </div>
            </form>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4">
          {/* 分类标签 */}
          <Tabs defaultValue="全部" onValueChange={setSelectedCategory}>
            <TabsList className="mb-4 flex flex-wrap">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-0">
                <AppCategory
                  title={category === "全部" ? "所有应用" : `${category}类应用`}
                  apps={category === "全部" ? filteredApps : filteredApps.filter(app => app.category === category)}
                  onAppClick={handleAppClick}
                  onAppDetails={handleAppDetails}
                />
              </TabsContent>
            ))}
          </Tabs>
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

