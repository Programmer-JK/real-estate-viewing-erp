'use client'

import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import type { Property } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Phase1SectionProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
}

export function Phase1Section({ property, onUpdate }: Phase1SectionProps) {
  const updateAgent = (updates: Partial<Property['agent']>) => {
    onUpdate({ agent: { ...property.agent, ...updates } })
  }

  const updateSchedule = (updates: Partial<Property['schedule']>) => {
    onUpdate({ schedule: { ...property.schedule, ...updates } })
  }

  const handleStarClick = (rating: number) => {
    // If clicking the same star, deselect (set to 0)
    const newRating = property.agent.kindness === rating ? 0 : rating
    updateAgent({ kindness: newRating })
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-primary" />
        <h2 className="text-lg font-semibold">Phase 1 - 방문 전</h2>
      </div>


      {/* Schedule Card */}
      <Card className='mb-10'>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">방문 스케줄러</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="datetime" className="text-sm text-muted-foreground">방문 일시</Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={property.schedule.datetime}
              onChange={(e) => updateSchedule({ datetime: e.target.value })}
              className="mt-1 min-h-[44px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">방문 대기</span>
              <Switch
                checked={property.schedule.status === 'visited'}
                onCheckedChange={(checked) =>
                  updateSchedule({ status: checked ? 'visited' : 'pending' })
                }
              />
              <span className="text-sm text-muted-foreground">방문 완료</span>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn(
              'w-fit',
              property.schedule.status === 'visited'
                ? 'border-green-500 bg-green-50 text-green-600'
                : 'border-blue-500 bg-blue-50 text-blue-600'
            )}
          >
            {property.schedule.status === 'visited' ? '방문 완료' : '방문 대기'}
          </Badge>
        </CardContent>
      </Card>

      {/* Agent Profile Card */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">중개인 프로필</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <Label htmlFor="company" className="text-sm text-muted-foreground">업체명</Label>
            <Input
              id="company"
              value={property.agent.company}
              onChange={(e) => updateAgent({ company: e.target.value })}
              placeholder="예: 연남공인중개사"
              className="mt-1 min-h-[44px]"
            />
          </div>

          <div>
            <Label htmlFor="agentName" className="text-sm text-muted-foreground">담당자</Label>
            <Input
              id="agentName"
              value={property.agent.name}
              onChange={(e) => updateAgent({ name: e.target.value })}
              placeholder="예: 홍길동"
              className="mt-1 min-h-[44px]"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm text-muted-foreground">연락처</Label>
            <Input
              id="phone"
              value={property.agent.phone}
              onChange={(e) => updateAgent({ phone: e.target.value })}
              placeholder="예: 010-1234-5678"
              className="mt-1 min-h-[44px]"
            />
          </div>

          <div>
            <Label className="text-sm text-muted-foreground">친절도</Label>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleStarClick(rating)}
                  className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-accent"
                >
                  <Star
                    className={cn(
                      'h-6 w-6 transition-all',
                      rating <= property.agent.kindness
                        ? 'fill-primary text-primary'
                        : 'text-muted-foreground/30'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="agentMemo" className="text-sm text-muted-foreground">메모</Label>
            <Input
              id="agentMemo"
              value={property.agent.memo}
              onChange={(e) => updateAgent({ memo: e.target.value })}
              placeholder="예: 허위매물 없음, 말이 매우 빠름"
              className="mt-1 min-h-[44px]"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
