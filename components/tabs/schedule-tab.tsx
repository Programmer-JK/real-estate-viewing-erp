'use client'

import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Property } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScheduleTabProps {
  properties: Property[]
  onOpenDetail: (propertyId: string) => void
}

interface GroupedSchedule {
  date: string
  dateLabel: string
  items: {
    property: Property
    time: string
  }[]
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`
}

function formatTime(isoString: string): string {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export function ScheduleTab({ properties, onOpenDetail }: ScheduleTabProps) {
  const groupedSchedules = useMemo(() => {
    const withSchedule = properties
      .filter(p => p.schedule.datetime)
      .sort((a, b) => new Date(a.schedule.datetime).getTime() - new Date(b.schedule.datetime).getTime())

    const groups: GroupedSchedule[] = []
    let currentDate = ''

    for (const property of withSchedule) {
      const date = property.schedule.datetime.split('T')[0]
      if (date !== currentDate) {
        currentDate = date
        groups.push({
          date,
          dateLabel: formatDateLabel(date),
          items: []
        })
      }
      groups[groups.length - 1].items.push({
        property,
        time: formatTime(property.schedule.datetime)
      })
    }

    return groups
  }, [properties])

  if (groupedSchedules.length === 0) {
    return (
      <div className="flex flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card">
          <div className="mx-auto flex h-14 max-w-lg items-center px-4">
            <h1 className="text-lg font-semibold">방문 일정</h1>
          </div>
        </header>

        <div className="mx-auto flex max-w-lg flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            예정된 방문 일정이 없어요
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            매물에서 방문 일정을 추가해보세요
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold">방문 일정</h1>
        </div>
      </header>

      <div className="mx-auto flex max-w-lg flex-col gap-6 p-4">
        {groupedSchedules.map((group) => (
          <section key={group.date}>
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">
              {group.dateLabel}
            </h2>
            <div className="flex flex-col gap-2">
              {group.items.map(({ property, time }) => (
                <Card
                  key={property.id}
                  className="flex cursor-pointer items-start gap-4 p-4 transition-colors hover:border-primary/50"
                  onClick={() => onOpenDetail(property.id)}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-semibold text-primary">
                    {time}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{property.nickname || '이름 없음'}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs',
                          property.schedule.status === 'visited'
                            ? 'border-green-500 text-green-600'
                            : 'border-blue-500 text-blue-600'
                        )}
                      >
                        {property.schedule.status === 'visited' ? '완료' : '대기'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {property.address || '주소 미입력'}
                    </p>
                    {property.agent.name && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {property.agent.company} {property.agent.name}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
