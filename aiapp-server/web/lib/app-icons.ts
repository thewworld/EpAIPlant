// 创建一个集中管理应用图标的文件
// 这些图标使用内联SVG，避免依赖外部文件

export const AppIcons = {
  // 科研类图标
  paperOutline: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>`,

  findPapers: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    <path d="M11 8v6"></path>
    <path d="M8 11h6"></path>
  </svg>`,

  researchAssistant: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="22"></line>
    <line x1="8" y1="22" x2="16" y2="22"></line>
  </svg>`,

  dataAnalysis: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 3v18h18"></path>
    <path d="M18 17V9"></path>
    <path d="M13 17V5"></path>
    <path d="M8 17v-3"></path>
  </svg>`,

  experimentDesign: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ec4899" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 2v6l3 3 3-3V2"></path>
    <path d="M12 11v9"></path>
    <path d="M5 22h14"></path>
    <path d="M5 14h14"></path>
  </svg>`,

  citationManager: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
    <path d="m8 7 2 2 4-4"></path>
    <path d="M8 13h4"></path>
  </svg>`,

  // 办公类图标
  pptOutline: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 3h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2z"></path>
    <path d="M6 13v8"></path>
    <path d="M14 3h8a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-8z"></path>
    <path d="M18 13v8"></path>
  </svg>`,

  // 健康类图标
  aiDoctor: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
  </svg>`,

  // 用户头像图标
  userAvatar: `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="20" fill="#3B82F6" />
    <path d="M20 10C17.7909 10 16 11.7909 16 14C16 16.2091 17.7909 18 20 18C22.2091 18 24 16.2091 24 14C24 11.7909 22.2091 10 20 10Z" fill="white" />
    <path d="M12 26.5C12 22.9101 15.4101 20 19.5 20C23.5899 20 27 22.9101 27 26.5V30H12V26.5Z" fill="white" />
  </svg>`,

  // 默认图标
  defaultApp: `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
    <line x1="9" y1="9" x2="15" y2="15"></line>
    <line x1="15" y1="9" x2="9" y2="15"></line>
  </svg>`,
}

// 根据应用ID获取图标
export function getAppIconById(id: string): string {
  if (!id) {
    return AppIcons.defaultApp
  }

  switch (id) {
    case "paper-outline-generator":
      return AppIcons.paperOutline
    case "find-papers":
      return AppIcons.findPapers
    case "research-assistant":
      return AppIcons.researchAssistant
    case "data-analysis":
      return AppIcons.dataAnalysis
    case "experiment-design":
      return AppIcons.experimentDesign
    case "citation-manager":
      return AppIcons.citationManager
    case "ppt-outline":
      return AppIcons.pptOutline
    case "ai-doctor":
      return AppIcons.aiDoctor
    default:
      return AppIcons.defaultApp
  }
}

// 获取用户头像图标
export function getUserAvatarIcon(): string {
  return AppIcons.userAvatar
}

// 将SVG字符串转换为Data URL
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

