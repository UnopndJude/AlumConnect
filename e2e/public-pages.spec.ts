import { test, expect } from "@playwright/test"

// 공개 페이지 접근성 및 렌더링 테스트
// 인증 없이 접근 가능한 모든 공개 페이지를 검증
test.describe("Landing Page", () => {
  test("should render hero section", async ({ page }) => {
    await page.goto("/")

    // 메인 페이지에 제목이 있어야 함
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
  })

  test("should display newsletter subscription form", async ({ page }) => {
    await page.goto("/")

    // 뉴스레터 구독 이메일 입력 필드
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // 구독 버튼
    const subscribeButton = page.getByRole("button", { name: /구독/i })
    await expect(subscribeButton).toBeVisible()
  })

  test("should have navigation links", async ({ page }) => {
    await page.goto("/")

    // 로그인/가입 링크가 있어야 함
    const authLink = page.getByRole("link", { name: /로그인|가입|시작/i })
    await expect(authLink.first()).toBeVisible()
  })

  test("should render correctly on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/")

    // 모바일에서도 핵심 콘텐츠가 표시되어야 함
    const heading = page.locator("h1").first()
    await expect(heading).toBeVisible()
  })
})

test.describe("Newsletter Archive Page", () => {
  test("should render newsletter list page", async ({ page }) => {
    await page.goto("/newsletter")

    // 페이지 제목에 '뉴스레터' 포함
    const heading = page.locator("h1")
    await expect(heading).toContainText("뉴스레터")
  })

  test("should be accessible without authentication", async ({ page }) => {
    const response = await page.goto("/newsletter")

    // 200 OK 또는 리다이렉트 없이 정상 로드
    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL(/\/newsletter/)
  })
})

test.describe("Login Page", () => {
  test("should render login form", async ({ page }) => {
    await page.goto("/login")

    // 이메일 입력 필드
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // 로그인 버튼
    const loginButton = page.getByRole("button", {
      name: /로그인|링크|보내기/i,
    })
    await expect(loginButton).toBeVisible()
  })

  test("should have link to registration page", async ({ page }) => {
    await page.goto("/login")

    const registerLink = page.getByRole("link", { name: /가입|회원가입/i })
    await expect(registerLink).toBeVisible()
  })
})

test.describe("Register Page", () => {
  test("should render registration form", async ({ page }) => {
    await page.goto("/register")

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
  })

  test("should be accessible without authentication", async ({ page }) => {
    const response = await page.goto("/register")

    expect(response?.status()).toBeLessThan(400)
    await expect(page).toHaveURL(/\/register/)
  })
})

test.describe("Public Pages - Error Boundaries", () => {
  test("should handle non-existent newsletter gracefully", async ({ page }) => {
    await page.goto("/newsletter/non-existent-id")

    // 에러 페이지가 표시되거나, 404 메시지가 보여야 함
    // (전체 앱이 크래시하지 않아야 함)
    const body = page.locator("body")
    await expect(body).toBeVisible()
  })
})
