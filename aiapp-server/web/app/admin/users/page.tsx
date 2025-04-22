import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, Filter, Download, Trash2, Edit, UserPlus, Shield, Users, UserCog } from "lucide-react"

export default function UsersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">用户权限管理</h1>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          <span>添加用户</span>
        </Button>
      </div>

      <Tabs defaultValue="users">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>用户管理</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>角色管理</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            <span>权限配置</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input type="search" placeholder="搜索用户名、邮箱或角色..." className="w-full pl-9" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="状态筛选" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部状态</SelectItem>
                      <SelectItem value="active">已激活</SelectItem>
                      <SelectItem value="inactive">未激活</SelectItem>
                      <SelectItem value="locked">已锁定</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    <span>导出</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>用户名</TableHead>
                    <TableHead>邮箱</TableHead>
                    <TableHead>角色</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>最后登录</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="font-medium">admin{i + 1}</TableCell>
                      <TableCell>admin{i + 1}@example.com</TableCell>
                      <TableCell>
                        {i === 0 ? (
                          <Badge className="bg-blue-500">超级管理员</Badge>
                        ) : i === 1 ? (
                          <Badge className="bg-green-500">运维人员</Badge>
                        ) : (
                          <Badge className="bg-orange-500">普通用户</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {i === 3 ? (
                          <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                            未激活
                          </Badge>
                        ) : i === 4 ? (
                          <Badge variant="outline" className="text-red-500 border-red-500">
                            已锁定
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-500 border-green-500">
                            已激活
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date().toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader className="pb-0">
              <div className="flex justify-between items-center">
                <CardTitle>角色列表</CardTitle>
                <Button size="sm" className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>新建角色</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>角色名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>用户数量</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>1</TableCell>
                    <TableCell className="font-medium">超级管理员</TableCell>
                    <TableCell>拥有系统所有权限</TableCell>
                    <TableCell>1</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell className="font-medium">运维人员</TableCell>
                    <TableCell>负责系统运维和监控</TableCell>
                    <TableCell>2</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell className="font-medium">普通用户</TableCell>
                    <TableCell>基础功能访问权限</TableCell>
                    <TableCell>10</TableCell>
                    <TableCell>{new Date().toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>权限配置</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { name: "应用管理", permissions: ["查看应用", "创建应用", "编辑应用", "删除应用", "导出应用"] },
                  { name: "用户管理", permissions: ["查看用户", "创建用户", "编辑用户", "删除用户", "重置密码"] },
                  { name: "系统设置", permissions: ["查看设置", "修改设置", "系统备份", "系统恢复"] },
                  { name: "监控告警", permissions: ["查看监控", "配置告警", "处理告警", "告警历史"] },
                ].map((module, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">{module.name}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {module.permissions.map((permission, j) => (
                        <div key={j} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`permission-${i}-${j}`}
                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                            defaultChecked={j < 2}
                          />
                          <label htmlFor={`permission-${i}-${j}`} className="text-sm font-medium text-gray-700">
                            {permission}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button>保存配置</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
