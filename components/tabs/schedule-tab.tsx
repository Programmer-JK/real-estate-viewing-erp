'use client'

import { useMemo } from 'react'
import { Calendar, Clock, MapPin, User } from 'lucide-react'
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
  isToday: boolean
  isPast: boolean
  daysFromNow: number
  items: {
    property: Property
    time: string
  }[]
}

function getTodayStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatDateLabel(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Number(dateStr.split('-')[0]), month - 1, day)
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  return `${month}월 ${day}일 ${weekdays[date.getDay()]}요일`
}

function getDaysFromNow(dateStr: string): number {
  const today = getTodayStr()
  const [ty, tm, td] = today.split('-').map(Number)
  const [gy, gm, gd] = dateStr.split('-').map(Number)
  const todayDate = new Date(ty, tm - 1, td)
  const groupDate = new Date(gy, gm - 1, gd)
  return Math.round((groupDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24))
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
  const today = getTodayStr()

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
        const daysFromNow = getDaysFromNow(date)
        groups.push({
          date,
          dateLabel: formatDateLabel(date),
          isToday: date === today,
          isPast: daysFromNow < 0,
          daysFromNow,
          items: []
        })
      }
      groups[groups.length - 1].items.push({
        property,
        time: formatTime(property.schedule.datetime)
      })
    }

    return groups
  }, [properties, today])

  const totalCount = groupedSchedules.reduce((sum, g) => sum + g.items.length, 0)
  const pendingCount = properties.filter(p => p.schedule.datetime && p.schedule.status === 'pending').length

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
          <p className="text-lg font-medium text-foreground">예정된 방문 일정이 없어요</p>
          <p className="mt-1 text-sm text-muted-foreground">매물에서 방문 일정을 추가해보세요</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-lg font-semibold">방문 일정</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">총 {totalCount}건</span>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                대기 {pendingCount}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-lg p-4 pb-8">
        {groupedSchedules.map((group) => {
          const [, month, day] = group.date.split('-').map(Number)
          return (
            <section key={group.date} className="mb-8 last:mb-0">
              {/* Date header */}
              <div className="mb-4 flex items-center gap-3">
                <div className={cn(
                  'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl',
                  group.isToday
                    ? 'bg-primary text-primary-foreground'
                    : group.isPast
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-secondary text-secondary-foreground'
                )}>
                  <span className="text-[10px] font-medium leading-none opacity-70">{month}월</span>
                  <span className="text-xl font-bold leading-tight">{day}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {group.isToday ? '오늘' : group.dateLabel}
                  </p>
                  {group.isToday && (
                    <p className="text-xs text-muted-foreground">{group.dateLabel}</p>
                  )}
                  {!group.isToday && group.daysFromNow > 0 && (
                    <p className="text-xs font-medium text-blue-500">D-{group.daysFromNow}</p>
                  )}
                  {group.isPast && (
                    <p className="text-xs text-muted-foreground">지난 일정</p>
                  )}
                </div>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {group.items.length}건
                </Badge>
              </div>

              {/* Timeline */}
              <div className="relative">
                {group.items.length > 1 && (
                  <div className="absolute bottom-5 left-[19px] top-5 w-px bg-border" />
                )}

                <div className="flex flex-col gap-3">
                  {group.items.map(({ property, time }) => {
                    const isVisited = property.schedule.status === 'visited'
                    return (
                      <div key={property.id} className="flex gap-3">
                        {/* Timeline dot */}
                        <div className="relative flex w-10 shrink-0 justify-center pt-4">
                          <div className={cn(
                            'z-10 h-3 w-3 rounded-full border-2',
                            isVisited
                              ? 'border-green-500 bg-green-500'
                              : 'border-blue-500 bg-background'
                          )} />
                        </div>

                        {/* Card */}
                        <div className="flex-1 pb-0.5">
                          <Card
                            className={cn(
                              'cursor-pointer overflow-hidden transition-all hover:shadow-md active:scale-[0.99]',
                              isVisited
                                ? 'hover:border-green-500/40'
                                : 'hover:border-blue-500/40'
                            )}
                            onClick={() => onOpenDetail(property.id)}
                          >
                            {/* Color bar */}
                            <div className={cn(
                              'h-1',
                              isVisited ? 'bg-green-500' : 'bg-blue-500'
                            )} />

                            <div className="p-3">
                              <div className="flex items-start gap-3">
                                {/* Time block */}
                                <div className={cn(
                                  'flex min-w-[52px] shrink-0 flex-col items-center justify-center rounded-lg px-2.5 py-2',
                                  isVisited
                                    ? 'bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400'
                                    : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                )}>
                                  <Clock className="mb-0.5 h-3 w-3 opacity-70" />
                                  <span className="font-mono text-sm font-bold leading-none">{time}</span>
                                </div>

                                {/* Property info */}
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate font-medium leading-tight">
                                      {property.nickname || '이름 없음'}
                                    </span>
                                    <Badge
                                      className={cn(
                                        'shrink-0 border-0 px-1.5 py-0 text-[11px]',
                                        isVisited
                                          ? 'bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-300'
                                          : 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300'
                                      )}
                                    >
                                      {isVisited ? '완료' : '예정'}
                                    </Badge>
                                  </div>

                                  {property.address && (
                                    <div className="mt-1 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      <span className="truncate text-xs text-muted-foreground">
                                        {property.address}
                                      </span>
                                    </div>
                                  )}

                                  {property.agent.name && (
                                    <div className="mt-0.5 flex items-center gap-1">
                                      <User className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      <span className="truncate text-xs text-muted-foreground">
                                        {property.agent.company} {property.agent.name}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
