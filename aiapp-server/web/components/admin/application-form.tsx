"use client"

import type { ReactNode } from "react"
import React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, X, Loader2, Copy, Upload, Eye, EyeOff, RefreshCw, FileText, Play, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { MonacoEditor } from "../monaco-editor"
import { JsonEditor } from "../json-editor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

// 表单配置选项
const APP_CONFIG = {
  categories: [
    { value: "科研", label: "科研" },
    { value: "写作", label: "写作" },
    { value: "管理", label: "管理" },
    { value: "教育", label: "教育" }
  ],
  types: [
    { value: "Chat", label: "对话式应用" },
    { value: "Workflow", label: "工作流应用" },
    { value: "Completion", label: "文本生成应用" }
  ],
  inputTypes: [
    { value: "TEXT", label: "文本" },
    { value: "FILE", label: "附件" }
  ],
  outputTypes: [
    { value: "TEXT", label: "文本" },
    { value: "FILE", label: "附件" }
  ],
  responseModels: [
    { value: "sse", label: "流式响应 (SSE)" },
    { value: "block", label: "阻塞式响应 (Block)" }
  ],
  formFieldTypes: [
    { value: "text", label: "文本输入框" },
    { value: "select", label: "选择框" },
    { value: "number", label: "数字输入框" },
    { value: "file", label: "文件上传" }
  ],
  fieldAttributes: [
    { name: "name", description: "字段名称（必填）" },
    { name: "label", description: "字段标签（必填）" },
    { name: "required", description: "是否必填（布尔值）" },
    { name: "placeholder", description: "输入提示文本" },
    { name: "options", description: "选择框的选项（仅select类型需要）" },
    { name: "min/max", description: "数值范围（仅number类型）" },
    { name: "accept", description: "文件类型限制（仅file类型）" },
    { name: "tip", description: "帮助提示文本" }
  ]
}

// 应用表单默认值
const defaultFormData = {
  name: "",
  description: "",
  category: "",
  type: "Chat",
  inputType: "TEXT",
  outputType: "TEXT",
  chatModel: "sse",
  openerContent: "您好，我是AI助手，有什么可以帮您解决的问题？",
  maxTokens: 2048,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.6,
  formConfig: "",
  apiKey: "",
  logo: "",
  tags: [] as string[],
  status: "active", // 默认为启用状态
}

// AI生成的默认应用模板
const AI_GENERATED_TEMPLATES = {
  "科研": {
    name: "科研助手",
    description: "帮助科研工作者解决文献阅读、实验设计、数据分析等问题的智能助手。可以辅助论文写作、研究方法选择，并提供最新研究趋势参考。",
    openerContent: "您好，我是您的科研助手，可以帮您解决科研过程中的问题，包括文献检索、实验设计、数据分析和论文写作等。请问有什么可以帮您的？",
    category: "科研",
    type: "Chat",
    formConfig: JSON.stringify([
      {
        "name": "research_field",
        "type": "text",
        "label": "研究领域",
        "required": true,
        "placeholder": "请输入您的研究领域，如物理、生物学、计算机科学等"
      },
      {
        "name": "research_stage",
        "type": "select",
        "label": "研究阶段",
        "required": true,
        "options": [
          {
            "label": "文献调研",
            "value": "literature_review"
          },
          {
            "label": "实验设计",
            "value": "experiment_design"
          },
          {
            "label": "数据分析",
            "value": "data_analysis"
          },
          {
            "label": "论文写作",
            "value": "paper_writing"
          }
        ]
      }
    ], null, 2)
  },
  "写作": {
    name: "写作助手",
    description: "一款强大的写作辅助工具，能够帮助用户进行文案创作、内容润色、文章结构优化等。适用于各类写作场景，包括商业文案、学术论文、创意写作等。",
    openerContent: "欢迎使用写作助手！我可以帮您构思创意、润色文章、优化语言表达，让您的文字更加精彩。请告诉我您需要什么类型的写作帮助？",
    category: "写作",
    type: "Chat",
    formConfig: JSON.stringify([
      {
        "name": "content_type",
        "type": "select",
        "label": "内容类型",
        "required": true,
        "options": [
          {
            "label": "商业文案",
            "value": "business"
          },
          {
            "label": "学术论文",
            "value": "academic"
          },
          {
            "label": "创意写作",
            "value": "creative"
          }
        ]
      },
      {
        "name": "style",
        "type": "select",
        "label": "写作风格",
        "required": false,
        "options": [
          {
            "label": "正式",
            "value": "formal"
          },
          {
            "label": "轻松",
            "value": "casual"
          },
          {
            "label": "专业",
            "value": "professional"
          }
        ]
      }
    ], null, 2)
  },
  "教育": {
    name: "智能教学助手",
    description: "为教师和学生提供个性化学习体验的教育助手。可用于课程规划、知识点解析、习题辅导和学习进度跟踪，支持多学科教学辅助。",
    openerContent: "您好！我是您的智能教学助手，可以帮助您解答学科问题、制定学习计划、提供习题辅导。请问您需要哪方面的学习帮助？",
    category: "教育",
    type: "Chat",
    formConfig: JSON.stringify([
      {
        "name": "subject",
        "type": "select",
        "label": "学科",
        "required": true,
        "options": [
          {
            "label": "数学",
            "value": "math"
          },
          {
            "label": "物理",
            "value": "physics"
          },
          {
            "label": "化学",
            "value": "chemistry"
          },
          {
            "label": "语文",
            "value": "chinese"
          },
          {
            "label": "英语",
            "value": "english"
          }
        ]
      },
      {
        "name": "grade",
        "type": "select",
        "label": "年级",
        "required": true,
        "options": [
          {
            "label": "小学",
            "value": "primary"
          },
          {
            "label": "初中",
            "value": "junior"
          },
          {
            "label": "高中",
            "value": "senior"
          },
          {
            "label": "大学",
            "value": "college"
          }
        ]
      }
    ], null, 2)
  },
  "管理": {
    name: "项目管理助手",
    description: "专为管理者设计的智能助手，帮助优化工作流程、制定项目计划、分配任务和生成报告。支持团队协作、进度跟踪和资源管理。",
    openerContent: "您好，我是项目管理助手。我可以帮您制定项目计划、分配任务、管理团队进度，提高工作效率。请问您有什么需要我协助的吗？",
    category: "管理",
    type: "Workflow",
    formConfig: JSON.stringify([
      {
        "name": "project_name",
        "type": "text",
        "label": "项目名称",
        "required": true,
        "placeholder": "请输入项目名称"
      },
      {
        "name": "team_size",
        "type": "number",
        "label": "团队规模",
        "required": true,
        "min": 1,
        "max": 100
      },
      {
        "name": "project_type",
        "type": "select",
        "label": "项目类型",
        "required": true,
        "options": [
          {
            "label": "软件开发",
            "value": "software"
          },
          {
            "label": "市场营销",
            "value": "marketing"
          },
          {
            "label": "产品设计",
            "value": "product"
          },
          {
            "label": "研发",
            "value": "rd"
          }
        ]
      }
    ], null, 2)
  }
};

// 定义控件类型接口
interface FormControlData {
  type?: string;
  label?: string;
  title?: string;
  name?: string;
  required?: boolean;
  variable?: string;
  field_name?: string;
  default?: any;
  description?: string;
  tip?: string;
  placeholder?: string;
  maxLength?: number;
  max_length?: number;
  options?: any[];
  allowed_file_types?: string[];
  allowed_file_extensions?: string[];
  [key: string]: any; // 允许其他属性
}

interface ApplicationFormProps {
  mode: 'create' | 'edit'
  id?: string
  initialData?: typeof defaultFormData
  isLoading?: boolean
  isUsingMockData?: boolean
  onSubmit: (formData: typeof defaultFormData) => void
  isSubmitting?: boolean
}

const FormPreview = ({ formConfig, showDetailsInfo = true }: { formConfig: string, showDetailsInfo?: boolean }) => {
  const [formControls, setFormControls] = useState<FormControlData[]>([])
  const [error, setError] = useState<string | null>(null)
  const [formStructure, setFormStructure] = useState<'standard' | 'dify' | 'unknown'>('unknown')

  // 控件类型映射表，根据Java中的FormControlType枚举值定义
  const controlTypeExplanations: Record<string, string> = {
    'text-input': '文本输入控件',
    'paragraph': '段落文本控件',
    'select': '下拉选择控件',
    'number': '数字输入控件',
    'file': '文件上传控件',
    'file-list': '文件列表控件'
  }

  // 规范化控件数据的函数，处理不同的控件数据格式
  const normalizeControl = (control: Record<string, any>): FormControlData => {
    // 检查是否是特殊格式：对象的键是控件类型
    const controlKeys = Object.keys(control);
    const validTypeKey = controlKeys.find(key => Object.keys(controlTypeExplanations).includes(key));
    
    if (validTypeKey) {
      // 特殊格式：{text-input: {properties}}
      const properties = control[validTypeKey] as Record<string, any>;
      return {
        ...properties,
        type: validTypeKey // 确保type属性存在且为正确的类型
      };
    }
    
    // 标准格式
    return control as FormControlData;
  };

  useEffect(() => {
    if (!formConfig || formConfig.trim() === '') {
      setFormControls([])
      setError(null)
      setFormStructure('unknown')
        return
      }
      
    try {
      let parsedConfig: any = JSON.parse(formConfig)
      console.log('表单配置解析结果:', parsedConfig)
      
      // 检查并处理各种可能的表单格式
      if (Array.isArray(parsedConfig)) {
        // 直接是控件数组的情况，需要规范化每个控件
        setFormControls(parsedConfig.map((control: Record<string, any>) => normalizeControl(control)))
        setFormStructure('standard')
        setError(null)
      } 
      else if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.userInputForm)) {
        // Dify格式的表单
        setFormControls(parsedConfig.userInputForm.map((control: Record<string, any>) => normalizeControl(control)))
        setFormStructure('dify')
        setError(null)
      }
      else if (parsedConfig && typeof parsedConfig === 'object' && parsedConfig.formConfig) {
        // 嵌套的formConfig
        try {
          const nestedConfig = typeof parsedConfig.formConfig === 'string'
            ? JSON.parse(parsedConfig.formConfig)
            : parsedConfig.formConfig
          
          if (Array.isArray(nestedConfig)) {
            setFormControls(nestedConfig.map((control: Record<string, any>) => normalizeControl(control)))
            setFormStructure('standard')
      setError(null)
          } 
          else if (nestedConfig && typeof nestedConfig === 'object' && Array.isArray(nestedConfig.userInputForm)) {
            setFormControls(nestedConfig.userInputForm.map((control: Record<string, any>) => normalizeControl(control)))
            setFormStructure('dify')
            setError(null)
          }
          else {
            setFormControls([])
            setError('嵌套formConfig格式不支持，预期为数组或Dify格式')
            setFormStructure('unknown')
          }
    } catch (err) {
          setFormControls([])
          setError(`嵌套formConfig解析失败: ${err instanceof Error ? err.message : String(err)}`)
          setFormStructure('unknown')
        }
      }
      else if (parsedConfig && typeof parsedConfig === 'object') {
        // 单个控件对象的情况
        const normalizedControl = normalizeControl(parsedConfig as Record<string, any>);
        if (normalizedControl.type) {
          setFormControls([normalizedControl])
          setFormStructure('standard')
          setError(null)
        } else {
          setFormControls([])
          setError('不支持的表单控件格式，无法识别控件类型')
          setFormStructure('unknown')
        }
      }
      else {
        setFormControls([])
        setError('不支持的表单配置格式，无法预览')
        setFormStructure('unknown')
      }
    } catch (err) {
      setFormControls([])
      setError(`表单配置解析失败: ${err instanceof Error ? err.message : String(err)}`)
      setFormStructure('unknown')
    }
  }, [formConfig])

  if (error) {
    return (
      <div className="flex flex-col gap-2 p-4 border border-red-200 bg-red-50 rounded-md">
        <div className="text-red-500 font-medium">表单预览错误</div>
        <div className="text-sm text-red-600">{error}</div>
      </div>
    )
  }

  if (formControls.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-4 border border-gray-200 bg-gray-50 rounded-md">
        <div className="text-gray-500 font-medium">表单预览</div>
        <div className="text-sm text-gray-600">未配置表单控件或配置为空</div>
      </div>
    )
  }

  // 渲染控件函数
  const renderControl = (control: FormControlData, index: number) => {
    // 检查控件类型是否有效
    const type = control.type || '';
    const isValidType = Object.keys(controlTypeExplanations).includes(type);
    
    // 提取控件的基本信息
    const label = control.label || control.title || control.name || `控件 ${index + 1}`;
    const required = control.required ? true : false;
    const variable = control.variable || control.name || control.field_name || '';
    const defaultValue = control.default || '';
    const description = control.description || control.tip || '';
    const placeholder = control.placeholder || '';
    const maxLength = control.maxLength || control.max_length;
    const options = control.options || [];
    
    // 文件控件特有属性
    const allowedFileTypes = control.allowed_file_types || [];
    const allowedFileExtensions = control.allowed_file_extensions || [];
    
    // 获取控件类型的解释说明
    const typeExplanation = controlTypeExplanations[type] || '未知控件类型';

  return (
      <div key={index} className="border border-gray-100 p-3 rounded-md bg-gray-50 mb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="font-medium flex items-center">
            <span>{label}</span>
            {required && <span className="text-red-500 ml-1">*</span>}
          </div>
          {showDetailsInfo && (
            <div className="flex items-center">
              {variable && (
                <div className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded mr-2">
                  ID: {variable}
                </div>
              )}
              <div className={`text-xs px-1.5 py-0.5 ${isValidType ? 'bg-gray-200 text-gray-700' : 'bg-red-100 text-red-700'} rounded flex items-center`}>
                <span>{type}</span>
                <div className="ml-1 text-xs text-gray-500">({typeExplanation})</div>
              </div>
            </div>
          )}
        </div>
        
        {/* 渲染不同类型的控件预览 */}
        {type === 'text-input' && (
          <input 
            type="text" 
            placeholder={placeholder || '请输入文本'} 
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            defaultValue={defaultValue}
            maxLength={maxLength}
          />
        )}
        
        {type === 'paragraph' && (
          <textarea 
            placeholder={placeholder || '请输入段落文本'} 
            className="w-full p-2 border border-gray-300 rounded-md bg-white"
            rows={3}
            defaultValue={defaultValue}
            maxLength={maxLength}
          />
        )}
        
        {type === 'select' && (
          <select className="w-full p-2 border border-gray-300 rounded-md bg-white">
            <option value="">{placeholder || '请选择选项'}</option>
            {options.map((opt: any, i: number) => (
              <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                {typeof opt === 'object' ? opt.label || opt.value : opt}
              </option>
            ))}
          </select>
        )}
        
        {type === 'number' && (
          <div className="w-full">
            <input 
              type="number"
              placeholder={placeholder || '请输入数字'} 
              className="w-full p-2 border border-gray-300 rounded-md bg-white"
              defaultValue={defaultValue}
              min={0}  // 默认最小值为0
              step={1} // 默认步长为1
              // 使用onInput而不是onChange来确保实时响应
              onInput={(e) => {
                const target = e.target as HTMLInputElement;
                if (maxLength && target.value.length > maxLength) {
                  target.value = target.value.slice(0, maxLength);
                }
              }}
            />
            {maxLength && (
              <div className="text-xs text-gray-500 mt-1">
                最大允许值: {maxLength}
              </div>
            )}
          </div>
        )}
        
        {type === 'file' && (
          <div className="w-full">
            <label className="block w-full cursor-pointer">
              <div className="p-4 border border-dashed border-gray-300 rounded-md bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    // 显示选择的文件名
                    const fileInput = e.target as HTMLInputElement;
                    const fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : "";
                    
                    if (fileName) {
                      // 找到并更新最近的文件名显示元素
                      const fileNameElement = e.currentTarget.parentElement?.querySelector('.file-name');
                      if (fileNameElement) {
                        fileNameElement.textContent = fileName;
                        fileNameElement.classList.remove('hidden');
                      }
                    }
                  }}
                  // 根据允许的文件类型设置accept属性
                  accept={allowedFileExtensions.length > 0 ? allowedFileExtensions.join(',') : undefined}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-500">点击或拖拽文件上传</span>
                <span className="file-name hidden mt-2 text-sm text-blue-600 font-medium"></span>
              </div>
            </label>
            
            {allowedFileTypes.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {allowedFileTypes.map((fileType: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                    {fileType}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {type === 'file-list' && (
          <div className="w-full">
            <label className="block w-full cursor-pointer">
              <div className="p-4 border border-dashed border-gray-300 rounded-md bg-white flex flex-col items-center justify-center hover:bg-gray-50 transition-colors mb-2">
                <input
                type="file"
                  className="hidden"
                  multiple // 允许多文件上传
                onChange={(e) => {
                    // 显示选择的文件名
                    const fileInput = e.target as HTMLInputElement;
                    const fileList = fileInput.files;
                    
                    // 找到文件列表显示区域
                    const fileListElement = e.currentTarget.parentElement?.parentElement?.querySelector('.file-list-container');
                    if (fileListElement && fileList && fileList.length > 0) {
                      // 清空现有内容
                      fileListElement.innerHTML = '';
                      
                      // 添加每个文件
                      Array.from(fileList).forEach(file => {
                        const fileItem = document.createElement('div');
                        fileItem.className = 'flex items-center justify-between p-2 border border-gray-200 rounded-md mb-1';
                        fileItem.innerHTML = `
                          <span class="text-sm truncate flex-1">${file.name}</span>
                          <span class="text-xs text-gray-500 ml-2">${(file.size / 1024).toFixed(1)} KB</span>
                        `;
                        fileListElement.appendChild(fileItem);
                      });

                      // 显示文件列表容器
                      fileListElement.classList.remove('hidden');
                      
                      // 隐藏占位文本
                      const placeholderElement = e.currentTarget.parentElement?.parentElement?.querySelector('.file-list-placeholder');
                      if (placeholderElement) {
                        placeholderElement.classList.add('hidden');
                      }
                    }
                  }}
                  // 根据允许的文件类型设置accept属性
                  accept={allowedFileExtensions.length > 0 ? allowedFileExtensions.join(',') : undefined}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-500">点击或拖拽上传多个文件</span>
            </div>
            </label>
            <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
              <div className="file-list-placeholder text-sm text-gray-500">文件列表将在此显示</div>
              <div className="file-list-container hidden"></div>
        </div>
            {allowedFileExtensions.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {allowedFileExtensions.map((ext: string, i: number) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded">
                    {ext}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!isValidType && (
          <div className="w-full p-2 border border-red-200 rounded-md bg-red-50 text-red-600 text-sm">
            未知控件类型: {type}，仅支持: text-input, paragraph, select, number, file, file-list
      </div>
        )}
        
        {description && (
          <div className="mt-1 text-xs text-gray-500">{description}</div>
        )}
        
        {/* 显示控件字段信息，根据showDetailsInfo属性决定是否显示 */}
        {showDetailsInfo && (
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            <div className="grid grid-cols-2 gap-2">
              {variable && (
                <div>变量ID: <span className="font-mono">{variable}</span></div>
              )}
              {defaultValue && (
                <div>默认值: <span className="font-mono">{typeof defaultValue === 'object' ? JSON.stringify(defaultValue) : defaultValue}</span></div>
              )}
              <div>是否必填: <span className="font-mono">{required ? '是' : '否'}</span></div>
              {maxLength && (
                <div>最大长度: <span className="font-mono">{maxLength}</span></div>
              )}
              {placeholder && (
                <div>占位文本: <span className="font-mono">{placeholder}</span></div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 p-4 border border-gray-200 rounded-md">
      {showDetailsInfo && (
        <div className="flex items-center justify-between mb-4">
          <div className="font-medium">表单预览</div>
          {formStructure === 'dify' && (
            <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">Dify格式</div>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        {formControls.map((control, index) => renderControl(control, index))}
        {formControls.length === 0 && (
          <div className="p-4 text-center text-gray-500 border border-dashed border-gray-300 rounded-md">
            没有配置任何表单控件
          </div>
        )}
      </div>
    </div>
  )
}

// 将FormPreview组件使用memo包装
const MemoizedFormPreview = React.memo(FormPreview) as typeof FormPreview;

export function ApplicationForm({ mode, id, initialData, isLoading = false, isUsingMockData = false, onSubmit, isSubmitting = false }: ApplicationFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<typeof defaultFormData>(initialData || defaultFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [useMonaco, setUseMonaco] = useState(true)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [tagInput, setTagInput] = useState("")

  // 页面标题和返回链接
  const pageTitle = mode === 'create' ? '创建新应用' : '编辑应用'
  const backUrl = '/admin/applications' // 始终返回应用列表页面
  const saveButtonText = mode === 'create' ? '保存应用' : '保存更改'
  const savingButtonText = mode === 'create' ? '保存中...' : '更新中...'

  // Check if Monaco editor fails to load
  useEffect(() => {
    const checkMonaco = async () => {
      try {
        await import("monaco-editor/esm/vs/editor/editor.api")
      } catch (error) {
        console.error("Monaco editor failed to load:", error)
        setUseMonaco(false)
      }
    }

    checkMonaco()
  }, [])

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
      if (initialData.logo) {
        setLogoPreview(initialData.logo)
      }
    }
  }, [initialData])

  // 使用useCallback优化事件处理函数
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // 清除错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // 清除错误
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }, [])

  const handleSliderChange = (name: string, value: number[]) => {
    setFormData((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleEditorChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, formConfig: value }))
    
    // 如果formConfig为空，则不校验JSON格式
    if (!value || value.trim() === "") {
      // 清除formConfig的错误
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.formConfig
        return newErrors
      })
    } else {
      try {
        // 尝试解析JSON
        const parsedValue = JSON.parse(value)
        
        // 验证JSON结构，检查是否符合表单格式要求
        let isValidFormConfig = false
        
        // 检查是否为数组格式的表单配置
        if (Array.isArray(parsedValue)) {
          // 检查数组中的每一项是否包含必要的表单字段属性
          isValidFormConfig = parsedValue.length === 0 || parsedValue.some(item => 
            item && typeof item === 'object' && (
              item.type || 
              item.name || 
              item.label
            )
          )
        } 
        // 检查是否为Dify格式的表单配置
        else if (
          parsedValue && 
          typeof parsedValue === 'object' && 
          Array.isArray(parsedValue.userInputForm)
        ) {
          isValidFormConfig = true
        }
        // 检查是否包含formConfig属性的嵌套结构
        else if (
          parsedValue && 
          typeof parsedValue === 'object' && 
          parsedValue.formConfig
        ) {
          try {
            const nestedConfig = typeof parsedValue.formConfig === 'string'
              ? JSON.parse(parsedValue.formConfig)
              : parsedValue.formConfig
              
            if (Array.isArray(nestedConfig) || 
                (nestedConfig && nestedConfig.userInputForm)) {
              isValidFormConfig = true
            }
          } catch (nestedErr) {
            console.warn("嵌套formConfig解析失败", nestedErr)
          }
        }
        // 检查对象是否直接包含表单字段属性
        else if (
          parsedValue && 
          typeof parsedValue === 'object' &&
          (parsedValue.type || parsedValue.name || parsedValue.label)
        ) {
          isValidFormConfig = true
        }
        
        // 验证JSON格式和结构
        if (isValidFormConfig) {
        // 验证通过，清除formConfig的错误
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.formConfig
          return newErrors
        })
        } else {
          // JSON格式正确但结构不符合表单要求
          setErrors((prev) => ({ 
            ...prev, 
            formConfig: "JSON格式正确，但不符合表单配置的结构要求" 
          }))
        }
      } catch (error) {
        // JSON格式无效
        setErrors((prev) => ({ 
          ...prev, 
          formConfig: `无效的JSON格式: ${error instanceof Error ? error.message : String(error)}` 
        }))
      }
    }
  }, [])

  const copyApiKey = useCallback(() => {
    if (formData.apiKey) {
      navigator.clipboard.writeText(formData.apiKey)
      setApiKeyCopied(true)
      setTimeout(() => setApiKeyCopied(false), 2000)
    }
  }, [formData.apiKey])

  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    const allowedTypes = [
      "image/svg+xml",    // SVG
      "image/png",        // PNG
      "image/jpeg",       // JPG, JPEG
      "image/webp",       // WEBP
      "image/gif"         // GIF
    ]
    
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, logo: "只支持SVG、PNG、JPG、JPEG、WEBP、GIF格式的图片" }))
      return
    }

    // 验证文件大小 (最大200KB)
    if (file.size > 200 * 1024) {
      setErrors((prev) => ({ ...prev, logo: "图片大小不能超过200KB" }))
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result as string
      setLogoPreview(result)
      setFormData((prev) => ({ ...prev, logo: result }))

      // 清除错误
      if (errors.logo) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.logo
          return newErrors
        })
      }
    }
    reader.readAsDataURL(file)
  }, [])

  const validateForm = useCallback(() => {
    let isValid = true
    const newErrors: { [key: string]: string } = {}

    // 验证必填字段
    if (!formData.name || formData.name.trim() === "") {
      newErrors.name = "应用名称不能为空"
      isValid = false
    }

    if (!formData.category || formData.category.trim() === "") {
      newErrors.category = "应用类别不能为空"
      isValid = false
    }

    // 验证API Key必填
    if (!formData.apiKey || formData.apiKey.trim() === "") {
      newErrors.apiKey = "API Key不能为空"
      isValid = false
    }

    // 只有当formConfig不为空时才验证JSON格式
    if (formData.formConfig && formData.formConfig.trim() !== "") {
      try {
        JSON.parse(formData.formConfig)
      } catch (error) {
        newErrors.formConfig = "无效的JSON格式"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    const isValid = validateForm()
    if (!isValid) {
      // 如果表单验证失败，则不提交
      return
    }
    
    // 调用提交回调函数
    onSubmit(formData)
  }, [formData, onSubmit, validateForm])

  // 使用useMemo优化计算属性
  const logoPreviewElement = useMemo(() => {
    if (logoPreview) {
      return (
        <div className="relative w-24 h-24 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
          <img src={logoPreview || "/placeholder.svg"} alt="应用Logo" className="max-w-full max-h-full" />
        </div>
      )
    } else {
      return (
        <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-gray-50">
          <p className="text-xs text-gray-400">无Logo</p>
        </div>
      )
    }
  }, [logoPreview])

  // 延迟加载Monaco编辑器，只在高级参数标签页被激活时加载
  const editorComponent = useMemo(() => {
    if (useMonaco) {
      return (
        <div className="h-[400px]">
          <MonacoEditor language="json" value={formData.formConfig} onChange={handleEditorChange} />
        </div>
      )
    } else {
      return <JsonEditor value={formData.formConfig} onChange={handleEditorChange} />
    }
  }, [useMonaco, formData.formConfig, handleEditorChange])

  // 使用AI生成应用内容
  const handleAIGenerate = useCallback(() => {
    setIsGenerating(true)
    
    // 模拟API调用延迟
    setTimeout(() => {
      const selectedCategory = formData.category || "科研"
      let template
      
      // 安全地获取模板
      if (selectedCategory === "科研") {
        template = AI_GENERATED_TEMPLATES["科研"]
      } else if (selectedCategory === "写作") {
        template = AI_GENERATED_TEMPLATES["写作"]
      } else if (selectedCategory === "教育") {
        template = AI_GENERATED_TEMPLATES["教育"]
      } else if (selectedCategory === "管理") {
        template = AI_GENERATED_TEMPLATES["管理"]
      } else {
        template = AI_GENERATED_TEMPLATES["科研"] // 默认模板
      }
      
      setFormData({
        ...formData,
        ...template,
        // 保持原来的标签
        tags: formData.tags
      })
      
      setIsGenerating(false)
    }, 1000)
  }, [formData])

  // 添加同步应用信息的处理函数
  const handleSyncApp = useCallback(async () => {
    if (!formData.apiKey) {
      setErrors((prev) => ({ ...prev, apiKey: "请先输入API Key" }))
      return
    }

    setIsSyncing(true)
    setError(null)

    try {
      const response = await fetch(`/api/dify-apps/sync?apiKey=${encodeURIComponent(formData.apiKey)}`)
      
      if (!response.ok) {
        throw new Error(`同步失败: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // 使用同步的数据更新表单
      setFormData((prev) => ({
        ...prev,
        name: data.name || prev.name,
        description: data.description || prev.description,
        category: data.category || prev.category,
        type: data.type || prev.type,
        inputType: data.inputType || prev.inputType,
        outputType: data.outputType || prev.outputType,
        chatModel: data.chatModel || prev.chatModel,
        openerContent: data.openerContent || prev.openerContent,
        formConfig: data.formConfig || prev.formConfig,
        logo: data.logo || prev.logo,
        // 确保标签数据被正确填充
        tags: data.tags || prev.tags
      }))
      
      // 更新Logo预览
      if (data.logo) {
        setLogoPreview(data.logo)
      }
      
      // 清除API Key相关错误
      if (errors.apiKey) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.apiKey
          return newErrors
        })
      }
    } catch (error) {
      console.error("同步应用信息失败:", error)
      setError(`同步应用信息失败: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSyncing(false)
    }
  }, [formData.apiKey, errors])

  // 处理添加标签
  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData((prev) => {
        const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
        // 避免添加重复标签
        if (!currentTags.includes(tagInput.trim())) {
          return { ...prev, tags: [...currentTags, tagInput.trim()] };
        }
        return prev;
      });
      setTagInput("");
    }
  };

  // 处理删除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => {
      const currentTags = Array.isArray(prev.tags) ? prev.tags : [];
      return { ...prev, tags: currentTags.filter(tag => tag !== tagToRemove) };
    });
  };

  // 处理回车键添加标签
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">正在加载应用数据...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href={backUrl}>
              <X className="mr-2 h-4 w-4" />
              取消
            </Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? savingButtonText : saveButtonText}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {isUsingMockData && (
        <Alert className="mb-4 bg-yellow-50 border-yellow-200">
          <AlertTitle className="text-yellow-800">使用模拟数据</AlertTitle>
          <AlertDescription className="text-yellow-700">
            由于API连接问题，当前显示的是模拟数据。您可以继续编辑，但可能无法保存更改。
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 基础信息卡片 */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>基础信息</CardTitle>
                  <CardDescription>设置应用的基本信息和分类</CardDescription>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center" 
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        AI生成
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>使用AI自动生成应用内容</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">
                  API Key <span className="text-red-500">*</span>
                </Label>
                <div className="flex">
                  <div className="relative flex-grow">
                    <Input
                      id="apiKey"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleInputChange}
                      type={showApiKey ? "text" : "password"}
                      className={`pr-10 ${errors.apiKey ? "border-red-500" : ""}`}
                      placeholder="输入API Key"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="ml-2"
                          onClick={handleSyncApp}
                          disabled={isSyncing || !formData.apiKey}
                        >
                          {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>同步应用信息</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="ml-2"
                          onClick={copyApiKey}
                          disabled={!formData.apiKey}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{apiKeyCopied ? "已复制!" : "复制API Key"}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                {errors.apiKey && <p className="text-xs text-red-500">{errors.apiKey}</p>}
                <p className="text-xs text-gray-500">输入API Key并点击同步按钮，自动填充应用信息</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  应用名称 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="输入应用名称"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">应用描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="描述应用的功能和用途"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  应用分类 <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                  <SelectTrigger id="category" className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="选择应用分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_CONFIG.categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">应用标签</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                      {tag}
                    <button
                      type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    </Badge>
                  ))}
                  </div>
                <div className="flex">
                  <Input
                    id="tagInput"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    placeholder="输入标签后按回车添加"
                    className="flex-grow"
                  />
                        <Button
                          type="button"
                          variant="outline"
                          className="ml-2"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim()}
                        >
                    添加
                        </Button>
                </div>
                <p className="text-xs text-gray-500">添加多个标签来分类您的应用</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">应用类型</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="选择应用类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {APP_CONFIG.types.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logo上传 */}
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="logo">应用Logo</Label>
                <div className="flex flex-col items-center space-y-4">
                  {logoPreviewElement}
                  <input
                    type="file"
                    id="logo"
                    ref={fileInputRef}
                    accept=".svg,.png,.jpg,.jpeg,.webp,.gif"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={triggerFileInput}>
                    <Upload className="h-4 w-4 mr-2" />
                    上传Logo
                  </Button>
                  {errors.logo && <p className="text-xs text-red-500">{errors.logo}</p>}
                  <p className="text-xs text-gray-500">支持SVG、PNG、JPG、JPEG、WEBP、GIF格式，大小不超过200KB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 技术配置卡片 */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>技术配置</CardTitle>
              <CardDescription>设置应用的技术参数和配置信息</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">基本配置</TabsTrigger>
                  <TabsTrigger value="advanced">高级参数</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inputType">输入类型</Label>
                      <Select
                        value={formData.inputType}
                        onValueChange={(value) => handleSelectChange("inputType", value)}
                      >
                        <SelectTrigger id="inputType">
                          <SelectValue placeholder="选择输入类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {APP_CONFIG.inputTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="outputType">输出类型</Label>
                      <Select
                        value={formData.outputType}
                        onValueChange={(value) => handleSelectChange("outputType", value)}
                      >
                        <SelectTrigger id="outputType">
                          <SelectValue placeholder="选择输出类型" />
                        </SelectTrigger>
                        <SelectContent>
                          {APP_CONFIG.outputTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="chatModel">响应模式</Label>
                    <Select
                      value={formData.chatModel}
                      onValueChange={(value) => handleSelectChange("chatModel", value)}
                    >
                      <SelectTrigger id="chatModel">
                        <SelectValue placeholder="选择响应模式" />
                      </SelectTrigger>
                      <SelectContent>
                        {APP_CONFIG.responseModels.map((model) => (
                          <SelectItem key={model.value} value={model.value}>{model.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">流式响应可实时展示生成内容，阻塞式响应等待完全生成后一次性返回</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openerContent">开场白</Label>
                    <Textarea
                      id="openerContent"
                      name="openerContent"
                      value={formData.openerContent}
                      onChange={handleInputChange}
                      placeholder="设置AI助手的开场白"
                      rows={3}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="pt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="formConfig">表单配置 (JSON)</Label>
                      <div className="flex space-x-2">
                        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                            >
                              <Play className="h-4 w-4 mr-2" />
                              预览表单
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
                            <DialogHeader>
                              <DialogTitle>表单预览</DialogTitle>
                              <DialogDescription>
                                当前表单配置的实际效果展示
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 overflow-y-auto max-h-[calc(90vh-180px)] flex-grow">
                              <MemoizedFormPreview formConfig={formData.formConfig} showDetailsInfo={false} />
                            </div>
                            <div className="flex justify-end pt-2 border-t mt-2">
                              <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>关闭</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      {editorComponent}
                    </div>
                    {errors.formConfig && <p className="text-xs text-red-500">{errors.formConfig}</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" asChild>
                <Link href={backUrl}>取消</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? savingButtonText : saveButtonText}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
} 