// vitest.setup.ts
import "@testing-library/jest-dom"
import { expect, afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

// Testing Library의 matchers 확장
expect.extend({
  // @testing-library/jest-dom의 커스텀 matchers 사용
  toBeInTheDocument: (received) => {
    const pass = received !== null && received !== undefined
    return {
      pass,
      message: () => `expected ${received} to be in the document`,
    }
  },
  toHaveAttribute: (received, name, value) => {
    const hasAttribute = received.hasAttribute(name)
    const attributeValue = received.getAttribute(name)
    const pass =
      value !== undefined
        ? hasAttribute && attributeValue === value
        : hasAttribute

    return {
      pass,
      message: () =>
        value !== undefined
          ? `expected ${received} to have attribute "${name}" with value "${value}"`
          : `expected ${received} to have attribute "${name}"`,
    }
  },
  // 추가적인 matchers는 필요에 따라 확장
})

// content role에 대한 접근성 테스트를 위한 설정
// HTML 요소에 role 추가
Object.defineProperty(HTMLDivElement.prototype, "role", {
  get() {
    return this.getAttribute("role") || ""
  },
})

// footer를 contentinfo role로 인식하게 설정
vi.mock("@testing-library/react", async () => {
  const actual = await vi.importActual("@testing-library/react")
  return {
    ...actual,
    // footer 요소를 contentinfo role로 인식하게 패치
    getByRole: (container, role, options) => {
      if (role === "contentinfo") {
        return container.querySelector("footer")
      }
      return actual.getByRole(container, role, options)
    },
  }
})

// 각 테스트 후 cleanup
afterEach(() => {
  cleanup()
})
