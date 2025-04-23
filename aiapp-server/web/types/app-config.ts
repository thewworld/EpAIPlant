// 应用类型枚举
export enum AppType {
  CHAT = "Chat", // 对话式应用
  WORKFLOW = "Workflow", // 工作流应用
  COMPLETION = "Completion", // 文本生成应用
}

// 表单字段类型枚举
export enum FieldType {
  TEXT = "text", // 单行文本
  TEXTAREA = "textarea", // 多行文本
  SELECT = "select", // 下拉选择
  RADIO = "radio", // 单选
  CHECKBOX = "checkbox", // 多选
  SLIDER = "slider", // 滑块
  FILE = "file", // 文件上传
}

// 表单字段配置接口
export interface FormField {
  id: string // 字段ID
  type: FieldType // 字段类型
  label: string // 字段标签
  placeholder?: string // 占位文本
  required?: boolean // 是否必填
  defaultValue?: any // 默认值
  options?: {
    // 选项（用于下拉、单选、多选）
    label: string
    value: string | number
  }[]
  min?: number // 最小值（用于滑块）
  max?: number // 最大值（用于滑块）
  step?: number // 步长（用于滑块）
  helperText?: string // 帮助文本
  accept?: string // 文件类型限制（用于文件上传）
  tip?: string // 提示信息
  originalData?: any // 原始字段数据，用于保存特殊控件属性
}

// 应用介绍消息
export interface IntroMessage {
  icon?: string // 消息图标（emoji）
  content: string // 消息内容
}

// 应用配置接口
export interface AppConfig {
  id: string // 应用ID
  name: string // 应用名称
  icon: string // 应用图标
  logo?: string // 应用logo（从后端获取的SVG格式图片）
  type: AppType // 应用类型
  description: string // 应用描述
  introMessages: IntroMessage[] // 介绍消息
  formConfig?: {
    // 表单配置（仅表单对话类应用需要）
    fields: FormField[] // 表单字段
    submitButtonText: string // 提交按钮文本
    resetButtonText: string // 重置按钮文本
  }
  modelName?: string // 默认模型名称
  enableWebSearch?: boolean // 是否启用网络搜索
  category?: string // 应用类别
  tags?: string[] // 应用标签
  usageCount?: number // 使用次数
  chatModel?: string // 聊天模型类型，sse: 流式响应, block: 阻塞式响应
}

