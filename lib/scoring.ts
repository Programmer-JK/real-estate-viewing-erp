import type { Property, ScorePreset, Direction, Appliances, Sensory } from './types'
import { APPLIANCE_KEYS } from './types'

export interface ScoreResult {
  score: number
  grade: 'recommended' | 'hold' | 'not-recommended'
  gradeLabel: string
  reason: string
}

function countAppliances(appliances: Appliances): { ok: number; broken: number; none: number } {
  let ok = 0, broken = 0, none = 0
  for (const key of APPLIANCE_KEYS) {
    const status = appliances[key]
    if (status === 'ok') ok++
    else if (status === 'broken') broken++
    else none++
  }
  return { ok, broken, none }
}

function getDirectionBonus(direction: Direction): number {
  if (direction === '남' || direction === '남동') return 5
  if (direction === '동' || direction === '서' || direction === '남서') return 2
  return 0
}

function getBuildingPenalty(builtYear: number): number {
  if (!builtYear) return 0
  const currentYear = new Date().getFullYear()
  const age = currentYear - builtYear
  if (age >= 30) return -10
  if (age >= 20) return -5
  return 0
}

function getSensoryScore(sensory: Sensory): number {
  let score = 0
  
  // 수압: 쫄쫄=0, 보통=5, 폭포=10
  if (sensory.waterPressure === 'high') score += 10
  else if (sensory.waterPressure === 'normal') score += 5
  
  // 소음: 시끄러움=0, 생활소음=5, 조용=10
  if (sensory.noise === 'quiet') score += 10
  else if (sensory.noise === 'normal') score += 5
  
  // 채광: 어두움=0, 보통=5, 밝음=10
  if (sensory.lighting === 'bright') score += 10
  else if (sensory.lighting === 'normal') score += 5
  
  // 냄새: 악취=0, 무취=5, 향기=10
  if (sensory.smell === 'good') score += 10
  else if (sensory.smell === 'neutral') score += 5
  
  return score
}

export function calculateScore(property: Property, preset: ScorePreset): ScoreResult {
  const { ok, broken } = countAppliances(property.appliances)
  
  // Base scores
  let applianceScore = ok * 5 + broken * -3 // max 50 (10 items × 5)
  let sensoryScore = getSensoryScore(property.sensory) // max 40
  const directionBonus = getDirectionBonus(property.direction)
  const buildingPenalty = getBuildingPenalty(property.builtYear)
  const visitBonus = property.schedule.status === 'visited' ? 10 : 0
  
  // Apply preset weights
  let weightedApplianceScore = applianceScore
  let weightedSensoryScore = sensoryScore
  let costPenalty = 0
  
  if (preset === 'environment') {
    weightedApplianceScore *= 2
    weightedSensoryScore *= 2
  } else if (preset === 'cost') {
    // Invert cost into a penalty scale
    // Lower cost = higher score
    const effectiveMonthly = property.rent + property.maintenance
    if (effectiveMonthly > 100) costPenalty = -20
    else if (effectiveMonthly > 80) costPenalty = -10
    else if (effectiveMonthly > 60) costPenalty = -5
    else if (effectiveMonthly < 40) costPenalty = 15
    else if (effectiveMonthly < 50) costPenalty = 10
    else if (effectiveMonthly < 60) costPenalty = 5
    costPenalty *= 2 // Apply cost weight
  }
  
  let totalScore = weightedApplianceScore + weightedSensoryScore + directionBonus + buildingPenalty + visitBonus + costPenalty
  
  // Normalize to 0-100
  // Max possible (environment preset): 100 + 80 + 5 + 10 = 195 -> normalize
  // For simplicity, we'll clamp between 0 and 100
  totalScore = Math.min(100, Math.max(0, totalScore))
  
  // Determine grade
  let grade: 'recommended' | 'hold' | 'not-recommended'
  let gradeLabel: string
  
  if (totalScore >= 70) {
    grade = 'recommended'
    gradeLabel = '추천'
  } else if (totalScore >= 50) {
    grade = 'hold'
    gradeLabel = '보류'
  } else {
    grade = 'not-recommended'
    gradeLabel = '비추천'
  }
  
  // Generate reason
  const reasons: string[] = []
  
  // Positive aspects
  if (property.sensory.lighting === 'bright') reasons.push('채광 양호')
  if (property.sensory.waterPressure === 'high') reasons.push('수압 좋음')
  if (property.sensory.noise === 'quiet') reasons.push('조용함')
  if (ok >= 7) reasons.push(`가구 ${ok}/10 확보`)
  if (property.direction === '남' || property.direction === '남동') reasons.push('좋은 향')
  
  // Negative aspects
  if (property.sensory.lighting === 'dark') reasons.push('채광 부족')
  if (property.sensory.waterPressure === 'low') reasons.push('수압 약함')
  if (property.sensory.noise === 'loud') reasons.push('소음 있음')
  if (property.sensory.smell === 'bad') reasons.push('냄새 있음')
  if (broken > 0) reasons.push(`가전 ${broken}개 고장`)
  if (buildingPenalty < 0) reasons.push('노후건물 주의')
  
  const reason = reasons.slice(0, 4).join(', ') || '데이터 부족'
  
  return {
    score: Math.round(totalScore),
    grade,
    gradeLabel,
    reason
  }
}

export function getApplianceCount(appliances: Appliances) {
  return countAppliances(appliances)
}

export function getEffectiveMonthly(property: Property): number {
  return property.rent + property.maintenance
}

export function getAnnualCost(property: Property): number {
  return getEffectiveMonthly(property) * 12
}

export function getAnnualWithDeposit(property: Property): number {
  return getAnnualCost(property) + property.deposit
}

export function getApplianceRate(appliances: Appliances): number {
  const { ok } = countAppliances(appliances)
  return (ok / 10) * 100
}

export function getDirectionWarning(direction: Direction, lighting: 'dark' | 'normal' | 'bright'): string | null {
  // direction is 북 or 북서 AND lighting is 'bright' → "채광 재확인"
  if ((direction === '북' || direction === '북서') && lighting === 'bright') {
    return '채광 재확인'
  }
  // direction is 남 or 남동 AND lighting is 'dark' → "앞 건물 의심"
  if ((direction === '남' || direction === '남동') && lighting === 'dark') {
    return '앞 건물 의심'
  }
  return null
}

export function getBuildingAgeWarning(builtYear: number): { label: string; severity: 'warning' | 'danger' } | null {
  if (!builtYear) return null
  const currentYear = new Date().getFullYear()
  const age = currentYear - builtYear
  if (age >= 30) {
    return { label: `준공 ${age}년+ 주의`, severity: 'danger' }
  }
  if (age >= 20) {
    return { label: `준공 ${age}년+ 노후건물`, severity: 'warning' }
  }
  return null
}
