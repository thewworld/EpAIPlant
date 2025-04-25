"use client"

import React, { useMemo } from "react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

// 预生成固定的应用使用趋势测试数据
const trendData = [
  { date: "2025-03-27", value: 4231 },
  { date: "2025-03-28", value: 4612 },
  { date: "2025-03-29", value: 3891 }, // 周末
  { date: "2025-03-30", value: 3750 }, // 周末
  { date: "2025-03-31", value: 4534 },
  { date: "2025-04-01", value: 4999 },
  { date: "2025-04-02", value: 5123 },
  { date: "2025-04-03", value: 5001 },
  { date: "2025-04-04", value: 5214 },
  { date: "2025-04-05", value: 4302 }, // 周末
  { date: "2025-04-06", value: 4012 }, // 周末
  { date: "2025-04-07", value: 5134 },
  { date: "2025-04-08", value: 5428 },
  { date: "2025-04-09", value: 5342 },
  { date: "2025-04-10", value: 5421 },
  { date: "2025-04-11", value: 5634 },
  { date: "2025-04-12", value: 4532 }, // 周末
  { date: "2025-04-13", value: 4621 }, // 周末
  { date: "2025-04-14", value: 5412 },
  { date: "2025-04-15", value: 5632 },
  { date: "2025-04-16", value: 5478 },
  { date: "2025-04-17", value: 5590 },
  { date: "2025-04-18", value: 5623 },
  { date: "2025-04-19", value: 4756 }, // 周末
  { date: "2025-04-20", value: 4563 }, // 周末
  { date: "2025-04-21", value: 5423 },
  { date: "2025-04-22", value: 5563 },
  { date: "2025-04-23", value: 5634 },
  { date: "2025-04-24", value: 5842 },
  { date: "2025-04-25", value: 6123 },
];

// 应用类型分布测试数据
const appTypeData = [
  { name: '聊天应用', value: 45, color: '#8884d8' },
  { name: '文档处理', value: 25, color: '#82ca9d' },
  { name: '数据分析', value: 15, color: '#ffc658' },
  { name: '自动化', value: 10, color: '#ff8042' },
  { name: '其他', value: 5, color: '#0088fe' },
]

/**
 * 应用使用趋势图表
 */
export function AppUsageTrendChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={trendData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis 
          dataKey="date" 
          tickFormatter={(date) => {
            const d = new Date(date)
            return `${d.getMonth()+1}/${d.getDate()}`
          }}
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
          tick={{ fontSize: 12 }}
        />
        <Tooltip 
          formatter={(value) => [`${value.toLocaleString()} 次调用`, '调用量']}
          labelFormatter={(date) => `${new Date(date).toLocaleDateString('zh-CN')}`}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          fill="#8884d8" 
          fillOpacity={0.2} 
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/**
 * 应用类型分布图表
 */
export function AppTypeDistributionChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={appTypeData}
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {appTypeData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `${value} 个应用`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
} 