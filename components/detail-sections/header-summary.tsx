'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Property } from '@/lib/types'
import type { ScoreResult } from '@/lib/scoring'
import { getEffectiveMonthly, getApplianceRate } from '@/lib/scoring'
import { cn } from '@/lib/utils'

interface HeaderSummaryProps {
  property: Property
  score: ScoreResult
}

export function HeaderSummary({ property, score }: HeaderSummaryProps) {
  const effectiveMonthly = getEffectiveMonthly(property)
  const applianceRate = getApplianceRate(property.appliances)

  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        {/* Score Ring */}
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <svg className="h-16 w-16 -rotate-90 transform">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-muted"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${(score.score / 100) * 176} 176`}
              strokeLinecap="round"
              className={cn(
                'transition-all duration-700 ease-out',
                score.grade === 'recommended' && 'text-green-500',
                score.grade === 'hold' && 'text-yellow-500',
                score.grade === 'not-recommended' && 'text-red-500'
              )}
              style={{
                animation: 'score-ring 0.8s ease-out forwards'
              }}
            />
          </svg>
          <span className="absolute text-lg font-bold">{score.score}</span>
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                'text-xs font-medium',
                score.grade === 'recommended' && 'bg-green-100 text-green-700',
                score.grade === 'hold' && 'bg-yellow-100 text-yellow-700',
                score.grade === 'not-recommended' && 'bg-red-100 text-red-700'
              )}
            >
              {score.gradeLabel}
            </Badge>
            <span className="font-semibold text-primary">
              월 {effectiveMonthly.toLocaleString('ko-KR')}만원
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">가구 확보율</span>
            <div className="flex flex-1 items-center gap-2">
              <Progress value={applianceRate} className="h-2 flex-1" />
              <span className="text-sm font-medium">{applianceRate.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes score-ring {
          from {
            stroke-dasharray: 0 176;
          }
        }
      `}</style>
    </Card>
  )
}
