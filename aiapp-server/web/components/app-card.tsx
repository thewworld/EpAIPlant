"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Eye } from "lucide-react"
import { getAppIconById, svgToDataUrl } from "@/lib/app-icons"

// 修改 AppCardProps 接口，适配后端数据格式
interface AppCardProps {
  app: {
    id: number
    name: string
    description: string
    category: string
    apiKey: string
    inputType: string
    outputType: string
    chatModel: string
    type: string
    formConfig?: string
    // 下面是前端自定义属性
    usageCount?: number
    tags?: string[]
    icon?: string
    isFromCommunity?: boolean
  }
  onAppClick: (appId: string) => void
  onAppDetails: (app: any) => void
}

// 修改 AppCard 组件参数，移除 showFavoriteButton 参数
export function AppCard({ app, onAppClick, onAppDetails }: AppCardProps) {
  // 移除收藏相关的状态和函数
  // 删除以下代码:
  /*
  const { toast } = useToast()
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteApps, setFavoriteApps] = useState<string[]>([])

  // 初始化收藏状态
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("favoriteApps")
      if (storedFavorites) {
        const favorites = JSON.parse(storedFavorites) as string[]
        setFavoriteApps(favorites)
        setIsFavorited(favorites.includes(app.id))
      }
    } catch (e) {
      console.error("Failed to parse favorites", e)
    }
  }, [app.id])
  */

  // 移除 handleToggleFavorite 函数
  // 删除以下代码:
  /*
  // 处理收藏/取消收藏
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡
    
    let newFavorites: string[]
    
    if (isFavorited) {
      // 取消收藏
      newFavorites = favoriteApps.filter(id => id !== app.id)
      toast({
        title: "已取消收藏",
        description: `${app.name} 已从收藏夹中移除`,
        duration: 2000,
      })
    } else {
      // 添加收藏
      newFavorites = [...favoriteApps, app.id]
      toast({
        title: "已添加收藏",
        description: `${app.name} 已添加到收藏夹`,
        duration: 2000,
      })
    }
    
    // 更新状态和本地存储
    setFavoriteApps(newFavorites)
    setIsFavorited(!isFavorited)
    localStorage.setItem("favoriteApps", JSON.stringify(newFavorites))
  }
  */

  // 根据应用类别确定背景颜色
  const getBgColor = () => {
    if (app.isFromCommunity)
      return "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20"

    switch (app.category) {
      case "科研":
        return "bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20"
      case "写作":
        return "bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 dark:from-violet-500/20 dark:to-fuchsia-500/20"
      case "教学":
        return "bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20"
      case "管理":
        return "bg-gradient-to-br from-teal-500/10 to-cyan-500/10 dark:from-teal-500/20 dark:to-cyan-500/20"
      default:
        return "bg-gradient-to-br from-gray-500/10 to-slate-500/10 dark:from-gray-500/20 dark:to-slate-500/20"
    }
  }

  // 获取应用图标（基于类型生成不同图标）
  const getIconSrc = () => {
    // 如果有自定义图标，则使用自定义图标
    if (app.icon) {
      const svgIcon = getAppIconById(app.id.toString())
      return svgToDataUrl(svgIcon)
    }
    
    // 根据应用类型生成不同图标
    const defaultIcons: Record<string, string> = {
      'Chat': '/icons/chat.svg',
      'Completion': '/icons/completion.svg',
      'Workflow': '/icons/workflow.svg'
    }
    
    return defaultIcons[app.type] || '/icons/app-default.svg'
  }

  // 从formConfig生成标签
  const getTags = () => {
    // 如果已有标签，则使用现有标签
    if (app.tags && app.tags.length > 0) return app.tags
    
    // 否则基于应用类型生成标签
    const tags = [app.type]
    
    // 添加chatModel为标签
    if (app.chatModel === 'sse') {
      tags.push('流式')
    } else if (app.chatModel === 'block') {
      tags.push('阻塞式')
    }
    
    return tags
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#1e293b]">
      <CardContent
        className="p-4 cursor-pointer relative"
        onClick={(e) => {
          // 防止点击按钮时触发卡片点击事件
          if (!(e.target as HTMLElement).closest("button")) {
            onAppDetails(app)
          }
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${getBgColor()} border border-gray-200 dark:border-[#334155]`}
          >
            {/* 使用图标 */}
            <img src={getIconSrc() || "/placeholder.svg"} alt={app.name} className="w-8 h-8" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium truncate text-gray-800 dark:text-white">{app.name}</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{app.type}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{app.description}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#334155]"
          onClick={() => onAppClick(app.id.toString())}
        >
          立即使用
        </Button>

        {getTags().slice(0, 2).map((tag) => (
          <Button
            key={tag}
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            {tag}
          </Button>
        ))}
      </CardFooter>
    </Card>
  )
}

