"use client"

import { useState } from "react"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Bell, Info, AlertTriangle, CheckCircle, Clock, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// 模拟通知数据
const notifications = [
  {
    id: 1,
    title: "系统更新",
    content: "EAI平台已更新到最新版本，新增多项功能和优化。",
    time: "2023-12-20 09:30",
    type: "info",
    read: false,
  },
  {
    id: 2,
    title: "安全警报",
    content: "检测到您的账号在新设备上登录，请确认是否为您本人操作。",
    time: "2023-12-19 15:45",
    type: "warning",
    read: true,
  },
  {
    id: 3,
    title: "应用推荐",
    content: "基于您的使用习惯，我们为您推荐了&quot;科研助手&quot;应用。",
    time: "2023-12-18 11:20",
    type: "info",
    read: false,
  },
  {
    id: 4,
    title: "账号提醒",
    content: "您的账号已成功升级到高级版，享有更多功能权限。",
    time: "2023-12-15 14:10",
    type: "success",
    read: true,
  },
  {
    id: 5,
    title: "系统维护",
    content: "系统将于2023年12月25日凌晨2:00-4:00进行维护，期间服务可能不可用。",
    time: "2023-12-10 10:00",
    type: "warning",
    read: true,
  },
]

export default function NotificationsPage() {
  const { toast } = useToast()
  const [activeNotifications, setActiveNotifications] = useState(notifications)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [systemUpdates, setSystemUpdates] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)
  const [appRecommendations, setAppRecommendations] = useState(true)

  const unreadCount = activeNotifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setActiveNotifications(activeNotifications.map((n) => ({ ...n, read: true })))
    toast({
      title: "全部标记为已读",
      description: "所有通知已标记为已读。",
      duration: 3000,
    })
  }

  const clearAll = () => {
    setActiveNotifications([])
    toast({
      title: "通知已清空",
      description: "所有通知已被清除。",
      duration: 3000,
    })
  }

  const markAsRead = (id: number) => {
    setActiveNotifications(activeNotifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const deleteNotification = (id: number) => {
    setActiveNotifications(activeNotifications.filter((n) => n.id !== id))
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <UserSpaceLayout title="消息通知中心">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="all">
              全部
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">未读</TabsTrigger>
            <TabsTrigger value="settings">通知设置</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              全部标为已读
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll} disabled={activeNotifications.length === 0}>
              清空通知
            </Button>
          </div>
        </div>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>所有通知</CardTitle>
              <CardDescription>查看您收到的所有系统通知和消息。</CardDescription>
            </CardHeader>
            <CardContent>
              {activeNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">没有通知</h3>
                  <p className="text-sm text-muted-foreground">您目前没有任何通知。新通知将显示在这里。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 ${notification.read ? "bg-background" : "bg-muted/30"}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex gap-3">
                          {getIconForType(notification.type)}
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{notification.title}</h4>
                              {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Clock className="h-3 w-3 mr-1" />
                              {notification.time}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardHeader>
              <CardTitle>未读通知</CardTitle>
              <CardDescription>查看您尚未阅读的通知。</CardDescription>
            </CardHeader>
            <CardContent>
              {activeNotifications.filter((n) => !n.read).length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">没有未读通知</h3>
                  <p className="text-sm text-muted-foreground">您已阅读所有通知。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeNotifications
                    .filter((n) => !n.read)
                    .map((notification) => (
                      <div key={notification.id} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex justify-between">
                          <div className="flex gap-3">
                            {getIconForType(notification.type)}
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{notification.title}</h4>
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                              <div className="flex items-center text-xs text-muted-foreground mt-2">
                                <Clock className="h-3 w-3 mr-1" />
                                {notification.time}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-start gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>管理您接收的通知类型和方式。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">通知方式</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">电子邮件通知</div>
                      <div className="text-sm text-muted-foreground">通过电子邮件接收通知</div>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">推送通知</div>
                      <div className="text-sm text-muted-foreground">在浏览器中接收推送通知</div>
                    </div>
                    <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">通知类型</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">系统更新</div>
                      <div className="text-sm text-muted-foreground">关于平台更新、维护的通知</div>
                    </div>
                    <Switch checked={systemUpdates} onCheckedChange={setSystemUpdates} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">安全警报</div>
                      <div className="text-sm text-muted-foreground">关于账号安全的重要通知</div>
                    </div>
                    <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="font-medium">应用推荐</div>
                      <div className="text-sm text-muted-foreground">基于您的使用习惯推荐的应用</div>
                    </div>
                    <Switch checked={appRecommendations} onCheckedChange={setAppRecommendations} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  toast({
                    title: "通知设置已保存",
                    description: "您的通知偏好设置已更新。",
                    duration: 3000,
                  })
                }}
              >
                保存设置
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </UserSpaceLayout>
  )
}

