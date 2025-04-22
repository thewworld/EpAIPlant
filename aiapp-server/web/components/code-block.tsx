"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

export function CodeBlock({ code, language = "json", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative rounded-md border">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
          <div className="text-sm font-medium">{title}</div>
          <Button variant="ghost" size="sm" className="h-8 px-2" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            <span className="ml-2">{copied ? "已复制" : "复制"}</span>
          </Button>
        </div>
      )}
      <pre className={`p-4 overflow-x-auto text-sm ${!title ? "relative" : ""}`}>
        {!title && (
          <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8" onClick={copyToClipboard}>
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </Button>
        )}
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  )
} 