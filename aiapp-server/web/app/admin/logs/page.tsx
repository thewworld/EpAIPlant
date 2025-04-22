"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DownloadIcon, FilterIcon, RefreshCwIcon, SearchIcon, EyeIcon, CalendarIcon } from "lucide-react"

// 模拟日志数据
const mockSystemLogs = [
  {
    id: "log1",
    timestamp: "2023-04-11T14:32:10",
    level: "ERROR",
    source: "应用服务器",
    message: "数据库连接失败: Connection refused",
    details:
      "java.sql.SQLException: Connection refused (Connection refused) at org.postgresql.core.v3.ConnectionFactoryImpl.openConnectionImpl",
  },
  {
    id: "log2",
    timestamp: "2023-04-11T14:30:05",
    level: "WARN",
    source: "应用服务器",
    message: "API请求超时: /api/data/sync",
    details: "Request timed out after 30000ms",
  },
  {
    id: "log3",
    timestamp: "2023-04-11T14:28:22",
    level: "INFO",
    source: "应用服务器",
    message: "用户登录成功: admin",
    details: "User admin logged in from 192.168.1.100",
  },
  {
    id: "log4",
    timestamp: "2023-04-11T14:25:18",
    level: "INFO",
    source: "应用服务器",
    message: "系统启动完成",
    details: "System started in 12.5 seconds",
  },
  {
    id: "log5",
    timestamp: "2023-04-11T14:20:45",
    level: "ERROR",
    source: "应用服务器",
    message: "文件上传失败: 权限不足",
    details: "java.io.IOException: Permission denied",
  },
]

const mockAccessLogs = [
  {
    id: "access1",
    timestamp: "2023-04-11T14:35:22",
    ip: "192.168.1.100",
    method: "GET",
    path: "/api/users",
    status: 200,
    responseTime: 120,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "access2",
    timestamp: "2023-04-11T14:34:15",
    ip: "192.168.1.101",
    method: "POST",
    path: "/api/login",
    status: 401,
    responseTime: 95,
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_4 like Mac OS X)",
  },
  {
    id: "access3",
    timestamp: "2023-04-11T14:33:50",
    ip: "192.168.1.102",
    method: "GET",
    path: "/api/data",
    status: 200,
    responseTime: 150,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
  },
  {
    id: "access4",
    timestamp: "2023-04-11T14:32:30",
    ip: "192.168.1.103",
    method: "PUT",
    path: "/api/users/5",
    status: 403,
    responseTime: 85,
    userAgent: "PostmanRuntime/7.29.0",
  },
  {
    id: "access5",
    timestamp: "2023-04-11T14:31:10",
    ip: "192.168.1.104",
    method: "DELETE",
    path: "/api/posts/10",
    status: 204,
    responseTime: 110,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
]

const mockAuditLogs = [
  {
    id: "audit1",
    timestamp: "2023-04-11T14:30:22",
    user: "admin",
    action: "UPDATE",
    resource: "用户配置",
    details: "修改了密码策略: 最小长度从8改为12",
  },
  {
    id: "audit2",
    timestamp: "2023-04-11T14:28:15",
    user: "operator",
    action: "CREATE",
    resource: "应用",
    details: "创建了新应用: 智能客服助手",
  },
  {
    id: "audit3",
    timestamp: "2023-04-11T14:25:50",
    user: "admin",
    action: "DELETE",
    resource: "用户",
    details: "删除了用户: test_user",
  },
  {
    id: "audit4",
    timestamp: "2023-04-11T14:20:30",
    user: "system",
    action: "UPDATE",
    resource: "系统配置",
    details: "更新了系统配置: 启用了双因素认证",
  },
  {
    id: "audit5",
    timestamp: "2023-04-11T14:15:10",
    user: "operator",
    action: "READ",
    resource: "敏感数据",
    details: "查看了用户列表",
  },
]

export default function LogsPage() {
  const [activeTab, setActiveTab] = useState("system")
  const [selectedLog, setSelectedLog] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")

  // 格式化日期时间
  const formatDateTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr)
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  // 根据日志级别返回对应的Badge样式
  const getLevelBadge = (level) => {
    const styles = {
      ERROR: "bg-red-100 text-red-800 hover:bg-red-200",
      WARN: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      INFO: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      DEBUG: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    }
    return styles[level] || "bg-gray-100 text-gray-800"
  }

  // 根据HTTP状态码返回对应的Badge样式
  const getStatusBadge = (status) => {
    if (status >= 200 && status < 300) {
      return "bg-green-100 text-green-800 hover:bg-green-200"
    } else if (status >= 300 && status < 400) {
      return "bg-blue-100 text-blue-800 hover:bg-blue-200"
    } else if (status >= 400 && status < 500) {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    } else {
      return "bg-red-100 text-red-800 hover:bg-red-200"
    }
  }

  // 根据操作类型返回对应的Badge样式
  const getActionBadge = (action) => {
    const styles = {
      CREATE: "bg-green-100 text-green-800 hover:bg-green-200",
      READ: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      UPDATE: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      DELETE: "bg-red-100 text-red-800 hover:bg-red-200",
    }
    return styles[action] || "bg-gray-100 text-gray-800"
  }

  // 过滤系统日志
  const filteredSystemLogs = mockSystemLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLevel = levelFilter === "all" || log.level === levelFilter

    return matchesSearch && matchesLevel
  })

  // 过滤访问日志
  const filteredAccessLogs = mockAccessLogs.filter((log) => {
    return (
      searchQuery === "" ||
      log.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userAgent.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // 过滤审计日志
  const filteredAuditLogs = mockAuditLogs.filter((log) => {
    return (
      searchQuery === "" ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">日志分析</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <CalendarIcon className="h-4 w-4 mr-2" />
            选择日期范围
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <DownloadIcon className="h-4 w-4 mr-2" />
            导出日志
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索日志..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === "system" && (
          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择日志级别" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有级别</SelectItem>
              <SelectItem value="ERROR">错误</SelectItem>
              <SelectItem value="WARN">警告</SelectItem>
              <SelectItem value="INFO">信息</SelectItem>
              <SelectItem value="DEBUG">调试</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" size="icon">
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">系统日志</TabsTrigger>
          <TabsTrigger value="access">访问日志</TabsTrigger>
          <TabsTrigger value="audit">审计日志</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>系统日志</CardTitle>
              <CardDescription>显示系统运行过程中产生的日志信息，包括错误、警告和信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>级别</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead className="w-[40%]">消息</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSystemLogs.length > 0 ? (
                    filteredSystemLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                        <TableCell>
                          <Badge className={getLevelBadge(log.level)}>{log.level}</Badge>
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell className="font-mono text-sm truncate max-w-[400px]">{log.message}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        没有找到匹配的日志记录
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>访问日志</CardTitle>
              <CardDescription>记录API和页面访问情况，包括请求方法、路径、状态码和响应时间</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>IP地址</TableHead>
                    <TableHead>方法</TableHead>
                    <TableHead>路径</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>响应时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccessLogs.length > 0 ? (
                    filteredAccessLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                        <TableCell>{log.ip}</TableCell>
                        <TableCell>{log.method}</TableCell>
                        <TableCell className="font-mono text-sm truncate max-w-[200px]">{log.path}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(log.status)}>{log.status}</Badge>
                        </TableCell>
                        <TableCell>{log.responseTime}ms</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        没有找到匹配的访问日志记录
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>审计日志</CardTitle>
              <CardDescription>记录用户和系统的关键操作，用于安全审计和合规管理</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>资源</TableHead>
                    <TableHead className="w-[40%]">详情</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuditLogs.length > 0 ? (
                    filteredAuditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDateTime(log.timestamp)}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          <Badge className={getActionBadge(log.action)}>{log.action}</Badge>
                        </TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell className="truncate max-w-[400px]">{log.details}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        没有找到匹配的审计日志记录
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {selectedLog && (
        <Card>
          <CardHeader>
            <CardTitle>日志详情</CardTitle>
            <CardDescription>查看完整的日志信息和上下文</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md font-mono text-sm whitespace-pre-wrap">
              {JSON.stringify(selectedLog, null, 2)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
