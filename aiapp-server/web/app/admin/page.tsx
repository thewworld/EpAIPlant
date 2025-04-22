import { redirect } from "next/navigation"

export default function AdminIndexPage() {
  // 自动重定向到仪表盘页面
  redirect("/admin/dashboard")

  // 以下内容不会被执行，因为已经重定向
  return null
}
