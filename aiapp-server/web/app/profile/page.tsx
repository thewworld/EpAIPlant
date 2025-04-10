"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Building, Briefcase, MapPin, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    organization: "",
    position: "",
    location: "",
    bio: "",
    joinDate: "",
    avatar: "",
  })

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(userData)

  useEffect(() => {
    // 从本地存储获取用户数据
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        // 补充模拟数据
        const enhancedUser = {
          ...parsedUser,
          email: parsedUser.email || "user@example.com",
          phone: parsedUser.phone || "138****1234",
          organization: parsedUser.organization || "某大学/研究机构",
          position: parsedUser.position || "研究员",
          location: "北京市",
          bio: "这是一段个人简介，描述了用户的研究方向、兴趣爱好等信息。",
          joinDate: "2023年10月",
          avatar: "",
        }
        setUserData(enhancedUser)
        setFormData(enhancedUser)
      } catch (error) {
        console.error("解析用户数据失败:", error)
      }
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = () => {
    // 保存用户数据到本地存储
    const updatedUser = { ...userData, ...formData }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUserData(updatedUser)
    setIsEditing(false)

    toast({
      title: "个人资料已更新",
      description: "您的个人资料已成功保存。",
      duration: 3000,
    })
  }

  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  return (
    <UserSpaceLayout title="个人资料管理">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">基本资料</TabsTrigger>
          <TabsTrigger value="account">账号信息</TabsTrigger>
          <TabsTrigger value="avatar">头像设置</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>基本资料</CardTitle>
              <CardDescription>管理您的个人基本信息，这些信息可能会显示在平台的其他位置。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                // 编辑模式
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">姓名</Label>
                      <div className="relative">
                        <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          name="name"
                          placeholder="请输入您的姓名"
                          className="pl-8"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">邮箱</Label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="请输入您的邮箱"
                          className="pl-8"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">手机号</Label>
                      <div className="relative">
                        <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="请输入您的手机号"
                          className="pl-8"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="organization">所属机构</Label>
                      <div className="relative">
                        <Building className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="organization"
                          name="organization"
                          placeholder="请输入您的所属机构"
                          className="pl-8"
                          value={formData.organization}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">职位</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="position"
                          name="position"
                          placeholder="请输入您的职位"
                          className="pl-8"
                          value={formData.position}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">所在地</Label>
                      <div className="relative">
                        <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="请输入您的所在地"
                          className="pl-8"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">个人简介</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="请输入您的个人简介"
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                </>
              ) : (
                // 查看模式
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-lg">{userData.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-medium">{userData.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {userData.position} @ {userData.organization}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">邮箱</p>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {userData.email}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">手机号</p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {userData.phone}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">所属机构</p>
                      <p className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        {userData.organization}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">职位</p>
                      <p className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {userData.position}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">所在地</p>
                      <p className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {userData.location}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">加入时间</p>
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {userData.joinDate}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">个人简介</p>
                    <p className="text-sm">{userData.bio}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    取消
                  </Button>
                  <Button onClick={handleSave}>保存</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>编辑资料</Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>账号信息</CardTitle>
              <CardDescription>查看您的账号基本信息和状态。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">账号ID</p>
                  <p>USER_123456</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">账号状态</p>
                  <p className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    正常
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">账号类型</p>
                  <p>个人账号</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">账号等级</p>
                  <p>免费版</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">注册时间</p>
                  <p>2023年10月15日</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">最后登录</p>
                  <p>2023年12月20日 10:30</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                升级账号
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="avatar">
          <Card>
            <CardHeader>
              <CardTitle>头像设置</CardTitle>
              <CardDescription>上传或更新您的个人头像。</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6 space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={userData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-4xl">{userData.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>

              <div className="flex gap-2">
                <Button variant="outline">上传新头像</Button>
                <Button variant="destructive">删除头像</Button>
              </div>

              <p className="text-sm text-muted-foreground text-center max-w-md">
                支持JPG、PNG格式，文件大小不超过2MB。上传后的头像将显示在您的个人资料和评论中。
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </UserSpaceLayout>
  )
}

