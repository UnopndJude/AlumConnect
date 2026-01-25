"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import RegistrationStepper from "@/components/auth/RegistrationStepper"

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  graduationClass: number
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    graduationClass: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "비밀번호가 일치하지 않습니다." })
      return
    }

    if (formData.password.length < 6) {
      setMessage({
        type: "error",
        text: "비밀번호는 6자 이상이어야 합니다.",
      })
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
      const matchResponse = await fetch("/api/auth/register/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          graduationClass: formData.graduationClass,
          email: formData.email,
        }),
      })

      const matchResult = await matchResponse.json()

      if (!matchResult.success) {
        setMessage({ type: "error", text: matchResult.message })
        setIsLoading(false)
        return
      }

      const registrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        graduationClass: formData.graduationClass,
        alumniMatched: matchResult.matched,
        alumniId: matchResult.alumniId,
        matchMessage: matchResult.message,
      }

      sessionStorage.setItem(
        "registrationData",
        JSON.stringify(registrationData)
      )

      router.push("/register/quiz")
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center font-medium text-slate-600 transition-colors hover:text-violet-600"
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

        <div className="animate-fadeInUp mb-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="animate-float flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>
          <h1 className="text-gradient mb-4 text-4xl font-bold">AlumConnect</h1>
          <p className="text-xl font-medium text-slate-600">
            인천과학고등학교 동문 커뮤니티에 가입하세요
          </p>
        </div>

        <div
          className="card animate-fadeInUp"
          style={{ animationDelay: "0.2s" }}
        >
          <RegistrationStepper currentStep={1} />

          <div className="mb-8 text-center">
            <h2 className="mb-3 text-3xl font-bold text-slate-800">
              기본 정보 입력
            </h2>
            <p className="text-lg text-slate-600">
              회원가입을 위한 기본 정보를 입력해주세요
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="mb-3 block text-base font-semibold text-slate-700"
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
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-3 block text-base font-semibold text-slate-700"
              >
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="이메일을 입력하세요"
                className="input"
              />
            </div>

            <div>
              <label
                htmlFor="graduationClass"
                className="mb-3 block text-base font-semibold text-slate-700"
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
                className="input"
                placeholder="몇 기인지 숫자로 입력하세요"
              />
              <p className="mt-3 flex items-center text-sm text-slate-500">
                <span className="mr-2">i</span>
                인천과학고등학교 졸업 기수를 입력해주세요
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="password"
                  className="mb-3 block text-base font-semibold text-slate-700"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={6}
                  placeholder="6자 이상"
                  className="input"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-3 block text-base font-semibold text-slate-700"
                >
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  placeholder="비밀번호 재입력"
                  className="input"
                />
              </div>
            </div>

            {message && (
              <div
                className={`rounded-xl p-4 font-medium ${
                  message.type === "success"
                    ? "border border-green-200 bg-green-50 text-green-800"
                    : message.type === "info"
                      ? "border border-blue-200 bg-blue-50 text-blue-800"
                      : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-lg">
                    {message.type === "success"
                      ? "v"
                      : message.type === "info"
                        ? "i"
                        : "x"}
                  </span>
                  {message.text}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full py-4 text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  처리 중...
                </div>
              ) : (
                "다음 단계로"
              )}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start text-blue-800">
              <span className="mr-4 text-2xl">i</span>
              <div>
                <p className="mb-2 text-lg font-semibold">
                  퀴즈 기반 인증 안내
                </p>
                <p className="leading-relaxed">
                  동문 DB 매칭 후 인천과학고에 대한 퀴즈를 통해 인증합니다.
                  퀴즈를 통과하면 바로 가입이 완료됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="animate-fadeInUp mt-10 text-center"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-lg text-slate-600">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-violet-600 transition-colors hover:text-violet-700"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
