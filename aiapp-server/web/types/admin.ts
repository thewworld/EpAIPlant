// 应用列表查询参数
export interface AppListParams {
  name?: string
  type?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 应用列表响应
export interface AppListResponse {
  apps: DifyApp[]
  total: number
}

// 应用详情
export interface DifyApp {
  id: number
  name: string
  description: string
  category: string
  type: string
  status: string
  createdAt: string
  updatedAt: string
  inputType: string
  outputType: string
  chatModel: string
  openerContent: string
  formConfig: string
  apiKey: string
  usage?: {
    requests: number
    tokens: number
  }
  logo?: string
}

// 创建应用请求
export interface CreateAppRequest {
  name: string
  description: string
  category: string
  type: string
  inputType: string
  outputType: string
  chatModel: string
  openerContent: string
  formConfig: string
  apiKey: string
  logo?: string
  streamResponse?: boolean
}

// 更新应用请求
export interface UpdateAppRequest {
  id: number
  name?: string
  description?: string
  category?: string
  type?: string
  inputType?: string
  outputType?: string
  chatModel?: string
  openerContent?: string
  formConfig?: string
  apiKey?: string
  logo?: string
  streamResponse?: boolean
}

// 应用统计数据
export interface AppStats {
  dailyRequests: { date: string; count: number }[]
  totalRequests: number
  dailyTokens: { date: string; count: number }[]
  totalTokens: number
  averageResponseTime: number
}

// 日志条目
export interface LogEntry {
  id: string
  timestamp: string
  level: string
  source: string
  message: string
  details?: string
}

// 依赖
export interface Dependency {
  id: string
  name: string
  version: string
  type: string
  isRequired: boolean
}

// 部署记录
export interface Deployment {
  id: string
  version: string
  status: string
  deployedAt: string
  deployedBy: string
  changes: string[]
} 