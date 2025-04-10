"use client"

import { useState } from "react"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Search, Clock, ArrowUpDown, Download, Filter } from "lucide-react"

// 模拟使用记录数据
const usageRecords = [
  {
    id: 1,
    appName: "找论文",
    appIcon: "/placeholder.svg?height=32&width=32",
    action: "使用应用",
    timestamp: "2023-12-20 14:30",
    duration: "25分钟",
    details: "搜索关键词: 人工智能, 机器学习",
  },
  {
    id: 2,
    appName: "科研助手",
    appIcon: "/placeholder.svg?height=32&width=32",
    action: "使用应用",
    timestamp: "2023-12-19 10:15",
    duration: "45分钟",
    details: "分析数据集: 气候变化研究",
  },
  {
    id: 3,
    appName: "AI 对话",
    appIcon: "/placeholder.svg?height=32&width=32",
    action: "对话",
    timestamp: "2023-12-18 16:20",
    duration: "15分钟",
    details: "对话主题: 量子计算基础",
  },
  {
    id: 4,
    appName: "数据分析工具",
    appIcon: "/placeholder.svg?height=32&width=32",
    action: "使用应用",
    timestamp: "2023-12-17 09:45",
    duration: "35分钟",
    details: "处理数据: 社会调查结果",
  },
  {
    id: 5,
    appName: "试题生成器",
    appIcon: "/placeholder.svg?height=32&width=32",
    action: "使用应用",
    timestamp: "2023-12-15 11:30",
    duration: "20分钟",
    details: "生成试题: 高等数学",
  },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedApp, setSelectedApp] = useState<string | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // 过滤和排序记录
  const filteredRecords = usageRecords
    .filter((record) => {
      // 搜索过滤
      if (
        searchQuery &&
        !record.appName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.details.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false
      }

      // 应用过滤
      if (selectedApp && record.appName !== selectedApp) {
        return false
      }

      // 日期过滤 (简化版，实际应用中需要更精确的日期比较)
      if (selectedDate && !record.timestamp.includes(selectedDate ? format(selectedDate, "yyyy-MM-dd") : "")) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // 时间排序
      const dateA = new Date(a.timestamp.replace(/(\d+)-(\d+)-(\d+)/, "$1/$2/$3")).getTime()
      const dateB = new Date(b.timestamp.replace(/(\d+)-(\d+)-(\d+)/, "$1/$2/$3")).getTime()
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA
    })

  // 获取所有应用名称（用于过滤）
  const appNames = Array.from(new Set(usageRecords.map((record) => record.appName)))

  // 重置所有过滤器
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedDate(undefined)
    setSelectedApp(undefined)
    setSortOrder("desc")
  }

  return (
    <UserSpaceLayout title="使用记录查看">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">所有记录</TabsTrigger>
          <TabsTrigger value="apps">应用使用</TabsTrigger>
          <TabsTrigger value="chat">AI 对话</TabsTrigger>
          <TabsTrigger value="analytics">使用分析</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>使用记录</CardTitle>
              <CardDescription>查看您在平台上的所有活动记录。</CardDescription>
            </CardHeader>
            <CardContent>
              {/* 过滤和搜索工具栏 */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索应用或内容..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "yyyy-MM-dd") : "选择日期"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>

                  <Select value={selectedApp} onValueChange={setSelectedApp}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="选择应用" />
                    </SelectTrigger>
                    <SelectContent>
                      {appNames.map((app) => (
                        <SelectItem key={app} value={app}>
                          {app}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>

                  <Button variant="outline" size="icon" onClick={resetFilters}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 记录列表 */}
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">没有找到记录</h3>
                  <p className="text-sm text-muted-foreground">尝试调整过滤条件或清除搜索内容。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <img
                            src={record.appIcon || "/placeholder.svg"}
                            alt={record.appName}
                            className="w-5 h-5"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{record.appName}</h4>
                            <span className="text-sm text-muted-foreground">{record.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {record.action} · {record.duration}
                          </p>
                          <p className="text-sm mt-2">{record.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">加载更多</Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                导出记录
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="apps">
          <Card>
            <CardHeader>
              <CardTitle>应用使用记录</CardTitle>
              <CardDescription>查看您使用过的应用及其使用情况。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords
                  .filter((record) => record.action === "使用应用")
                  .map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <img
                            src={record.appIcon || "/placeholder.svg"}
                            alt={record.appName}
                            className="w-5 h-5"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{record.appName}</h4>
                            <span className="text-sm text-muted-foreground">{record.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">使用时长: {record.duration}</p>
                          <p className="text-sm mt-2">{record.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>AI 对话记录</CardTitle>
              <CardDescription>查看您与AI助手的对话历史。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRecords
                  .filter((record) => record.action === "对话")
                  .map((record) => (
                    <div key={record.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <img
                            src={record.appIcon || "/placeholder.svg"}
                            alt={record.appName}
                            className="w-5 h-5"
                            onError={(e) => {
                              ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=20&width=20"
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{record.appName}</h4>
                            <span className="text-sm text-muted-foreground">{record.timestamp}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">对话时长: {record.duration}</p>
                          <p className="text-sm mt-2">{record.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>使用分析</CardTitle>
              <CardDescription>查看您的平台使用情况统计和分析。</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">使用时长统计</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">本周使用时长</p>
                      <p className="text-2xl font-bold mt-1">2小时35分钟</p>
                      <p className="text-xs text-green-600 mt-1">↑ 15% 相比上周</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">本月使用时长</p>
                      <p className="text-2xl font-bold mt-1">10小时20分钟</p>
                      <p className="text-xs text-green-600 mt-1">↑ 8% 相比上月</p>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">总使用时长</p>
                      <p className="text-2xl font-bold mt-1">45小时15分钟</p>
                      <p className="text-xs text-muted-foreground mt-1">自2023年10月起</p>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">最常使用的应用</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                        <img src="/placeholder.svg?height=20&width=20" alt="科研助手" className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">科研助手</p>
                          <p className="text-sm">5小时30分钟</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-1">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "80%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                        <img src="/placeholder.svg?height=20&width=20" alt="AI 对话" className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">AI 对话</p>
                          <p className="text-sm">4小时15分钟</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-1">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "65%" }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                        <img src="/placeholder.svg?height=20&width=20" alt="找论文" className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">找论文</p>
                          <p className="text-sm">3小时45分钟</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-1">
                          <div className="bg-primary h-2 rounded-full" style={{ width: "55%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </UserSpaceLayout>
  )
}

