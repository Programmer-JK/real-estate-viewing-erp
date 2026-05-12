export type ApplianceStatus = 'ok' | 'none' | 'broken'

export type Direction = '북' | '북동' | '동' | '남동' | '남' | '남서' | '서' | '북서' | ''

export type WaterPressure = 'low' | 'normal' | 'high'
export type NoiseLevel = 'quiet' | 'normal' | 'loud'
export type LightingLevel = 'dark' | 'normal' | 'bright'
export type SmellLevel = 'bad' | 'neutral' | 'good'

export type MoldLevel = 'none' | 'minor' | 'severe'
export type ConditionLevel = 'good' | 'normal' | 'bad'
export type HeatingType = 'individual' | 'central' | 'district'
export type HeatingMethod = 'floor' | 'radiator' | 'electric'
export type DoorLockType = 'keypad' | 'key' | 'card' | 'fingerprint'
export type WindowType = 'double' | 'single'

export type ScheduleStatus = 'pending' | 'visited'

export type ScorePreset = 'balanced' | 'cost' | 'environment'

export interface Agent {
  company: string
  name: string
  phone: string
  kindness: number // 1-5, 0 means not rated
  memo: string
}

export interface Schedule {
  datetime: string // ISO datetime-local string
  status: ScheduleStatus
}

export interface ContractConditions {
  shortTerm: boolean
  petsAllowed: boolean
  residencyRegistration: boolean
  parking: boolean
  depositInsurance: boolean
  earlyTermination: boolean
}

export interface Appliances {
  에어컨: ApplianceStatus
  세탁기: ApplianceStatus
  냉장고: ApplianceStatus
  인덕션: ApplianceStatus
  전자레인지: ApplianceStatus
  침대: ApplianceStatus
  책상: ApplianceStatus
  옷장: ApplianceStatus
  건조기: ApplianceStatus
  비데: ApplianceStatus
}

export interface Sensory {
  waterPressure: WaterPressure
  noise: NoiseLevel
  lighting: LightingLevel
  smell: SmellLevel
}

export interface Inspection {
  mold: MoldLevel
  floorCondition: ConditionLevel
  heatingType: HeatingType
  heatingMethod: HeatingMethod
  hasCommercial: boolean
  doorLockType: DoorLockType
  bathroomCount: number
  bathroomCondition: ConditionLevel
  hasBathtub: boolean
  windowCount: number
  windowType: WindowType
  windowCondition: ConditionLevel
}

export interface Property {
  id: string
  createdAt: string // ISO date string
  nickname: string

  // Phase 1
  agent: Agent
  schedule: Schedule

  // Phase 2
  address: string
  availableDate: string
  deposit: number // 보증금 (만원 단위)
  rent: number // 월세
  maintenance: number // 관리비
  utilitiesIncluded: boolean // 공과금 포함 여부

  direction: Direction
  floor: number
  totalFloors: number
  hasElevator: boolean
  builtYear: number

  contractConditions: ContractConditions
  appliances: Appliances
  sensory: Sensory
  inspection: Inspection

  photos: string[] // base64 encoded image strings
  memo: string
}

export const APPLIANCE_KEYS: (keyof Appliances)[] = [
  '에어컨', '세탁기', '냉장고', '인덕션', '전자레인지',
  '침대', '책상', '옷장', '건조기', '비데'
]

export const DIRECTION_OPTIONS: Direction[] = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']

export const WATER_PRESSURE_LABELS: Record<WaterPressure, string> = {
  low: '쫄쫄',
  normal: '보통',
  high: '폭포'
}

export const NOISE_LABELS: Record<NoiseLevel, string> = {
  quiet: '조용',
  normal: '생활소음',
  loud: '시끄러움'
}

export const LIGHTING_LABELS: Record<LightingLevel, string> = {
  dark: '어두움',
  normal: '보통',
  bright: '밝음'
}

export const SMELL_LABELS: Record<SmellLevel, string> = {
  bad: '악취',
  neutral: '무취',
  good: '향기'
}

export const MOLD_LABELS: Record<MoldLevel, string> = {
  none: '없음',
  minor: '경미',
  severe: '심각'
}

export const CONDITION_LABELS: Record<ConditionLevel, string> = {
  good: '양호',
  normal: '보통',
  bad: '불량'
}

export const HEATING_TYPE_LABELS: Record<HeatingType, string> = {
  individual: '개별난방',
  central: '중앙난방',
  district: '지역난방'
}

export const HEATING_METHOD_LABELS: Record<HeatingMethod, string> = {
  floor: '바닥난방',
  radiator: '라디에이터',
  electric: '전기'
}

export const DOOR_LOCK_LABELS: Record<DoorLockType, string> = {
  keypad: '비밀번호',
  key: '열쇠',
  card: '카드키',
  fingerprint: '지문'
}

export const WINDOW_TYPE_LABELS: Record<WindowType, string> = {
  double: '이중창',
  single: '단창'
}

export const DEFAULT_INSPECTION: Inspection = {
  mold: 'none',
  floorCondition: 'good',
  heatingType: 'individual',
  heatingMethod: 'floor',
  hasCommercial: false,
  doorLockType: 'keypad',
  bathroomCount: 1,
  bathroomCondition: 'good',
  hasBathtub: false,
  windowCount: 1,
  windowType: 'double',
  windowCondition: 'good',
}
