"use client"

import { use } from "react"

// ... existing code ...

export default function ChatPage({ params }: { params: { id: string } }) {
  // 使用 React.use() 解包 params
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  
  // ... existing code ...
}

// ... existing code ...

// 设置应用配置
setAppConfig({
  id: data.id.toString(),
  name: data.name || "未命名应用",
  description: data.description || "无描述",
  type: data.type || AppType.CHAT,
  icon: getAppIconById(data.id.toString()) || "",
  introMessages: data.openerContent ? [{ content: data.openerContent }] : [{ content: "欢迎使用此应用！" }],
  formConfig: formConfig,
  chatModel: data.chatModel
})
// ... existing code ... 