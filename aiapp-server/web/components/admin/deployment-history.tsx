"use client"

import { CheckCircle, XCircle, Clock, User, GitCommit, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface DeploymentHistoryProps {
  id: string
}

// 模拟部署历史数据
const deploymentData = [
  {
    id: "deploy-001",
    version: "v1.2.3",
    status: "success",
    timestamp: "2023-10-15T14:30:00Z",
    duration: "2m 15s",
    deployer: "admin@example.com",
    commit: "a1b2c3d",
    commitMessage: "添加新的聊天模型配置",
    environment: "production",
  },
  {
    id: "deploy-002",
    version: "v1.2.2",
    status: "success",
    timestamp: "2023-10-10T11:45:00Z",
    duration: "1m 58s",
    deployer: "admin@example.com",
    commit: "e4f5g6h",
    commitMessage: "优化响应速度，减少延迟",
    environment: "production",
  },
  {
    id: "deploy-003",
    version: "v1.2.1",
    status: "failed",
    timestamp: "2023-10-05T09:20:00Z",
    duration: "45s",
    deployer: "developer@example.com",
    commit: "i7j8k9l",
    commitMessage: "更新依赖包版本",
    environment: "production",
    error: "构建失败: 依赖冲突",
  },
  {
    id: "deploy-004",
    version: "v1.2.0",
    status: "success",
    timestamp: "2023-09-28T16:15:00Z",
    duration: "2m 32s",
    deployer: "developer@example.com",
    commit: "m1n2o3p",
    commitMessage: "新增文件上传功能",
    environment: "production",
  },
  {
    id: "deploy-005",
    version: "v1.1.9",
    status: "success",
    timestamp: "2023-09-20T10:05:00Z",
    duration: "2m 05s",
    deployer: "admin@example.com",
    commit: "q4r5s6t",
    commitMessage: "修复用户反馈的bug",
    environment: "production",
  },
]

export function DeploymentHistory({ id }: DeploymentHistoryProps) {
  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN")
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  // 获取环境标签样式
  const getEnvironmentBadgeStyle = (env: string) => {
    switch (env) {
      case "production":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "staging":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "development":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">部署历史</h3>
        <Button>部署新版本</Button>
      </div>

      <div className="space-y-4">
        {deploymentData.map((deployment) => (
          <div key={deployment.id} className="border rounded-md p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {getStatusIcon(deployment.status)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{deployment.version}</h4>
                    <Badge variant="outline" className={getEnvironmentBadgeStyle(deployment.environment)}>
                      {deployment.environment}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{deployment.commitMessage}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatDate(deployment.timestamp)}
                    </div>
                    <div className="flex items-center">
                      <User className="mr-1 h-3 w-3" />
                      {deployment.deployer}
                    </div>
                    <div className="flex items-center">
                      <GitCommit className="mr-1 h-3 w-3" />
                      {deployment.commit}
                    </div>
                    <div>耗时: {deployment.duration}</div>
                  </div>
                  {deployment.status === "failed" && (
                    <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">{deployment.error}</div>
                  )}
                </div>
              </div>
              <div>
                <Button variant="ghost" size="sm">
                  查看详情
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
