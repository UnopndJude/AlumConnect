# AlumConnect 테스트 가이드

## 1. 현재 테스트 구조

### 1.1 유닛 테스트 구성

```
__test__/
├── api/                          # API 라우트 테스트
│   ├── admin/newsletter/         # 관리자 뉴스레터 API
│   ├── directory/                # 디렉토리 API
│   ├── newsletter/               # 공개 뉴스레터 API
│   │   ├── subscribe/
│   │   ├── unsubscribe/
│   │   └── subscription/
│   ├── onboarding/               # 온보딩 API
│   └── verify/                   # 인증 API
├── app/                          # 페이지 컴포넌트 테스트
│   ├── admin/newsletter/
│   └── newsletter/
├── components/                   # UI 컴포넌트 테스트
│   ├── admin/
│   ├── auth/
│   └── newsletter/
├── domain/                       # 도메인 엔티티 테스트
│   └── subscription/entities/
├── infrastructure/               # 인프라 레이어 테스트
│   ├── di/
│   ├── email/
│   └── persistence/
└── lib/                          # 라이브러리 함수 테스트
```

### 1.2 테스트 패턴

#### API 테스트 패턴
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest"
import { POST } from "@/app/api/newsletter/subscribe/route"
import { NextRequest } from "next/server"

// 의존성 Mock
vi.mock("@/infrastructure/di/container", () => ({
  container: {
    getSubscriptionRepository: vi.fn(),
  },
}))

describe("/api/newsletter/subscribe - POST", () => {
  const mockRepository = { findByEmail: vi.fn(), save: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(container.getSubscriptionRepository).mockReturnValue(mockRepository)
  })

  it("should subscribe new email successfully", async () => {
    mockRepository.findByEmail.mockResolvedValue(null)
    const request = new NextRequest("http://localhost:3000/api/...", {
      method: "POST",
      body: JSON.stringify({ email: "test@example.com" }),
    })

    const response = await POST(request)
    expect(response.status).toBe(200)
  })
})
```

### 1.3 테스트 실행

```bash
# 전체 테스트
pnpm test

# 특정 파일 테스트
pnpm test __test__/api/newsletter/subscribe/route.test.ts

# Watch 모드
pnpm test:watch

# 커버리지 리포트
pnpm test:coverage

# UI 모드
pnpm test:ui
```

---

## 2. 기능 테스트 가이드 (수동 테스트)

유닛 테스트로는 검증하기 어려운 전체 사용자 플로우를 수동으로 테스트합니다.

### 2.1 사전 준비

1. **Supabase 설정** (docs/INFRASTRUCTURE.md 참조)
2. **환경 변수 설정** (.env.local)
3. **개발 서버 실행**: `pnpm dev`

### 2.2 인증 플로우 테스트

#### Test Case 1: Magic Link 로그인
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | `/login` 페이지 접속 | 이메일 입력 폼 표시 |
| 2 | 이메일 입력 후 "로그인 링크 받기" 클릭 | "이메일을 확인해주세요" 메시지 |
| 3 | 이메일에서 Magic Link 클릭 | `/onboarding` 또는 메인 페이지로 이동 |

#### Test Case 2: 신규 사용자 온보딩
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | Magic Link 클릭 (신규 사용자) | `/onboarding` 페이지로 이동 |
| 2 | 이름, 기수 입력 | Alumni DB 매칭 시도 |
| 3 | 매칭 성공 시 | 프로필 생성, 메인 페이지 이동 |
| 4 | 매칭 실패 시 | 에러 메시지 표시 |

#### Test Case 3: 퀴즈 인증 (Verified 배지)
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | `/verify` 페이지 접속 | 퀴즈 시작 버튼 표시 |
| 2 | 퀴즈 시작 | 5개 문제 표시 |
| 3 | 4개 이상 정답 | Verified 배지 획득, 축하 메시지 |
| 4 | 3개 이하 정답 | 재시도 안내 메시지 |

### 2.3 뉴스레터 플로우 테스트

#### Test Case 4: 공개 구독
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | 메인 페이지 접속 (비로그인) | 구독 폼 표시 |
| 2 | 이메일 입력 후 구독 | 성공 메시지, DB에 구독 레코드 생성 |
| 3 | 동일 이메일로 재구독 | "이미 구독 중" 메시지 |

#### Test Case 5: 구독 해지
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | 해지 링크 클릭 (?token=xxx) | 해지 성공 메시지 |
| 2 | DB 확인 | status = 'unsubscribed' |

#### Test Case 6: 관리자 - 뉴스레터 생성/발행
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | `/admin/newsletter` 접속 (관리자) | 대시보드 표시 |
| 2 | "새 뉴스레터" 클릭 | 뉴스레터 폼 표시 |
| 3 | 제목 입력, 섹션 추가 | 초안 저장 |
| 4 | "발행" 클릭 | status = 'published' |
| 5 | "배포" 클릭 | 이메일 발송 (또는 콘솔 로그) |

### 2.4 네트워킹 플로우 테스트

#### Test Case 7: 연결 요청
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | `/directory` 접속 (Verified 사용자) | 전체 프로필 표시 |
| 2 | "연결 요청" 버튼 클릭 | 요청 전송 성공 메시지 |
| 3 | 상대방 `/connections` 확인 | "받은 요청"에 표시 |
| 4 | 수락/거절 | 상태 변경 |

### 2.5 소식 제보 플로우 테스트

#### Test Case 8: 소식 제보 및 검토
| 단계 | 액션 | 예상 결과 |
|------|------|----------|
| 1 | POST /api/announcements (Verified) | 소식 생성, status = 'pending' |
| 2 | 관리자 `/admin/newsletter` | "검토 대기" 섹션에 표시 |
| 3 | 승인 클릭 | status = 'approved' |
| 4 | 거절 클릭 (사유 입력) | status = 'rejected' |

---

## 3. E2E 테스트 자동화 (Playwright)

수동 테스트를 자동화하려면 Playwright를 사용합니다.

### 3.1 설치

```bash
pnpm add -D @playwright/test
npx playwright install
```

### 3.2 설정 파일

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3.3 E2E 테스트 예시

```typescript
// e2e/newsletter-subscription.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Newsletter Subscription', () => {
  test('should subscribe with valid email', async ({ page }) => {
    await page.goto('/')

    // 이메일 입력
    await page.fill('input[type="email"]', 'test@example.com')

    // 구독 버튼 클릭
    await page.click('button:has-text("구독하기")')

    // 성공 메시지 확인
    await expect(page.locator('text=구독이 완료되었습니다')).toBeVisible()
  })

  test('should show error for invalid email', async ({ page }) => {
    await page.goto('/')

    await page.fill('input[type="email"]', 'invalid-email')
    await page.click('button:has-text("구독하기")')

    await expect(page.locator('text=올바른 이메일')).toBeVisible()
  })
})
```

### 3.4 E2E 실행

```bash
# 전체 E2E 테스트
npx playwright test

# UI 모드
npx playwright test --ui

# 특정 파일
npx playwright test e2e/newsletter-subscription.spec.ts

# 리포트 확인
npx playwright show-report
```

---

## 4. API 테스트 (REST Client)

### 4.1 VS Code REST Client 사용

`.http` 파일을 만들어 API를 직접 테스트합니다.

```http
### Newsletter Subscribe
POST http://localhost:3000/api/newsletter/subscribe
Content-Type: application/json

{
  "email": "test@example.com"
}

### Newsletter Unsubscribe
GET http://localhost:3000/api/newsletter/unsubscribe?token=YOUR_TOKEN

### Get Published Newsletters
GET http://localhost:3000/api/newsletter?page=1&limit=10

### Admin - Create Newsletter (requires auth)
POST http://localhost:3000/api/admin/newsletter
Content-Type: application/json
Cookie: sb-access-token=YOUR_TOKEN

{
  "title": "제 5호 뉴스레터"
}
```

### 4.2 cURL 테스트

```bash
# 구독
curl -X POST http://localhost:3000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 뉴스레터 목록
curl http://localhost:3000/api/newsletter

# 구독자 수 (통계)
curl http://localhost:3000/api/newsletter/subscription?stats=true
```

---

## 5. 테스트 체크리스트

### 배포 전 필수 테스트

- [ ] 유닛 테스트 전체 통과 (`pnpm test`)
- [ ] 빌드 성공 (`pnpm build`)
- [ ] Magic Link 로그인 플로우
- [ ] 신규 사용자 온보딩
- [ ] 뉴스레터 구독/해지
- [ ] 관리자 뉴스레터 CRUD
- [ ] 반응형 UI (모바일/데스크톱)

### 성능 테스트

- [ ] 메인 페이지 로딩 시간 < 3초
- [ ] 뉴스레터 목록 페이지네이션
- [ ] 디렉토리 검색 응답 시간

### 보안 테스트

- [ ] 비인증 사용자 API 접근 차단
- [ ] 관리자 API 권한 검증
- [ ] XSS 방지 (입력값 검증)
- [ ] SQL Injection 방지 (Supabase RLS)
