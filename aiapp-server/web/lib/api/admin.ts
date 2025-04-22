import type {
  AppListParams,
  AppListResponse,
  DifyApp,
  CreateAppRequest,
  UpdateAppRequest,
  AppStats,
  LogEntry,
  Dependency,
  Deployment,
} from "@/types/admin"

// API基础URL
const API_BASE_URL = "/api/admin"

// 获取应用列表
export async function getAppList(params: AppListParams): Promise<AppListResponse> {
  const queryParams = new URLSearchParams()

  if (params.name) queryParams.append("name", params.name)
  if (params.type) queryParams.append("type", params.type)
  if (params.startDate) queryParams.append("startDate", params.startDate)
  if (params.endDate) queryParams.append("endDate", params.endDate)
  if (params.page) queryParams.append("page", params.page.toString())
  if (params.pageSize) queryParams.append("pageSize", params.pageSize.toString())
  if (params.sortBy) queryParams.append("sortBy", params.sortBy)
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder)

  const response = await fetch(`${API_BASE_URL}/applications?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`获取应用列表失败: ${response.statusText}`)
  }

  return await response.json()
}

// 获取应用详情
export async function getAppDetail(id: number): Promise<DifyApp> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${id}`)

    if (!response.ok) {
      throw new Error(`获取应用详情失败: ${response.statusText}`)
    }

    // 检查响应类型
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("API返回了非JSON格式的数据")
    }

    return await response.json()
  } catch (error) {
    console.error("API请求失败，使用模拟数据:", error)
    return getMockAppDetail(id)
  }
}

// 创建应用
export async function createApp(data: CreateAppRequest): Promise<DifyApp> {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`创建应用失败: ${response.statusText}`)
  }

  return await response.json()
}

// 更新应用
export async function updateApp(data: UpdateAppRequest): Promise<DifyApp> {
  const response = await fetch(`${API_BASE_URL}/applications/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error(`更新应用失败: ${response.statusText}`)
  }

  return await response.json()
}

// 删除应用
export async function deleteApp(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error(`删除应用失败: ${response.statusText}`)
  }
}

// 生成新的API Key
export async function generateApiKey(): Promise<{ apiKey: string }> {
  // 模拟API调用，随机生成API Key
  // 在实际项目中应替换为真实的API调用
  await new Promise((resolve) => setTimeout(resolve, 500))
  
  const randomKey = Array.from({ length: 32 }, () => 
    "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36))
  ).join("")
  
  return { apiKey: `sk-${randomKey}` }
}

// 模拟API函数，用于在实际API不可用时提供数据
export async function getMockAppDetail(id: number): Promise<DifyApp> {
  // 模拟延迟
  await new Promise((resolve) => setTimeout(resolve, 500))

  return {
    id,
    name: `模拟应用 ${id}`,
    description: "这是一个模拟应用，用于在API不可用时提供数据",
    category: "other",
    type: "Chat",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inputType: "TEXT",
    outputType: "TEXT",
    chatModel: "gpt-4",
    openerContent: "您好，我是AI助手，有什么可以帮您解决的问题？",
    formConfig: JSON.stringify(
      {
        welcomeMessage: "您好，我是AI助手，有什么可以帮您解决的问题？",
        maxTokens: 2048,
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.6,
        stopSequences: ["\n\n"],
        streamResponse: false,
      },
      null,
      2,
    ),
    apiKey: "mock-api-key-" + id,
    usage: {
      requests: 0,
      tokens: 0,
    },
  }
} 