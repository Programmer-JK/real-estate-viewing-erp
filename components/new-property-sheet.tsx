'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { createDefaultProperty } from '@/lib/store'
import type { Property } from '@/lib/types'

interface NewPropertySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (property: Property) => void
}

export function NewPropertySheet({ open, onOpenChange, onAdd }: NewPropertySheetProps) {
  const [nickname, setNickname] = useState('')
  const [deposit, setDeposit] = useState('')
  const [rent, setRent] = useState('')
  const [maintenance, setMaintenance] = useState('')

  const handleSubmit = () => {
    if (!nickname.trim()) {
      toast({ description: '매물 별칭을 입력해주세요' })
      return
    }

    const newProperty = createDefaultProperty()
    newProperty.nickname = nickname.trim()
    newProperty.deposit = deposit ? Number(deposit) : 0
    newProperty.rent = rent ? Number(rent) : 0
    newProperty.maintenance = maintenance ? Number(maintenance) : 0

    onAdd(newProperty)
    setNickname('')
    setDeposit('')
    setRent('')
    setMaintenance('')
    onOpenChange(false)

    toast({ description: '매물이 추가되었어요' })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl mx-auto max-w-lg">
        <SheetHeader>
          <SheetTitle>새 매물 추가</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 py-4 px-4">
          <div>
            <Label htmlFor="nickname" className="mb-2 block text-sm font-medium">
              매물 이름
            </Label>
            <Input
              id="nickname"
              placeholder="예: 연남동 3층, 신촌역 원룸"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="min-h-[44px]"
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="deposit" className="mb-2 block text-sm font-medium">
              보증금 (만원)
            </Label>
            <Input
              id="deposit"
              type="number"
              inputMode="numeric"
              placeholder="예: 1000"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div>
            <Label htmlFor="rent" className="mb-2 block text-sm font-medium">
              월세 (만원)
            </Label>
            <Input
              id="rent"
              type="number"
              inputMode="numeric"
              placeholder="예: 50"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <div>
            <Label htmlFor="maintenance" className="mb-2 block text-sm font-medium">
              관리비 (만원)
            </Label>
            <Input
              id="maintenance"
              type="number"
              inputMode="numeric"
              placeholder="예: 5"
              value={maintenance}
              onChange={(e) => setMaintenance(e.target.value)}
              className="min-h-[44px]"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            나중에 상세 정보는 매물 상세에서 추가할 수 있어요
          </p>
        </div>

        <SheetFooter>
          <Button onClick={handleSubmit} className="w-full">
            추가하기
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
