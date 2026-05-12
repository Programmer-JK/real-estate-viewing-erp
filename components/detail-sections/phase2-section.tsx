'use client'

import { useState, useRef } from 'react'
import { Copy, Check, X, AlertTriangle, ImagePlus, Compass, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'
import type { Property, Direction, ApplianceStatus, WaterPressure, NoiseLevel, LightingLevel, SmellLevel, MoldLevel, ConditionLevel, HeatingType, HeatingMethod, DoorLockType, WindowType } from '@/lib/types'
import { APPLIANCE_KEYS, WATER_PRESSURE_LABELS, NOISE_LABELS, LIGHTING_LABELS, SMELL_LABELS, MOLD_LABELS, CONDITION_LABELS, HEATING_TYPE_LABELS, HEATING_METHOD_LABELS, DOOR_LOCK_LABELS, WINDOW_TYPE_LABELS, DEFAULT_INSPECTION } from '@/lib/types'
import { getDirectionWarning, getBuildingAgeWarning, getApplianceCount, getEffectiveMonthly, getAnnualCost, getAnnualWithDeposit } from '@/lib/scoring'
import { cn } from '@/lib/utils'

interface Phase2SectionProps {
  property: Property
  onUpdate: (updates: Partial<Property>) => void
}

const APPLIANCE_ICONS: Record<string, string> = {
  에어컨: '❄️',
  세탁기: '🧺',
  냉장고: '🧊',
  인덕션: '🔥',
  전자레인지: '📻',
  침대: '🛏️',
  책상: '📝',
  옷장: '👕',
  건조기: '💨',
  비데: '🚽'
}

export function Phase2Section({ property, onUpdate }: Phase2SectionProps) {
  const [copied, setCopied] = useState(false)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyAddress = () => {
    if (property.address) {
      navigator.clipboard.writeText(property.address)
      setCopied(true)
      toast({ description: '주소가 복사되었어요' })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${property.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('property-photos')
        .upload(path, file, { upsert: false })
      if (error) {
        toast({ description: `사진 업로드 실패: ${file.name}` })
        continue
      }
      const { data: urlData } = supabase.storage
        .from('property-photos')
        .getPublicUrl(path)
      uploaded.push(urlData.publicUrl)
    }

    if (uploaded.length > 0) {
      onUpdate({ photos: [...property.photos, ...uploaded] })
    }
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = async (index: number) => {
    const url = property.photos[index]
    const newPhotos = property.photos.filter((_, i) => i !== index)
    onUpdate({ photos: newPhotos })

    // Delete from Supabase Storage if it's a storage URL
    const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (storageUrl && url.includes(storageUrl)) {
      const pathMatch = url.match(/property-photos\/(.+)$/)
      if (pathMatch) {
        await supabase.storage.from('property-photos').remove([pathMatch[1]])
      }
    }
  }

  const cycleApplianceStatus = (key: keyof Property['appliances']) => {
    const currentStatus = property.appliances[key]
    const nextStatus: ApplianceStatus =
      currentStatus === 'ok' ? 'none' :
        currentStatus === 'none' ? 'broken' : 'ok'

    onUpdate({
      appliances: { ...property.appliances, [key]: nextStatus }
    })
  }

  const inspection: typeof DEFAULT_INSPECTION = {
    ...DEFAULT_INSPECTION,
    ...(property.inspection ?? {}),
  }

  const directionWarning = getDirectionWarning(property.direction, property.sensory.lighting)
  const buildingWarning = getBuildingAgeWarning(property.builtYear)
  const { ok, broken, none } = getApplianceCount(property.appliances)
  const effectiveMonthly = getEffectiveMonthly(property)
  const annualCost = getAnnualCost(property)
  const annualWithDeposit = getAnnualWithDeposit(property)

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-teal-500" />
        <h2 className="text-lg font-semibold">Phase 2 - 방문 중</h2>
      </div>

      <Accordion type="multiple" defaultValue={['address', 'appliances', 'sensory', 'inspection', 'photos']} className="flex flex-col gap-3">
        {/* Address & Price Info */}
        <AccordionItem value="address" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-medium">주소 및 가격 정보</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pb-4">
            {/* Address */}
            <div>
              <Label className="text-sm text-muted-foreground">주소</Label>
              <div className="mt-1 flex gap-2">
                <Input
                  value={property.address}
                  onChange={(e) => onUpdate({ address: e.target.value })}
                  placeholder="서울시 마포구 연남동 239-15"
                  className="min-h-[44px] flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyAddress}
                  className="h-11 w-11 shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Direction */}
            <div>
              <Label className="text-sm text-muted-foreground">방향 (향)</Label>
              <div className="mt-2 grid grid-cols-3 gap-1.5">
                {(['북서', '북', '북동', '서', null, '동', '남서', '남', '남동'] as const).map((dir, i) => {
                  if (!dir) {
                    return (
                      <div key={i} className="flex items-center justify-center">
                        <Compass className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )
                  }
                  return (
                    <button
                      key={dir}
                      onClick={() => onUpdate({ direction: property.direction === dir ? '' : dir })}
                      className={cn(
                        'min-h-[44px] rounded-lg border text-sm font-medium transition-colors',
                        property.direction === dir
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-accent'
                      )}
                    >
                      {dir}향
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Price Fields - Vertical Layout */}
            <div className="flex flex-col gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">보증금</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={property.deposit || ''}
                    onChange={(e) => onUpdate({ deposit: parseInt(e.target.value) || 0 })}
                    className="min-h-[44px]"
                    placeholder="1000"
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">만원</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">월세</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={property.rent || ''}
                    onChange={(e) => onUpdate({ rent: parseInt(e.target.value) || 0 })}
                    className="min-h-[44px]"
                    placeholder="50"
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">만원</span>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">관리비</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={property.maintenance || ''}
                    onChange={(e) => onUpdate({ maintenance: parseInt(e.target.value) || 0 })}
                    className="min-h-[44px]"
                    placeholder="5"
                  />
                  <span className="shrink-0 text-sm text-muted-foreground">만원</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="utilitiesIncluded"
                checked={!property.utilitiesIncluded}
                onCheckedChange={(checked) => onUpdate({ utilitiesIncluded: !checked })}
                className="h-6 w-6"
              />
              <Label htmlFor="utilitiesIncluded" className="text-sm">공과금 별도</Label>
            </div>

            {/* Auto Calculated */}
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              <p>실질 월 고정비: 월세 + 관리비 = <span className="font-medium text-foreground">{effectiveMonthly.toLocaleString('ko-KR')}만원</span></p>
              <p>연간 총비용: <span className="font-medium text-foreground">{annualCost.toLocaleString('ko-KR')}만원</span></p>
              <p>보증금 포함 1년: <span className="font-medium text-foreground">{annualWithDeposit.toLocaleString('ko-KR')}만원</span></p>
            </div>

            {/* Building Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-muted-foreground">층수</Label>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">내 방</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={property.floor || ''}
                        onChange={(e) => onUpdate({ floor: parseInt(e.target.value) || 0 })}
                        className="min-h-[44px]"
                        placeholder="3"
                      />
                      <span className="shrink-0 text-sm text-muted-foreground">층</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">전체</span>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        inputMode="numeric"
                        value={property.totalFloors || ''}
                        onChange={(e) => onUpdate({ totalFloors: parseInt(e.target.value) || 0 })}
                        className="min-h-[44px]"
                        placeholder="5"
                      />
                      <span className="shrink-0 text-sm text-muted-foreground">층</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">엘리베이터</Label>
                <div className="mt-1 flex flex-col gap-1">
                  <span className="text-xs opacity-0">-</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpdate({ hasElevator: true })}
                      className={cn(
                        'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                        property.hasElevator
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-accent'
                      )}
                    >
                      있음
                    </button>
                    <button
                      onClick={() => onUpdate({ hasElevator: false })}
                      className={cn(
                        'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                        !property.hasElevator
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-accent'
                      )}
                    >
                      없음
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-sm text-muted-foreground">준공연도</Label>
                <div className="mt-1 flex items-center gap-1">
                  <Input
                    type="number"
                    value={property.builtYear || ''}
                    onChange={(e) => onUpdate({ builtYear: parseInt(e.target.value) || 0 })}
                    className="min-h-[44px]"
                    placeholder="2010"
                  />
                  <span className="text-sm text-muted-foreground">년</span>
                </div>
              </div>
              {buildingWarning && (
                <Badge
                  variant="outline"
                  className={cn(
                    'mt-6',
                    buildingWarning.severity === 'danger'
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-orange-500 bg-orange-50 text-orange-600'
                  )}
                >
                  {buildingWarning.label}
                </Badge>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Contract Conditions */}
        <AccordionItem value="contract" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-medium">계약 조건</AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'shortTerm', label: '단기계약', sub: '6개월 이하' },
                { key: 'petsAllowed', label: '반려동물', sub: '허용' },
                { key: 'residencyRegistration', label: '전입신고', sub: '가능' },
                { key: 'parking', label: '주차', sub: '가능' },
                { key: 'depositInsurance', label: '보증보험', sub: '가입 가능' },
                { key: 'earlyTermination', label: '중도해지', sub: '가능' },
              ] as const).map(({ key, label, sub }) => {
                const checked = property.contractConditions[key]
                return (
                  <button
                    key={key}
                    onClick={() => onUpdate({
                      contractConditions: { ...property.contractConditions, [key]: !checked }
                    })}
                    className={cn(
                      'flex min-h-[56px] flex-col items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                      checked
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    <span>{label}</span>
                    <span className={cn('text-xs', checked ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{sub}</span>
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Appliances Checklist */}
        <AccordionItem value="appliances" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-medium">
            <div className="flex flex-col gap-2">
              <span>가구 / 가전 체크리스트</span>
              <span className="text-sm font-normal text-muted-foreground">
                구비 {ok}개 / 상태불량 {broken}개 / 없음 {none}개
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {APPLIANCE_KEYS.map((key) => {
                const status = property.appliances[key]
                return (
                  <button
                    key={key}
                    onClick={() => cycleApplianceStatus(key)}
                    className={cn(
                      'flex min-h-[80px] flex-col items-center justify-center gap-1 rounded-lg border p-2 transition-all active:scale-95',
                      status === 'ok' && 'border-green-500 bg-green-50 text-green-700',
                      status === 'broken' && 'border-orange-500 bg-orange-50 text-orange-700',
                      status === 'none' && 'border-border bg-muted text-muted-foreground'
                    )}
                  >
                    <span className="text-xl">{APPLIANCE_ICONS[key]}</span>
                    <span className="text-sm font-medium">{key}</span>
                    <span className="text-xs">
                      {status === 'ok' && '구비됨'}
                      {status === 'broken' && '상태불량'}
                      {status === 'none' && '없음'}
                    </span>
                  </button>
                )
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Sensory Checklist */}
        <AccordionItem value="sensory" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-medium">현장 오감 체크</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pb-4">
            {/* Water Pressure */}
            <div className="flex items-center gap-4">
              <span className="w-12 text-sm text-muted-foreground">수압</span>
              <div className="flex flex-1 gap-2">
                {(['low', 'normal', 'high'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ sensory: { ...property.sensory, waterPressure: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      property.sensory.waterPressure === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {WATER_PRESSURE_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* Noise */}
            <div className="flex items-center gap-4">
              <span className="w-12 text-sm text-muted-foreground">소음</span>
              <div className="flex flex-1 gap-2">
                {(['quiet', 'normal', 'loud'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ sensory: { ...property.sensory, noise: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      property.sensory.noise === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {NOISE_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* Lighting */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="w-12 text-sm text-muted-foreground">채광</span>
                <div className="flex flex-1 gap-2">
                  {(['dark', 'normal', 'bright'] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => onUpdate({ sensory: { ...property.sensory, lighting: value } })}
                      className={cn(
                        'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                        property.sensory.lighting === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-accent'
                      )}
                    >
                      {LIGHTING_LABELS[value]}
                    </button>
                  ))}
                </div>
              </div>
              {directionWarning && (
                <Badge variant="outline" className="self-center border-yellow-500 bg-yellow-50 text-yellow-600">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {directionWarning}
                </Badge>
              )}
            </div>

            {/* Smell */}
            <div className="flex items-center gap-4">
              <span className="w-12 text-sm text-muted-foreground">냄새</span>
              <div className="flex flex-1 gap-2">
                {(['bad', 'neutral', 'good'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ sensory: { ...property.sensory, smell: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      property.sensory.smell === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {SMELL_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Inspection */}
        <AccordionItem value="inspection" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-medium">시설 상태 점검</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-5 pb-4">

            {/* 곰팡이 */}
            <div className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-sm text-muted-foreground">곰팡이</span>
              <div className="flex flex-1 gap-2">
                {(['none', 'minor', 'severe'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ inspection: { ...inspection, mold: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      inspection.mold === value
                        ? value === 'none'
                          ? 'border-primary bg-primary text-primary-foreground'
                          : value === 'minor'
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-red-500 bg-red-50 text-red-700'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {MOLD_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* 바닥 상태 */}
            <div className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-sm text-muted-foreground">바닥 상태</span>
              <div className="flex flex-1 gap-2">
                {(['good', 'normal', 'bad'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ inspection: { ...inspection, floorCondition: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      inspection.floorCondition === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {CONDITION_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* 난방 방식 */}
            <div className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-sm text-muted-foreground">난방</span>
              <div className="flex flex-1 gap-2">
                {(['individual', 'central', 'district'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ inspection: { ...inspection, heatingType: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-xs font-medium transition-colors',
                      inspection.heatingType === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {HEATING_TYPE_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* 난방 타입 */}
            <div className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-sm text-muted-foreground">방식</span>
              <div className="flex flex-1 gap-2">
                {(['floor', 'radiator', 'electric'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ inspection: { ...inspection, heatingMethod: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-xs font-medium transition-colors',
                      inspection.heatingMethod === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {HEATING_METHOD_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* 상가 여부 */}
            <div className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-sm text-muted-foreground">상가</span>
              <div className="flex flex-1 gap-2">
                {([true, false] as const).map((value) => (
                  <button
                    key={String(value)}
                    onClick={() => onUpdate({ inspection: { ...inspection, hasCommercial: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      inspection.hasCommercial === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {value ? '있음' : '없음'}
                  </button>
                ))}
              </div>
            </div>

            {/* 도어락 */}
            <div className="flex items-center gap-4">
              <span className="w-14 shrink-0 text-sm text-muted-foreground">도어락</span>
              <div className="flex flex-1 flex-wrap gap-2">
                {(['keypad', 'key', 'card', 'fingerprint'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ inspection: { ...inspection, doorLockType: value } })}
                    className={cn(
                      'min-h-[44px] flex-1 rounded-lg border text-xs font-medium transition-colors',
                      inspection.doorLockType === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {DOOR_LOCK_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

            {/* 화장실 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">화장실</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">개수</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdate({ inspection: { ...inspection, bathroomCount: Math.max(1, inspection.bathroomCount - 1) } })}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg hover:bg-accent"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{inspection.bathroomCount}</span>
                    <button
                      onClick={() => onUpdate({ inspection: { ...inspection, bathroomCount: inspection.bathroomCount + 1 } })}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg hover:bg-accent"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 gap-2">
                  {(['good', 'normal', 'bad'] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => onUpdate({ inspection: { ...inspection, bathroomCondition: value } })}
                      className={cn(
                        'min-h-[36px] flex-1 rounded-lg border text-xs font-medium transition-colors',
                        inspection.bathroomCondition === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-accent'
                      )}
                    >
                      {CONDITION_LABELS[value]}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onUpdate({ inspection: { ...inspection, hasBathtub: !inspection.hasBathtub } })}
                className={cn(
                  'flex min-h-[40px] items-center justify-center rounded-lg border text-sm font-medium transition-colors',
                  inspection.hasBathtub
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:bg-accent'
                )}
              >
                욕조 {inspection.hasBathtub ? '있음' : '없음'}
              </button>
            </div>

            {/* 창문 */}
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">창문</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">개수</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdate({ inspection: { ...inspection, windowCount: Math.max(1, inspection.windowCount - 1) } })}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg hover:bg-accent"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-medium">{inspection.windowCount}</span>
                    <button
                      onClick={() => onUpdate({ inspection: { ...inspection, windowCount: inspection.windowCount + 1 } })}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg hover:bg-accent"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-1 gap-2">
                  {(['double', 'single'] as const).map((value) => (
                    <button
                      key={value}
                      onClick={() => onUpdate({ inspection: { ...inspection, windowType: value } })}
                      className={cn(
                        'min-h-[36px] flex-1 rounded-lg border text-xs font-medium transition-colors',
                        inspection.windowType === value
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card text-foreground hover:bg-accent'
                      )}
                    >
                      {WINDOW_TYPE_LABELS[value]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                {(['good', 'normal', 'bad'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => onUpdate({ inspection: { ...inspection, windowCondition: value } })}
                    className={cn(
                      'min-h-[40px] flex-1 rounded-lg border text-sm font-medium transition-colors',
                      inspection.windowCondition === value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-foreground hover:bg-accent'
                    )}
                  >
                    {CONDITION_LABELS[value]}
                  </button>
                ))}
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>

        {/* Photos */}
        <AccordionItem value="photos" className="rounded-lg border bg-card px-4">
          <AccordionTrigger className="text-base font-medium">현장 사진</AccordionTrigger>
          <AccordionContent className="pb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mb-3 w-full gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              사진 추가
            </Button>

            {property.photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {property.photos.map((photo, index) => (
                  <div key={index} className="relative shrink-0">
                    <button
                      onClick={() => setSelectedPhotoIndex(index)}
                      className="block overflow-hidden rounded-lg"
                    >
                      <img
                        src={photo}
                        alt={`현장 사진 ${index + 1}`}
                        className="h-20 w-20 object-cover"
                      />
                    </button>
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Memo */}
        <Card className="p-4 gap-2">
          <Label className="text-base font-medium">현장 메모</Label>
          <Textarea
            value={property.memo}
            onChange={(e) => onUpdate({ memo: e.target.value })}
            placeholder="채광은 좋으나 창문 바로 앞 건물이 가림 / 복도 담배 냄새 있음 / 관리비 실제로 10만원 이상 나온다고 함"
            className="min-h-[150px]"
          />
        </Card>
      </Accordion>

      {/* Photo Preview Dialog */}
      <Dialog open={selectedPhotoIndex !== null} onOpenChange={() => setSelectedPhotoIndex(null)}>
        <DialogContent className="max-w-[90vw] gap-0 p-0">
          {selectedPhotoIndex !== null && (
            <>
              <img
                src={property.photos[selectedPhotoIndex]}
                alt={`현장 사진 ${selectedPhotoIndex + 1}`}
                className="h-auto w-full rounded-t-lg object-contain"
              />
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  onClick={() => setSelectedPhotoIndex(i => i !== null && i > 0 ? i - 1 : i)}
                  disabled={selectedPhotoIndex === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm text-muted-foreground">
                  {selectedPhotoIndex + 1} / {property.photos.length}
                </span>
                <button
                  onClick={() => setSelectedPhotoIndex(i => i !== null && i < property.photos.length - 1 ? i + 1 : i)}
                  disabled={selectedPhotoIndex === property.photos.length - 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full border disabled:opacity-30"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}
