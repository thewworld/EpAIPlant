// 这个文件包含应用的全局配置常量

// 从环境变量获取 API 地址，如果未设置则使用默认值
// 在 Docker 环境中，可以通过环境变量注入正确的 API 地址
// export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://172.16.3.105:8087'; 
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8087'; 