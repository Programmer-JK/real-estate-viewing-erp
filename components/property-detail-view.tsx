'use client'

import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Phase1Section } from '@/components/detail-sections/phase1-section'
import { Phase2Section } from '@/components/detail-sections/phase2-section'
import { Phase3Section } from '@/components/detail-sections/phase3-section'
import { HeaderSummary } from '@/components/detail-sections/header-summary'
import { calculateScore } from '@/lib/scoring'
import type { Property, ScorePreset } from '@/lib/types'

interface PropertyDetailViewProps {
  property: Property
  scorePreset: ScorePreset
  onSave: (property: Property) => void
  onClose: () => void
  onDelete: () => void
}

export function PropertyDetailView({
  property: initialProperty,
  scorePreset,
  onSave,
  onClose,
  onDelete
}: PropertyDetailViewProps) {
  const [property, setProperty] = useState<Property>(initialProperty)
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Auto-save on property change
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(property)
    }, 500)
    return () => clearTimeout(timer)
  }, [property, onSave])

  const score = calculateScore(property, scorePreset)

  const updateProperty = useCallback((updates: Partial<Property>) => {
    setProperty(prev => ({ ...prev, ...updates }))
  }, [])

  const handleDelete = () => {
    onDelete()
    toast({ description: '매물이 삭제되었어요' })
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {isEditingNickname ? (
          <Input
            value={property.nickname}
            onChange={(e) => updateProperty({ nickname: e.target.value })}
            onBlur={() => setIsEditingNickname(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingNickname(false)}
            className="mx-4 h-8 flex-1 text-center font-semibold"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingNickname(true)}
            className="flex-1 truncate px-4 text-center font-semibold"
          >
            {property.nickname || '이름 없음'}
          </button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto flex max-w-lg flex-col gap-6 p-4">
        {/* Header Summary Card */}
        <HeaderSummary property={property} score={score} />

        {/* Phase 1: Pre-Visit */}
        <Phase1Section property={property} onUpdate={updateProperty} />

        {/* Phase 2: On-Site */}
        <Phase2Section property={property} onUpdate={updateProperty} />

        {/* Phase 3: Post-Visit Analysis */}
        <Phase3Section property={property} score={score} />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>매물 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{property.nickname || '이름 없음'}&quot; 매물을 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
