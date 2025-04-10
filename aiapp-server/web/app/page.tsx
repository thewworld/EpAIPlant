"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 检查用户是否已登录，但总是重定向到首页
    // 首页会根据登录状态显示不同的导航选项
    router.push("/home")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>正在加载，请稍候...</p>
    </div>
  )
}

