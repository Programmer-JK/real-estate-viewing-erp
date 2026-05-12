# 자취방 발품 올인원 - 부동산 투어 ERP

자취방을 구하는 과정 전체를 효율적으로 관리하는 웹 애플리케이션입니다. 매물 정보를 체계적으로 수집하고, AI 기반 점수로 비교하여 최적의 방을 선택할 수 있도록 돕습니다.

## 주요 기능

### 매물 관리
- **3단계 입력 시스템**으로 매물 정보를 체계적으로 기록
  - Phase 1: 공인중개사 정보 및 방문 일정
  - Phase 2: 가격, 기본정보, 가전/시설 상태, 환경 평가
  - Phase 3: 추가 메모 및 사진
- 스와이프 제스처로 빠른 삭제
- 정렬 및 필터 (월세, AI 점수, 가구 수, 방문 완료 여부 등)

### AI 점수 시스템
가전 상태, 채광/소음/수압/냄새, 건물 방향 및 연식 등을 종합하여 0~100점을 자동 산출합니다.

| 등급 | 점수 |
|------|------|
| 추천 | 70점 이상 |
| 보류 | 50~69점 |
| 비추천 | 49점 이하 |

**점수 가중치 프리셋** 3가지를 설정에서 선택할 수 있습니다:
- **균형** (기본): 모든 요소 동일 가중치
- **가격 중시**: 월세·관리비에 높은 가중치
- **가구/환경 중시**: 시설과 환경에 2배 가중치

### 매물 비교
- 최대 3개 매물을 나란히 비교
- 가격, AI 점수, 시설, 환경 항목별 비교표
- 비교표를 이미지(PNG)로 내보내기

### 방문 일정 관리
- 날짜별 방문 일정 확인
- 방문 상태 추적 (대기 / 완료)

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 15 + React 19 |
| 언어 | TypeScript |
| 데이터베이스 | Supabase (PostgreSQL) |
| 인증 | Supabase Auth |
| 상태 관리 | Zustand |
| UI | Radix UI + Tailwind CSS |
| 폼 | React Hook Form + Zod |
| 기타 | html2canvas, date-fns, Recharts |

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 Supabase 정보를 입력합니다:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 데이터베이스 설정

`supabase/schema.sql`을 Supabase SQL 에디터에서 실행합니다.

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 프로젝트 구조

```
├── app/                    # Next.js 앱 라우터
├── components/
│   ├── tabs/               # 4개 메인 탭 (목록, 일정, 비교, 설정)
│   ├── detail-sections/    # 매물 상세 섹션 (Phase 1/2/3)
│   └── ui/                 # 재사용 가능한 UI 컴포넌트
├── lib/
│   ├── types.ts            # TypeScript 타입 정의
│   ├── store.ts            # Zustand 상태 관리
│   ├── scoring.ts          # AI 점수 계산 알고리즘
│   └── supabase.ts         # Supabase 클라이언트
└── supabase/
    └── schema.sql          # 데이터베이스 스키마
```

## 사용 흐름

1. 로그인 / 회원가입
2. **목록 탭**에서 신규 매물 추가 (FAB 버튼)
3. 3단계 입력으로 매물 정보 기록
4. **일정 탭**에서 방문 일정 확인 및 상태 업데이트
5. **비교 탭**에서 관심 매물 비교 후 최적 선택
6. **설정 탭**에서 점수 가중치 조정 또는 데이터 초기화
