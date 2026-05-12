'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface FilterState {
  rentRange: [number, number]
  grades: ('recommended' | 'hold' | 'not-recommended')[]
  directions: string[]
}

interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onReset: () => void
}

const GRADE_OPTIONS: { value: 'recommended' | 'hold' | 'not-recommended'; label: string }[] = [
  { value: 'recommended', label: '추천' },
  { value: 'hold', label: '보류' },
  { value: 'not-recommended', label: '비추천' },
]

const DIRECTION_OPTIONS = [
  { value: 'south', label: '남향계열' },
  { value: 'east', label: '동향' },
  { value: 'north', label: '북향계열' },
]

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onReset
}: FilterSheetProps) {
  const handleRentChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      rentRange: [value[0], value[1]] as [number, number]
    })
  }

  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const toggleGrade = (grade: 'recommended' | 'hold' | 'not-recommended') => {
    const newGrades = filters.grades.includes(grade)
      ? filters.grades.filter(g => g !== grade)
      : [...filters.grades, grade]
    onFiltersChange({ ...filters, grades: newGrades })
  }

  const toggleDirection = (direction: string) => {
    const newDirections = filters.directions.includes(direction)
      ? filters.directions.filter(d => d !== direction)
      : [...filters.directions, direction]
    onFiltersChange({ ...filters, directions: newDirections })
  }

  useEffect(() => {
    if (!open) {
      setKeyboardHeight(0)
      return
    }

    const viewport = window.visualViewport
    if (!viewport) return

    const handler = () => {
      const height = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
      setKeyboardHeight(height)
    }

    viewport.addEventListener('resize', handler)
    viewport.addEventListener('scroll', handler)

    return () => {
      viewport.removeEventListener('resize', handler)
      viewport.removeEventListener('scroll', handler)
      setKeyboardHeight(0)
    }
  }, [open])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl mx-auto max-w-lg"
        style={{ bottom: keyboardHeight, transition: 'bottom 0.2s ease-out' }}>
        <SheetHeader>
          <SheetTitle>필터</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4 px-4 overflow-y-auto max-h-[60dvh]">
          {/* Rent Range */}
          <div>
            <label className="mb-3 block text-sm font-medium">
              월세 범위: {filters.rentRange[0]}만 ~ {filters.rentRange[1]}만원
            </label>
            <Slider
              value={filters.rentRange}
              onValueChange={handleRentChange}
              min={0}
              max={150}
              step={5}
              className="mt-2"
            />
          </div>

          {/* AI Grade */}
          <div>
            <label className="mb-3 block text-sm font-medium">AI 등급</label>
            <div className="flex flex-wrap gap-2">
              {GRADE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleGrade(value)}
                  className={cn(
                    'min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    filters.grades.includes(value)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Direction */}
          <div>
            <label className="mb-3 block text-sm font-medium">방향</label>
            <div className="flex flex-wrap gap-2">
              {DIRECTION_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => toggleDirection(value)}
                  className={cn(
                    'min-h-[44px] rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    filters.directions.includes(value)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:bg-accent'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter className="flex flex-row gap-3">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1"
          >
            초기화
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            적용
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
