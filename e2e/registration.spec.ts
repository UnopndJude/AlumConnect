import { test, expect } from "@playwright/test"

// 회원가입 플로우 E2E 테스트
// Step 1: 기본 정보 입력 → Step 2: 동문 인증 퀴즈 → Step 3: 완료/대기
test.describe("Registration Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/register")
  })

  test("should display registration form with all required fields", async ({
    page,
  }) => {
    // 이름 입력 필드
    const nameInput = page
      .locator('input[name="name"]')
      .or(
        page
          .locator('input[placeholder*="이름"]')
          .or(page.locator('input[placeholder*="실명"]'))
      )
    await expect(nameInput).toBeVisible()

    // 이메일 입력 필드
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // 졸업 기수 입력 필드
    const classInput = page
      .locator('input[type="number"]')
      .or(
        page
          .locator('input[name="graduationClass"]')
          .or(page.locator('input[name="graduation_class"]'))
      )
    await expect(classInput).toBeVisible()

    // 비밀번호 필드
    const passwordInputs = page.locator('input[type="password"]')
    await expect(passwordInputs.first()).toBeVisible()
    // 비밀번호 확인 필드도 존재해야 함
    expect(await passwordInputs.count()).toBeGreaterThanOrEqual(2)

    // 제출 버튼
    const submitButton = page.getByRole("button", {
      name: /다음|가입|등록|제출/i,
    })
    await expect(submitButton).toBeVisible()
  })

  test("should validate empty required fields", async ({ page }) => {
    // 빈 상태로 제출 시도
    const submitButton = page.getByRole("button", {
      name: /다음|가입|등록|제출/i,
    })
    await submitButton.click()

    // HTML5 필수 필드 검증 — 폼이 제출되지 않아야 함
    await expect(page).toHaveURL(/\/register$/)
  })

  test("should validate email format", async ({ page }) => {
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill("invalid-email")

    const submitButton = page.getByRole("button", {
      name: /다음|가입|등록|제출/i,
    })
    await submitButton.click()

    // HTML5 이메일 형식 검증으로 인해 페이지가 이동하지 않아야 함
    await expect(page).toHaveURL(/\/register$/)
  })

  test("should have link to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /로그인/i })
    await expect(loginLink).toBeVisible()
  })
})

test.describe("Registration Page - Accessibility", () => {
  test("should be accessible on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/register")

    // 모바일에서도 폼 필드가 보여야 함
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const submitButton = page.getByRole("button", {
      name: /다음|가입|등록|제출/i,
    })
    await expect(submitButton).toBeVisible()
  })
})
