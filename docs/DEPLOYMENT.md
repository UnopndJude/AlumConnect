# AlumConnect 배포 가이드 (Vercel + Supabase)

## 사전 준비

| 서비스                           | 용도           | 가입          |
| -------------------------------- | -------------- | ------------- |
| [Vercel](https://vercel.com)     | 호스팅 + CI/CD | GitHub 연동   |
| [Supabase](https://supabase.com) | DB + Auth      | 프로젝트 생성 |
| [Resend](https://resend.com)     | 이메일 발송    | API Key 발급  |

---

## 1. Supabase 프로젝트 설정

### 1-1. 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) → **New Project**
2. Region: **Northeast Asia (Seoul)** 선택
3. 프로젝트 생성 후 **Settings > API** 에서 아래 값 확인:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon (public)` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role (secret)` key → `SUPABASE_SERVICE_ROLE_KEY`

### 1-2. DB 마이그레이션

Supabase CLI로 마이그레이션을 적용합니다:

```bash
# Supabase CLI 설치
pnpm add -g supabase

# 프로젝트 연결
supabase link --project-ref <your-project-ref>

# 마이그레이션 적용
supabase db push
```

마이그레이션 파일 위치: `supabase/migrations/`

- `002_profiles.sql` — 사용자 프로필 테이블 + RLS
- `003_newsletter.sql` — 뉴스레터 테이블
- `004_subscriptions.sql` — 구독 관리
- `005_announcements.sql` — 공지사항
- `006_connections.sql` — 동문 연결 네트워크

### 1-3. Auth 설정

Supabase Dashboard → **Authentication > Providers**:

- **Email** 활성화 (Magic Link 사용)
- **Site URL**: 프로덕션 도메인 (예: `https://alumconnect.vercel.app`)
- **Redirect URLs**: `https://your-domain.com/auth/callback` 추가

---

## 2. Vercel 배포

### 2-1. Vercel 프로젝트 연결

**방법 A: Vercel Dashboard (권장)**

1. [Vercel Dashboard](https://vercel.com/new) → **Import Git Repository**
2. GitHub 리포지토리 선택
3. Framework Preset: **Next.js** (자동 감지됨)
4. Root Directory: `/` (기본값)
5. Build Command: `pnpm build` (자동 감지됨)
6. Install Command: `pnpm install` (자동 감지됨)

**방법 B: Vercel CLI**

```bash
# Vercel CLI 설치
pnpm add -g vercel

# 프로젝트 연결 + 배포
vercel
```

### 2-2. 환경 변수 설정

Vercel Dashboard → **Settings > Environment Variables**:

| 변수명                          | 환경                | 설명                                 |
| ------------------------------- | ------------------- | ------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | All                 | Supabase 프로젝트 URL                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All                 | Supabase anon (public) key           |
| `SUPABASE_SERVICE_ROLE_KEY`     | Production, Preview | Supabase service role key (**비밀**) |
| `NEXT_PUBLIC_SITE_URL`          | Production          | 프로덕션 도메인 URL                  |
| `NEXT_PUBLIC_BASE_URL`          | Production          | 프로덕션 도메인 URL                  |
| `NEXT_PUBLIC_APP_URL`           | Production          | 프로덕션 도메인 URL                  |
| `RESEND_API_KEY`                | Production, Preview | Resend 이메일 API key                |

> **주의**: `SUPABASE_SERVICE_ROLE_KEY`는 **절대** `NEXT_PUBLIC_` 접두사를 붙이지 마세요.
> 서버 사이드에서만 사용되며, 클라이언트에 노출되면 DB 전체 접근이 가능합니다.

**Preview 환경 팁**: Preview 배포에서는 `NEXT_PUBLIC_SITE_URL`을
`https://<project>-git-<branch>-<team>.vercel.app` 형식으로 설정하거나,
Vercel의 `VERCEL_URL` 시스템 변수를 활용하세요.

### 2-3. Supabase Vercel Integration (선택)

Vercel Marketplace에서 [Supabase Integration](https://vercel.com/integrations/supabase)을
설치하면 환경 변수가 자동으로 동기화됩니다:

1. Vercel Dashboard → **Integrations > Browse Marketplace**
2. "Supabase" 검색 → **Add Integration**
3. Supabase 프로젝트와 Vercel 프로젝트 연결
4. 환경 변수 자동 주입 확인

---

## 3. 커스텀 도메인 설정

### 3-1. Vercel 도메인

1. Vercel Dashboard → **Settings > Domains**
2. 커스텀 도메인 추가 (예: `alumconnect.kr`)
3. DNS 레코드 설정:
   - `A` 레코드: `76.76.21.21`
   - `CNAME` 레코드 (`www`): `cname.vercel-dns.com`

### 3-2. Supabase Redirect URL 업데이트

도메인 변경 후 Supabase Dashboard에서 **Site URL**과 **Redirect URLs**을
새 도메인으로 업데이트하세요.

### 3-3. 환경 변수 업데이트

```
NEXT_PUBLIC_SITE_URL=https://alumconnect.kr
NEXT_PUBLIC_BASE_URL=https://alumconnect.kr
NEXT_PUBLIC_APP_URL=https://alumconnect.kr
```

---

## 4. 배포 후 확인사항

### 체크리스트

- [ ] 홈페이지 접속 가능
- [ ] Magic Link 로그인 이메일 수신 확인
- [ ] `/auth/callback` 리다이렉트 정상 작동
- [ ] 인증 후 프로필/대시보드 접근 가능
- [ ] API 라우트 응답 확인 (`/api/auth/me`)
- [ ] 뉴스레터 구독/구독취소 작동
- [ ] Resend 이메일 발송 확인 (미설정 시 콘솔 대체)

### 문제 해결

**빌드 실패 시:**

```bash
# 로컬에서 프로덕션 빌드 테스트
pnpm build
```

**환경 변수 누락 시:**

DI 컨테이너(`src/infrastructure/di/container.ts`)가 자동으로 fallback합니다:

- Supabase 변수 미설정 → InMemory 리포지토리 사용
- `RESEND_API_KEY` 미설정 → 콘솔 이메일 출력

**CORS/리다이렉트 문제:**

Supabase Dashboard에서 다음을 확인하세요:

- **Site URL**: 프로덕션 도메인과 정확히 일치
- **Redirect URLs**: `/auth/callback` 경로 포함

---

## 5. 프로젝트 구성 파일

| 파일                                 | 용도                                     |
| ------------------------------------ | ---------------------------------------- |
| `vercel.json`                        | Vercel 배포 설정 (리전, 보안 헤더, 캐시) |
| `next.config.ts`                     | Next.js 설정 (strict mode, 보안)         |
| `.env.example`                       | 환경 변수 템플릿                         |
| `src/middleware.ts`                  | Supabase 세션 갱신 미들웨어              |
| `src/infrastructure/di/container.ts` | 환경 기반 DI 컨테이너                    |
