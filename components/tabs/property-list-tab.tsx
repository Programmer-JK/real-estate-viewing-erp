'use client'

import { useState, useMemo } from 'react'
import { Filter, Plus, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PropertyCard } from '@/components/property-card'
import { FilterSheet } from '@/components/filter-sheet'
import { NewPropertySheet } from '@/components/new-property-sheet'
import type { Property } from '@/lib/types'
import type { ScoreResult } from '@/lib/scoring'
import { getApplianceCount, getEffectiveMonthly } from '@/lib/scoring'
import { cn } from '@/lib/utils'

type SortOption = 'recent' | 'rent-low' | 'ai-score' | 'appliances' | 'visited'

interface FilterState {
  rentRange: [number, number]
  grades: ('recommended' | 'hold' | 'not-recommended')[]
  directions: string[]
}

interface PropertyListTabProps {
  propertiesWithScores: { property: Property; score: ScoreResult }[]
  compareIds: string[]
  onOpenDetail: (propertyId: string) => void
  onAddProperty: (property: Property) => void
  onDeleteProperty: (propertyId: string) => void
  onToggleCompare: (propertyId: string) => boolean
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: '최신순' },
  { value: 'rent-low', label: '월세 낮은순' },
  { value: 'ai-score', label: 'AI 점수순' },
  { value: 'appliances', label: '가구 많은순' },
  { value: 'visited', label: '방문완료만' },
]

const defaultFilters: FilterState = {
  rentRange: [0, 150],
  grades: [],
  directions: []
}

export function PropertyListTab({
  propertiesWithScores,
  compareIds,
  onOpenDetail,
  onAddProperty,
  onDeleteProperty,
  onToggleCompare
}: PropertyListTabProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isNewPropertyOpen, setIsNewPropertyOpen] = useState(false)

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.rentRange[0] > 0 || filters.rentRange[1] < 150) count++
    if (filters.grades.length > 0) count++
    if (filters.directions.length > 0) count++
    return count
  }, [filters])

  const filteredAndSortedProperties = useMemo(() => {
    let result = [...propertiesWithScores]

    // Apply filters
    result = result.filter(({ property, score }) => {
      const effectiveMonthly = getEffectiveMonthly(property)
      
      // Rent range filter
      if (effectiveMonthly < filters.rentRange[0] || effectiveMonthly > filters.rentRange[1]) {
        return false
      }
      
      // Grade filter
      if (filters.grades.length > 0 && !filters.grades.includes(score.grade)) {
        return false
      }
      
      // Direction filter
      if (filters.directions.length > 0) {
        const southDirections = ['남', '남동', '남서']
        const eastDirections = ['동', '북동']
        const northDirections = ['북', '북서', '서']
        
        let matches = false
        if (filters.directions.includes('south') && southDirections.includes(property.direction)) {
          matches = true
        }
        if (filters.directions.includes('east') && eastDirections.includes(property.direction)) {
          matches = true
        }
        if (filters.directions.includes('north') && northDirections.includes(property.direction)) {
          matches = true
        }
        if (!matches && property.direction) {
          return false
        }
      }
      
      return true
    })

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        result.sort((a, b) => new Date(b.property.createdAt).getTime() - new Date(a.property.createdAt).getTime())
        break
      case 'rent-low':
        result.sort((a, b) => getEffectiveMonthly(a.property) - getEffectiveMonthly(b.property))
        break
      case 'ai-score':
        result.sort((a, b) => b.score.score - a.score.score)
        break
      case 'appliances':
        result.sort((a, b) => getApplianceCount(b.property.appliances).ok - getApplianceCount(a.property.appliances).ok)
        break
      case 'visited':
        result = result.filter(({ property }) => property.schedule.status === 'visited')
        result.sort((a, b) => new Date(b.property.createdAt).getTime() - new Date(a.property.createdAt).getTime())
        break
    }

    return result
  }, [propertiesWithScores, sortBy, filters])

  return (
    <div className="flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <h1 className="text-lg font-semibold">내 매물 목록</h1>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="h-5 w-5" />
          {activeFilterCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1.5 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        </div>
      </header>

      {/* Sort Bar */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-lg gap-2 overflow-x-auto px-4 py-2 scrollbar-none">
        {SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSortBy(value)}
            className={cn(
              'flex-shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              sortBy === value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-accent'
            )}
          >
            {label}
          </button>
        ))}
        </div>
      </div>

      {/* Property List or Empty State */}
      <div className="flex-1 p-4">
        {filteredAndSortedProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
              <Home className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground">
              아직 등록된 매물이 없어요
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              + 버튼으로 첫 매물을 추가해보세요
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredAndSortedProperties.map(({ property, score }) => (
              <PropertyCard
                key={property.id}
                property={property}
                score={score}
                isInCompare={compareIds.includes(property.id)}
                onOpen={() => onOpenDetail(property.id)}
                onDelete={() => onDeleteProperty(property.id)}
                onToggleCompare={() => onToggleCompare(property.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB - Positioned relative to max-w-lg container on larger screens */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40 mx-auto max-w-lg px-4">
        <button
          onClick={() => setIsNewPropertyOpen(true)}
          className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => setFilters(defaultFilters)}
      />

      {/* New Property Sheet */}
      <NewPropertySheet
        open={isNewPropertyOpen}
        onOpenChange={setIsNewPropertyOpen}
        onAdd={onAddProperty}
      />
    </div>
  )
}
