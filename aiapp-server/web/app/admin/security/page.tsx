import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Shield, Lock, Key, UserCheck, AlertTriangle, Clock, Eye } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">安全设置</h1>
          <p className="text-gray-500">管理平台安全策略和访问控制</p>
        </div>
        <Button>保存更改</Button>
      </div>

      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="password">密码策略</TabsTrigger>
          <TabsTrigger value="login">登录安全</TabsTrigger>
          <TabsTrigger value="access">访问控制</TabsTrigger>
          <TabsTrigger value="audit">安全审计</TabsTrigger>
          <TabsTrigger value="encryption">数据加密</TabsTrigger>
        </TabsList>

        <TabsContent value="password">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  密码复杂度要求
                </CardTitle>
                <CardDescription>设置密码的最低复杂度要求，提高账户安全性</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>最小密码长度</Label>
                    <div className="text-sm text-gray-500">密码至少需要包含的字符数</div>
                  </div>
                  <div className="w-60">
                    <Slider defaultValue={[8]} max={20} min={6} step={1} />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>6</span>
                      <span>8</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>要求包含大写字母</Label>
                    <div className="text-sm text-gray-500">密码必须包含至少一个大写字母</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>要求包含数字</Label>
                    <div className="text-sm text-gray-500">密码必须包含至少一个数字</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>要求包含特殊字符</Label>
                    <div className="text-sm text-gray-500">密码必须包含至少一个特殊字符</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  密码过期策略
                </CardTitle>
                <CardDescription>设置密码有效期和历史记录限制</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用密码过期</Label>
                    <div className="text-sm text-gray-500">定期要求用户更改密码</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>密码有效期（天）</Label>
                    <div className="text-sm text-gray-500">密码需要更改的时间间隔</div>
                  </div>
                  <Select defaultValue="90">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择天数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30天</SelectItem>
                      <SelectItem value="60">60天</SelectItem>
                      <SelectItem value="90">90天</SelectItem>
                      <SelectItem value="180">180天</SelectItem>
                      <SelectItem value="365">365天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>密码历史记录</Label>
                    <div className="text-sm text-gray-500">禁止重复使用最近使用过的密码数量</div>
                  </div>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择数量" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3个</SelectItem>
                      <SelectItem value="5">5个</SelectItem>
                      <SelectItem value="10">10个</SelectItem>
                      <SelectItem value="15">15个</SelectItem>
                      <SelectItem value="20">20个</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="login">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  登录保护
                </CardTitle>
                <CardDescription>设置登录尝试限制和账户锁定策略</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用账户锁定</Label>
                    <div className="text-sm text-gray-500">多次登录失败后锁定账户</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>最大登录尝试次数</Label>
                    <div className="text-sm text-gray-500">锁定账户前允许的失败登录尝试次数</div>
                  </div>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择次数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3次</SelectItem>
                      <SelectItem value="5">5次</SelectItem>
                      <SelectItem value="10">10次</SelectItem>
                      <SelectItem value="15">15次</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>账户锁定时长（分钟）</Label>
                    <div className="text-sm text-gray-500">账户被锁定的持续时间</div>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择时长" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15分钟</SelectItem>
                      <SelectItem value="30">30分钟</SelectItem>
                      <SelectItem value="60">1小时</SelectItem>
                      <SelectItem value="1440">24小时</SelectItem>
                      <SelectItem value="0">永久（需手动解锁）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  双因素认证
                </CardTitle>
                <CardDescription>配置双因素认证要求，增强账户安全性</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用双因素认证</Label>
                    <div className="text-sm text-gray-500">要求用户使用双因素认证登录</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>双因素认证方式</Label>
                    <div className="text-sm text-gray-500">选择支持的认证方式</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="2fa-app" defaultChecked />
                      <Label htmlFor="2fa-app">认证应用（TOTP）</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="2fa-sms" defaultChecked />
                      <Label htmlFor="2fa-sms">短信验证码</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="2fa-email" defaultChecked />
                      <Label htmlFor="2fa-email">邮件验证码</Label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>强制管理员使用双因素认证</Label>
                    <div className="text-sm text-gray-500">管理员账户必须启用双因素认证</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5" />
                  IP访问控制
                </CardTitle>
                <CardDescription>限制可以访问管理平台的IP地址</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用IP访问控制</Label>
                    <div className="text-sm text-gray-500">限制只有特定IP地址可以访问平台</div>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <Label>允许的IP地址/范围</Label>
                  <div className="text-sm text-gray-500 mb-2">每行输入一个IP地址或CIDR范围</div>
                  <div className="relative">
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="例如：
192.168.1.1
10.0.0.0/24
2001:db8::/64"
                      disabled
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-70 rounded-md">
                      <div className="text-sm text-gray-500">启用IP访问控制后可编辑</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  访问时间限制
                </CardTitle>
                <CardDescription>限制可以访问管理平台的时间段</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用访问时间限制</Label>
                    <div className="text-sm text-gray-500">限制只有在特定时间段内可以访问平台</div>
                  </div>
                  <Switch />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>允许访问的开始时间</Label>
                    <Input type="time" value="09:00" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>允许访问的结束时间</Label>
                    <Input type="time" value="18:00" disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>允许访问的星期</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-sm">{day}</div>
                        <Switch disabled checked={index < 5} />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  安全审计日志
                </CardTitle>
                <CardDescription>配置安全相关操作的审计日志记录</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>记录登录尝试</Label>
                    <div className="text-sm text-gray-500">记录所有成功和失败的登录尝试</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>记录权限变更</Label>
                    <div className="text-sm text-gray-500">记录用户权限的所有变更</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>记录配置修改</Label>
                    <div className="text-sm text-gray-500">记录系统配置的所有修改</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>记录数据访问</Label>
                    <div className="text-sm text-gray-500">记录敏感数据的所有访问</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>审计日志保留期限（天）</Label>
                    <div className="text-sm text-gray-500">审计日志保存的时间长度</div>
                  </div>
                  <Select defaultValue="180">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择天数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30天</SelectItem>
                      <SelectItem value="90">90天</SelectItem>
                      <SelectItem value="180">180天</SelectItem>
                      <SelectItem value="365">365天</SelectItem>
                      <SelectItem value="730">2年</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  数据加密设置
                </CardTitle>
                <CardDescription>配置敏感数据的加密策略</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用数据库加密</Label>
                    <div className="text-sm text-gray-500">对数据库中的敏感数据进行加密存储</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用传输加密</Label>
                    <div className="text-sm text-gray-500">确保所有数据传输使用TLS/SSL加密</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>加密算法</Label>
                    <div className="text-sm text-gray-500">选择用于数据加密的算法</div>
                  </div>
                  <Select defaultValue="aes-256">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择算法" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aes-128">AES-128</SelectItem>
                      <SelectItem value="aes-256">AES-256</SelectItem>
                      <SelectItem value="chacha20">ChaCha20</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>密钥轮换周期（天）</Label>
                    <div className="text-sm text-gray-500">自动更换加密密钥的时间间隔</div>
                  </div>
                  <Select defaultValue="90">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择天数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30天</SelectItem>
                      <SelectItem value="90">90天</SelectItem>
                      <SelectItem value="180">180天</SelectItem>
                      <SelectItem value="365">365天</SelectItem>
                      <SelectItem value="0">不自动轮换</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-5 w-5" />
                  敏感数据掩码
                </CardTitle>
                <CardDescription>配置敏感数据在界面上的显示方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用API密钥掩码</Label>
                    <div className="text-sm text-gray-500">在界面上部分隐藏API密钥</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用用户信息掩码</Label>
                    <div className="text-sm text-gray-500">在界面上部分隐藏用户敏感信息</div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>掩码方式</Label>
                    <div className="text-sm text-gray-500">选择敏感数据的掩码显示方式</div>
                  </div>
                  <Select defaultValue="partial">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="选择掩码方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="partial">部分显示（如：****1234）</SelectItem>
                      <SelectItem value="full">完全隐藏（如：********）</SelectItem>
                      <SelectItem value="custom">自定义掩码</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
