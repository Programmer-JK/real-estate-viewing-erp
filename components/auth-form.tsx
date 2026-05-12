'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { login, register } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const schema = z.object({
  id: z
    .string()
    .min(4, '아이디는 4자 이상이어야 합니다.')
    .max(20, '아이디는 20자 이하여야 합니다.')
    .regex(/^[a-zA-Z0-9_]+$/, '영문, 숫자, 밑줄(_)만 사용 가능합니다.'),
  password: z
    .string()
    .min(6, '비밀번호는 6자 이상이어야 합니다.')
    .max(30, '비밀번호는 30자 이하여야 합니다.')
})

type FormValues = z.infer<typeof schema>

interface AuthFormProps {
  onSuccess: () => void
}

function LoginForm({ onSuccess }: AuthFormProps) {
  const [serverError, setServerError] = useState('')
  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError('')
    const result = await login(data.id, data.password)
    if (result.ok) {
      onSuccess()
    } else {
      setServerError(result.error ?? '로그인 실패')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="login-id">아이디</Label>
        <Input id="login-id" placeholder="아이디 입력" {...reg('id')} />
        {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="login-pw">비밀번호</Label>
        <Input id="login-pw" type="password" placeholder="비밀번호 입력" {...reg('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        로그인
      </Button>
    </form>
  )
}

function SignupForm({ onSuccess }: AuthFormProps) {
  const [serverError, setServerError] = useState('')
  const {
    register: reg,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormValues) => {
    setServerError('')
    const result = await register(data.id, data.password)
    if (result.ok) {
      onSuccess()
    } else {
      setServerError(result.error ?? '회원가입 실패')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="signup-id">아이디</Label>
        <Input id="signup-id" placeholder="4~20자, 영문·숫자·밑줄" {...reg('id')} />
        {errors.id && <p className="text-sm text-destructive">{errors.id.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="signup-pw">비밀번호</Label>
        <Input id="signup-pw" type="password" placeholder="6자 이상" {...reg('password')} />
        {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        회원가입
      </Button>
    </form>
  )
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">부동산 매물 관리</CardTitle>
          <CardDescription>로그인하거나 새 계정을 만드세요</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSuccess={onSuccess} />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm onSuccess={onSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
