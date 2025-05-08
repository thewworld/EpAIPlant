"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MessageSquare, Search, BarChart3, FileText, User, Settings, Cpu } from "lucide-react"

export function PlatformPreview() {
  const [activeTab, setActiveTab] = useState(1)
  const [animationFrame, setAnimationFrame] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 添加动画效果 - 修复无限循环问题
  useEffect(() => {
    // 清除之前的interval以防止内存泄漏
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // 设置新的interval
    intervalRef.current = setInterval(() => {
      setAnimationFrame((prev) => (prev + 1) % 100)
    }, 50)

    // 组件卸载时清除interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, []) // 空依赖数组，只在组件挂载时运行一次

  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] shadow-xl dark:shadow-blue-500/10 relative">
      {/* 装饰性背景元素 - 只在深色模式显示 */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 dark:opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMjAgMCBMIDAgMCAwIDIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==')] opacity-10"></div>
        <div className="absolute top-20 -left-10 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-40 -right-20 w-60 h-60 bg-purple-500 rounded-full filter blur-3xl opacity-10"></div>
      </div>

      {/* 模拟界面头部 */}
      <div className="bg-gray-100 dark:bg-[#1e293b] p-3 flex items-center justify-between border-b border-gray-200 dark:border-[#334155] relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="flex-1 text-center text-sm font-medium text-gray-600 dark:text-gray-300">
          易智能AI平台 - 智能研究助手
        </div>
        <div className="w-16"></div>
      </div>

      {/* 模拟界面内容 */}
      <div className="flex h-[400px] relative z-10">
        {/* 侧边栏 */}
        <div className="w-16 bg-gray-50 dark:bg-[#0f172a] border-r border-gray-200 dark:border-[#1e293b] flex flex-col items-center py-4 space-y-6">
          <SidebarIcon icon={<MessageSquare size={20} />} active={activeTab === 1} onClick={() => setActiveTab(1)} />
          <SidebarIcon icon={<Search size={20} />} active={activeTab === 2} onClick={() => setActiveTab(2)} />
          <SidebarIcon icon={<FileText size={20} />} active={activeTab === 3} onClick={() => setActiveTab(3)} />
          <SidebarIcon icon={<BarChart3 size={20} />} active={activeTab === 4} onClick={() => setActiveTab(4)} />
          <SidebarIcon icon={<User size={20} />} active={activeTab === 5} onClick={() => setActiveTab(5)} />
          <SidebarIcon icon={<Settings size={20} />} active={activeTab === 6} onClick={() => setActiveTab(6)} />
        </div>

        {/* 主内容区 */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#0f172a]">
          {/* 顶部导航 */}
          <div className="h-12 border-b border-gray-200 dark:border-[#1e293b] flex items-center px-4">
            <div className="flex space-x-4">
              <TabButton label="AI 对话" active={activeTab === 1} />
              <TabButton label="论文大纲" active={activeTab === 3} />
              <TabButton label="数据分析" active={activeTab === 4} />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="flex-1 p-4 overflow-hidden">
            {activeTab === 1 && <ChatInterface animationFrame={animationFrame} />}
            {activeTab === 3 && <DocumentInterface />}
            {activeTab === 4 && <AnalyticsInterface />}
          </div>
        </div>
      </div>
    </div>
  )
}

// 侧边栏图标
function SidebarIcon({ icon, active, onClick }: { icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
        active
          ? "bg-blue-100 text-blue-600 dark:bg-gradient-to-r dark:from-blue-600/20 dark:to-purple-600/20 dark:text-blue-400 dark:shadow-lg dark:shadow-blue-500/10"
          : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-[#1e293b] dark:hover:text-gray-300"
      }`}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}

// 标签按钮
function TabButton({ label, active }: { label: string; active: boolean }) {
  return (
    <button
      className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "text-blue-600 border-b-2 border-blue-500 dark:text-blue-400"
          : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
      }`}
    >
      {label}
    </button>
  )
}

// 聊天界面
function ChatInterface({ animationFrame }: { animationFrame: number }) {
  // 计算动画位置
  const pulseOpacity = 0.5 + 0.5 * Math.sin(animationFrame / 10)

  return (
    <div className="h-full flex flex-col">
      {/* 聊天消息 */}
      <div className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 flex items-center justify-center mr-2 flex-shrink-0 dark:shadow-lg dark:shadow-blue-500/20">
            <Cpu size={16} className="text-blue-600 dark:text-white" />
          </div>
          <div className="bg-gray-100 dark:bg-[#1e293b] rounded-lg p-3 max-w-[80%] border border-gray-200 dark:border-[#334155]">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              欢迎使用易智能AI平台的AI助手，我可以帮助您回答问题、提供研究建议或协助写作。请问有什么我可以帮您的？
            </p>
          </div>
        </div>

        <div className="flex items-start justify-end">
          <div className="bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 text-white rounded-lg p-3 max-w-[80%]">
            <p className="text-sm">我正在研究人工智能在教育领域的应用，能否帮我整理一下相关的研究方向？</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-[#334155] flex items-center justify-center ml-2 flex-shrink-0">
            <User size={16} className="text-gray-700 dark:text-gray-300" />
          </div>
        </div>

        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 flex items-center justify-center mr-2 flex-shrink-0 dark:shadow-lg dark:shadow-blue-500/20">
            <Cpu size={16} className="text-blue-600 dark:text-white" />
          </div>
          <div className="bg-gray-100 dark:bg-[#1e293b] rounded-lg p-3 max-w-[80%] border border-gray-200 dark:border-[#334155]">
            <p className="text-sm text-gray-700 dark:text-gray-300">人工智能在教育领域的主要研究方向包括：</p>
            <ul className="text-sm list-disc pl-5 mt-2 space-y-1 text-gray-700 dark:text-gray-300">
              <li>个性化学习与自适应教学系统</li>
              <li>智能辅导系统与虚拟教学助手</li>
              <li>教育数据挖掘与学习分析</li>
              <li>自动评分与反馈系统</li>
              <li>教育机器人与沉浸式学习环境</li>
            </ul>
            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              您对哪个方向特别感兴趣？我可以提供更详细的信息。
            </p>
          </div>
        </div>
      </div>

      {/* 输入框 */}
      <div className="border border-gray-200 dark:border-[#334155] rounded-lg p-3 bg-white dark:bg-[#1e293b] relative">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="输入您的问题..."
            className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-500"
          />
          <button className="w-8 h-8 rounded-full bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 flex items-center justify-center text-white ml-2 dark:shadow-lg dark:shadow-blue-500/20">
            <MessageSquare size={16} />
          </button>
        </div>

        {/* 动态脉冲效果 - 只在深色模式显示 */}
        <div
          className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full opacity-0 dark:opacity-100"
          style={{
            opacity: `${pulseOpacity * 0.5}`,
            backgroundSize: "200% 100%",
            backgroundPosition: `${animationFrame}% 0%`,
          }}
        ></div>
      </div>
    </div>
  )
}

// 文档界面
function DocumentInterface() {
  return (
    <div className="h-full flex">
      {/* 左侧编辑区 */}
      <div className="w-1/2 pr-4 border-r border-gray-200 dark:border-[#1e293b]">
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-300">论文大纲生成器</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">主题</label>
              <div className="h-8 bg-gray-100 dark:bg-[#1e293b] rounded w-full border border-gray-200 dark:border-[#334155]"></div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">关键词</label>
              <div className="h-20 bg-gray-100 dark:bg-[#1e293b] rounded w-full border border-gray-200 dark:border-[#334155]"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 dark:bg-[#334155] rounded w-20 text-center text-xs text-gray-700 dark:text-gray-400 flex items-center justify-center">
                重置
              </div>
              <div className="h-8 bg-blue-600 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 rounded w-20 text-center text-xs text-white flex items-center justify-center dark:shadow-lg dark:shadow-blue-500/20">
                生成
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧预览区 */}
      <div className="w-1/2 pl-4">
        <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-300">大纲预览</h3>
        <div className="space-y-2">
          <div className="h-6 bg-gray-100 dark:bg-[#1e293b] rounded w-3/4 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-1/2 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-5/6 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-2/3 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-3/4 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-6 bg-gray-100 dark:bg-[#1e293b] rounded w-1/2 mt-4 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-4/5 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-3/5 border border-gray-200 dark:border-[#334155]"></div>
          <div className="h-4 bg-gray-100 dark:bg-[#1e293b] rounded w-2/3 border border-gray-200 dark:border-[#334155]"></div>
        </div>
      </div>
    </div>
  )
}

// 分析界面
function AnalyticsInterface() {
  return (
    <div className="h-full">
      <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-gray-300">数据分析</h3>

      {/* 图表区域 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border border-gray-200 dark:border-[#334155] rounded-lg p-3 bg-white dark:bg-[#1e293b]">
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">研究趋势分析</div>
          <div className="h-40 flex items-end space-x-2 pt-4">
            <div
              className="w-1/6 bg-blue-500 dark:bg-gradient-to-t dark:from-blue-600 dark:to-blue-400 rounded-t"
              style={{ height: "30%" }}
            ></div>
            <div
              className="w-1/6 bg-blue-500 dark:bg-gradient-to-t dark:from-blue-600 dark:to-blue-400 rounded-t"
              style={{ height: "50%" }}
            ></div>
            <div
              className="w-1/6 bg-blue-500 dark:bg-gradient-to-t dark:from-blue-600 dark:to-blue-400 rounded-t"
              style={{ height: "40%" }}
            ></div>
            <div
              className="w-1/6 bg-blue-500 dark:bg-gradient-to-t dark:from-blue-600 dark:to-blue-400 rounded-t"
              style={{ height: "70%" }}
            ></div>
            <div
              className="w-1/6 bg-blue-500 dark:bg-gradient-to-t dark:from-blue-600 dark:to-blue-400 rounded-t"
              style={{ height: "60%" }}
            ></div>
            <div
              className="w-1/6 bg-blue-500 dark:bg-gradient-to-t dark:from-blue-600 dark:to-blue-400 rounded-t"
              style={{ height: "90%" }}
            ></div>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-[#334155] rounded-lg p-3 bg-white dark:bg-[#1e293b]">
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">主题分布</div>
          <div className="h-40 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-8 border-blue-500 relative">
              <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-indigo-500 rounded-full transform rotate-45"></div>
              <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-r-purple-500 rounded-full transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="border border-gray-200 dark:border-[#334155] rounded-lg overflow-hidden">
        <div className="bg-gray-100 dark:bg-[#1e293b] text-xs font-medium grid grid-cols-4 p-2 text-gray-700 dark:text-gray-300">
          <div>主题</div>
          <div>文献数量</div>
          <div>引用次数</div>
          <div>增长率</div>
        </div>
        <div className="text-xs grid grid-cols-4 p-2 border-b border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-400">
          <div>人工智能</div>
          <div>1,245</div>
          <div>8,392</div>
          <div className="text-green-500">+24%</div>
        </div>
        <div className="text-xs grid grid-cols-4 p-2 border-b border-gray-200 dark:border-[#334155] text-gray-700 dark:text-gray-400">
          <div>机器学习</div>
          <div>982</div>
          <div>6,147</div>
          <div className="text-green-500">+18%</div>
        </div>
        <div className="text-xs grid grid-cols-4 p-2 text-gray-700 dark:text-gray-400">
          <div>深度学习</div>
          <div>754</div>
          <div>4,832</div>
          <div className="text-green-500">+32%</div>
        </div>
      </div>
    </div>
  )
}

