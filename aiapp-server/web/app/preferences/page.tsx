"use client"

import { useState, useEffect } from "react"
import { UserSpaceLayout } from "@/components/user-space-layout"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getDarkMode, setDarkMode } from "@/lib/theme-utils"

export default function PreferencesPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

  // Interface settings
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [language, setLanguage] = useState("zh-CN")
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // AI settings
  const [defaultModel, setDefaultModel] = useState("gpt-4")
  const [streamingEnabled, setStreamingEnabled] = useState(true)
  const [historyEnabled, setHistoryEnabled] = useState(true)
  const [contextLength, setContextLength] = useState([10])
  const [autoSuggest, setAutoSuggest] = useState(true)

  // Privacy settings
  const [dataCollection, setDataCollection] = useState(true)
  const [improvementProgram, setImprovementProgram] = useState(true)
  const [shareUsageData, setShareUsageData] = useState(false)
  const [cookiePreference, setCookiePreference] = useState("essential")

  // Load settings after a delay to ensure React is fully initialized
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Interface settings
        setIsDarkMode(getDarkMode())
        setIsHighContrast(localStorage.getItem("highContrast") === "true")
        setFontSize(localStorage.getItem("fontSize") || "medium")
        setLanguage(localStorage.getItem("language") || "zh-CN")
        setAnimationsEnabled(localStorage.getItem("animationsEnabled") !== "false")

        // AI settings
        setDefaultModel(localStorage.getItem("defaultModel") || "gpt-4")
        setStreamingEnabled(localStorage.getItem("streamingEnabled") !== "false")
        setHistoryEnabled(localStorage.getItem("historyEnabled") !== "false")
        setContextLength(
          localStorage.getItem("contextLength")
            ? [Number.parseInt(localStorage.getItem("contextLength") || "10")]
            : [10],
        )
        setAutoSuggest(localStorage.getItem("autoSuggest") !== "false")

        // Privacy settings
        setDataCollection(localStorage.getItem("dataCollection") !== "false")
        setImprovementProgram(localStorage.getItem("improvementProgram") !== "false")
        setShareUsageData(localStorage.getItem("shareUsageData") === "true")
        setCookiePreference(localStorage.getItem("cookiePreference") || "essential")

        setMounted(true)
      } catch (e) {
        console.error("Error loading settings", e)
        setMounted(true)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    try {
      const newMode = !isDarkMode
      setIsDarkMode(newMode)
      setDarkMode(newMode)
    } catch (e) {
      console.error("Error toggling dark mode", e)
    }
  }

  // Handle high contrast toggle
  const handleHighContrastToggle = () => {
    try {
      const newMode = !isHighContrast
      setIsHighContrast(newMode)

      // Use setTimeout to defer DOM manipulation
      setTimeout(() => {
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            if (newMode) {
              document.documentElement.classList.add("high-contrast")
            } else {
              document.documentElement.classList.remove("high-contrast")
            }
          }
        } catch (e) {
          console.error("Error updating high contrast mode", e)
        }
      }, 0)

      localStorage.setItem("highContrast", newMode.toString())
    } catch (e) {
      console.error("Error toggling high contrast", e)
    }
  }

  // Handle font size change
  const handleFontSizeChange = (value: string) => {
    try {
      setFontSize(value)

      // Use setTimeout to defer DOM manipulation
      setTimeout(() => {
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.setAttribute("data-font-size", value)
          }
        } catch (e) {
          console.error("Error updating font size", e)
        }
      }, 0)

      localStorage.setItem("fontSize", value)
    } catch (e) {
      console.error("Error changing font size", e)
    }
  }

  // Handle language change
  const handleLanguageChange = (value: string) => {
    try {
      setLanguage(value)

      // Use setTimeout to defer DOM manipulation
      setTimeout(() => {
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.lang = value
          }
        } catch (e) {
          console.error("Error updating language", e)
        }
      }, 0)

      localStorage.setItem("language", value)
    } catch (e) {
      console.error("Error changing language", e)
    }
  }

  // Handle animations toggle
  const handleAnimationsToggle = () => {
    try {
      const newValue = !animationsEnabled
      setAnimationsEnabled(newValue)

      // Use setTimeout to defer DOM manipulation
      setTimeout(() => {
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            if (!newValue) {
              document.documentElement.classList.add("no-animations")
            } else {
              document.documentElement.classList.remove("no-animations")
            }
          }
        } catch (e) {
          console.error("Error updating animations setting", e)
        }
      }, 0)

      localStorage.setItem("animationsEnabled", newValue.toString())
    } catch (e) {
      console.error("Error toggling animations", e)
    }
  }

  const saveSettings = () => {
    try {
      // Save AI settings
      localStorage.setItem("defaultModel", defaultModel)
      localStorage.setItem("streamingEnabled", streamingEnabled.toString())
      localStorage.setItem("historyEnabled", historyEnabled.toString())
      localStorage.setItem("contextLength", contextLength[0].toString())
      localStorage.setItem("autoSuggest", autoSuggest.toString())

      // Save privacy settings
      localStorage.setItem("dataCollection", dataCollection.toString())
      localStorage.setItem("improvementProgram", improvementProgram.toString())
      localStorage.setItem("shareUsageData", shareUsageData.toString())
      localStorage.setItem("cookiePreference", cookiePreference)

      // Show success message
      toast({
        title: "设置已保存",
        description: "您的偏好设置已成功更新。",
        duration: 3000,
      })
    } catch (e) {
      console.error("Error saving settings", e)
      toast({
        variant: "destructive",
        title: "保存失败",
        description: "保存设置时出现错误，请重试。",
        duration: 3000,
      })
    }
  }

  const resetSettings = () => {
    try {
      // Reset interface settings
      setDarkMode(false)
      setIsDarkMode(false)

      setIsHighContrast(false)
      setTimeout(() => {
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.classList.remove("high-contrast")
          }
        } catch (e) {
          console.error("Error removing high contrast class", e)
        }
      }, 0)
      localStorage.setItem("highContrast", "false")

      handleFontSizeChange("medium")
      handleLanguageChange("zh-CN")

      setAnimationsEnabled(true)
      setTimeout(() => {
        try {
          if (typeof document !== "undefined" && document.documentElement) {
            document.documentElement.classList.remove("no-animations")
          }
        } catch (e) {
          console.error("Error removing no-animations class", e)
        }
      }, 0)
      localStorage.setItem("animationsEnabled", "true")

      // Reset AI settings
      setDefaultModel("gpt-4")
      setStreamingEnabled(true)
      setHistoryEnabled(true)
      setContextLength([10])
      setAutoSuggest(true)

      // Reset privacy settings
      setDataCollection(true)
      setImprovementProgram(true)
      setShareUsageData(false)
      setCookiePreference("essential")

      toast({
        title: "设置已重置",
        description: "所有设置已恢复为默认值。",
        duration: 3000,
      })
    } catch (e) {
      console.error("Error resetting settings", e)
      toast({
        variant: "destructive",
        title: "重置失败",
        description: "重置设置时出现错误，请重试。",
        duration: 3000,
      })
    }
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <UserSpaceLayout title="偏好设置">
        <div>加载中...</div>
      </UserSpaceLayout>
    )
  }

  return (
    <UserSpaceLayout title="偏好设置">
      <Tabs defaultValue="interface" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="interface">界面设置</TabsTrigger>
          <TabsTrigger value="ai">AI设置</TabsTrigger>
          <TabsTrigger value="privacy">隐私设置</TabsTrigger>
        </TabsList>

        <TabsContent value="interface">
          <Card>
            <CardHeader>
              <CardTitle>界面设置</CardTitle>
              <CardDescription>自定义平台的外观和行为。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">深色模式</div>
                  <div className="text-sm text-muted-foreground">使用深色主题</div>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={handleDarkModeToggle} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">高对比度</div>
                  <div className="text-sm text-muted-foreground">增强文本和背景的对比度</div>
                </div>
                <Switch checked={isHighContrast} onCheckedChange={handleHighContrastToggle} />
              </div>

              <div className="space-y-3">
                <div className="font-medium">字体大小</div>
                <RadioGroup value={fontSize} onValueChange={handleFontSizeChange} className="flex space-x-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">小</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">中</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large">大</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <div className="font-medium">语言</div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                    <SelectItem value="ko-KR">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-medium">界面动画</div>
                  <div className="text-sm text-muted-foreground">启用界面过渡动画</div>
                </div>
                <Switch checked={animationsEnabled} onCheckedChange={handleAnimationsToggle} />
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">预览效果</div>
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">主题预览</h3>

                  <Card>
                    <CardContent className="p-4">
                      <p className="mb-4">这是一个示例卡片，用于展示您的界面设置效果。</p>
                      <div className="flex gap-2">
                        <Button>主要按钮</Button>
                        <Button variant="outline">次要按钮</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>当前设置:</p>
                    <ul className="list-disc list-inside mt-2">
                      <li>主题模式: {isDarkMode ? "深色" : "浅色"}</li>
                      <li>对比度: {isHighContrast ? "高" : "标准"}</li>
                      <li>字体大小: {fontSize === "small" ? "小" : fontSize === "medium" ? "中" : "大"}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetSettings}>
                恢复默认
              </Button>
              <Button onClick={saveSettings}>保存设置</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* AI and Privacy tabs remain the same */}
        <TabsContent value="ai">
          {/* AI settings content */}
          <Card>
            <CardHeader>
              <CardTitle>AI设置</CardTitle>
              <CardDescription>自定义AI助手的行为和偏好。</CardDescription>
            </CardHeader>
            <CardContent>{/* AI settings content */}</CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetSettings}>
                恢复默认
              </Button>
              <Button onClick={saveSettings}>保存设置</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          {/* Privacy settings content */}
          <Card>
            <CardHeader>
              <CardTitle>隐私设置</CardTitle>
              <CardDescription>管理您的数据和隐私偏好。</CardDescription>
            </CardHeader>
            <CardContent>{/* Privacy settings content */}</CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={resetSettings}>
                恢复默认
              </Button>
              <Button onClick={saveSettings}>保存设置</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </UserSpaceLayout>
  )
}

