import { AppType } from "@/types/app-config"

export interface DifyApiParams {
  query: string
  inputs?: Record<string, any>
  files?: Array<{
    type: string
    transfer_method: string
    url: string
    upload_file_id: string
  }>
  user?: string
  conversation_id?: string
  response_mode?: string
  auto_generate_name?: boolean
}

export interface DifyApiConfig {
  appId: string
  appType: AppType
  chatModel: string
}

export interface DifyApiResponse {
  content: string
  messageId?: string
}

export async function callDifyApi(
  params: DifyApiParams,
  config: DifyApiConfig,
  onStreamData?: (content: string) => void,
  onStreamEnd?: () => void
): Promise<DifyApiResponse> {
  // 根据应用类型选择API端点
  let apiEndpoint = ""
  const baseUrl = "http://localhost:8087/api/dify"

  switch (config.appType) {
    case AppType.CHAT:
      apiEndpoint = `${baseUrl}/chat-messages?appId=${config.appId}`
      break
    case AppType.WORKFLOW:
      apiEndpoint = `${baseUrl}/workflow/${config.chatModel === "sse" ? "run/stream" : "run/block"}?appId=${config.appId}`
      break
    case AppType.COMPLETION:
      apiEndpoint = `${baseUrl}/completion-messages?appId=${config.appId}`
      break
    default:
      apiEndpoint = `${baseUrl}/chat-messages?appId=${config.appId}`
  }

  const requestBody = {
    ...params,
    response_mode: config.chatModel === "sse" ? "streaming" : "blocking",
  }

  if (config.chatModel === "sse") {
    return handleSseResponse(apiEndpoint, requestBody, config.appType, onStreamData, onStreamEnd)
  } else {
    return handleBlockingResponse(apiEndpoint, requestBody, config.appType)
  }
}

async function handleSseResponse(
  apiEndpoint: string,
  requestBody: any,
  appType: AppType,
  onStreamData?: (content: string) => void,
  onStreamEnd?: () => void
): Promise<DifyApiResponse> {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "text/event-stream",
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error("无法读取响应流")

  let accumulatedContent = ""
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.trim() === "" || !line.startsWith("data:")) continue
        try {
          const jsonStr = line.substring(5).trim()
          if (!jsonStr) continue
          const data = JSON.parse(jsonStr)

          if (appType === AppType.WORKFLOW) {
            if (data.error) {
              throw new Error(data.error)
            }
            if (data.event === "text_chunk" && data.data?.text) {
              accumulatedContent += data.data.text
              onStreamData?.(accumulatedContent)
            } else if (data.event === "workflow_finished") {
              onStreamEnd?.()
              break
            }
          } else {
            if ((data.event === "message" || data.event === "agent_message") && data.answer) {
              accumulatedContent += data.answer
              onStreamData?.(accumulatedContent)
            }

            if (data.event === "message_end") {
              onStreamEnd?.()
            }
          }
        } catch (e) {
          console.error("解析SSE数据失败:", e)
        }
      }
    }
  } finally {
    reader.releaseLock()
    onStreamEnd?.()
  }

  return { content: accumulatedContent }
}

async function handleBlockingResponse(
  apiEndpoint: string,
  requestBody: any,
  appType: AppType
): Promise<DifyApiResponse> {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`)
  }

  const data = await response.json()
  
  if (appType === AppType.WORKFLOW) {
    if (data.error) {
      throw new Error(data.error)
    }
    return {
      content: data.answer || data.text || "工作流执行完成",
      messageId: data.message_id,
    }
  } else {
    return {
      content: data.answer || data.text || "处理完成",
      messageId: data.message_id,
    }
  }
} 