// ... existing code ...
// 设置应用配置
setAppConfig({
  id: data.id.toString(),
  name: data.name || "未命名应用",
  description: data.description || "无描述",
  type: formConfig ? "form_chat" as AppType : "chat" as AppType,
  icon: getAppIconById(data.id.toString()) || "",
  introMessages: data.openerContent ? [{ content: data.openerContent }] : [{ content: "欢迎使用此应用！" }],
  formConfig: formConfig,
  chatModel: data.chatModel
})
// ... existing code ... 