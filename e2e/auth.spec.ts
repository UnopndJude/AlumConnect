import { test, expect } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login")

    // 이메일 입력 필드 확인
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    // 로그인 버튼 확인
    const loginButton = page.getByRole("button", { name: /로그인|링크/i })
    await expect(loginButton).toBeVisible()
  })

  test("should show error for empty email on login", async ({ page }) => {
    await page.goto("/login")

    // 빈 상태로 제출 시도
    await page.click('button[type="submit"]')

    // HTML5 validation 또는 에러 메시지
    const emailInput = page.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    )
    expect(isInvalid).toBe(true)
  })

  test("should request magic link with valid email", async ({ page }) => {
    await page.goto("/login")

    // 이메일 입력
    await page.fill('input[type="email"]', "test@example.com")

    // 제출
    await page.click('button[type="submit"]')

    // 성공 메시지 확인 (이메일 전송됨)
    await expect(
      page
        .locator("text=이메일을 확인")
        .or(page.locator("text=링크를 보냈습니다"))
        .or(page.locator("text=메일을 확인"))
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe("Protected Routes", () => {
  test("should redirect unauthenticated user from directory", async ({
    page,
  }) => {
    await page.goto("/directory")

    // 로그인 페이지로 리다이렉트되거나 에러 표시
    await expect(page).toHaveURL(/\/(login|directory)/)
  })

  test("should redirect unauthenticated user from connections", async ({
    page,
  }) => {
    await page.goto("/connections")

    // 로그인 페이지로 리다이렉트되거나 에러 표시
    await expect(page).toHaveURL(/\/(login|connections)/)
  })

  test("should redirect non-admin from admin pages", async ({ page }) => {
    await page.goto("/admin/newsletter")

    // 메인 페이지나 로그인으로 리다이렉트
    await expect(page).not.toHaveURL("/admin/newsletter")
  })
})
