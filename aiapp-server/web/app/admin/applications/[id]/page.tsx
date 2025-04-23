"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Copy, Edit, Trash2, MessageSquare, GitBranch, FileText, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/admin/status-badge"
import { DeleteConfirmation } from "@/components/admin/delete-confirmation"
import { AppDetailTabs } from "@/components/admin/app-detail-tabs"
import { CodeBlock } from "@/components/code-block"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AlertDialogAction } from "@/components/ui/alert-dialog"

// 应用数据类型
interface ApplicationData {
  id: number;
  name: string;
  description: string;
  type: string;
  category: string;
  apiKey: string;
  createTime: string;
  updateTime: string;
  status: string;
  inputType: string;
  outputType: string;
  chatModel: string;
  openerContent: string;
  logo: string;
  formConfig: string;
  stats?: {
    totalRequests: number;
    averageResponseTime: number;
    successRate: number;
    errorRate: number;
    dailyActiveUsers: number;
    peakUsage?: {
      time: string;
      requests: number;
    };
  };
}

// 模拟数据作为后备
const mockAppData: ApplicationData = {
  id: 1,
  name: "智能客服助手",
  description: "基于大语言模型的智能客服系统，可以自动回答用户常见问题，提供24/7不间断服务。",
  type: "Chat",
  category: "客户服务",
  apiKey: "sk-12345678901234567890123456789012",
  createTime: "2023-10-01T10:00:00Z",
  updateTime: "2023-10-15T14:30:00Z",
  status: "active",
  inputType: "TEXT",
  outputType: "TEXT",
  chatModel: "gpt-4",
  openerContent: "您好，我是智能客服助手，有什么可以帮您解决的问题？",
  logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  formConfig: JSON.stringify(
    {
      welcomeMessage: "您好，我是智能客服助手，有什么可以帮您解决的问题？",
      maxTokens: 2048,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.6,
      stopSequences: ["\n\n"],
    },
    null,
    2,
  ),
  stats: {
    totalRequests: 12583,
    averageResponseTime: 1.2,
    successRate: 98.5,
    errorRate: 1.5,
    dailyActiveUsers: 342,
    peakUsage: {
      time: "2023-10-14T13:00:00Z",
      requests: 156,
    },
  },
}

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [appData, setAppData] = useState<ApplicationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingMockData, setIsUsingMockData] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [copied, setCopied] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // 获取应用数据
  useEffect(() => {
    const fetchAppData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 尝试从API获取数据
        const response = await fetch(`/api/dify-apps/${id}`)
        
        // 检查响应状态
        if (!response.ok) {
          throw new Error(`服务器返回错误: ${response.status} ${response.statusText}`)
        }
        
        // 检查内容类型
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("API返回了非JSON格式的数据，可能是服务器错误")
        }
        
        // 解析响应数据
        const data = await response.json()
        setAppData(data)
        setIsUsingMockData(false)
      } catch (error) {
        console.error("获取应用数据失败:", error)
        setError(`获取应用数据失败: ${error instanceof Error ? error.message : String(error)}`)
        
        // 使用模拟数据作为后备
        setAppData(mockAppData)
        setIsUsingMockData(true)
      } finally {
        setLoading(false)
      }
    }
    
    fetchAppData()
  }, [id])

  // 复制API Key
  const copyApiKey = () => {
    if (appData) {
      navigator.clipboard.writeText(appData.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 执行删除
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/dify-apps/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '删除应用失败')
      }
      
      // 删除成功，返回列表页
      router.push('/admin/applications')
    } catch (err) {
      console.error('删除应用失败:', err)
      setError(err instanceof Error ? err.message : '删除应用失败，请稍后重试')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
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

  // 获取应用图标
  const getAppIcon = () => {
    if (!appData) return <MessageSquare className="h-6 w-6 text-gray-600" />
    
    switch (appData.type) {
      case "Chat":
        return <MessageSquare className="h-6 w-6 text-blue-600" />
      case "Workflow":
        return <GitBranch className="h-6 w-6 text-orange-600" />
      case "Completion":
        return <FileText className="h-6 w-6 text-green-600" />
      default:
        return <MessageSquare className="h-6 w-6 text-gray-600" />
    }
  }

  // 获取JSON配置对象
  const getFormConfigObj = () => {
    if (!appData || !appData.formConfig) return {}
    
    try {
      return JSON.parse(appData.formConfig)
    } catch (error) {
      console.error("解析formConfig失败:", error)
      return {}
    }
  }
  
  // 如果正在加载，显示加载状态
  if (loading && !appData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">正在加载应用数据...</p>
      </div>
    )
  }
  
  // 如果没有数据且有错误，显示错误信息
  if (!appData && error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">应用详情</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Button asChild>
          <Link href="/admin/applications">返回应用列表</Link>
        </Button>
      </div>
    )
  }
  
  // 如果没有数据且没有错误（理论上不应该发生），显示通用错误信息
  if (!appData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">应用详情</h1>
        </div>
        
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>无法加载应用数据，请刷新页面或返回应用列表。</AlertDescription>
        </Alert>
        
        <Button asChild>
          <Link href="/admin/applications">返回应用列表</Link>
        </Button>
      </div>
    )
  }

  // 从应用数据中获取JSON配置
  const formConfigObj = getFormConfigObj()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/applications">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">应用详情</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/applications/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {isUsingMockData && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertTitle className="text-yellow-800">使用模拟数据</AlertTitle>
          <AlertDescription className="text-yellow-700">
            由于API连接问题，当前显示的是模拟数据。这些数据可能与实际应用不一致。
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 基础信息卡片 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                {getAppIcon()}
                <CardTitle>{appData.name}</CardTitle>
              </div>
              <StatusBadge type={appData.type} />
            </div>
            <CardDescription>{appData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">应用ID</p>
                  <p>{appData.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">分类</p>
                  <p>{appData.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">创建时间</p>
                  <p>{formatDate(appData.createTime)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">更新时间</p>
                  <p>{formatDate(appData.updateTime)}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">API Key</p>
                <div className="flex items-center space-x-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs flex-1 overflow-x-auto">{appData.apiKey}</code>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyApiKey}>
                    {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">输入类型</p>
                  <Badge variant="outline" className="mt-1">
                    {appData.inputType === "TEXT" ? "文本输入" : "文件输入"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">输出类型</p>
                  <Badge variant="outline" className="mt-1">
                    {appData.outputType === "TEXT" ? "文本输出" : "文件输出"}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">状态</p>
                <div className="flex items-center space-x-2 mt-1">
                  {appData.status !== "inactive" ? (
                    <>
                      <div className="h-2 w-2 rounded-full bg-green-600"></div>
                      <span className="text-green-600 font-medium">运行中</span>
                    </>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      <span className="text-gray-500">已停用</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 技术配置卡片 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>技术配置</CardTitle>
            <CardDescription>应用的技术参数和配置信息</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="config">基本配置</TabsTrigger>
                <TabsTrigger value="model">模型设置</TabsTrigger>
                <TabsTrigger value="advanced">高级参数</TabsTrigger>
              </TabsList>
              <TabsContent value="config" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">应用类型</p>
                    <p className="mt-1">{appData.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">聊天模型</p>
                    <p className="mt-1">{appData.chatModel}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">开场白</p>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{appData.openerContent}</p>
                </div>
              </TabsContent>
              <TabsContent value="model" className="pt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">最大Token数</p>
                      <p className="mt-1">{formConfigObj.maxTokens || 2048}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">温度</p>
                      <p className="mt-1">{formConfigObj.temperature || 0.7}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Top P</p>
                      <p className="mt-1">{formConfigObj.topP || 0.9}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">频率惩罚</p>
                      <p className="mt-1">{formConfigObj.frequencyPenalty || 0.0}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">存在惩罚</p>
                      <p className="mt-1">{formConfigObj.presencePenalty || 0.6}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">表单配置 (JSON)</p>
                    <div className="mt-2 bg-gray-50 rounded-md overflow-hidden">
                      <CodeBlock code={appData.formConfig} language="json" />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 使用统计卡片 */}
        {appData.stats && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>使用统计</CardTitle>
              <CardDescription>应用使用情况统计和性能指标</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">总请求数</p>
                  <p className="text-3xl font-bold">{appData.stats.totalRequests.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">平均响应时间</p>
                  <p className="text-3xl font-bold">{appData.stats.averageResponseTime}s</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">成功率</p>
                  <p className="text-3xl font-bold text-green-600">{appData.stats.successRate}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">日活跃用户</p>
                  <p className="text-3xl font-bold">{appData.stats.dailyActiveUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 应用详情标签页 */}
      <Card>
        <CardHeader>
          <CardTitle>应用监控与分析</CardTitle>
          <CardDescription>查看应用的运行状态、使用情况和性能指标</CardDescription>
        </CardHeader>
        <CardContent>
          <AppDetailTabs id={id} />
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <DeleteConfirmation
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="删除应用"
        description="确定要删除这个应用吗？此操作不可逆，删除后该应用将无法访问。"
        isLoading={isDeleting}
        itemName={appData?.name}
      />

      {/* 错误提示 */}
      {error && (
        <AlertDialog open={!!error} onOpenChange={() => setError(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>操作失败</AlertDialogTitle>
              <AlertDialogDescription>{error}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction>确定</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
