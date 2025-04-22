"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "@/components/date-range-picker"
import { LineChart, BarChart, PieChart } from "@/components/admin/monitoring-charts"
import { Loader2, AlertTriangle, Download, RefreshCw } from "lucide-react"

// 模拟资源数据
const resourceData = {
  system: {
    cpu: 68,
    memory: 72,
    storage: 45,
    network: 38,
  },
  applications: [
    { name: "AI研究助手", cpu: 22, memory: 18, storage: 12, network: 15 },
    { name: "论文分析工具", cpu: 15, memory: 24, storage: 8, network: 10 },
    { name: "数据可视化", cpu: 12, memory: 14, storage: 10, network: 5 },
    { name: "实验设计助手", cpu: 10, memory: 8, storage: 6, network: 4 },
    { name: "其他应用", cpu: 9, memory: 8, storage: 9, network: 4 },
  ],
  alerts: [
    { id: 1, level: "warning", resource: "CPU", message: "CPU使用率超过70%", time: "今天 08:45" },
    { id: 2, level: "critical", resource: "内存", message: "内存使用率接近阈值", time: "今天 10:23" },
    { id: 3, level: "info", resource: "存储", message: "存储空间增长速度异常", time: "昨天 15:30" },
  ],
}

// 模拟历史数据
const generateHistoricalData = () => {
  const data = []
  const now = new Date()
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      cpu: Math.floor(Math.random() * 30) + 50,
      memory: Math.floor(Math.random() * 25) + 60,
      storage: Math.floor(Math.random() * 10) + 40,
      network: Math.floor(Math.random() * 40) + 20,
    })
  }
  return data.reverse()
}

export default function ResourcesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("24h")
  const [historicalData, setHistoricalData] = useState([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // 模拟加载数据
    const timer = setTimeout(() => {
      setHistoricalData(generateHistoricalData())
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setHistoricalData(generateHistoricalData())
      setRefreshing(false)
    }, 1000)
  }

  const ResourceProgressCard = ({ title, value, description, color }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}%</div>
          {value > 80 ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : value > 60 ? (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          ) : null}
        </div>
        <Progress value={value} className={`h-2 mt-2 ${color}`} />
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex h-[600px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">资源监控</h1>
        <div className="flex items-center gap-4">
          <DateRangePicker />
          <Select defaultValue={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择时间范围" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">最近1小时</SelectItem>
              <SelectItem value="6h">最近6小时</SelectItem>
              <SelectItem value="24h">最近24小时</SelectItem>
              <SelectItem value="7d">最近7天</SelectItem>
              <SelectItem value="30d">最近30天</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            刷新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ResourceProgressCard
          title="CPU使用率"
          value={resourceData.system.cpu}
          description="当前CPU使用率，阈值为85%"
          color={
            resourceData.system.cpu > 80
              ? "bg-red-500"
              : resourceData.system.cpu > 60
                ? "bg-yellow-500"
                : "bg-green-500"
          }
        />
        <ResourceProgressCard
          title="内存使用率"
          value={resourceData.system.memory}
          description="当前内存使用率，阈值为90%"
          color={
            resourceData.system.memory > 80
              ? "bg-red-500"
              : resourceData.system.memory > 60
                ? "bg-yellow-500"
                : "bg-green-500"
          }
        />
        <ResourceProgressCard
          title="存储使用率"
          value={resourceData.system.storage}
          description="当前存储使用率，阈值为85%"
          color={
            resourceData.system.storage > 80
              ? "bg-red-500"
              : resourceData.system.storage > 60
                ? "bg-yellow-500"
                : "bg-green-500"
          }
        />
        <ResourceProgressCard
          title="网络带宽使用率"
          value={resourceData.system.network}
          description="当前网络带宽使用率，阈值为80%"
          color={
            resourceData.system.network > 80
              ? "bg-red-500"
              : resourceData.system.network > 60
                ? "bg-yellow-500"
                : "bg-green-500"
          }
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">系统概览</TabsTrigger>
          <TabsTrigger value="applications">应用资源</TabsTrigger>
          <TabsTrigger value="alerts">资源告警</TabsTrigger>
          <TabsTrigger value="settings">告警设置</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>资源使用趋势</CardTitle>
              <CardDescription>显示过去24小时的系统资源使用情况</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <LineChart
                data={historicalData}
                categories={["cpu", "memory", "storage", "network"]}
                index="time"
                colors={["#2563eb", "#16a34a", "#d97706", "#dc2626"]}
                valueFormatter={(value) => `${value}%`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>应用CPU使用率</CardTitle>
                <CardDescription>按应用划分的CPU资源使用情况</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={resourceData.applications.map((app) => ({ name: app.name, value: app.cpu }))}
                  index="name"
                  category="value"
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>应用内存使用率</CardTitle>
                <CardDescription>按应用划分的内存资源使用情况</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChart
                  data={resourceData.applications.map((app) => ({ name: app.name, value: app.memory }))}
                  index="name"
                  category="value"
                  valueFormatter={(value) => `${value}%`}
                />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>应用资源消耗排名</CardTitle>
              <CardDescription>按资源消耗排序的应用列表</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <BarChart
                data={resourceData.applications}
                index="name"
                categories={["cpu", "memory", "storage", "network"]}
                colors={["#2563eb", "#16a34a", "#d97706", "#dc2626"]}
                valueFormatter={(value) => `${value}%`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>资源告警</CardTitle>
              <CardDescription>最近的资源使用告警信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resourceData.alerts.map((alert) => (
                  <Alert
                    key={alert.id}
                    variant={
                      alert.level === "critical" ? "destructive" : alert.level === "warning" ? "default" : "outline"
                    }
                  >
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium">{alert.resource}告警</div>
                        <AlertDescription className="mt-1">
                          {alert.message}
                          <div className="text-xs text-muted-foreground mt-1">{alert.time}</div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>告警阈值设置</CardTitle>
              <CardDescription>配置资源使用告警的阈值</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">CPU告警阈值 (%)</label>
                    <div className="flex items-center space-x-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">警告</label>
                          <input type="number" defaultValue={70} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">严重</label>
                          <input type="number" defaultValue={85} className="w-full p-2 border rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">内存告警阈值 (%)</label>
                    <div className="flex items-center space-x-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">警告</label>
                          <input type="number" defaultValue={75} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">严重</label>
                          <input type="number" defaultValue={90} className="w-full p-2 border rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">存储告警阈值 (%)</label>
                    <div className="flex items-center space-x-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">警告</label>
                          <input type="number" defaultValue={70} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">严重</label>
                          <input type="number" defaultValue={85} className="w-full p-2 border rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">网络告警阈值 (%)</label>
                    <div className="flex items-center space-x-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">警告</label>
                          <input type="number" defaultValue={65} className="w-full p-2 border rounded-md" />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">严重</label>
                          <input type="number" defaultValue={80} className="w-full p-2 border rounded-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">告警通知设置</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email-notification" defaultChecked />
                      <label htmlFor="email-notification">邮件通知</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="sms-notification" defaultChecked />
                      <label htmlFor="sms-notification">短信通知</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="system-notification" defaultChecked />
                      <label htmlFor="system-notification">系统内通知</label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">取消</Button>
                  <Button>保存设置</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
