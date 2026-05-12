'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Property, ScorePreset, Appliances } from './types'
import { APPLIANCE_KEYS } from './types'
import { supabase } from './supabase'

const PRESET_KEY = 'realestate-erp-score-preset'
const COMPARE_KEY = 'realestate-erp-compare'

export function createDefaultProperty(): Property {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    nickname: '',
    agent: {
      company: '',
      name: '',
      phone: '',
      kindness: 0,
      memo: ''
    },
    schedule: {
      datetime: '',
      status: 'pending'
    },
    address: '',
    availableDate: '',
    deposit: 0,
    rent: 0,
    maintenance: 0,
    utilitiesIncluded: false,
    direction: '',
    floor: 0,
    totalFloors: 0,
    hasElevator: false,
    builtYear: 0,
    contractConditions: {
      shortTerm: false,
      petsAllowed: false,
      residencyRegistration: false
    },
    appliances: APPLIANCE_KEYS.reduce((acc, key) => {
      acc[key] = 'none'
      return acc
    }, {} as Appliances),
    sensory: {
      waterPressure: 'normal',
      noise: 'normal',
      lighting: 'normal',
      smell: 'neutral'
    },
    photos: [],
    memo: ''
  }
}

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: 'sample-1',
    createdAt: new Date().toISOString(),
    nickname: '연남동 빌라',
    agent: {
      company: '연남공인중개사',
      name: '박민준',
      phone: '010-1234-5678',
      kindness: 4,
      memo: '허위매물 없음'
    },
    schedule: {
      datetime: new Date(Date.now() - 86400000).toISOString().slice(0, 16),
      status: 'visited'
    },
    address: '서울시 마포구 연남동 239-15',
    availableDate: '',
    deposit: 1000,
    rent: 65,
    maintenance: 8,
    utilitiesIncluded: false,
    direction: '남동',
    floor: 3,
    totalFloors: 5,
    hasElevator: false,
    builtYear: 2010,
    contractConditions: {
      shortTerm: false,
      petsAllowed: false,
      residencyRegistration: true
    },
    appliances: {
      에어컨: 'ok',
      세탁기: 'ok',
      냉장고: 'ok',
      인덕션: 'none',
      전자레인지: 'ok',
      침대: 'ok',
      책상: 'ok',
      옷장: 'ok',
      건조기: 'none',
      비데: 'none'
    },
    sensory: {
      waterPressure: 'normal',
      noise: 'quiet',
      lighting: 'bright',
      smell: 'neutral'
    },
    photos: [],
    memo: '채광 훌륭함. 남동향이라 오전 햇살 좋음. 단, 엘베 없어서 짐 이동 불편할 듯.'
  },
  {
    id: 'sample-2',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    nickname: '신촌 원룸',
    agent: {
      company: '신촌부동산',
      name: '이지은',
      phone: '010-9876-5432',
      kindness: 3,
      memo: '말이 매우 빠름'
    },
    schedule: {
      datetime: new Date(Date.now() - 172800000).toISOString().slice(0, 16),
      status: 'visited'
    },
    address: '서울시 서대문구 신촌동 134-8',
    availableDate: '',
    deposit: 500,
    rent: 55,
    maintenance: 5,
    utilitiesIncluded: true,
    direction: '북',
    floor: 2,
    totalFloors: 4,
    hasElevator: true,
    builtYear: 1998,
    contractConditions: {
      shortTerm: true,
      petsAllowed: true,
      residencyRegistration: false
    },
    appliances: {
      에어컨: 'ok',
      세탁기: 'ok',
      냉장고: 'ok',
      인덕션: 'broken',
      전자레인지: 'none',
      침대: 'ok',
      책상: 'ok',
      옷장: 'broken',
      건조기: 'none',
      비데: 'none'
    },
    sensory: {
      waterPressure: 'low',
      noise: 'loud',
      lighting: 'dark',
      smell: 'bad'
    },
    photos: [],
    memo: '복도 담배 냄새 심함. 수압 매우 약함. 가격은 저렴하나 북향이라 어두움. 재확인 필요.'
  }
]

export function usePropertyStore() {
  const [properties, setProperties] = useState<Property[]>([])
  const [scorePreset, setScorePreset] = useState<ScorePreset>('balanced')
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from Supabase on mount
  useEffect(() => {
    async function load() {
      try {
        // Load local UI prefs
        const storedPreset = localStorage.getItem(PRESET_KEY)
        const storedCompare = localStorage.getItem(COMPARE_KEY)
        if (storedPreset) setScorePreset(storedPreset as ScorePreset)
        if (storedCompare) setCompareIds(JSON.parse(storedCompare))

        // Load properties from Supabase
        const { data, error } = await supabase
          .from('properties')
          .select('data')
          .order('created_at', { ascending: false })

        if (error) throw error

        if (data && data.length > 0) {
          setProperties(data.map(row => row.data as Property))
        }
      } catch (err) {
        console.error('[supabase] load error:', err)
      } finally {
        setIsLoaded(true)
      }
    }
    load()
  }, [])

  // Persist scorePreset to localStorage
  useEffect(() => {
    if (isLoaded) localStorage.setItem(PRESET_KEY, scorePreset)
  }, [scorePreset, isLoaded])

  // Persist compareIds to localStorage
  useEffect(() => {
    if (isLoaded) localStorage.setItem(COMPARE_KEY, JSON.stringify(compareIds))
  }, [compareIds, isLoaded])

  const addProperty = useCallback(async (property: Property) => {
    // Optimistic update
    setProperties(prev => [property, ...prev])
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('properties').insert({
      id: property.id,
      user_id: user.id,
      data: property
    })
  }, [])

  const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
    // Optimistic update
    setProperties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
    const updated = await getFullProperty(id, updates)
    if (!updated) return
    await supabase
      .from('properties')
      .update({ data: updated })
      .eq('id', id)
  }, [])

  const deleteProperty = useCallback(async (id: string) => {
    // Optimistic update
    setProperties(prev => prev.filter(p => p.id !== id))
    setCompareIds(prev => prev.filter(cid => cid !== id))
    await supabase.from('properties').delete().eq('id', id)
  }, [])

  const toggleCompare = useCallback((id: string): boolean => {
    let added = false
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(cid => cid !== id)
      if (prev.length >= 3) return prev
      added = true
      return [...prev, id]
    })
    return added
  }, [])

  const resetData = useCallback(async () => {
    setProperties([])
    setCompareIds([])
    await supabase.from('properties').delete().neq('id', '')
  }, [])

  return {
    properties,
    scorePreset,
    setScorePreset,
    compareIds,
    isLoaded,
    addProperty,
    updateProperty,
    deleteProperty,
    toggleCompare,
    resetData
  }
}

// Helper: merge updates into current property for upsert
async function getFullProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
  const { data } = await supabase
    .from('properties')
    .select('data')
    .eq('id', id)
    .single()
  if (!data) return null
  return { ...(data.data as Property), ...updates }
}
