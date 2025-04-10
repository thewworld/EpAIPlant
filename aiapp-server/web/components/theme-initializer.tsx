"use client"

import { useEffect } from "react"
import { setDarkMode } from "@/lib/theme-utils"

export function ThemeInitializer() {
  useEffect(() => {
    // Use a timeout to ensure this runs after React has fully initialized
    const timer = setTimeout(() => {
      try {
        // Check if there's a stored preference, otherwise default to light mode
        const storedPreference = localStorage.getItem("darkMode")
        const isDark = storedPreference ? storedPreference === "true" : false
        setDarkMode(isDark)
      } catch (e) {
        console.error("Error initializing theme", e)
        // Default to light mode on error
        setDarkMode(false)
      }
    }, 100) // Small delay to ensure React is ready

    return () => clearTimeout(timer)
  }, [])

  return null
}

