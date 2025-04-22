"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  PlusCircle,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  Copy,
  Eye,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DateRangePicker } from "@/components/date-range-picker"
import { StatusBadge } from "@/components/admin/status-badge"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"

// 应用类型定义
interface Application {
  id: number;
  name: string;
  type: string;
  apiKey: string;
  createTime?: string;
  updateTime?: string;
  status?: string;
  description?: string;
  category?: string;
}

// 模拟数据作为后备
const mockApplications = [
  {
    id: 1,
    name: "智能客服助手",
    type: "Chat",
    apiKey: "sk-12345678901234567890123456789012",
    createTime: "2023-10-01T10:00:00Z",
    updateTime: "2023-10-15T14:30:00Z",
    status: "active",
  },
  {
    id: 2,
    name: "文档摘要生成器",
    type: "Completion",
    apiKey: "sk-abcdefghijklmnopqrstuvwxyz123456",
    createTime: "2023-09-15T08:20:00Z",
    updateTime: "2023-10-10T11:45:00Z",
    status: "active",
  },
  {
    id: 3,
    name: "数据分析流程",
    type: "Workflow",
    apiKey: "sk-workflow9876543210abcdefghijklmno",
    createTime: "2023-10-05T15:10:00Z",
    updateTime: "2023-10-05T15:10:00Z",
    status: "active",
  },
  {
    id: 4,
    name: "内容审核系统",
    type: "Chat",
    apiKey: "sk-content98765432109876543210abcdef",
    createTime: "2023-09-20T09:30:00Z",
    updateTime: "2023-10-12T16:20:00Z",
    status: "active",
  },
  {
    id: 5,
    name: "代码生成助手",
    type: "Completion",
    apiKey: "sk-codegenabcdefghijklmnopqrstuvwxy",
    createTime: "2023-10-08T13:45:00Z",
    updateTime: "2023-10-14T10:15:00Z",
    status: "active",
  },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined })
  const [selectedApps, setSelectedApps] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [appToDelete, setAppToDelete] = useState<number | null>(null)
  
  // 获取应用列表
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        const response = await fetch('/api/dify-apps');
        
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('获取应用列表失败:', error);
        setApiError(`获取应用列表失败: ${error instanceof Error ? error.message : String(error)}`);
        // 使用模拟数据作为后备
        setApplications(mockApplications);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // 排序处理
  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // 过滤和排序应用列表
  const filteredAndSortedApps = applications
    .filter((app) => {
      // 搜索词过滤
      const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase())

      // 类型过滤
      const matchesType = selectedType ? app.type === selectedType : true

      // 日期范围过滤
      let matchesDateRange = true
      if (dateRange.from && dateRange.to && app.createTime) {
        const appDate = new Date(app.createTime)
        const fromDate = new Date(dateRange.from)
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999) // 设置为当天结束时间
        matchesDateRange = appDate >= fromDate && appDate <= toDate
      }

      return matchesSearch && matchesType && matchesDateRange
    })
    .sort((a, b) => {
      if (!sortConfig) return 0

      const { key, direction } = sortConfig

      if (key === "id") {
        return direction === "asc" ? a.id - b.id : b.id - a.id
      }

      if ((key === "createTime" || key === "updateTime") && a[key as keyof typeof a] && b[key as keyof typeof b]) {
        const dateA = new Date(a[key as keyof typeof a] as string).getTime()
        const dateB = new Date(b[key as keyof typeof b] as string).getTime()
        return direction === "asc" ? dateA - dateB : dateB - dateA
      }

      return 0
    })

  // 处理全选
  const handleSelectAll = () => {
    if (selectedApps.length === filteredAndSortedApps.length) {
      setSelectedApps([])
    } else {
      setSelectedApps(filteredAndSortedApps.map((app) => app.id))
    }
  }

  // 处理单个选择
  const handleSelectApp = (id: number) => {
    if (selectedApps.includes(id)) {
      setSelectedApps(selectedApps.filter((appId) => appId !== id))
    } else {
      setSelectedApps([...selectedApps, id])
    }
  }

  // 导出选中的应用
  const handleExport = () => {
    const selectedAppData = applications
      .filter((app) => selectedApps.includes(app.id))
      .map((app) => ({
        ID: app.id,
        名称: app.name,
        类型: app.type,
        API密钥: app.apiKey,
        创建时间: new Date(app.createTime).toLocaleString("zh-CN"),
      }))

    // 创建CSV内容
    const headers = Object.keys(selectedAppData[0]).join(",")
    const rows = selectedAppData.map((app) => Object.values(app).join(","))
    const csvContent = [headers, ...rows].join("\n")

    // 创建下载链接
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `应用列表_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 处理删除确认
  const handleDeleteConfirm = (id: number) => {
    setAppToDelete(id)
    setShowDeleteConfirm(true)
  }

  // 执行删除
  const executeDelete = async () => {
    if (!appToDelete) return;
    
    try {
      const response = await fetch(`/api/dify-apps/${appToDelete}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`删除失败: ${response.status} ${response.statusText}`);
      }
      
      // 更新 UI，从列表中移除已删除的应用
      setApplications(applications.filter(app => app.id !== appToDelete));
      
      setShowDeleteConfirm(false);
      setAppToDelete(null);
    } catch (error) {
      console.error('删除应用失败:', error);
      alert(`删除应用失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">正在加载应用列表...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">应用管理</h1>
        <Link href="/admin/applications/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            创建应用
          </Button>
        </Link>
      </div>

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">错误：</strong>
          <span className="block sm:inline">{apiError}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>应用列表</CardTitle>
          <CardDescription>管理所有Dify应用，支持多条件查询和批量操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 过滤和搜索区域 */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="搜索应用名称..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="应用类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="Chat">对话式应用</SelectItem>
                  <SelectItem value="Workflow">工作流应用</SelectItem>
                  <SelectItem value="Completion">文本生成应用</SelectItem>
                </SelectContent>
              </Select>

              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />

              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* 批量操作区域 */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={selectedApps.length > 0 && selectedApps.length === filteredAndSortedApps.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="selectAll" className="text-sm">
                  {selectedApps.length > 0 ? `已选择 ${selectedApps.length} 项` : "全选"}
                </label>
              </div>

              <Button variant="outline" size="sm" onClick={handleExport} disabled={selectedApps.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                导出API Key
              </Button>
            </div>

            {/* 表格区域 */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("id")}>
                      <div className="flex items-center">
                        ID
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>应用名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createTime")}>
                      <div className="flex items-center">
                        创建时间
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("updateTime")}>
                      <div className="flex items-center">
                        更新时间
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-[100px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedApps.length > 0 ? (
                    filteredAndSortedApps.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedApps.includes(app.id)}
                            onCheckedChange={() => handleSelectApp(app.id)}
                          />
                        </TableCell>
                        <TableCell>{app.id}</TableCell>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>
                          <StatusBadge type={app.type} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {app.apiKey.substring(0, 10)}...
                            </code>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(app.createTime)}</TableCell>
                        <TableCell>{formatDate(app.updateTime)}</TableCell>
                        <TableCell>
                          <Badge className={app.status !== "inactive" ? "bg-green-500 hover:bg-green-600 text-white" : ""} variant={app.status !== "inactive" ? "default" : "secondary"}>
                            {app.status !== "inactive" ? "运行中" : "已停用"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/applications/${app.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>查看</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/applications/${app.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>编辑</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteConfirm(app.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>删除</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                        没有找到匹配的应用
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={executeDelete}
        title="删除应用"
        description="您确定要删除这个应用吗？此操作无法撤销，应用的所有数据将被永久删除。"
      />
    </div>
  )
}
