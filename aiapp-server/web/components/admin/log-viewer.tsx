"use client"

import { useState } from "react"
import { Search, Download, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface LogViewerProps {
  id: string
}

// 模拟日志数据
const logData = [
  {
    id: "log-001",
    timestamp: "2023-10-15T14:32:45Z",
    level: "INFO",
    message: "应用启动成功，版本: v1.2.3",
    source: "system",
  },
  {
    id: "log-002",
    timestamp: "2023-10-15T14:35:12Z",
    level: "INFO",
    message: "收到用户请求: /api/chat, 用户ID: user-123",
    source: "api",
  },
  {
    id: "log-003",
    timestamp: "2023-10-15T14:35:13Z",
    level: "INFO",
    message: "调用模型: gpt-4, 请求ID: req-456",
    source: "model",
  },
  {
    id: "log-004",
    timestamp: "2023-10-15T14:35:18Z",
    level: "INFO",
    message: "模型响应成功，耗时: 4.8s",
    source: "model",
  },
  {
    id: "log-005",
    timestamp: "2023-10-15T14:40:22Z",
    level: "WARN",
    message: "请求速率接近限制，当前: 95/100 每分钟",
    source: "system",
  },
  {
    id: "log-006",
    timestamp: "2023-10-15T14:45:33Z",
    level: "ERROR",
    message: "模型调用失败: 连接超时，请求ID: req-789",
    source: "model",
  },
  {
    id: "log-007",
    timestamp: "2023-10-15T14:45:35Z",
    level: "INFO",
    message: "自动重试请求: req-789, 尝试次数: 1/3",
    source: "system",
  },
  {
    id: "log-008",
    timestamp: "2023-10-15T14:45:40Z",
    level: "INFO",
    message: "模型响应成功，耗时: 5.2s",
    source: "model",
  },
  {
    id: "log-009",
    timestamp: "2023-10-15T15:00:00Z",
    level: "INFO",
    message: "执行定时任务: 清理过期会话",
    source: "system",
  },
  {
    id: "log-010",
    timestamp: "2023-10-15T15:01:12Z",
    level: "INFO",
    message: "清理完成，移除了 15 个过期会话",
    source: "system",
  },
]

export function LogViewer({ id }: LogViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [logLevel, setLogLevel] = useState("")
  const [logSource, setLogSource] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 获取日志级别的样式
  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case "INFO":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "WARN":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "ERROR":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "DEBUG":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  // 过滤日志
  const filteredLogs = logData.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = logLevel ? log.level === logLevel : true
    const matchesSource = logSource ? log.source === logSource : true
    return matchesSearch && matchesLevel && matchesSource
  })

  // 刷新日志
  const refreshLogs = () => {
    setIsLoading(true)
    // 模拟API调用
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  // 导出日志
  const exportLogs = () => {
    const logText = filteredLogs
      .map((log) => `[${formatDate(log.timestamp)}] [${log.level}] [${log.source}] ${log.message}`)
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `app-${id}-logs-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="搜索日志内容..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Select value={logLevel} onValueChange={setLogLevel}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="日志级别" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部级别</SelectItem>
            <SelectItem value="INFO">信息</SelectItem>
            <SelectItem value="WARN">警告</SelectItem>
            <SelectItem value="ERROR">错误</SelectItem>
            <SelectItem value="DEBUG">调试</SelectItem>
          </SelectContent>
        </Select>

        <Select value={logSource} onValueChange={setLogSource}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="日志来源" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部来源</SelectItem>
            <SelectItem value="system">系统</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="model">模型</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="icon" onClick={refreshLogs} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        <Button variant="outline" onClick={exportLogs}>
          <Download className="mr-2 h-4 w-4" />
          导出日志
        </Button>
      </div>

      <div className="border rounded-md">
        <div className="bg-gray-50 p-3 border-b flex justify-between items-center">
          <div className="text-sm font-medium">应用日志</div>
          <div className="text-xs text-gray-500">显示最近 {filteredLogs.length} 条日志</div>
        </div>
        <div className="divide-y">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-xs text-gray-500">{formatDate(log.timestamp)}</div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getLevelBadgeStyle(log.level)}>
                      {log.level}
                    </Badge>
                    <Badge variant="outline">{log.source}</Badge>
                  </div>
                </div>
                <div className="text-sm font-mono">{log.message}</div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">没有找到匹配的日志记录</div>
          )}
        </div>
      </div>
    </div>
  )
}
