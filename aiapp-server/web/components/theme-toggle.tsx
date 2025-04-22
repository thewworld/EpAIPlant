"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getDarkMode, toggleDarkMode } from "@/lib/theme-utils"

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Initialize state on mount with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setIsDarkMode(getDarkMode())
        setMounted(true)
      } catch (e) {
        console.error("Error getting dark mode state", e)
        setMounted(true)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleToggle = () => {
    try {
      const newMode = toggleDarkMode()
      setIsDarkMode(newMode)
    } catch (e) {
      console.error("Error toggling dark mode", e)
    }
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-9 h-9" /> // Placeholder with same dimensions
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle} title={isDarkMode ? "切换到浅色模式" : "切换到深色模式"}>
      {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      <span className="sr-only">{isDarkMode ? "切换到浅色模式" : "切换到深色模式"}</span>
    </Button>
  )
}

