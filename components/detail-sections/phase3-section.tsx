'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { Property } from '@/lib/types'
import type { ScoreResult } from '@/lib/scoring'
import { getEffectiveMonthly, getAnnualCost, getAnnualWithDeposit, getApplianceRate } from '@/lib/scoring'
import { cn } from '@/lib/utils'

interface Phase3SectionProps {
  property: Property
  score: ScoreResult
}

export function Phase3Section({ property, score }: Phase3SectionProps) {
  if (property.schedule.status !== 'visited') {
    return (
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-amber-500" />
          <h2 className="text-lg font-semibold">Phase 3 - 방문 후 분석</h2>
        </div>
        
        <Card className="p-6 text-center text-muted-foreground">
          방문 완료 후 분석 데이터가 표시됩니다.
        </Card>
      </section>
    )
  }

  const effectiveMonthly = getEffectiveMonthly(property)
  const annualCost = getAnnualCost(property)
  const annualWithDeposit = getAnnualWithDeposit(property)
  const applianceRate = getApplianceRate(property.appliances)

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-amber-500" />
        <h2 className="text-lg font-semibold">Phase 3 - 방문 후 분석</h2>
      </div>

      {/* Cost Analysis Grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">실질 월 고정비</p>
          <p className="text-xl font-bold text-primary">
            {effectiveMonthly.toLocaleString('ko-KR')}만원
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">연간 총비용</p>
          <p className="text-xl font-bold">
            {annualCost.toLocaleString('ko-KR')}만원
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">보증금 포함 1년</p>
          <p className="text-xl font-bold">
            {annualWithDeposit.toLocaleString('ko-KR')}만원
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">가구 확보율</p>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">{applianceRate.toFixed(0)}%</span>
          </div>
          <Progress value={applianceRate} className="mt-2 h-2" />
        </Card>
      </div>

      {/* AI Score Card */}
      <Card className="p-4">
        <h3 className="mb-4 text-base font-medium">AI 스코어링</h3>
        
        <div className="flex items-center gap-6">
          {/* Score Ring */}
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                className="text-muted"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeDasharray={`${(score.score / 100) * 251} 251`}
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
            <span className="absolute text-2xl font-bold">{score.score}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Badge
              className={cn(
                'w-fit text-sm font-medium',
                score.grade === 'recommended' && 'bg-green-100 text-green-700',
                score.grade === 'hold' && 'bg-yellow-100 text-yellow-700',
                score.grade === 'not-recommended' && 'bg-red-100 text-red-700'
              )}
            >
              {score.gradeLabel}
            </Badge>
            <p className="text-sm text-muted-foreground">{score.reason}</p>
          </div>
        </div>

        <style jsx>{`
          @keyframes score-ring {
            from {
              stroke-dasharray: 0 251;
            }
          }
        `}</style>
      </Card>
    </section>
  )
}
