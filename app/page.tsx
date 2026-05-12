'use client'

import { useState, useEffect } from 'react'
import { RealEstateApp } from '@/components/real-estate-app'
import { AuthForm } from '@/components/auth-form'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecked(true)
    })

    // 로그인/로그아웃 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!checked) return null

  if (!session) {
    return <AuthForm onSuccess={() => {}} />
  }

  return <RealEstateApp onLogout={() => {}} />
}
