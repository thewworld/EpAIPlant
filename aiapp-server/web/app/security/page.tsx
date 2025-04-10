"use client"

import type React from "react"

import { useState } from "react"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, Lock, Shield, AlertTriangle, Smartphone, Mail } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SecurityPage() {
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [loginNotifications, setLoginNotifications] = useState(true)
  const [securityAlerts, setSecurityAlerts] = useState(true)

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 验证密码
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        variant: "destructive",
        title: "密码不匹配",
        description: "新密码和确认密码不一致，请重新输入。",
        duration: 3000,
      })
      return
    }

    // 模拟密码更新
    toast({
      title: "密码已更新",
      description: "您的密码已成功更改。",
      duration: 3000,
    })

    // 重置表单
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    })
  }

  const handleTwoFactorToggle = () => {
    const newState = !twoFactorEnabled
    setTwoFactorEnabled(newState)

    toast({
      title: newState ? "双因素认证已启用" : "双因素认证已禁用",
      description: newState ? "您的账号现在受到双因素认证的保护。" : "您的账号不再使用双因素认证。",
      duration: 3000,
    })
  }

  return (
    <UserSpaceLayout title="账号安全设置">
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="password">密码管理</TabsTrigger>
          <TabsTrigger value="2fa">双因素认证</TabsTrigger>
          <TabsTrigger value="devices">登录设备</TabsTrigger>
          <TabsTrigger value="notifications">安全通知</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>定期更改密码可以提高您账号的安全性。</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">当前密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入当前密码"
                      className="pl-8"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入新密码"
                      className="pl-8"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">确认新密码</Label>
                  <div className="relative">
                    <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="请再次输入新密码"
                      className="pl-8"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-9 w-9"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>密码要求：</p>
                  <ul className="list-disc list-inside pl-2 space-y-1">
                    <li>至少8个字符</li>
                    <li>包含至少一个大写字母</li>
                    <li>包含至少一个数字</li>
                    <li>包含至少一个特殊字符</li>
                  </ul>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handlePasswordSubmit}>更新密码</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="2fa">
          <Card>
            <CardHeader>
              <CardTitle>双因素认证</CardTitle>
              <CardDescription>设置双因素认证，为您的账号添加额外的安全保障。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">启用双因素认证</div>
                  <div className="text-sm text-muted-foreground">登录时需要额外的验证步骤</div>
                </div>
                <Switch checked={twoFactorEnabled} onCheckedChange={handleTwoFactorToggle} />
              </div>

              {twoFactorEnabled && (
                <div className="space-y-4">
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>双因素认证已启用</AlertTitle>
                    <AlertDescription>
                      您的账号现在受到双因素认证的保护。每次登录时，您都需要输入手机验证码。
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>验证方式</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4 flex items-start space-x-3">
                        <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                        <div>
                          <h4 className="font-medium">短信验证码</h4>
                          <p className="text-sm text-muted-foreground">通过短信接收验证码</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4 flex items-start space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="font-medium text-muted-foreground">邮箱验证码</h4>
                          <p className="text-sm text-muted-foreground">通过邮箱接收验证码</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recovery-codes">恢复码</Label>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm">请保存以下恢复码，当您无法接收验证码时，可以使用恢复码登录。</p>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <code className="bg-background p-1 rounded text-xs">ABCD-1234-EFGH</code>
                        <code className="bg-background p-1 rounded text-xs">IJKL-5678-MNOP</code>
                        <code className="bg-background p-1 rounded text-xs">QRST-9012-UVWX</code>
                        <code className="bg-background p-1 rounded text-xs">YZ12-3456-7890</code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            {twoFactorEnabled && (
              <CardFooter>
                <Button variant="outline" className="w-full">
                  下载恢复码
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>登录设备</CardTitle>
              <CardDescription>查看并管理您当前登录的设备。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <rect width="14" height="8" x="5" y="2" rx="2" />
                          <rect width="20" height="8" x="2" y="14" rx="2" />
                          <path d="M6 18h2" />
                          <path d="M12 18h6" />
                          <path d="M12 6h.01" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">当前设备</h4>
                        <p className="text-sm text-muted-foreground">Windows 10 · Chrome · 北京</p>
                        <p className="text-xs text-green-600 mt-1">当前活跃</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" disabled>
                      当前设备
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="bg-muted p-2 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                          <path d="M12 18h.01" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">iPhone 13</h4>
                        <p className="text-sm text-muted-foreground">iOS 16 · Safari · 上海</p>
                        <p className="text-xs text-muted-foreground mt-1">最后活跃: 2023年12月18日</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      移除
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className="bg-muted p-2 rounded-full">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="14" height="8" x="5" y="2" rx="2" />
                          <rect width="20" height="8" x="2" y="14" rx="2" />
                          <path d="M6 18h2" />
                          <path d="M12 18h6" />
                          <path d="M12 6h.01" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium">MacBook Pro</h4>
                        <p className="text-sm text-muted-foreground">macOS · Firefox · 广州</p>
                        <p className="text-xs text-muted-foreground mt-1">最后活跃: 2023年12月15日</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      移除
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">刷新</Button>
              <Button variant="destructive">移除所有其他设备</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>安全通知</CardTitle>
              <CardDescription>管理您接收的安全相关通知。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">登录通知</div>
                  <div className="text-sm text-muted-foreground">当有新设备登录您的账号时通知您</div>
                </div>
                <Switch checked={loginNotifications} onCheckedChange={setLoginNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">安全警报</div>
                  <div className="text-sm text-muted-foreground">当检测到可疑活动时通知您</div>
                </div>
                <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
              </div>

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>安全警报</AlertTitle>
                <AlertDescription>我们强烈建议保持安全警报开启，以便及时发现并处理可能的安全问题。</AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => {
                  toast({
                    title: "设置已保存",
                    description: "您的安全通知设置已更新。",
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

