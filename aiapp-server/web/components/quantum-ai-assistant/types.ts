export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

// 不再需要这个接口，因为我们直接在组件中定义了更详细的接口
// export interface QuantumChatInterfaceProps {
//   messages: Message[]
//   inputValue: string
//   setInputValue: (value: string) => void
//   handleSendMessage: () => void
//   isLoading: boolean
//   onClose: () => void
//   clearMessages: () => void
// }

