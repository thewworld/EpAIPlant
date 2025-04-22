"use client"

import { useState, useEffect } from "react"

type DeviceType = "mobile" | "tablet" | "desktop"
type OSType = "ios" | "android" | "other"

interface MobileDetection {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  deviceType: DeviceType
  osType: OSType
  isIOS: boolean
  isAndroid: boolean
  isTouchDevice: boolean
  hasSafeArea: boolean
}

export function useMobile(): MobileDetection {
  const [state, setState] = useState<MobileDetection>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    deviceType: "desktop",
    osType: "other",
    isIOS: false,
    isAndroid: false,
    isTouchDevice: false,
    hasSafeArea: false,
  })

  useEffect(() => {
    // 检测设备类型
    const checkDevice = () => {
      if (typeof window === "undefined") return

      // 检测触摸设备
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // 检测操作系统
      const userAgent = navigator.userAgent.toLowerCase()
      const isIOS = /iphone|ipad|ipod/.test(userAgent)
      const isAndroid = /android/.test(userAgent)
      const osType: OSType = isIOS ? "ios" : isAndroid ? "android" : "other"

      // 检测设备类型
      const isMobile = /iphone|ipod|android.*mobile|windows.*phone|blackberry.*mobile/i.test(userAgent)
      const isTablet = !isMobile && /ipad|android|android.*chrome\/[.0-9]* (?!mobile)/i.test(userAgent)
      const isDesktop = !isMobile && !isTablet
      const deviceType: DeviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop"

      // 检测是否有安全区域（刘海屏）
      const hasSafeArea = isIOS && (window.screen.height >= 812 || window.screen.width >= 812) // iPhone X 及以上机型

      setState({
        isMobile,
        isTablet,
        isDesktop,
        deviceType,
        osType,
        isIOS,
        isAndroid,
        isTouchDevice,
        hasSafeArea,
      })
    }

    checkDevice()

    // 监听窗口大小变化
    window.addEventListener("resize", checkDevice)
    return () => window.removeEventListener("resize", checkDevice)
  }, [])

  return state
}

