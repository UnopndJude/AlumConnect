import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import IntroductionCard from "@/components/introduction/IntroductionCard"
import { Introduction } from "@/types/introduction"

const mockIntroduction: Introduction = {
  id: "intro-123",
  userId: "user-123",
  name: "홍길동",
  graduationClass: 10,
  status: "employed",
  field: "컴퓨터공학",
  organization: "삼성전자",
  selfIntroduction:
    "안녕하세요. 소프트웨어 엔지니어로 일하고 있습니다. 새로운 기술을 배우는 것을 좋아하고, 동문들과 네트워킹하고 싶습니다.",
  location: "서울",
  interests: "프로그래밍, 독서, 운동",
  lookingFor: "mentoring",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date("2024-01-15"),
}

describe("IntroductionCard", () => {
  it("should render basic introduction information", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    expect(screen.getByText("홍길동")).toBeInTheDocument()
    expect(screen.getByText("10기 · 직장인")).toBeInTheDocument()
    expect(screen.getByText("컴퓨터공학")).toBeInTheDocument()
    expect(screen.getByText("삼성전자")).toBeInTheDocument()
  })

  it("should render self introduction text (truncated)", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    // 자기소개 텍스트가 표시되는지 확인 (line-clamp로 인해 일부만 보일 수 있음)
    expect(
      screen.getByText(/안녕하세요. 소프트웨어 엔지니어로 일하고 있습니다/)
    ).toBeInTheDocument()
  })

  it("should render location when provided", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    expect(screen.getByText("서울")).toBeInTheDocument()
  })

  it("should not render location when not provided", () => {
    const introWithoutLocation = {
      ...mockIntroduction,
      location: undefined,
    }

    render(<IntroductionCard introduction={introWithoutLocation} />)

    expect(screen.queryByText("지역:")).not.toBeInTheDocument()
  })

  it("should render looking for tag when provided", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    expect(screen.getByText("멘토링")).toBeInTheDocument()
  })

  it("should render interests tag when provided", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    expect(
      screen.getByText("관심사: 프로그래밍, 독서, 운동")
    ).toBeInTheDocument()
  })

  it("should not render tags when optional fields are not provided", () => {
    const minimalIntro = {
      ...mockIntroduction,
      lookingFor: undefined,
      interests: undefined,
    }

    render(<IntroductionCard introduction={minimalIntro} />)

    expect(screen.queryByText(/멘토링/)).not.toBeInTheDocument()
    expect(screen.queryByText(/관심사:/)).not.toBeInTheDocument()
  })

  it("should render creation date", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    expect(screen.getByText("2024. 1. 15.")).toBeInTheDocument()
  })

  it("should render detail link with correct href", () => {
    render(<IntroductionCard introduction={mockIntroduction} />)

    const detailLink = screen.getByRole("link", { name: "자세히 보기" })
    expect(detailLink).toHaveAttribute("href", "/introductions/intro-123")
  })

  it("should render correct status labels", () => {
    const statuses = [
      { status: "student", label: "학생" },
      { status: "employed", label: "직장인" },
      { status: "entrepreneur", label: "창업가" },
      { status: "graduate_student", label: "대학원생" },
      { status: "other", label: "기타" },
    ]

    statuses.forEach(({ status, label }) => {
      const introWithStatus = {
        ...mockIntroduction,
        status: status as Introduction["status"],
      }

      const { unmount } = render(
        <IntroductionCard introduction={introWithStatus} />
      )
      expect(screen.getByText(`10기 · ${label}`)).toBeInTheDocument()
      unmount()
    })
  })

  it("should render correct looking for labels", () => {
    const lookingForOptions = [
      { value: "mentoring", label: "멘토링" },
      { value: "networking", label: "네트워킹" },
      { value: "collaboration", label: "협업" },
      { value: "job_opportunities", label: "구직/구인" },
      { value: "investment", label: "투자" },
    ]

    lookingForOptions.forEach(({ value, label }) => {
      const introWithLookingFor = {
        ...mockIntroduction,
        lookingFor: value as Introduction["lookingFor"],
      }

      const { unmount } = render(
        <IntroductionCard introduction={introWithLookingFor} />
      )
      expect(screen.getByText(label)).toBeInTheDocument()
      unmount()
    })
  })

  it("should handle unknown status gracefully", () => {
    const introWithUnknownStatus = {
      ...mockIntroduction,
      status: "unknown_status" as Introduction["status"],
    }

    render(<IntroductionCard introduction={introWithUnknownStatus} />)

    expect(screen.getByText("10기 · unknown_status")).toBeInTheDocument()
  })

  it("should have proper CSS classes for styling", () => {
    const { container } = render(
      <IntroductionCard introduction={mockIntroduction} />
    )

    // Find the card element which has the bg-white class
    const card = container.querySelector(".bg-white.rounded-lg.shadow-md")
    expect(card).toBeInTheDocument()
  })

  it("should have hover effect class", () => {
    const { container } = render(
      <IntroductionCard introduction={mockIntroduction} />
    )

    // Find the card element which has hover effects
    const card = container.querySelector(".hover\\:shadow-lg.transition-shadow")
    expect(card).toBeInTheDocument()
  })
})
