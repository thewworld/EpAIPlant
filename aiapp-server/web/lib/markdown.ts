import { marked } from "marked"
import DOMPurify from "dompurify"

// 配置marked选项
marked.setOptions({
  breaks: true, // 将换行符转换为<br>
  gfm: true, // 使用GitHub风格的Markdown
})

// 渲染Markdown为HTML
export function renderMarkdown(markdown: string): string {
  // 将Markdown转换为HTML
  const html = marked(markdown)

  // 使用DOMPurify清理HTML以防止XSS攻击
  const cleanHtml = DOMPurify.sanitize(html)

  return cleanHtml
}

