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
  conversationId?: string
}

// 将内部文件对象转换为正确格式
function transformFileObject(fileObject: any): any {
  if (!fileObject) return fileObject;
  
  // 检查是否有uploadFileId字段，表示这是一个前端文件对象需要转换
  if (fileObject.uploadFileId) {
    return {
      type: fileObject.type?.startsWith("image/") ? "image" : "document",
      transfer_method: "local_file",
      url: "",
      upload_file_id: fileObject.uploadFileId
    };
  }
  
  // 已经是正确格式的对象，直接返回
  if (fileObject.upload_file_id) {
    return fileObject;
  }
  
  // 无法识别的格式，返回原对象
  return fileObject;
}

export async function callDifyApi(
  params: DifyApiParams,
  config: DifyApiConfig,
  onStreamData?: (content: string, rawData?: string) => void,
  onStreamEnd?: () => void
): Promise<DifyApiResponse> {
  // 根据应用类型选择API端点
  let apiEndpoint = ""

  switch (config.appType) {
    case AppType.CHAT:
      apiEndpoint = `${API_BASE_URL}/api/dify/chat-messages${config.chatModel === "sse" ? "" : "/block"}?appId=${config.appId}`
      break
    case AppType.WORKFLOW:
      apiEndpoint = `${API_BASE_URL}/api/dify/workflow/${config.chatModel === "sse" ? "run/stream" : "run/block"}?appId=${config.appId}`
      break
    case AppType.COMPLETION:
      apiEndpoint = `${API_BASE_URL}/api/dify/completion/messages/${config.chatModel === "sse" ? "stream" : "block"}?appId=${config.appId}`
      break
    default:
      apiEndpoint = `${API_BASE_URL}/api/dify/chat-messages${config.chatModel === "sse" ? "" : "/block"}?appId=${config.appId}`
  }

  // 处理请求体中的inputs字段，确保文件字段格式正确
  const processedParams = { ...params };
  
  // 检查inputs是否存在
  if (processedParams.inputs) {
    // 检查每个input字段，确保文件格式正确
    Object.keys(processedParams.inputs).forEach(key => {
      const value = processedParams.inputs![key];
      
      // 检查是否是数组，且看起来是文件对象数组
      if (Array.isArray(value) && value.length > 0) {
        // 判断是否是文件对象
        const isFileObject = value[0].uploadFileId || value[0].upload_file_id;
        
        if (isFileObject) {
          // 如果是单文件字段但错误地存储为只有一个元素的数组，取出该元素并转换
          if (value.length === 1) {
            processedParams.inputs![key] = transformFileObject(value[0]);
            console.log(`调整文件字段格式: ${key} 从数组转为正确的对象格式`);
          } else {
            // 多文件字段，转换数组中每个元素
            processedParams.inputs![key] = value.map(item => transformFileObject(item));
            console.log(`调整文件数组字段格式: ${key} 转换数组中每个元素为正确格式`);
          }
        }
      } 
      // 检查单个对象是否需要转换
      else if (value && typeof value === 'object' && (value.uploadFileId || value.id)) {
        processedParams.inputs![key] = transformFileObject(value);
        console.log(`调整单个文件对象格式: ${key} 转换为正确格式`);
      }
    });
  }

  const requestBody = {
    ...processedParams,
    response_mode: config.chatModel === "sse" ? "streaming" : "blocking",
  }

  // 打印最终的请求体用于调试
  console.log("发送请求参数:", JSON.stringify(requestBody));

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
  onStreamData?: (content: string, rawData?: string) => void,
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
  let lastConversationId: string | undefined = undefined
  let lastMessageId: string | undefined = undefined
  
  const decoder = new TextDecoder()
  let buffer = ""
  // 添加标记，确保onStreamEnd只被调用一次
  let streamEndCalled = false

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
              // 确保只调用一次
              if (onStreamEnd && !streamEndCalled) {
                streamEndCalled = true
                onStreamEnd()
              }
              break
            }
          } else {
            // 保存最后一次收到的会话ID和消息ID（聊天应用专用）
            if (appType === AppType.CHAT && data.conversation_id) {
              lastConversationId = data.conversation_id
              if (data.message_id) {
                lastMessageId = data.message_id
              }
            }
            
            if ((data.event === "message" || data.event === "agent_message") && data.answer) {
              hasContent = true
              accumulatedContent += data.answer
              // 传递原始数据给回调函数，以便提取会话ID
              onStreamData?.(accumulatedContent, jsonStr)
            }

            if (data.event === "message_end") {
              // 确保只调用一次
              if (onStreamEnd && !streamEndCalled) {
                streamEndCalled = true
                onStreamEnd()
              }
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
    // 确保只调用一次
    if (onStreamEnd && !streamEndCalled) {
      streamEndCalled = true
      onStreamEnd()
    }
    return { 
      content: `抱歉，处理响应时出错: ${errorMessage}`, 
      error: errorMessage,
      conversationId: lastConversationId // 即使出错，也返回最后已知的会话ID
    }
  } finally {
    reader.releaseLock()
    // 移除这里的onStreamEnd调用，避免重复调用
  }

  // 如果没有获取到任何内容，返回友好提示
  if (!hasContent) {
    const friendlyMessage = "抱歉，未能获取到有效的响应内容。请尝试重新提问或使用不同的方式表述您的问题。"
    if (onStreamData) {
      onStreamData(friendlyMessage)
    }
    // 确保在异常流程中也只调用一次onStreamEnd
    if (onStreamEnd && !streamEndCalled) {
      streamEndCalled = true
      onStreamEnd()
    }
    return { 
      content: friendlyMessage,
      conversationId: lastConversationId // 返回最后记录的会话ID
    }
  }

  return { 
    content: accumulatedContent,
    messageId: lastMessageId,
    conversationId: lastConversationId // 返回最后记录的会话ID
  }
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
    // 提取并返回会话ID（针对聊天应用）
    const conversationId = data.conversation_id;
      
    const content = data.answer || data.text || ""
    if (content.trim()) {
      return {
        content,
        messageId: data.message_id,
        conversationId: conversationId  // 添加会话ID到响应中
      }
    }
    
    // 如果没有内容，返回友好提示
    return {
      content: "处理完成，但未返回任何内容。您可以尝试重新提问或使用不同的方式表述您的问题。",
      messageId: data.message_id,
      conversationId: conversationId  // 添加会话ID到响应中
    }
  }
}

/**
 * 获取对话建议问题
 * 
 * @param appId 应用ID
 * @param messageId 消息ID
 * @param user 用户标识
 * @returns 建议问题列表
 */
export async function fetchSuggestedQuestions(
  appId: string,
  messageId: string,
  user: string
): Promise<string[]> {
  try {
    const url = `${API_BASE_URL}/api/dify/messages/${messageId}/suggested?appId=${appId}&user=${user}`;
    
    console.log(`获取建议问题: ${url}`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法获取错误详情");
      throw new Error(`获取建议问题失败: ${response.status} ${errorText}`);
    }

    const questions = await response.json();
    console.log(`收到建议问题: ${questions.length}个`);
    return questions;
  } catch (error) {
    console.error("获取建议问题出错:", error);
    return [];
  }
} 