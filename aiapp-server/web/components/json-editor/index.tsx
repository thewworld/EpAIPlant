"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

interface JsonEditorProps {
  value?: string
  onChange?: (value: string) => void
  readOnly?: boolean
}

export function JsonEditor({ value = "{}", onChange, readOnly = false }: JsonEditorProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)

    try {
      // Validate JSON
      JSON.parse(newValue)
      setError(null)
      if (onChange) {
        onChange(newValue)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(internalValue)
      const formatted = JSON.stringify(parsed, null, 2)
      setInternalValue(formatted)
      setError(null)
      if (onChange) {
        onChange(formatted)
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          value={internalValue}
          onChange={handleChange}
          readOnly={readOnly}
          className="font-mono text-sm h-[400px] resize-none"
          placeholder="{}"
        />
        {!readOnly && (
          <button
            type="button"
            onClick={formatJson}
            className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs"
          >
            Format
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">Error: {error}</p>}
    </div>
  )
} 