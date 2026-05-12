'use client'

import { Home, Calendar, Scale, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TabId = 'list' | 'schedule' | 'compare' | 'settings'

interface BottomTabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  compareCount?: number
}

const tabs: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: 'list', label: '목록', icon: Home },
  { id: 'schedule', label: '일정', icon: Calendar },
  { id: 'compare', label: '비교', icon: Scale },
  { id: 'settings', label: '설정', icon: Settings },
]

export function BottomTabBar({ activeTab, onTabChange, compareCount = 0 }: BottomTabBarProps) {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex h-[60px] max-w-lg items-center justify-around">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-4 py-2 transition-colors',
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-5 w-5',
                    isActive && 'fill-primary'
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {id === 'compare' && compareCount > 0 && (
                  <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {compareCount}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
