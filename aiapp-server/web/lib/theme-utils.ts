// Simplified theme utility with minimal functionality
export function setDarkMode(isDark: boolean): void {
  // Defer all DOM operations to ensure they happen after React is fully initialized
  setTimeout(() => {
    try {
      if (typeof document !== "undefined" && document.documentElement) {
        if (isDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }

        try {
          localStorage.setItem("darkMode", isDark ? "true" : "false")
        } catch (e) {
          console.error("Failed to save theme preference", e)
        }
      }
    } catch (e) {
      console.error("Error setting dark mode", e)
    }
  }, 0)
}

export function getDarkMode(): boolean {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return false
  }

  try {
    return localStorage.getItem("darkMode") === "true"
  } catch (e) {
    return false
  }
}

export function toggleDarkMode(): boolean {
  const isDark = getDarkMode()
  setDarkMode(!isDark)
  return !isDark
}

