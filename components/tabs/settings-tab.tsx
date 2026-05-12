'use client'

import { useState, useEffect } from 'react'
import { Scale, DollarSign, Sofa, AlertTriangle, Database, LogOut } from 'lucide-react'
import { logout, getCurrentUser } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import type { ScorePreset } from '@/lib/types'
import { cn } from '@/lib/utils'

interface SettingsTabProps {
  scorePreset: ScorePreset
  onPresetChange: (preset: ScorePreset) => void
  onResetData: () => void
  onLogout?: () => void
}

const PRESETS: { value: ScorePreset; label: string; description: string; icon: typeof Scale }[] = [
  {
    value: 'balanced',
    label: '균형 (기본값)',
    description: '모든 요소를 동일하게 평가',
    icon: Scale
  },
  {
    value: 'cost',
    label: '가격 중시',
    description: '비용 관련 요소에 가중치 부여',
    icon: DollarSign
  },
  {
    value: 'environment',
    label: '가구/환경 중시',
    description: '가구 및 환경 요소에 가중치 부여',
    icon: Sofa
  }
]

export function SettingsTab({
  scorePreset,
  onPresetChange,
  onResetData,
  onLogout
}: SettingsTabProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  useEffect(() => {
    getCurrentUser().then(setCurrentUser)
  }, [])

  const handleLogout = async () => {
    await logout()
    onLogout?.()
  }

  const handlePresetChange = (preset: ScorePreset) => {
    onPresetChange(preset)
    toast({ description: '스코어 가중치가 변경되었어요' })
  }

  const handleReset = () => {
    onResetData()
    setShowResetDialog(false)
    toast({ description: '모든 데이터가 초기화되었어요' })
  }

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold">설정</h1>
        </div>
      </header>

      <div className="mx-auto flex max-w-lg flex-col gap-6 p-4">
        {/* Score Preset */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI 스코어 가중치</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {PRESETS.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                onClick={() => handlePresetChange(value)}
                className={cn(
                  'flex min-h-[60px] items-center gap-4 rounded-lg border p-4 text-left transition-colors',
                  scorePreset === value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:bg-accent'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                  scorePreset === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className={cn(
                    'font-medium',
                    scorePreset === value && 'text-primary'
                  )}>
                    {label}
                  </p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">데이터 관리</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(true)}
              className="justify-start gap-2 border-destructive text-destructive hover:bg-destructive/10"
            >
              <AlertTriangle className="h-4 w-4" />
              전체 데이터 초기화
            </Button>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">계정</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {currentUser && (
              <p className="text-sm text-muted-foreground">
                로그인: <span className="font-medium text-foreground">{currentUser}</span>
              </p>
            )}
            <Button
              variant="outline"
              onClick={handleLogout}
              className="justify-start gap-2 border-destructive text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </Button>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>자취방 발품 올인원 시스템</p>
          <p>Real Estate Tour ERP v1.0</p>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>전체 데이터 초기화</AlertDialogTitle>
            <AlertDialogDescription>
              모든 매물 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              초기화
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
