import { test, expect } from "@playwright/test"

test.describe("Newsletter Subscription (Public)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display newsletter subscription form on landing page", async ({
    page,
  }) => {
    // 구독 폼이 보이는지 확인
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()

    const subscribeButton = page.getByRole("button", { name: /구독/i })
    await expect(subscribeButton).toBeVisible()
  })

  test("should subscribe with valid email", async ({ page }) => {
    const testEmail = `test-${Date.now()}@example.com`

    // 이메일 입력
    await page.fill('input[type="email"]', testEmail)

    // 구독 버튼 클릭
    await page.click('button:has-text("구독")')

    // 성공 메시지 또는 상태 변화 확인
    await expect(
      page.locator("text=구독이 완료").or(page.locator("text=완료"))
    ).toBeVisible({ timeout: 5000 })
  })

  test("should show error for invalid email format", async ({ page }) => {
    // 잘못된 이메일 입력
    await page.fill('input[type="email"]', "invalid-email")

    // 구독 버튼 클릭
    await page.click('button:has-text("구독")')

    // 에러 메시지 확인
    await expect(
      page.locator("text=올바른 이메일").or(page.locator("text=유효하지"))
    ).toBeVisible({ timeout: 3000 })
  })
})

test.describe("Newsletter Archive (Public)", () => {
  test("should display newsletter list page", async ({ page }) => {
    await page.goto("/newsletter")

    // 페이지 제목 확인
    await expect(page.locator("h1")).toContainText("뉴스레터")
  })

  test("should navigate to newsletter detail", async ({ page }) => {
    await page.goto("/newsletter")

    // 첫 번째 뉴스레터 링크 클릭 (있는 경우)
    const firstNewsletter = page.locator("a[href^='/newsletter/']").first()

    if (await firstNewsletter.isVisible()) {
      await firstNewsletter.click()
      await expect(page).toHaveURL(/\/newsletter\//)
    }
  })
})
