"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ResourceUsageProps {
  id: string
}

export function ResourceUsage({ id }: ResourceUsageProps) {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="cpu" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cpu">CPU 使用率</TabsTrigger>
          <TabsTrigger value="memory">内存使用</TabsTrigger>
          <TabsTrigger value="storage">存储空间</TabsTrigger>
          <TabsTrigger value="network">网络流量</TabsTrigger>
        </TabsList>

        <TabsContent value="cpu" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">当前 CPU 使用率</CardTitle>
                <CardDescription>实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12.5%</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">平均 CPU 使用率</CardTitle>
                <CardDescription>过去24小时</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">18.3%</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">CPU 峰值</CardTitle>
                <CardDescription>过去24小时</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">45.7%</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>CPU 使用率趋势</CardTitle>
              <CardDescription>过去7天的CPU使用率变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded-md"></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">当前内存使用</CardTitle>
                <CardDescription>实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">256 MB</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">内存分配</CardTitle>
                <CardDescription>当前配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">512 MB</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">内存使用率</CardTitle>
                <CardDescription>实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">50%</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>内存使用趋势</CardTitle>
              <CardDescription>过去7天的内存使用变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded-md"></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">已用存储空间</CardTitle>
                <CardDescription>实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.2 GB</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">总存储空间</CardTitle>
                <CardDescription>当前配置</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">5 GB</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">存储使用率</CardTitle>
                <CardDescription>实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">24%</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>存储空间使用趋势</CardTitle>
              <CardDescription>过去30天的存储空间变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded-md"></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">入站流量</CardTitle>
                <CardDescription>过去24小时</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.5 GB</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">出站流量</CardTitle>
                <CardDescription>过去24小时</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.8 GB</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">当前带宽</CardTitle>
                <CardDescription>实时数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1.2 Mbps</div>
                <div className="h-[100px] mt-4 bg-gray-100 rounded-md"></div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>网络流量趋势</CardTitle>
              <CardDescription>过去7天的网络流量变化</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded-md"></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
