"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FieldType, type FormField } from "@/types/app-config"
import { Paperclip, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 添加上传文件类型定义
interface UploadedFile {
  id: string // Temporary frontend ID or server ID after upload
  name: string
  type: string
  size: number
  url?: string // Local preview URL (optional)
  preview?: string // Local image preview URL (optional)
  uploadFileId?: string // Server-provided ID after successful upload
  uploading?: boolean
  error?: string
}

interface DynamicFormProps {
  fields: FormField[]
  submitButtonText: string
  resetButtonText: string
  onSubmit: (formData: Record<string, any>) => void
  onReset: () => void
  isSubmitting?: boolean
  className?: string
  onFileUpload?: (fieldId: string, file: File) => Promise<UploadedFile | null>
  onRemoveFile?: (fieldId: string, fileId: string) => void
  hideSubmitButton?: boolean
  onFieldChange?: (fieldData: Record<string, any>) => void
}

export function DynamicForm({
  fields,
  submitButtonText,
  resetButtonText,
  onSubmit,
  onReset,
  isSubmitting = false,
  className,
  onFileUpload,
  onRemoveFile,
  hideSubmitButton,
  onFieldChange,
}: DynamicFormProps) {
  // 初始化表单数据
  const initialFormData = fields.reduce(
    (acc, field) => {
      acc[field.id] = field.defaultValue !== undefined ? field.defaultValue : ""
      return acc
    },
    {} as Record<string, any>,
  )

  const [formData, setFormData] = useState<Record<string, any>>(initialFormData)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFile[]>>({})
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  // 处理表单重置
  const handleReset = () => {
    setFormData(initialFormData)
    setUploadedFiles({})
    onReset()
  }

  // 处理表单字段变化
  const handleChange = (id: string, value: any) => {
    const updatedData = { ...formData, [id]: value };
    setFormData(updatedData);
    
    // 如果提供了onFieldChange回调，通知父组件
    if (onFieldChange) {
      onFieldChange({ [id]: value });
    }
  }

  // 处理文件上传
  const handleFileUploadInternal = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !onFileUpload) return

    const currentFiles = uploadedFiles[id] || []
    let newUploadedFilesInfo: UploadedFile[] = [...currentFiles];

    // Upload files one by one
    for (const file of Array.from(files)) {
      // Call the upload function passed via props
      const result = await onFileUpload(id, file)
      if (result) {
        // Add successful upload result to state for this field
        newUploadedFilesInfo.push(result);
      } else {
        // Optionally handle the case where upload returns null (e.g., show temporary error)
        // For simplicity, we rely on the onFileUpload prop to update state with error/progress
      }
    }
    
    // Update the central uploadedFiles state
    setUploadedFiles(prev => ({
        ...prev,
        [id]: newUploadedFilesInfo
    }));

    // Update formData: Store the UploadedFile objects
    const updatedFormData = {
      ...formData,
      [id]: newUploadedFilesInfo, // Store the array of UploadedFile objects
    };
    setFormData(updatedFormData);

    // 通知父组件文件字段变化
    if (onFieldChange) {
      onFieldChange({ [id]: newUploadedFilesInfo });
    }

    // Clear file input
    e.target.value = ""
  }

  // 移除上传的文件
  const removeFileInternal = (fieldId: string, fileId: string) => {
    // Update local state for immediate UI feedback
    setUploadedFiles((prev) => {
      const fieldFiles = prev[fieldId] || []
      const filtered = fieldFiles.filter((file) => file.id !== fileId)
      return {
        ...prev,
        [fieldId]: filtered,
      }
    })
     // Update formData
    const updatedFiles = (formData[fieldId] || []).filter((file: UploadedFile) => file.id !== fileId);
    const updatedFormData = {
      ...formData,
      [fieldId]: updatedFiles,
    };
    setFormData(updatedFormData);

    // 通知父组件文件被移除
    if (onFieldChange) {
      onFieldChange({ [fieldId]: updatedFiles });
    }

    // Call the remove function passed via props (if provided)
    if (onRemoveFile) {
      onRemoveFile(fieldId, fileId)
    }
  }

  // 渲染表单字段
  const renderField = (field: FormField) => {
    const { id, type, label, placeholder, required, options, min, max, step, helperText, accept, tip } = field

    switch (type) {
      case FieldType.TEXT:
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={id}
              name={id}
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
              required={required}
            />
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      case FieldType.TEXTAREA:
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={id}
              name={id}
              placeholder={placeholder}
              value={formData[id] || ""}
              onChange={(e) => handleChange(id, e.target.value)}
              required={required}
              rows={4}
            />
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      case FieldType.SELECT:
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={formData[id] || ""} onValueChange={(value) => handleChange(id, value)}>
              <SelectTrigger id={id}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value.toString()} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      case FieldType.RADIO:
        return (
          <div className="space-y-2" key={id}>
            <Label>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={formData[id] || ""}
              onValueChange={(value) => handleChange(id, value)}
              className="flex flex-wrap gap-4"
            >
              {options?.map((option) => (
                <div key={option.value.toString()} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value.toString()} id={`${id}-${option.value}`} />
                  <Label htmlFor={`${id}-${option.value}`} className="font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      case FieldType.CHECKBOX:
        return (
          <div className="space-y-2" key={id}>
            <Label>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex flex-col gap-2">
              {options?.map((option) => {
                const checkboxId = `${id}-${option.value}`
                const isChecked = Array.isArray(formData[id]) ? formData[id].includes(option.value.toString()) : false

                return (
                  <div key={checkboxId} className="flex items-center space-x-2">
                    <Checkbox
                      id={checkboxId}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(formData[id]) ? [...formData[id]] : []
                        const newValues = checked
                          ? [...currentValues, option.value.toString()]
                          : currentValues.filter((v) => v !== option.value.toString())
                        handleChange(id, newValues)
                      }}
                    />
                    <Label htmlFor={checkboxId} className="font-normal">
                      {option.label}
                    </Label>
                  </div>
                )
              })}
            </div>
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      case FieldType.SLIDER:
        return (
          <div className="space-y-2" key={id}>
            <div className="flex justify-between">
              <Label htmlFor={id}>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <span className="text-sm">{formData[id] || min || 0}</span>
            </div>
            <Slider
              id={id}
              min={min || 0}
              max={max || 100}
              step={step || 1}
              value={[formData[id] || min || 0]}
              onValueChange={(values) => handleChange(id, values[0])}
            />
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      case FieldType.FILE:
        // 获取文件字段的特殊属性
        const isFileList = field.originalData && Object.keys(field.originalData).includes('file-list');
        const fileConfig = field.originalData 
          ? (field.originalData.file || field.originalData['file-list'] || {})
          : {};
        const allowedFileTypes = fileConfig.allowed_file_types || [];
        const allowedFileExtensions = fileConfig.allowed_file_extensions || [];
        const fileTypeText = allowedFileTypes.length > 0 
          ? `文件类型: ${allowedFileTypes.join(', ')}` 
          : '';
        const fileExtText = allowedFileExtensions.length > 0 
          ? `文件扩展名: ${allowedFileExtensions.join(', ')}` 
          : '';
        
        return (
          <div className="space-y-2" key={id}>
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            
            {/* 文件上传区域 */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 text-center">
              <input
                type="file"
                id={id}
                name={id}
                className="hidden"
                accept={accept}
                onChange={(e) => handleFileUploadInternal(id, e)}
                ref={(el) => {
                  if (el) {
                    fileInputRefs.current[id] = el
                  } else {
                    delete fileInputRefs.current[id]
                  }
                }}
                multiple={isFileList}
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRefs.current[id]?.click()}
                className="mb-2"
                disabled={isSubmitting}
              >
                <Paperclip className="mr-2 h-4 w-4" />
                {isFileList ? "选择多个文件" : "选择文件"}
              </Button>
              
              {placeholder && <p className="text-sm text-gray-500 dark:text-gray-400">{placeholder}</p>}
              
              {/* 显示文件类型和扩展名限制 */}
              {(fileTypeText || fileExtText) && (
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {fileTypeText && <div>{fileTypeText}</div>}
                  {fileExtText && <div>{fileExtText}</div>}
                </div>
              )}
            </div>
            
            {/* 已上传文件预览 */}
            {uploadedFiles[id] && uploadedFiles[id].length > 0 && (
              <div className="mt-2 space-y-2">
                {uploadedFiles[id].map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      {file.uploading && (
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      )}
                      {file.error && (
                         <TooltipProvider>
                           <Tooltip>
                             <TooltipTrigger>
                                <X className="w-4 h-4 text-red-500 flex-shrink-0" />
                             </TooltipTrigger>
                             <TooltipContent side="top">
                               <p className="text-xs text-red-600">{file.error}</p>
                             </TooltipContent>
                           </Tooltip>
                         </TooltipProvider>
                      )}
                      {!file.uploading && !file.error && (
                        <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate max-w-[200px]" title={file.name}>{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFileInternal(id, file.id)}
                      className="h-6 w-6 p-0"
                      disabled={file.uploading || isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {tip && <p className="text-xs text-muted-foreground">{tip}</p>}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="space-y-4">{fields.map(renderField)}</div>

      <div className="flex gap-2 mt-6 justify-start">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="w-24 border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:border-[#334155] dark:text-gray-300 dark:hover:text-white dark:hover:bg-[#1e293b]"
        >
          {resetButtonText}
        </Button>
        {!hideSubmitButton && (
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-24 bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                处理中...
              </>
            ) : (
              submitButtonText
            )}
          </Button>
        )}
      </div>
    </form>
  )
}

