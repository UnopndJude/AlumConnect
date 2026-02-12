"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import QuizForm from "@/components/auth/QuizForm"
import { QuizQuestionPublic } from "@/types/quiz"

export default function VerifyPage() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<QuizQuestionPublic[]>([])
  const [attemptCount, setAttemptCount] = useState(0)
  const [maxAttempts, setMaxAttempts] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info"
    text: string
  } | null>(null)

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const response = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        const result = await response.json()

        if (response.status === 401) {
          router.push("/login")
          return
        }

        if (response.status === 404) {
          router.push("/onboarding")
          return
        }

        if (result.verified) {
          router.push("/?message=already_verified")
          return
        }

        if (result.success) {
          setSessionId(result.sessionId)
          setQuestions(result.questions)
          setAttemptCount(result.attemptCount)
          setMaxAttempts(result.maxAttempts)
        } else {
          setMessage({ type: "error", text: result.message })
        }
      } catch {
        setMessage({ type: "error", text: "퀴즈를 불러오는데 실패했습니다." })
      } finally {
        setIsLoading(false)
      }
    }

    loadQuiz()
  }, [router])

  const handleSubmitQuiz = async (answers: number[]) => {
    if (!sessionId) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/verify/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      })

      const result = await response.json()

      if (result.passed && result.verified) {
        setMessage({
          type: "success",
          text: "축하합니다! 동문 인증이 완료되었습니다.",
        })
        setTimeout(() => {
          router.push("/?message=verified")
        }, 2000)
      } else if (result.attemptsRemaining > 0) {
        setMessage({ type: "info", text: result.message })
        setAttemptCount(maxAttempts - result.attemptsRemaining)
        if (result.newQuestions) {
          setQuestions(result.newQuestions)
        }
      } else {
        setMessage({
          type: "error",
          text: `${result.message} 나중에 다시 시도하거나 관리자에게 문의해주세요.`,
        })
      }
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
          <p className="text-lg text-slate-600">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-6 py-12">
      <div className="mx-auto max-w-3xl">
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

        <div className="card">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-slate-800">
              동문 인증하기
            </h1>
            <p className="text-slate-600">
              인증 동문 배지를 받고 커뮤니티에서 더 많은 기능을 이용해보세요.
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="mb-1 font-semibold text-blue-900">
                  인증 동문 배지
                </h3>
                <p className="text-sm text-blue-800">
                  퀴즈를 통과하면 프로필에 &quot;인증 동문&quot; 배지가
                  표시됩니다.
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-xl p-4 font-medium ${
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

          {questions.length > 0 && (
            <>
              <QuizForm
                questions={questions}
                attemptCount={attemptCount}
                maxAttempts={maxAttempts}
                onSubmit={handleSubmitQuiz}
                isLoading={isSubmitting}
              />

              <div className="mt-6 flex justify-center border-t border-slate-200 pt-6">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-sm font-medium text-slate-600 transition-colors hover:text-violet-600 disabled:opacity-50"
                >
                  나중에 하기
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
