"use client"

import type * as React from "react"
import { CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { zhCN } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  className?: string
}

export function DateRangePicker({ dateRange, setDateRange, className }: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[250px] justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })} -{" "}
                  {format(dateRange.to, "yyyy-MM-dd", { locale: zhCN })}
                </>
              ) : (
                format(dateRange.from, "yyyy-MM-dd", { locale: zhCN })
              )
            ) : (
              <span>创建时间范围</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
            locale={zhCN}
          />
          <div className="flex items-center justify-between p-3 border-t border-border">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  setDateRange({
                    from: today,
                    to: today,
                  })
                }}
              >
                今天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const weekAgo = addDays(today, -7)
                  setDateRange({
                    from: weekAgo,
                    to: today,
                  })
                }}
              >
                最近7天
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  const monthAgo = addDays(today, -30)
                  setDateRange({
                    from: monthAgo,
                    to: today,
                  })
                }}
              >
                最近30天
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setDateRange(undefined)
              }}
            >
              重置
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 