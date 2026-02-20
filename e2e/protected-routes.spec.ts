import { test, expect } from "@playwright/test"

// 인증이 필요한 보호된 라우트 접근 제어 테스트
// 비인증 사용자가 보호된 페이지에 접근 시 적절한 처리 확인
test.describe("Protected Routes - Unauthenticated Access", () => {
  test("should handle unauthenticated access to /directory", async ({
    page,
  }) => {
    await page.goto("/directory")

    // 로그인 페이지로 리다이렉트되거나 접근 거부 메시지 표시
    await expect(
      page
        .locator('input[type="email"]')
        .or(page.locator("text=로그인"))
        .or(page.locator("text=인증"))
        .or(page.locator("text=권한"))
    ).toBeVisible({ timeout: 5000 })
  })

  test("should handle unauthenticated access to /connections", async ({
    page,
  }) => {
    await page.goto("/connections")

    await expect(
      page
        .locator('input[type="email"]')
        .or(page.locator("text=로그인"))
        .or(page.locator("text=인증"))
        .or(page.locator("text=권한"))
    ).toBeVisible({ timeout: 5000 })
  })

  test("should handle unauthenticated access to /introductions", async ({
    page,
  }) => {
    await page.goto("/introductions")

    await expect(
      page
        .locator('input[type="email"]')
        .or(page.locator("text=로그인"))
        .or(page.locator("text=인증"))
        .or(page.locator("text=권한"))
    ).toBeVisible({ timeout: 5000 })
  })

  test("should handle unauthenticated access to /introductions/new", async ({
    page,
  }) => {
    await page.goto("/introductions/new")

    await expect(
      page
        .locator('input[type="email"]')
        .or(page.locator("text=로그인"))
        .or(page.locator("text=인증"))
        .or(page.locator("text=권한"))
    ).toBeVisible({ timeout: 5000 })
  })
})

test.describe("Admin Routes - Unauthenticated Access", () => {
  test("should block unauthenticated access to /admin", async ({ page }) => {
    await page.goto("/admin")

    // 관리자 페이지는 비인증 시 접근 불가
    await expect(page).not.toHaveURL("/admin")
  })

  test("should block unauthenticated access to /admin/newsletter", async ({
    page,
  }) => {
    await page.goto("/admin/newsletter")

    // 관리자 뉴스레터 페이지는 비인증 시 접근 불가
    await expect(page).not.toHaveURL("/admin/newsletter")
  })
})

test.describe("Protected Routes - Response Status", () => {
  test("protected API endpoints should return 401 for unauthenticated requests", async ({
    request,
  }) => {
    // API 엔드포인트는 인증 없이 접근 시 401 반환해야 함
    const endpoints = [
      "/api/directory",
      "/api/connections",
      "/api/announcements",
    ]

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint)
      // 401 Unauthorized 또는 리다이렉트(302/307)
      expect([401, 302, 307, 403]).toContain(response.status())
    }
  })
})
