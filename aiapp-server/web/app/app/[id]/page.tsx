"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

export default function AppPage() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // 直接重定向到聊天页面
    if (params.id) {
      router.replace(`/app/chat/${params.id}`)
    }
  }, [params.id, router])

  return null
}

