"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@/infrastructure/supabase/browser"

interface FormData {
  name: string
  graduationClass: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    graduationClass: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      // Check if user already has a profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profile) {
        // Already has profile, redirect to verify or home
        if (profile.is_verified) {
          router.push("/")
        } else {
          router.push("/verify")
        }
        return
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "이름을 입력해주세요." })
      return
    }

    if (formData.graduationClass < 1 || formData.graduationClass > 50) {
      setMessage({
        type: "error",
        text: "기수는 1기부터 50기까지 입력 가능합니다.",
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          graduationClass: formData.graduationClass,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setMessage({ type: "error", text: result.message })
        setIsLoading(false)
        return
      }

      // Success - redirect to quiz verification
      setMessage({ type: "success", text: "프로필이 생성되었습니다." })
      setTimeout(() => {
        router.push("/verify")
      }, 1000)
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." })
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex items-center space-x-4 text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
          <p className="text-xl">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="animate-fadeInUp mb-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="animate-float flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 shadow-2xl shadow-blue-500/30">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">프로필 생성</h1>
          <p className="text-xl text-slate-300">
            동문 인증을 위한 정보를 입력해주세요
          </p>
        </div>

        {/* Form Card */}
        <div
          className="animate-fadeInUp rounded-2xl border border-slate-700 bg-slate-800/50 p-8 shadow-2xl backdrop-blur-xl"
          style={{ animationDelay: "0.2s" }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-3 block text-base font-semibold text-slate-200"
              >
                이름
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="실명을 입력하세요"
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="graduationClass"
                className="mb-3 block text-base font-semibold text-slate-200"
              >
                졸업 기수
              </label>
              <input
                type="number"
                id="graduationClass"
                min="1"
                max="50"
                value={formData.graduationClass}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    graduationClass: parseInt(e.target.value) || 1,
                  })
                }
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                placeholder="몇 기인지 숫자로 입력하세요"
              />
              <p className="mt-3 flex items-center text-sm text-slate-400">
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                인천과학고등학교 졸업 기수를 입력해주세요 (1-50기)
              </p>
            </div>

            {message && (
              <div
                className={`rounded-xl p-4 font-medium ${
                  message.type === "success"
                    ? "border border-green-500/20 bg-green-500/10 text-green-400"
                    : message.type === "info"
                      ? "border border-blue-500/20 bg-blue-500/10 text-blue-400"
                      : "border border-red-500/20 bg-red-500/10 text-red-400"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">
                    {message.type === "success"
                      ? "✓"
                      : message.type === "info"
                        ? "ℹ"
                        : "✕"}
                  </span>
                  {message.text}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 py-4 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40 disabled:scale-100 disabled:opacity-50 disabled:shadow-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  처리 중...
                </div>
              ) : (
                "프로필 생성하기"
              )}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-6">
            <div className="flex items-start text-blue-400">
              <svg
                className="mt-1 mr-4 h-6 w-6 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="mb-2 text-lg font-semibold">동문 인증 안내</p>
                <p className="leading-relaxed text-slate-300">
                  입력하신 정보는 동문 데이터베이스와 매칭됩니다. 매칭 성공 후
                  퀴즈 인증을 통해 가입이 완료됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="animate-fadeInUp mt-10 text-center"
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            href="/"
            className="inline-flex items-center font-medium text-slate-400 transition-colors hover:text-white"
          >
            <svg
              className="mr-3 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
