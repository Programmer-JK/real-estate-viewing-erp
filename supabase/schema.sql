-- =============================================
-- 부동산 매물 관리 ERP - Supabase 스키마
-- Supabase Dashboard > SQL Editor 에서 실행
-- =============================================

-- properties 테이블
create table if not exists public.properties (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  data jsonb not null
);

-- Row Level Security 활성화
alter table public.properties enable row level security;

-- 자신의 매물만 접근 가능
create policy "own_properties" on public.properties
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================
-- Storage 버킷은 Supabase Dashboard에서 수동 생성:
-- Storage > New Bucket
--   Name: property-photos
--   Public bucket: ON (체크)
-- =============================================
