import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 只处理 /admin 路径
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 登录页面不需要验证，直接通过
    if (request.nextUrl.pathname === '/admin/login' || 
        request.nextUrl.pathname === '/admin/login/') {
      // 如果已登录访问登录页，重定向到控制面板
      if (request.cookies.has('adminLoggedIn')) {
        console.log('已登录，重定向到控制面板')
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      }
      return NextResponse.next()
    }
    
    // API路由不处理重定向
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next()
    }

    // 检查是否已登录
    const isLoggedIn = request.cookies.has('adminLoggedIn')
    console.log('检查登录状态:', isLoggedIn, '所有cookies:', request.cookies.getAll())
    
    // 开发环境下默认视为已登录，或者已经登录的情况
    if (process.env.NODE_ENV === 'development' || isLoggedIn) {
      return NextResponse.next()
    }

    // 未登录则重定向到登录页
    const loginUrl = new URL('/admin/login', request.url)
    // 保存原始URL作为登录后的重定向目标
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    console.log('未登录，重定向到:', loginUrl.toString())
    
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// 配置哪些路径应该触发该中间件
export const config = {
  matcher: ['/admin/:path*'],
}
