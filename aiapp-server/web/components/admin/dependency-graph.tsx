"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, RefreshCw, Download } from "lucide-react"
import { Input } from "@/components/ui/input"

interface DependencyGraphProps {
  id: string
}

// 模拟依赖数据
const dependencies = [
  {
    name: "OpenAI API",
    type: "external",
    version: "v1",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "250ms",
  },
  {
    name: "Redis Cache",
    type: "internal",
    version: "6.2.6",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "5ms",
  },
  {
    name: "PostgreSQL Database",
    type: "internal",
    version: "14.5",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "15ms",
  },
  {
    name: "User Service",
    type: "internal",
    version: "v2.3.1",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "45ms",
  },
  {
    name: "File Storage Service",
    type: "internal",
    version: "v1.8.0",
    status: "degraded",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "320ms",
    issue: "高延迟",
  },
  {
    name: "Authentication Service",
    type: "internal",
    version: "v3.0.2",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "30ms",
  },
  {
    name: "Analytics Service",
    type: "internal",
    version: "v1.2.5",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "60ms",
  },
  {
    name: "Email Service",
    type: "external",
    version: "v2",
    status: "healthy",
    lastChecked: "2023-10-15T14:30:00Z",
    responseTime: "180ms",
  },
]

export function DependencyGraph({ id }: DependencyGraphProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 获取状态标签样式
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "degraded":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "down":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // 获取类型标签样式
  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "internal":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "external":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input type="search" placeholder="搜索依赖..." className="pl-8" />
          </div>
        </div>

        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>

        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          导出依赖图
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>依赖关系图</CardTitle>
          <CardDescription>应用的所有内部和外部依赖关系可视化</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
            依赖关系图可视化区域
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
          <div className="text-sm font-medium">依赖列表</div>
          <div className="text-xs text-gray-500">共 {dependencies.length} 个依赖</div>
        </div>
        <div className="divide-y">
          {dependencies.map((dep, index) => (
            <div key={index} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{dep.name}</h4>
                  <Badge variant="outline" className={getTypeBadgeStyle(dep.type)}>
                    {dep.type === "internal" ? "内部" : "外部"}
                  </Badge>
                  <Badge variant="outline" className={getStatusBadgeStyle(dep.status)}>
                    {dep.status === "healthy" ? "正常" : dep.status === "degraded" ? "性能下降" : "不可用"}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">版本: {dep.version}</div>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div>最后检查: {formatDate(dep.lastChecked)}</div>
                <div>响应时间: {dep.responseTime}</div>
              </div>
              {dep.status === "degraded" && dep.issue && (
                <div className="mt-2 p-2 bg-yellow-50 text-yellow-700 text-sm rounded">问题: {dep.issue}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
