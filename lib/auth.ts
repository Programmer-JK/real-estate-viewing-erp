'use client'

import { supabase } from './supabase'

// 아이디를 Supabase Auth용 이메일 포맷으로 변환
function toEmail(id: string): string {
  return `${id}@realestate-erp.app`
}

export async function register(id: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signUp({
    email: toEmail(id),
    password,
    options: { data: { username: id } }
  })
  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already been registered')) {
      return { ok: false, error: '이미 사용 중인 아이디입니다.' }
    }
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export async function login(id: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({
    email: toEmail(id),
    password
  })
  if (error) {
    return { ok: false, error: '아이디 또는 비밀번호가 올바르지 않습니다.' }
  }
  return { ok: true }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

export async function getCurrentUser(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.user_metadata?.username ?? null
}

export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}
