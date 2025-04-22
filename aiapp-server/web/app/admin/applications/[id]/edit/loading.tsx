import { Loader2 } from "lucide-react"

export default function EditApplicationLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[600px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">正在加载应用数据...</p>
    </div>
  )
}
