"use client"

import type { ReactNode } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

interface SafeAreaProps {
  children: ReactNode
  top?: boolean
  bottom?: boolean
  left?: boolean
  right?: boolean
  className?: string
}

export function SafeArea({ children, top = true, bottom = true, left = true, right = true, className }: SafeAreaProps) {
  const { hasSafeArea, isIOS } = useMobile()

  // 只有在iOS设备上且有安全区域时才应用安全区域样式
  const safeAreaClass =
    hasSafeArea && isIOS ? cn(top && "pt-safe", bottom && "pb-safe", left && "pl-safe", right && "pr-safe") : ""

  return <div className={cn(safeAreaClass, className)}>{children}</div>
}

