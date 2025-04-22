import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 只处理 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 跳过登录页面的认证检查
    if (
      request.nextUrl.pathname === '/admin/login' ||
      request.nextUrl.pathname.startsWith('/admin/login/')
    ) {
      return NextResponse.next()
    }

    // 检查是否已登录
    const isLoggedIn = request.cookies.has('adminLoggedIn')
    
    // 开发环境下默认视为已登录
    if (process.env.NODE_ENV === 'development' || isLoggedIn) {
      return NextResponse.next()
    }

    // 未登录则重定向到登录页
    const loginUrl = new URL('/admin/login', request.url)
    // 保存原始URL作为登录后的重定向目标
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 配置哪些路径应该触发该中间件
export const config = {
  matcher: ['/admin/:path*'],
}
