import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter, RefreshCw } from "lucide-react"

export const metadata: Metadata = {
  title: "监控告警 | 易智能运维平台",
  description: "监控告警管理页面",
}

// 模拟告警数据
const alerts = [
  {
    id: "ALT-001",
    name: "CPU使用率过高",
    level: "critical",
    status: "active",
    source: "应用服务器",
    timestamp: "2023-04-10 14:32:15",
    description: "CPU使用率超过90%持续5分钟",
  },
  {
    id: "ALT-002",
    name: "内存不足",
    level: "warning",
    status: "active",
    source: "数据库服务器",
    timestamp: "2023-04-10 13:45:22",
    description: "可用内存低于10%",
  },
  {
    id: "ALT-003",
    name: "API响应时间过长",
    level: "warning",
    status: "acknowledged",
    source: "API网关",
    timestamp: "2023-04-10 12:18:05",
    description: "API平均响应时间超过2秒",
  },
  {
    id: "ALT-004",
    name: "磁盘空间不足",
    level: "critical",
    status: "resolved",
    source: "存储服务器",
    timestamp: "2023-04-09 23:55:41",
    description: "磁盘使用率超过95%",
  },
  {
    id: "ALT-005",
    name: "数据库连接失败",
    level: "critical",
    status: "resolved",
    source: "应用服务器",
    timestamp: "2023-04-09 22:10:33",
    description: "无法建立与数据库的连接",
  },
]

// 告警规则数据
const alertRules = [
  {
    id: "RULE-001",
    name: "CPU使用率监控",
    metric: "cpu_usage",
    threshold: "90%",
    duration: "5分钟",
    status: "enabled",
    actions: ["email", "sms"],
  },
  {
    id: "RULE-002",
    name: "内存使用率监控",
    metric: "memory_usage",
    threshold: "90%",
    duration: "5分钟",
    status: "enabled",
    actions: ["email"],
  },
  {
    id: "RULE-003",
    name: "磁盘空间监控",
    metric: "disk_usage",
    threshold: "95%",
    duration: "即时",
    status: "enabled",
    actions: ["email", "sms"],
  },
  {
    id: "RULE-004",
    name: "API响应时间监控",
    metric: "api_response_time",
    threshold: "2秒",
    duration: "10分钟",
    status: "enabled",
    actions: ["email"],
  },
  {
    id: "RULE-005",
    name: "数据库连接监控",
    metric: "db_connections",
    threshold: "失败",
    duration: "即时",
    status: "enabled",
    actions: ["email", "sms"],
  },
]

// 告警通知设置
const notificationSettings = [
  {
    id: "NOTIFY-001",
    channel: "email",
    recipients: "admin@example.com, ops@example.com",
    status: "enabled",
  },
  {
    id: "NOTIFY-002",
    channel: "sms",
    recipients: "+1234567890, +0987654321",
    status: "enabled",
  },
  {
    id: "NOTIFY-003",
    channel: "webhook",
    recipients: "https://api.example.com/alerts",
    status: "disabled",
  },
]

export default function AlertsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">监控告警</h1>
          <p className="text-muted-foreground">管理系统告警和告警规则</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            创建告警规则
          </Button>
        </div>
      </div>

      <Tabs defaultValue="current">
        <TabsList className="mb-4">
          <TabsTrigger value="current">当前告警</TabsTrigger>
          <TabsTrigger value="history">历史告警</TabsTrigger>
          <TabsTrigger value="rules">告警规则</TabsTrigger>
          <TabsTrigger value="notifications">通知设置</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>当前告警</CardTitle>
              <CardDescription>显示所有活跃和已确认的告警</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="搜索告警..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="告警级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有级别</SelectItem>
                      <SelectItem value="critical">严重</SelectItem>
                      <SelectItem value="warning">警告</SelectItem>
                      <SelectItem value="info">信息</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="告警状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="active">活跃</SelectItem>
                      <SelectItem value="acknowledged">已确认</SelectItem>
                      <SelectItem value="resolved">已解决</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>告警名称</TableHead>
                    <TableHead>级别</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts
                    .filter((alert) => alert.status !== "resolved")
                    .map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{alert.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-sm text-muted-foreground">{alert.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={alert.level === "critical" ? "destructive" : "warning"}>
                            {alert.level === "critical" ? "严重" : "警告"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alert.status === "active"
                                ? "destructive"
                                : alert.status === "acknowledged"
                                  ? "outline"
                                  : "secondary"
                            }
                          >
                            {alert.status === "active" ? "活跃" : alert.status === "acknowledged" ? "已确认" : "已解决"}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.source}</TableCell>
                        <TableCell>{alert.timestamp}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              确认
                            </Button>
                            <Button variant="outline" size="sm">
                              解决
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>历史告警</CardTitle>
              <CardDescription>显示所有已解决的历史告警</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="搜索历史告警..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="告警级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有级别</SelectItem>
                      <SelectItem value="critical">严重</SelectItem>
                      <SelectItem value="warning">警告</SelectItem>
                      <SelectItem value="info">信息</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>告警名称</TableHead>
                    <TableHead>级别</TableHead>
                    <TableHead>来源</TableHead>
                    <TableHead>解决时间</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts
                    .filter((alert) => alert.status === "resolved")
                    .map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>{alert.id}</TableCell>
                        <TableCell>
                          <div className="font-medium">{alert.name}</div>
                          <div className="text-sm text-muted-foreground">{alert.description}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={alert.level === "critical" ? "destructive" : "warning"}>
                            {alert.level === "critical" ? "严重" : "警告"}
                          </Badge>
                        </TableCell>
                        <TableCell>{alert.source}</TableCell>
                        <TableCell>{alert.timestamp}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            查看详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>告警规则</CardTitle>
              <CardDescription>配置系统告警规则和触发条件</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="搜索规则..." className="pl-8 w-[250px]" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="规则状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="enabled">已启用</SelectItem>
                      <SelectItem value="disabled">已禁用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新建规则
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>规则名称</TableHead>
                    <TableHead>监控指标</TableHead>
                    <TableHead>阈值</TableHead>
                    <TableHead>持续时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>通知方式</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell>{rule.id}</TableCell>
                      <TableCell>{rule.name}</TableCell>
                      <TableCell>{rule.metric}</TableCell>
                      <TableCell>{rule.threshold}</TableCell>
                      <TableCell>{rule.duration}</TableCell>
                      <TableCell>
                        <Badge variant={rule.status === "enabled" ? "success" : "secondary"}>
                          {rule.status === "enabled" ? "已启用" : "已禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.actions.map((action) => (
                            <Badge key={action} variant="outline">
                              {action === "email" ? "邮件" : action === "sms" ? "短信" : action}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            编辑
                          </Button>
                          <Button variant="outline" size="sm">
                            {rule.status === "enabled" ? "禁用" : "启用"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>通知设置</CardTitle>
              <CardDescription>配置告警通知渠道和接收人</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="通知渠道" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有渠道</SelectItem>
                      <SelectItem value="email">邮件</SelectItem>
                      <SelectItem value="sms">短信</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  添加通知渠道
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>通知渠道</TableHead>
                    <TableHead>接收人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationSettings.map((setting) => (
                    <TableRow key={setting.id}>
                      <TableCell>{setting.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {setting.channel === "email" ? (
                            <Badge variant="outline" className="mr-2">
                              邮件
                            </Badge>
                          ) : setting.channel === "sms" ? (
                            <Badge variant="outline" className="mr-2">
                              短信
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mr-2">
                              Webhook
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{setting.recipients}</TableCell>
                      <TableCell>
                        <Badge variant={setting.status === "enabled" ? "success" : "secondary"}>
                          {setting.status === "enabled" ? "已启用" : "已禁用"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            编辑
                          </Button>
                          <Button variant="outline" size="sm">
                            {setting.status === "enabled" ? "禁用" : "启用"}
                          </Button>
                          <Button variant="outline" size="sm">
                            测试
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
