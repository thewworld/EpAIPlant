"use client"

import { type AppConfig, AppType } from "@/types/app-config"
import { ChatAppDetail } from "./chat-app-detail"
import { FormChatAppDetail } from "./form-chat-app-detail"
import { cn } from "@/lib/utils"

interface AppDetailProps {
  appConfig: AppConfig
  className?: string
}

export function AppDetail({ appConfig, className }: AppDetailProps) {
  return (
    <div className={cn("h-full flex flex-col flex-grow overflow-auto", className)}>
      {/* 根据应用类型渲染不同的详情页面 */}
      {(() => {
        switch (appConfig.type) {
          case AppType.CHAT:
            return <ChatAppDetail appConfig={appConfig} className="h-full" />
          case AppType.WORKFLOW:
            return <ChatAppDetail appConfig={appConfig} className="h-full" />
          case AppType.COMPLETION:
            return <ChatAppDetail appConfig={appConfig} className="h-full" />
          default:
            return <div>不支持的应用类型: {appConfig.type}</div>
        }
      })()}
    </div>
  )
}

