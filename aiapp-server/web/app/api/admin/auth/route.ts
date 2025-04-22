import { NextRequest, NextResponse } from "next/server"

// 模拟管理员登录接口
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password, rememberMe } = body

    // 在实际应用中，这里应该检查数据库中的用户信息
    // 这里使用简单的硬编码检查，用于演示
    if (username === "admin" && password === "admin123") {
      // 创建响应对象
      const response = NextResponse.json({ 
        success: true, 
        message: "登录成功" 
      })
      
      // 设置Cookie到响应中
      response.cookies.set({
        name: "adminLoggedIn",
        value: "true",
        // 如果勾选了"记住我"，则Cookie保存30天，否则关闭浏览器后失效
        maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, message: "用户名或密码不正确" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("登录处理错误:", error)
    return NextResponse.json(
      { success: false, message: "登录处理失败" },
      { status: 500 }
    )
  }
}

// 管理员登出接口
export async function DELETE() {
  try {
    // 创建响应对象
    const response = NextResponse.json({ 
      success: true, 
      message: "登出成功" 
    })
    
    // 删除Cookie
    response.cookies.delete("adminLoggedIn")
    
    return response
  } catch (error) {
    console.error("登出处理错误:", error)
    return NextResponse.json(
      { success: false, message: "登出处理失败" },
      { status: 500 }
    )
  }
} 