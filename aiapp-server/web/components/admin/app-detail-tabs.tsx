"use client"
import { BarChart2, Clock, AlertCircle, FileText, GitBranch, Server } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MonitoringCharts } from "@/components/admin/monitoring-charts"
import { LogViewer } from "@/components/admin/log-viewer"
import { DeploymentHistory } from "@/components/admin/deployment-history"
import { ResourceUsage } from "@/components/admin/resource-usage"
import { DependencyGraph } from "@/components/admin/dependency-graph"

interface AppDetailTabsProps {
  id: string
}

export function AppDetailTabs({ id }: AppDetailTabsProps) {
  return (
    <Tabs defaultValue="monitoring" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="monitoring" className="flex items-center">
          <BarChart2 className="mr-2 h-4 w-4" />
          <span>性能监控</span>
        </TabsTrigger>
        <TabsTrigger value="logs" className="flex items-center">
          <FileText className="mr-2 h-4 w-4" />
          <span>日志查看</span>
        </TabsTrigger>
        <TabsTrigger value="deployments" className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <span>部署历史</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="flex items-center">
          <Server className="mr-2 h-4 w-4" />
          <span>资源使用</span>
        </TabsTrigger>
        <TabsTrigger value="dependencies" className="flex items-center">
          <GitBranch className="mr-2 h-4 w-4" />
          <span>依赖关系</span>
        </TabsTrigger>
        <TabsTrigger value="alerts" className="flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>告警记录</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="monitoring" className="pt-6">
        <MonitoringCharts id={id} />
      </TabsContent>
      <TabsContent value="logs" className="pt-6">
        <LogViewer id={id} />
      </TabsContent>
      <TabsContent value="deployments" className="pt-6">
        <DeploymentHistory id={id} />
      </TabsContent>
      <TabsContent value="resources" className="pt-6">
        <ResourceUsage id={id} />
      </TabsContent>
      <TabsContent value="dependencies" className="pt-6">
        <DependencyGraph id={id} />
      </TabsContent>
      <TabsContent value="alerts" className="pt-6">
        <div className="text-center py-10 text-gray-500">
          <AlertCircle className="mx-auto h-12 w-12 mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">暂无告警记录</h3>
          <p>该应用目前运行正常，没有触发任何告警规则</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
