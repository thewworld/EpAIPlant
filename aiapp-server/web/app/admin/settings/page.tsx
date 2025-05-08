"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleSubmit = () => {
    setIsSubmitting(true)
    // 模拟API调用
    setTimeout(() => {
      setIsSubmitting(false)
    }, 1500)
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "保存中..." : "保存设置"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="api">API配置</TabsTrigger>
          <TabsTrigger value="security">安全设置</TabsTrigger>
          <TabsTrigger value="notification">通知设置</TabsTrigger>
          <TabsTrigger value="advanced">高级设置</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>平台信息</CardTitle>
              <CardDescription>
                设置平台的基本信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">平台名称</Label>
                <Input id="platformName" defaultValue="易智能AI平台" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="platformDescription">平台描述</Label>
                <Textarea 
                  id="platformDescription" 
                  defaultValue="Dify应用的创建、配置、监控全生命周期管理平台"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">管理员邮箱</Label>
                <Input id="adminEmail" type="email" defaultValue="admin@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">时区设置</Label>
                <Select defaultValue="Asia/Shanghai">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="选择时区" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">中国标准时间 (UTC+8)</SelectItem>
                    <SelectItem value="America/New_York">美国东部时间 (UTC-5)</SelectItem>
                    <SelectItem value="Europe/London">格林威治标准时间 (UTC+0)</SelectItem>
                    <SelectItem value="Europe/Paris">中欧时间 (UTC+1)</SelectItem>
                    <SelectItem value="Asia/Tokyo">日本标准时间 (UTC+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">默认语言</Label>
                <Select defaultValue="zh-CN">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                    <SelectItem value="ko-KR">한국어</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>界面设置</CardTitle>
              <CardDescription>
                自定义平台界面外观
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">主题模式</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="选择主题" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色模式</SelectItem>
                    <SelectItem value="dark">深色模式</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primaryColor">主题色</Label>
                <div className="grid grid-cols-6 gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer border-2 border-gray-200"></div>
                  <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-red-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-orange-500 cursor-pointer"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-500 cursor-pointer"></div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableAnimation" defaultChecked />
                <Label htmlFor="enableAnimation">启用界面动画</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableDarkMode" defaultChecked />
                <Label htmlFor="enableDarkMode">允许用户切换深色模式</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>API设置</CardTitle>
              <CardDescription>
                配置API访问和限制
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiRateLimit">API速率限制 (每分钟请求数)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="apiRateLimit"
                    defaultValue={[100]}
                    max={500}
                    step={10}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">100</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiTimeout">API超时时间 (秒)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="apiTimeout"
                    defaultValue={[30]}
                    max={120}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">30</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiVersion">API版本</Label>
                <Select defaultValue="v1">
                  <SelectTrigger id="apiVersion">
                    <SelectValue placeholder="选择API版本" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">v1 (稳定版)</SelectItem>
                    <SelectItem value="v2">v2 (测试版)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableCors" defaultChecked />
                <Label htmlFor="enableCors">启用CORS</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowedOrigins">允许的源 (CORS)</Label>
                <Textarea 
                  id="allowedOrigins" 
                  defaultValue="*"
                  placeholder="每行一个域名，使用*表示允许所有源"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>模型提供商设置</CardTitle>
              <CardDescription>
                配置AI模型提供商的API密钥
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">OpenAI API密钥</Label>
                <Input id="openaiApiKey" type="password" defaultValue="sk-..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anthropicApiKey">Anthropic API密钥</Label>
                <Input id="anthropicApiKey" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="huggingfaceApiKey">Hugging Face API密钥</Label>
                <Input id="huggingfaceApiKey" type="password" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultProvider">默认模型提供商</Label>
                <Select defaultValue="openai">
                  <SelectTrigger id="defaultProvider">
                    <SelectValue placeholder="选择默认提供商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>
                配置平台的安全策略
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">密码策略</Label>
                <Select defaultValue="strong">
                  <SelectTrigger id="passwordPolicy">
                    <SelectValue placeholder="选择密码策略" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">基本 (至少8个字符)</SelectItem>
                    <SelectItem value="medium">中等 (至少8个字符，包含数字和字母)</SelectItem>
                    <SelectItem value="strong">强 (至少10个字符，包含大小写字母、数字和特殊字符)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">会话超时时间 (分钟)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="sessionTimeout"
                    defaultValue={[30]}
                    max={120}
                    step={5}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">30</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enable2FA" defaultChecked />
                <Label htmlFor="enable2FA">启用双因素认证</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enforceSSL" defaultChecked />
                <Label htmlFor="enforceSSL">强制使用HTTPS</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableIpRestriction" />
                <Label htmlFor="enableIpRestriction">启用IP访问限制</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="allowedIps">允许的IP地址</Label>
                <Textarea 
                  id="allowedIps" 
                  placeholder="每行一个IP地址或CIDR范围"
                  rows={3}
                  disabled
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>内容安全</CardTitle>
              <CardDescription>
                配置内容过滤和审核策略
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="enableContentFilter" defaultChecked />
                <Label htmlFor="enableContentFilter">启用内容过滤</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contentFilterLevel">内容过滤级别</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="contentFilterLevel">
                    <SelectValue placeholder="选择过滤级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">低 (仅过滤明显违规内容)</SelectItem>
                    <SelectItem value="medium">中 (平衡过滤)</SelectItem>
                    <SelectItem value="high">高 (严格过滤)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableAuditLog" defaultChecked />
                <Label htmlFor="enableAuditLog">启用审计日志</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auditLogRetention">审计日志保留时间 (天)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="auditLogRetention"
                    defaultValue={[90]}
                    max={365}
                    step={30}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">90</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notification" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
              <CardDescription>
                配置系统通知和告警方式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>通知渠道</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="enableEmailNotification" defaultChecked />
                    <Label htmlFor="enableEmailNotification">电子邮件</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enableSmsNotification" />
                    <Label htmlFor="enableSmsNotification">短信</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enableWebhookNotification" defaultChecked />
                    <Label htmlFor="enableWebhookNotification">Webhook</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enableDingTalkNotification" />
                    <Label htmlFor="enableDingTalkNotification">钉钉</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="enableWeChatNotification" />
                    <Label htmlFor="enableWeChatNotification">企业微信</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailServer">SMTP服务器设置</Label>
                <div className="space-y-4">
                  <Input id="emailServer" placeholder="smtp.example.com" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emailPort">端口</Label>
                      <Input id="emailPort" placeholder="587" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emailSecurity">安全连接</Label>
                      <Select defaultValue="tls">
                        <SelectTrigger id="emailSecurity">
                          <SelectValue placeholder="选择连接类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">无</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailUsername">用户名</Label>
                    <Input id="emailUsername" placeholder="notifications@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailPassword">密码</Label>
                    <Input id="emailPassword" type="password" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl">Webhook URL</Label>
                <Input id="webhookUrl" placeholder="https://example.com/webhook" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>高级设置</CardTitle>
              <CardDescription>
                系统高级配置选项
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logLevel">日志级别</Label>
                <Select defaultValue="info">
                  <SelectTrigger id="logLevel">
                    <SelectValue placeholder="选择日志级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">调试</SelectItem>
                    <SelectItem value="info">信息</SelectItem>
                    <SelectItem value="warn">警告</SelectItem>
                    <SelectItem value="error">错误</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cacheStrategy">缓存策略</Label>
                <Select defaultValue="memory">
                  <SelectTrigger id="cacheStrategy">
                    <SelectValue placeholder="选择缓存策略" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">不缓存</SelectItem>
                    <SelectItem value="memory">内存缓存</SelectItem>
                    <SelectItem value="redis">Redis缓存</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">最大上传文件大小 (MB)</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="maxUploadSize"
                    defaultValue={[50]}
                    max={500}
                    step={10}
                    className="flex-1"
                  />
                  <span className="w-12 text-center">50</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableDebugMode" />
                <Label htmlFor="enableDebugMode">启用调试模式</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enableMaintenanceMode" />
                <Label htmlFor="enableMaintenanceMode">启用维护模式</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
