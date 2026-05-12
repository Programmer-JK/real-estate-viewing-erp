'use client'

import { useMemo, useRef, useState } from 'react'
import { Scale, Star, Download, X } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/hooks/use-toast'
import type { Property, ScorePreset } from '@/lib/types'
import { calculateScore, getEffectiveMonthly, getApplianceCount } from '@/lib/scoring'
import { LIGHTING_LABELS, WATER_PRESSURE_LABELS, NOISE_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CompareTabProps {
  properties: Property[]
  compareIds: string[]
  scorePreset: ScorePreset
  onToggleCompare: (propertyId: string) => boolean
}

export function CompareTab({
  properties,
  compareIds,
  scorePreset,
  onToggleCompare
}: CompareTabProps) {
  const tableRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const compareProperties = useMemo(() => {
    return compareIds
      .map(id => properties.find(p => p.id === id))
      .filter((p): p is Property => p !== undefined)
      .map(property => ({
        property,
        score: calculateScore(property, scorePreset)
      }))
  }, [properties, compareIds, scorePreset])

  const handleExportImage = async () => {
    if (!tableRef.current || compareProperties.length < 2) return

    setIsExporting(true)
    
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default
      
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        onclone: (_clonedDoc, clonedElement) => {
          const originalEls = Array.from(tableRef.current!.querySelectorAll('*'))
          const clonedEls = Array.from(clonedElement.querySelectorAll('*'))
          clonedEls.forEach((clonedEl, i) => {
            const orig = originalEls[i] as HTMLElement | undefined
            if (!orig) return
            const s = window.getComputedStyle(orig)
            const el = clonedEl as HTMLElement
            el.style.backgroundColor = s.backgroundColor
            el.style.color = s.color
            el.style.borderColor = s.borderColor
            el.style.borderTopColor = s.borderTopColor
            el.style.borderRightColor = s.borderRightColor
            el.style.borderBottomColor = s.borderBottomColor
            el.style.borderLeftColor = s.borderLeftColor
          })
        }
      })
      
      const link = document.createElement('a')
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      link.download = `매물비교_${today}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      toast({ description: '이미지가 저장되었어요' })
    } catch (error) {
      console.error('[v0] Failed to export image:', error)
      toast({ description: '이미지 저장에 실패했어요' })
    } finally {
      setIsExporting(false)
    }
  }

  if (compareProperties.length < 2) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card">
          <div className="mx-auto flex h-14 max-w-lg items-center px-4">
            <h1 className="text-lg font-semibold">매물 비교</h1>
          </div>
        </header>

        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Scale className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            비교할 매물을 2~3개 선택해주세요
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            목록에서 &apos;비교에 추가&apos; 버튼을 눌러주세요
          </p>
        </div>
      </div>
    )
  }

  // Find best/worst values for highlighting
  const effectiveMonthlyValues = compareProperties.map(({ property }) => getEffectiveMonthly(property))
  const minMonthly = Math.min(...effectiveMonthlyValues)
  const maxMonthly = Math.max(...effectiveMonthlyValues)

  const depositValues = compareProperties.map(({ property }) => property.deposit)
  const minDeposit = Math.min(...depositValues)
  const maxDeposit = Math.max(...depositValues)

  const scoreValues = compareProperties.map(({ score }) => score.score)
  const maxScore = Math.max(...scoreValues)
  const minScore = Math.min(...scoreValues)

  const applianceValues = compareProperties.map(({ property }) => getApplianceCount(property.appliances).ok)
  const maxAppliances = Math.max(...applianceValues)
  const minAppliances = Math.min(...applianceValues)

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-lg font-semibold">매물 비교</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportImage}
            disabled={isExporting}
            className="gap-1.5"
          >
            <Download className="h-4 w-4" />
            {isExporting ? '저장 중...' : '이미지 저장'}
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div ref={tableRef} className="p-3">
          {/* Property Headers */}
          <div className="mb-3 flex gap-2">
            <div className="w-[72px] shrink-0" />
            {compareProperties.map(({ property }) => (
              <div key={property.id} className="flex-1 min-w-0">
                <Card className="relative p-2.5">
                  <button
                    onClick={() => onToggleCompare(property.id)}
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <h3 className="truncate text-sm font-semibold">{property.nickname || '이름 없음'}</h3>
                  <p className="truncate text-xs text-muted-foreground">{property.address || '주소 미입력'}</p>
                </Card>
              </div>
            ))}
          </div>

          {/* Comparison Rows */}
          <div className="flex flex-col gap-1.5">
            {/* AI Score */}
            <CompareRow label="AI 점수">
              {compareProperties.map(({ property, score }) => (
                <div key={property.id} className="flex flex-col items-center gap-1">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <svg className="h-10 w-10 -rotate-90 transform">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
                      <circle
                        cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                        strokeDasharray={`${(score.score / 100) * 100.5} 100.5`}
                        strokeLinecap="round"
                        className={cn(
                          score.grade === 'recommended' && 'text-green-500',
                          score.grade === 'hold' && 'text-yellow-500',
                          score.grade === 'not-recommended' && 'text-red-500'
                        )}
                      />
                    </svg>
                    <span className={cn(
                      'absolute text-xs font-bold',
                      score.score === maxScore && 'text-green-600',
                      score.score === minScore && scoreValues.length > 1 && 'text-red-600'
                    )}>
                      {score.score}
                    </span>
                  </div>
                  <Badge className={cn(
                    'text-[10px] px-1.5 py-0',
                    score.grade === 'recommended' && 'bg-green-100 text-green-700',
                    score.grade === 'hold' && 'bg-yellow-100 text-yellow-700',
                    score.grade === 'not-recommended' && 'bg-red-100 text-red-700'
                  )}>
                    {score.gradeLabel}
                  </Badge>
                </div>
              ))}
            </CompareRow>

            {/* Effective Monthly */}
            <CompareRow label="월 고정비">
              {compareProperties.map(({ property }) => {
                const value = getEffectiveMonthly(property)
                return (
                  <span key={property.id} className={cn(
                    'text-sm font-medium',
                    value === minMonthly && effectiveMonthlyValues.length > 1 && 'text-green-600 font-bold',
                    value === maxMonthly && effectiveMonthlyValues.length > 1 && minMonthly !== maxMonthly && 'text-red-600'
                  )}>
                    {value.toLocaleString('ko-KR')}만
                  </span>
                )
              })}
            </CompareRow>

            {/* Deposit */}
            <CompareRow label="보증금">
              {compareProperties.map(({ property }) => (
                <span key={property.id} className={cn(
                  'text-sm font-medium',
                  property.deposit === minDeposit && depositValues.length > 1 && 'text-green-600 font-bold',
                  property.deposit === maxDeposit && depositValues.length > 1 && minDeposit !== maxDeposit && 'text-red-600'
                )}>
                  {property.deposit.toLocaleString('ko-KR')}만
                </span>
              ))}
            </CompareRow>

            {/* Agent Kindness */}
            <CompareRow label="친절도">
              {compareProperties.map(({ property }) => (
                <div key={property.id} className="flex items-center gap-px">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn(
                      'h-3 w-3',
                      i < property.agent.kindness ? 'fill-primary text-primary' : 'text-muted-foreground/30'
                    )} />
                  ))}
                </div>
              ))}
            </CompareRow>

            {/* Appliances */}
            <CompareRow label="가구">
              {compareProperties.map(({ property }) => {
                const { ok } = getApplianceCount(property.appliances)
                return (
                  <div key={property.id} className="flex flex-col gap-1">
                    <span className={cn(
                      'text-sm font-medium',
                      ok === maxAppliances && applianceValues.length > 1 && 'text-green-600 font-bold',
                      ok === minAppliances && applianceValues.length > 1 && minAppliances !== maxAppliances && 'text-red-600'
                    )}>
                      {ok}/10
                    </span>
                    <Progress value={ok * 10} className="h-1.5 w-full" />
                  </div>
                )
              })}
            </CompareRow>

            {/* Direction */}
            <CompareRow label="방향">
              {compareProperties.map(({ property }) => (
                <span key={property.id} className="text-sm">
                  {property.direction ? `${property.direction}향` : '-'}
                </span>
              ))}
            </CompareRow>

            {/* Lighting */}
            <CompareRow label="채광">
              {compareProperties.map(({ property }) => (
                <span key={property.id} className="text-sm">{LIGHTING_LABELS[property.sensory.lighting]}</span>
              ))}
            </CompareRow>

            {/* Water Pressure */}
            <CompareRow label="수압">
              {compareProperties.map(({ property }) => (
                <span key={property.id} className="text-sm">{WATER_PRESSURE_LABELS[property.sensory.waterPressure]}</span>
              ))}
            </CompareRow>

            {/* Noise */}
            <CompareRow label="소음">
              {compareProperties.map(({ property }) => (
                <span key={property.id} className="text-sm">{NOISE_LABELS[property.sensory.noise]}</span>
              ))}
            </CompareRow>

            {/* Built Year */}
            <CompareRow label="준공">
              {compareProperties.map(({ property }) => (
                <span key={property.id} className="text-sm">
                  {property.builtYear ? `${property.builtYear}년` : '-'}
                </span>
              ))}
            </CompareRow>

            {/* Contract Conditions */}
            <CompareRow label="계약조건">
              {compareProperties.map(({ property }) => (
                <div key={property.id} className="flex flex-wrap gap-1">
                  {property.contractConditions.shortTerm && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">단기</Badge>}
                  {property.contractConditions.petsAllowed && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">반려동물</Badge>}
                  {property.contractConditions.residencyRegistration && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">전입신고</Badge>}
                  {!property.contractConditions.shortTerm && !property.contractConditions.petsAllowed && !property.contractConditions.residencyRegistration && <span className="text-sm">-</span>}
                </div>
              ))}
            </CompareRow>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children : [children]
  
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <div className="w-24 shrink-0 text-sm font-medium text-muted-foreground">
        {label}
      </div>
      {items.map((child, index) => (
        <div key={index} className="w-40 shrink-0">
          {child}
        </div>
      ))}
    </div>
  )
}
