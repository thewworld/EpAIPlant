import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ModulesPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">模块管理</h1>
        <p className="text-gray-500">管理系统模块和插件</p>
      </div>

      <Tabs defaultValue="installed">
        <TabsList className="mb-4">
          <TabsTrigger value="installed">已安装模块</TabsTrigger>
          <TabsTrigger value="marketplace">模块市场</TabsTrigger>
          <TabsTrigger value="updates">更新</TabsTrigger>
        </TabsList>

        <TabsContent value="installed">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle>模块 {i + 1}</CardTitle>
                  <CardDescription>版本: 1.0.{i}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>这是一个示例模块，用于展示模块管理功能。</p>
                  <div className="mt-4 flex justify-between">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      已启用
                    </span>
                    <button className="text-sm text-blue-600 hover:underline">查看详情</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">模块市场功能正在开发中</h3>
            <p className="text-gray-500 mt-2">敬请期待</p>
          </div>
        </TabsContent>

        <TabsContent value="updates">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">暂无可用更新</h3>
            <p className="text-gray-500 mt-2">所有模块均为最新版本</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
