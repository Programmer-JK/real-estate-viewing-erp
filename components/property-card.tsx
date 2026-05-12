'use client'

import { useState } from 'react'
import { Star, Trash2, Scale } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import type { Property } from '@/lib/types'
import type { ScoreResult } from '@/lib/scoring'
import { getEffectiveMonthly, getApplianceCount } from '@/lib/scoring'
import { cn } from '@/lib/utils'

interface PropertyCardProps {
  property: Property
  score: ScoreResult
  isInCompare: boolean
  onOpen: () => void
  onDelete: () => void
  onToggleCompare: () => boolean
}

function formatPrice(value: number): string {
  return value.toLocaleString('ko-KR')
}

function formatDateTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function PropertyCard({
  property,
  score,
  isInCompare,
  onOpen,
  onDelete,
  onToggleCompare
}: PropertyCardProps) {
  const [showDelete, setShowDelete] = useState(false)
  
  const effectiveMonthly = getEffectiveMonthly(property)
  const { ok: applianceCount } = getApplianceCount(property.appliances)

  const handleToggleCompare = (e: React.MouseEvent) => {
    e.stopPropagation()
    const wasAdded = onToggleCompare()
    if (!wasAdded && !isInCompare) {
      toast({
        description: '비교는 최대 3개까지 가능해요',
      })
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete()
    toast({
      description: '매물이 삭제되었어요',
    })
  }

  return (
    <Card
      className={cn(
        'relative cursor-pointer overflow-hidden p-4 transition-all hover:border-primary/50',
        showDelete && 'translate-x-[-80px]'
      )}
      onClick={onOpen}
      onTouchStart={() => setShowDelete(false)}
    >
      {/* Delete button (swipe reveal) */}
      <button
        onClick={handleDelete}
        className="absolute right-0 top-0 flex h-full w-20 translate-x-full items-center justify-center bg-destructive text-destructive-foreground transition-transform"
        style={{ transform: showDelete ? 'translateX(0)' : 'translateX(100%)' }}
      >
        <Trash2 className="h-5 w-5" />
      </button>

      {/* Top Row: Nickname + Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="font-semibold text-foreground">{property.nickname || '이름 없음'}</h3>
        <Badge
          variant="secondary"
          className={cn(
            'text-xs font-medium',
            score.grade === 'recommended' && 'bg-green-100 text-green-700',
            score.grade === 'hold' && 'bg-yellow-100 text-yellow-700',
            score.grade === 'not-recommended' && 'bg-red-100 text-red-700'
          )}
        >
          {score.gradeLabel}
        </Badge>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            property.schedule.status === 'visited' 
              ? 'border-green-500 text-green-600' 
              : 'border-blue-500 text-blue-600'
          )}
        >
          {property.schedule.status === 'visited' ? '방문완료' : '방문대기'}
        </Badge>
      </div>

      {/* Second Row: Address + Direction */}
      <div className="mt-1.5 flex items-center gap-2">
        <p className="truncate text-sm text-muted-foreground">
          {property.address || '주소 미입력'}
        </p>
        {property.direction && (
          <Badge variant="outline" className="shrink-0 text-xs">
            {property.direction}향
          </Badge>
        )}
      </div>

      {/* Third Row: Price Info - Vertical */}
      <div className="mt-2 flex flex-col gap-0.5 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>보증금</span>
          <span className="font-medium text-foreground">{formatPrice(property.deposit)}만</span>
        </div>
        <div className="flex items-center justify-between">
          <span>월세</span>
          <span className="font-medium text-foreground">{formatPrice(property.rent)}만</span>
        </div>
        <div className="flex items-center justify-between">
          <span>관리비</span>
          <span className="font-medium text-foreground">{formatPrice(property.maintenance)}만</span>
        </div>
      </div>

      {/* Fourth Row: Effective Monthly + Appliances */}
      <div className="mt-1.5 flex items-center gap-3">
        <span className="font-medium text-primary">
          실질 월 {formatPrice(effectiveMonthly)}만원
        </span>
        <span className="text-sm text-muted-foreground">
          가구 {applianceCount}/10
        </span>
      </div>

      {/* Bottom Row: Agent + Schedule */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {property.agent.name || '중개인 미입력'}
          </span>
          {property.agent.kindness > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < property.agent.kindness
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  )}
                />
              ))}
            </div>
          )}
        </div>
        {property.schedule.datetime && (
          <span className="text-xs text-muted-foreground">
            {formatDateTime(property.schedule.datetime)}
          </span>
        )}
      </div>

      {/* Compare Toggle Button */}
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant={isInCompare ? 'default' : 'outline'}
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={handleToggleCompare}
        >
          <Scale className="h-3.5 w-3.5" />
          비교에 {isInCompare ? '추가됨' : '추가'}
        </Button>
      </div>
    </Card>
  )
}
