# AlumConnect 인프라 설정 가이드

이 문서는 AlumConnect를 실행하기 위해 필요한 외부 서비스 설정 방법을 안내합니다.

---

## 1. 필수 인프라

| 서비스 | 용도 | 필수 여부 |
|--------|------|----------|
| **Supabase** | 데이터베이스, 인증 | 필수 |
| **Resend** | 이메일 발송 | 선택 (없으면 콘솔 출력) |

---

## 2. Supabase 설정

### 2.1 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `alumconnect` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호 설정
   - **Region**: Northeast Asia (Seoul) - `ap-northeast-2`

### 2.2 API 키 확인

**Settings > API** 에서 확인:

```
Project URL: https://[project-id].supabase.co
Anon/Public Key: eyJhbGciOiJIUzI1NiIs...
Service Role Key: eyJhbGciOiJIUzI1NiIs... (비밀)
```

### 2.3 환경 변수 설정

`.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Site URL (개발)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (선택)
RESEND_API_KEY=re_xxxx...
```

### 2.4 데이터베이스 마이그레이션

Supabase SQL Editor에서 마이그레이션 파일을 순서대로 실행합니다.

#### 순서:
1. `supabase/migrations/002_profiles.sql` - 프로필 테이블
2. `supabase/migrations/003_newsletter.sql` - 뉴스레터 테이블
3. `supabase/migrations/004_subscriptions.sql` - 구독 테이블
4. `supabase/migrations/005_announcements.sql` - 소식 테이블
5. `supabase/migrations/006_connections.sql` - 연결 테이블

#### SQL Editor 사용:
1. Supabase Dashboard > SQL Editor
2. "New Query" 클릭
3. 각 마이그레이션 파일 내용 붙여넣기
4. "Run" 클릭

또는 Supabase CLI 사용:

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref [project-id]

# 마이그레이션 실행
supabase db push
```

### 2.5 Alumni DB 초기 데이터

동문 인증을 위해 Alumni 테이블에 데이터가 필요합니다.

```sql
-- Alumni 테이블 (이미 존재한다고 가정)
INSERT INTO alumni (name, graduation_class, email) VALUES
('홍길동', 10, 'hong@example.com'),
('김철수', 11, 'kim@example.com'),
('이영희', 12, 'lee@example.com');
```

### 2.6 Magic Link 인증 설정

**Authentication > URL Configuration**:

| 설정 | 값 |
|------|-----|
| Site URL | `http://localhost:3000` (개발) |
| Redirect URLs | `http://localhost:3000/auth/callback` |

**프로덕션 추가**:
- `https://your-domain.com`
- `https://your-domain.com/auth/callback`

### 2.7 이메일 템플릿 (선택)

**Authentication > Email Templates**:

Magic Link 이메일 템플릿 커스터마이징:

```html
<h2>AlumConnect 로그인</h2>
<p>안녕하세요!</p>
<p>아래 버튼을 클릭하여 로그인하세요:</p>
<a href="{{ .ConfirmationURL }}" style="...">로그인하기</a>
<p>이 링크는 1시간 후 만료됩니다.</p>
```

---

## 3. Resend 설정 (이메일 발송)

### 3.1 계정 생성

1. [Resend](https://resend.com) 접속
2. 회원가입 (GitHub 연동 가능)
3. 무료 플랜: 월 3,000건

### 3.2 도메인 설정 (프로덕션)

**Domains > Add Domain**:

1. 도메인 입력 (예: `alumconnect.com`)
2. DNS 레코드 추가:
   - MX 레코드
   - TXT 레코드 (SPF, DKIM)
3. 검증 완료 대기 (수분 ~ 수시간)

### 3.3 API 키 생성

**API Keys > Create API Key**:

- Name: `alumconnect-production`
- Permission: `Sending access`

### 3.4 환경 변수

```bash
RESEND_API_KEY=re_xxxx...
```

### 3.5 발신자 이메일

도메인 검증 전에는 `onboarding@resend.dev`만 사용 가능.
검증 후에는 `newsletter@your-domain.com` 등 설정 가능.

코드에서 발신자 설정:
```typescript
// src/infrastructure/email/ResendEmailService.ts
from: "AlumConnect <newsletter@alumconnect.com>"
```

---

## 4. 환경별 설정

### 4.1 개발 환경

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[dev-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# RESEND_API_KEY= (설정 안 하면 콘솔 출력)
```

### 4.2 스테이징 환경

```bash
# .env.staging
NEXT_PUBLIC_SUPABASE_URL=https://[staging-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://staging.alumconnect.com
RESEND_API_KEY=re_test_xxxx...
```

### 4.3 프로덕션 환경

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://[prod-project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=https://alumconnect.com
RESEND_API_KEY=re_live_xxxx...
```

---

## 5. 배포 플랫폼 설정

### 5.1 Vercel

**Environment Variables** 설정:

1. Vercel Dashboard > Project > Settings > Environment Variables
2. 각 환경(Production, Preview, Development)별로 설정

| 변수 | Production | Preview |
|------|------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | prod URL | staging URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | prod key | staging key |
| `SUPABASE_SERVICE_ROLE_KEY` | prod secret | staging secret |
| `RESEND_API_KEY` | live key | test key |

### 5.2 기타 플랫폼

Netlify, Railway, Render 등에서도 동일하게 환경 변수 설정.

---

## 6. 보안 체크리스트

### 환경 변수
- [ ] `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 않음
- [ ] `.env.local`은 `.gitignore`에 포함
- [ ] 프로덕션 키는 CI/CD 시스템에서만 사용

### Supabase
- [ ] RLS (Row Level Security) 활성화 확인
- [ ] 각 테이블별 적절한 정책 설정
- [ ] Service Role Key 최소 권한 원칙

### Resend
- [ ] API Key 권한 "Sending access"만 부여
- [ ] 도메인 SPF/DKIM 검증 완료

---

## 7. 문제 해결

### Supabase 연결 오류

```
Error: Missing Supabase environment variables
```

**해결**: `.env.local` 파일 확인, 서버 재시작

### Magic Link 작동 안 함

```
Error: Invalid redirect URL
```

**해결**: Supabase Auth 설정에서 Redirect URLs 확인

### 이메일 발송 실패

```
Error: Resend API key is invalid
```

**해결**:
1. API 키 확인
2. 도메인 검증 상태 확인
3. 발신자 이메일 주소 확인

### RLS 정책 오류

```
Error: new row violates row-level security policy
```

**해결**: 해당 테이블의 RLS 정책 확인, 필요시 service_role 사용

---

## 8. 참고 링크

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth - Magic Link](https://supabase.com/docs/guides/auth/passwordless-login/auth-magic-link)
- [Resend Docs](https://resend.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
