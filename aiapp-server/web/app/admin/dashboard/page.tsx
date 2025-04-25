"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, AppWindow, CpuIcon, Database, Users } from "lucide-react"
import { AppUsageTrendChart, AppTypeDistributionChart } from "@/components/admin/dashboard-charts"

// 创建固定的活动时间，避免hydration错误
const activityTimes = [
  "2025/4/22 14:30:00",
  "2025/4/23 09:15:22",
  "2025/4/24 16:45:38",
  "2025/4/25 11:20:45",
]

// 活动数据
const activityData = [
  { type: "应用创建", description: "管理员创建了新应用「智能助手」", time: activityTimes[0] },
  { type: "配置更新", description: "管理员更新了「数据分析」应用的API配置", time: activityTimes[1] },
  { type: "应用创建", description: "管理员创建了新应用「文档摘要器」", time: activityTimes[2] },
  { type: "配置更新", description: "管理员更新了「智能客服」应用的模型配置", time: activityTimes[3] },
]

export default function DashboardPage() {
  // 客户端状态
  const [mounted, setMounted] = useState(false)
  
  // 仅在客户端渲染后设置为已挂载
  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground mt-2">易智能平台运维管理系统概览</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="analytics">分析</TabsTrigger>
          <TabsTrigger value="reports">报告</TabsTrigger>
          <TabsTrigger value="notifications">通知</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总应用数</CardTitle>
                <AppWindow className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground">较上月 +12%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,350</div>
                <p className="text-xs text-muted-foreground">较上月 +18.1%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API调用量</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2M</div>
                <p className="text-xs text-muted-foreground">较上月 +24.5%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">资源使用率</CardTitle>
                <CpuIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68%</div>
                <p className="text-xs text-muted-foreground">较上月 -2.5%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>应用使用趋势</CardTitle>
                <CardDescription>过去30天的应用调用量趋势</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {mounted ? <AppUsageTrendChart /> : (
                  <div className="h-full w-full rounded-md border border-dashed border-gray-300 flex items-center justify-center">
                    <p className="text-muted-foreground">图表加载中...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>应用类型分布</CardTitle>
                <CardDescription>按应用类型统计的分布情况</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {mounted ? <AppTypeDistributionChart /> : (
                  <div className="h-full w-full rounded-md border border-dashed border-gray-300 flex items-center justify-center">
                    <p className="text-muted-foreground">图表加载中...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>系统状态</CardTitle>
                <CardDescription>关键系统组件的运行状态</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span>数据库</span>
                    </div>
                    <span className="text-sm font-medium text-green-500">正常</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CpuIcon className="h-4 w-4 text-muted-foreground" />
                      <span>API服务</span>
                    </div>
                    <span className="text-sm font-medium text-green-500">正常</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span>任务队列</span>
                    </div>
                    <span className="text-sm font-medium text-green-500">正常</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>认证服务</span>
                    </div>
                    <span className="text-sm font-medium text-green-500">正常</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
                <CardDescription>系统最近的操作记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityData.map((activity, i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{activity.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="h-[400px] flex items-center justify-center border rounded-md">
          <p className="text-muted-foreground">分析数据加载中...</p>
        </TabsContent>

        <TabsContent value="reports" className="h-[400px] flex items-center justify-center border rounded-md">
          <p className="text-muted-foreground">报告数据加载中...</p>
        </TabsContent>

        <TabsContent value="notifications" className="h-[400px] flex items-center justify-center border rounded-md">
          <p className="text-muted-foreground">通知数据加载中...</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
