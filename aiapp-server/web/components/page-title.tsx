import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageTitleProps {
  title: string
  description?: string
  className?: string
}

export default function PageTitle({
  title,
  description,
  className,
}: PageTitleProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      {description && (
        <p className="text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
} 