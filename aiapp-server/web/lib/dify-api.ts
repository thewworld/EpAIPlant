import { AppType } from "@/types/app-config"
import { API_BASE_URL } from "./constants"

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
  error?: string
}

export async function callDifyApi(
  params: DifyApiParams,
  config: DifyApiConfig,
  onStreamData?: (content: string) => void,
  onStreamEnd?: () => void
): Promise<DifyApiResponse> {
  // 根据应用类型选择API端点
  let apiEndpoint = ""

  switch (config.appType) {
    case AppType.CHAT:
      apiEndpoint = `${API_BASE_URL}/api/dify/chat-messages?appId=${config.appId}`
      break
    case AppType.WORKFLOW:
      apiEndpoint = `${API_BASE_URL}/api/dify/workflow/${config.chatModel === "sse" ? "run/stream" : "run/block"}?appId=${config.appId}`
      break
    case AppType.COMPLETION:
      apiEndpoint = `${API_BASE_URL}/api/dify/completion-messages?appId=${config.appId}`
      break
    default:
      apiEndpoint = `${API_BASE_URL}/api/dify/chat-messages?appId=${config.appId}`
  }

  const requestBody = {
    ...params,
    response_mode: config.chatModel === "sse" ? "streaming" : "blocking",
  }

  try {
    if (config.chatModel === "sse") {
      return await handleSseResponse(apiEndpoint, requestBody, config.appType, onStreamData, onStreamEnd)
    } else {
      return await handleBlockingResponse(apiEndpoint, requestBody, config.appType)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "处理请求时发生未知错误"
    console.error("API 调用失败:", errorMessage)
    // 调用流式数据处理函数，显示错误消息
    if (onStreamData) {
      onStreamData(`抱歉，处理您的请求时出错: ${errorMessage}`)
    }
    if (onStreamEnd) {
      onStreamEnd()
    }
    // 返回错误响应
    return {
      content: `抱歉，处理您的请求时出错: ${errorMessage}`,
      error: errorMessage
    }
  }
}

async function handleSseResponse(
  apiEndpoint: string,
  requestBody: any,
  appType: AppType,
  onStreamData?: (content: string) => void,
  onStreamEnd?: () => void
): Promise<DifyApiResponse> {
  let response: Response
  try {
    response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法获取错误详情")
      throw new Error(`请求失败: ${response.status} ${errorText}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "网络请求失败"
    throw new Error(`连接服务器失败: ${errorMessage}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error("无法读取响应流")

  let accumulatedContent = ""
  let hasTextChunk = false
  let hasContent = false
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
              hasTextChunk = true
              hasContent = true
              accumulatedContent += data.data.text
              onStreamData?.(accumulatedContent)
            } else if (data.event === "workflow_finished") {
              if (!hasTextChunk && data.data?.outputs) {
                const outputContent = Object.values(data.data.outputs).join("\n")
                if (outputContent.trim()) {
                  hasContent = true
                  accumulatedContent = outputContent
                  onStreamData?.(accumulatedContent)
                }
              }
              onStreamEnd?.()
              break
            }
          } else {
            if ((data.event === "message" || data.event === "agent_message") && data.answer) {
              hasContent = true
              accumulatedContent += data.answer
              onStreamData?.(accumulatedContent)
            }

            if (data.event === "message_end") {
              onStreamEnd?.()
            }
          }
        } catch (e) {
          console.error("解析SSE数据失败:", e)
          // 不要立即失败，尝试处理下一行
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "处理流数据时出错"
    console.error("流处理错误:", errorMessage)
    if (onStreamData) {
      onStreamData(`抱歉，处理响应时出错: ${errorMessage}`)
    }
    reader.releaseLock()
    onStreamEnd?.()
    return { content: `抱歉，处理响应时出错: ${errorMessage}`, error: errorMessage }
  } finally {
    reader.releaseLock()
    onStreamEnd?.()
  }

  // 如果没有获取到任何内容，返回友好提示
  if (!hasContent) {
    const friendlyMessage = "抱歉，未能获取到有效的响应内容。请尝试重新提问或使用不同的方式表述您的问题。"
    if (onStreamData) {
      onStreamData(friendlyMessage)
    }
    return { content: friendlyMessage }
  }

  return { content: accumulatedContent }
}

async function handleBlockingResponse(
  apiEndpoint: string,
  requestBody: any,
  appType: AppType
): Promise<DifyApiResponse> {
  let response: Response
  try {
    response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法获取错误详情")
      throw new Error(`请求失败: ${response.status} ${errorText}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "网络请求失败"
    throw new Error(`连接服务器失败: ${errorMessage}`)
  }

  let data: any
  try {
    data = await response.json()
  } catch (error) {
    throw new Error("无法解析服务器响应，响应格式不正确")
  }
  
  if (appType === AppType.WORKFLOW) {
    if (data.error) {
      throw new Error(`工作流执行失败: ${data.error}`)
    }
    
    // 如果有 outputs 字段，优先使用 outputs 中的内容
    if (data.outputs && Object.keys(data.outputs).length > 0) {
      const outputContent = Object.values(data.outputs).join("\n")
      if (outputContent.trim()) {
        return {
          content: outputContent,
          messageId: data.id,
        }
      }
    }
    
    // 检查其他可能的响应字段
    const content = data.answer || data.text || ""
    if (content.trim()) {
      return {
        content,
        messageId: data.message_id || data.id,
      }
    }
    
    // 如果没有内容，返回友好提示
    return {
      content: "工作流执行完成，但未返回任何内容。您可以尝试修改输入或联系管理员检查工作流配置。",
      messageId: data.message_id || data.id,
    }
  } else {
    const content = data.answer || data.text || ""
    if (content.trim()) {
      return {
        content,
        messageId: data.message_id,
      }
    }
    
    // 如果没有内容，返回友好提示
    return {
      content: "处理完成，但未返回任何内容。您可以尝试重新提问或使用不同的方式表述您的问题。",
      messageId: data.message_id,
    }
  }
} 