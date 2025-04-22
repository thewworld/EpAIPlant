"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface MonacoEditorProps {
  language?: string
  value?: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function MonacoEditor({ language = "json", value = "{}", onChange, readOnly = false }: MonacoEditorProps) {
  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [monaco, setMonaco] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 配置 Monaco 编辑器的全局环境
      if (!window.MonacoEnvironment) {
        window.MonacoEnvironment = {
          getWorkerUrl: function (moduleId, label) {
            // 使用一个通用的 worker 而不是特定语言的 worker
            return '/monaco-editor-worker.js';
          }
        };
      }

      // Import both monaco-editor core and the language contributions
      Promise.all([
        import("monaco-editor/esm/vs/editor/editor.api"),
        import("monaco-editor/esm/vs/language/json/monaco.contribution"),
      ])
        .then(([monacoEditor]) => {
          setMonaco(monacoEditor)
          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Failed to load Monaco Editor:", error)
          setIsLoading(false)
        })
    }
  }, [])

  useEffect(() => {
    if (monaco && containerRef.current && !editorRef.current) {
      try {
        // Ensure the language exists
        if (language === "json" && !monaco.languages.getLanguages().some((lang: any) => lang.id === "json")) {
          console.warn("JSON language not registered, falling back to plaintext")
          language = "plaintext"
        }

        // 禁用 Web Worker 以避免相关错误
        monaco.languages.json.jsonDefaults.setModeConfiguration({
          documentFormattingEdits: false,
          documentRangeFormattingEdits: false,
          completionItems: true,
          hovers: true,
          documentSymbols: false,
          tokens: true,
          colors: false,
          foldingRanges: true,
          diagnostics: false // 关闭需要worker的诊断功能
        });

        editorRef.current = monaco.editor.create(containerRef.current, {
          value,
          language,
          theme: "vs",
          automaticLayout: true,
          minimap: {
            enabled: false,
          },
          scrollBeyondLastLine: false,
          readOnly,
          fontSize: 14,
          lineNumbers: "on",
          renderLineHighlight: "all",
          roundedSelection: true,
          selectOnLineNumbers: true,
          wordWrap: "on",
        })

        if (onChange) {
          editorRef.current.onDidChangeModelContent(() => {
            onChange(editorRef.current.getValue())
          })
        }
      } catch (error) {
        console.error("Error creating Monaco editor:", error)
      }
    }

    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.dispose()
        } catch (error) {
          console.error("Error disposing Monaco editor:", error)
        }
        editorRef.current = null
      }
    }
  }, [monaco, language, readOnly, onChange])

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      try {
        editorRef.current.setValue(value)
      } catch (error) {
        console.error("Error setting Monaco editor value:", error)
      }
    }
  }, [value])

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      <div ref={containerRef} className="h-full w-full" />
    </div>
  )
} 