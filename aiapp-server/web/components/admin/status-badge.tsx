import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  type: string
}

export function StatusBadge({ type }: StatusBadgeProps) {
  let color = ""
  let label = ""

  switch (type) {
    case "Chat":
      color = "bg-blue-100 text-blue-800 hover:bg-blue-100"
      label = "对话式应用"
      break
    case "Workflow":
      color = "bg-orange-100 text-orange-800 hover:bg-orange-100"
      label = "工作流应用"
      break
    case "Completion":
      color = "bg-green-100 text-green-800 hover:bg-green-100"
      label = "文本生成应用"
      break
    default:
      color = "bg-gray-100 text-gray-800 hover:bg-gray-100"
      label = type
  }

  return (
    <Badge className={`${color} font-normal`} variant="outline">
      {label}
    </Badge>
  )
}
