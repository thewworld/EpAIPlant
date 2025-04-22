"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProfile } from "@/components/user-profile"
import { ArrowRight, Brain, Sparkles, Users, BookOpen, ChevronRight, Cpu, Database, Code } from "lucide-react"
import { PlatformPreview } from "@/components/platform-preview"

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [featuredApps, setFeaturedApps] = useState<any[]>([])
  const [stats, setStats] = useState({
    users: "10,000+",
    apps: "30+",
    papers: "50,000+",
    satisfaction: "98%",
  })

  useEffect(() => {
    // 检查用户是否已登录
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  const handleGetStarted = () => {
    if (isLoggedIn) {
      router.push("/marketplace")
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] text-gray-800 dark:text-gray-100">
      {/* 导航栏 */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#1e293b]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-white">EAI 平台</h2>
            </div>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/home"
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium"
              >
                首页
              </Link>
              {isLoggedIn && (
                <Link
                  href="/marketplace"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium"
                >
                  应用市场
                </Link>
              )}
              <Link
                href="/features"
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium"
              >
                功能
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium"
              >
                价格
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 font-medium"
              >
                关于我们
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              {isLoggedIn ? (
                <UserProfile />
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#1e293b]"
                  >
                    登录
                  </Button>
                  <Button
                    onClick={() => router.push("/login")}
                    className="bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white shadow-lg shadow-blue-500/20"
                  >
                    注册
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="relative py-20 overflow-hidden">
        {/* 背景装饰 - 只在深色模式显示 */}
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 dark:bg-blue-600/20 rounded-full blur-3xl opacity-30 dark:opacity-100"></div>
          <div className="absolute top-1/2 -left-24 w-80 h-80 bg-indigo-100 dark:bg-purple-600/20 rounded-full blur-3xl opacity-30 dark:opacity-100"></div>
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-purple-100 dark:bg-indigo-600/20 rounded-full blur-3xl opacity-30 dark:opacity-100"></div>
        </div>

        {/* 网格背景 - 只在深色模式显示 */}
        <div
          className="absolute inset-0 z-0 opacity-0 dark:opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        ></div>

        {/* 动态线条 - 只在深色模式显示 */}
        <div className="absolute inset-0 z-0 opacity-0 dark:opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#4f46e5" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              智能研究与创作的未来平台
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              EAI平台集成先进AI技术，为科研、教育和管理提供智能解决方案，
              <br className="hidden md:block" />
              助您高效完成研究、写作与知识管理。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 border-0"
              >
                立即开始 <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/chat")}
                className="text-lg px-8 py-6 border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#1e293b]"
              >
                体验AI对话
              </Button>
            </div>

            <div className="mt-12 relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-sm opacity-30 dark:opacity-75"></div>
              <div className="relative bg-white dark:bg-[#0f172a] rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-[#1e293b]">
                <PlatformPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特点区域 */}
      <section className="py-20 bg-gray-100 dark:bg-[#0f172a]/50 relative">
        {/* 背景装饰 - 只在深色模式显示 */}
        <div className="absolute inset-0 z-0 opacity-0 dark:opacity-30">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M100,0 L100,200 M0,100 L200,100" stroke="#334155" strokeWidth="1" fill="none" />
                <circle cx="100" cy="100" r="5" fill="#3b82f6" />
                <circle cx="0" cy="100" r="3" fill="#8b5cf6" />
                <circle cx="200" cy="100" r="3" fill="#8b5cf6" />
                <circle cx="100" cy="0" r="3" fill="#8b5cf6" />
                <circle cx="100" cy="200" r="3" fill="#8b5cf6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">强大功能，助力创新</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              EAI平台提供多样化的AI工具，满足您在科研、教学和管理中的各种需求
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
              title="智能AI对话"
              description="基于先进大语言模型的对话系统，回答问题、提供建议、协助创作"
            />
            <FeatureCard
              icon={<BookOpen className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
              title="学术研究助手"
              description="论文大纲生成、文献检索、数据分析，全方位提升研究效率"
            />
            <FeatureCard
              icon={<Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
              title="创意写作支持"
              description="提供灵感、优化表达、完善结构，让您的写作更加出色"
            />
            <FeatureCard
              icon={<Database className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />}
              title="数据可视化"
              description="将复杂数据转化为直观图表，发现洞见，支持决策"
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-teal-600 dark:text-teal-400" />}
              title="团队协作"
              description="支持多人协作，共享资源，提高团队研究和创作效率"
            />
            <FeatureCard
              icon={<Code className="h-8 w-8 text-rose-600 dark:text-rose-400" />}
              title="个性化推荐"
              description="基于您的使用习惯，智能推荐相关应用和资源"
            />
          </div>
        </div>
      </section>

      {/* 推荐应用区域 */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">热门应用</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">发现用户喜爱的高效AI应用</p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/marketplace")}
              className="border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#1e293b]"
            >
              查看全部 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredApps.map((app) => (
              <Card
                key={app.id}
                className="overflow-hidden hover:shadow-md transition-shadow bg-white dark:bg-[#1e293b] border-gray-200 dark:border-[#334155]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-blue-100 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 border border-gray-200 dark:border-[#334155]">
                      <img
                        src={app.icon || "/placeholder.svg"}
                        alt={app.name}
                        className="w-8 h-8"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=32&width=32"
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg text-gray-800 dark:text-white">{app.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">{app.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#334155]"
                    onClick={() => router.push(`/app/${app.id}`)}
                  >
                    立即使用
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 统计数据区域 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">值得信赖的AI平台</h2>
            <p className="text-xl opacity-90">数以万计的用户选择EAI平台，助力他们的研究和创作</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard value={stats.users} label="活跃用户" />
            <StatCard value={stats.apps} label="智能应用" />
            <StatCard value={stats.papers} label="生成论文" />
            <StatCard value={stats.satisfaction} label="用户满意度" />
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="py-20 relative">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100 dark:bg-blue-600/10 rounded-full blur-3xl opacity-30 dark:opacity-100"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-100 dark:bg-purple-600/10 rounded-full blur-3xl opacity-30 dark:opacity-100"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
              准备好提升您的研究与创作效率了吗？
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">立即加入EAI平台，体验AI赋能的智能工作方式</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white shadow-lg shadow-blue-500/20 border-0"
            >
              免费开始使用 <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-white dark:bg-[#0f172a] border-t border-gray-200 dark:border-[#1e293b] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-md bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Cpu className="h-5 w-5 text-white" />
                </div>
                <h2 className="font-semibold text-xl text-gray-800 dark:text-white">EAI 平台</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                智能研究与创作的未来平台，助力学术、教育与管理创新
              </p>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-white">产品</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/features"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    功能
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    价格
                  </Link>
                </li>
                <li>
                  <Link
                    href="/marketplace"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    应用市场
                  </Link>
                </li>
                <li>
                  <Link
                    href="/roadmap"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    产品路线图
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-white">资源</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/docs"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    文档
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tutorials"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    教程
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    博客
                  </Link>
                </li>
                <li>
                  <Link
                    href="/support"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    支持
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4 text-gray-800 dark:text-white">公司</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    招贤纳士
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    联系我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal"
                    className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    法律条款
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-[#1e293b] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 dark:text-gray-400">© 2025 EAI平台. 保留所有权利.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// 特点卡片组件
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-[#1e293b] rounded-xl p-8 shadow-lg border border-gray-200 dark:border-[#334155] hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative overflow-hidden group">
      {/* 悬停时的发光效果 - 只在深色模式显示 */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-0 dark:group-hover:opacity-100 blur transition-opacity duration-300 -z-10"></div>

      <div className="mb-4 bg-blue-100 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 w-14 h-14 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}

// 统计卡片组件
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-lg opacity-90">{label}</div>
    </div>
  )
}

