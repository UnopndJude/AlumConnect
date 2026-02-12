"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import RegistrationStepper from "@/components/auth/RegistrationStepper"
import QuizForm from "@/components/auth/QuizForm"
import { QuizQuestionPublic } from "@/types/quiz"

interface RegistrationData {
  email: string
  password: string
  name: string
  graduationClass: number
  alumniMatched: boolean
  alumniId?: string
  matchMessage: string
}

export default function QuizPage() {
  const router = useRouter()
  const [registrationData, setRegistrationData] =
    useState<RegistrationData | null>(null)
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
    const loadRegistrationData = async () => {
      // Skip if already loaded (handles React Strict Mode)
      if (registrationData) return

      const stored = sessionStorage.getItem("registrationData")
      if (!stored) {
        router.push("/register")
        return
      }

      const data: RegistrationData = JSON.parse(stored)
      setRegistrationData(data)

      try {
        const response = await fetch("/api/auth/register/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            alumniMatched: data.alumniMatched,
            alumniId: data.alumniId,
          }),
        })

        const result = await response.json()

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

    loadRegistrationData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleSubmitQuiz = async (answers: number[]) => {
    if (!sessionId || !registrationData) return

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/register/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers }),
      })

      const result = await response.json()

      if (result.passed) {
        setMessage({
          type: "success",
          text: result.message,
        })

        const completeResponse = await fetch("/api/auth/register/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            email: registrationData.email,
            password: registrationData.password,
            name: registrationData.name,
            graduationClass: registrationData.graduationClass,
          }),
        })

        const completeResult = await completeResponse.json()

        if (completeResult.success) {
          sessionStorage.removeItem("registrationData")
          sessionStorage.setItem(
            "registrationComplete",
            JSON.stringify({
              autoApproved: completeResult.autoApproved,
              message: completeResult.message,
            })
          )
          router.push("/register/verify")
        } else {
          setMessage({ type: "error", text: completeResult.message })
        }
      } else if (result.attemptsRemaining > 0) {
        setMessage({ type: "info", text: result.message })
        setAttemptCount(maxAttempts - result.attemptsRemaining)
        if (result.newQuestions) {
          setQuestions(result.newQuestions)
        }
      } else {
        const completeResponse = await fetch("/api/auth/register/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            email: registrationData.email,
            password: registrationData.password,
            name: registrationData.name,
            graduationClass: registrationData.graduationClass,
          }),
        })

        const completeResult = await completeResponse.json()

        if (completeResult.success) {
          sessionStorage.removeItem("registrationData")
          router.push("/register/review-requested")
        } else {
          setMessage({ type: "error", text: completeResult.message })
        }
      }
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." })
    } finally {
      setIsSubmitting(false)
    }
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
            href="/register"
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
            이전 단계로
          </Link>
        </div>

        <div className="card">
          <RegistrationStepper currentStep={3} />

          {registrationData && (
            <div
              className={`mb-6 rounded-xl p-4 ${
                registrationData.alumniMatched
                  ? "border border-green-200 bg-green-50 text-green-800"
                  : "border border-yellow-200 bg-yellow-50 text-yellow-800"
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">
                  {registrationData.alumniMatched ? "v" : "!"}
                </span>
                <span>{registrationData.matchMessage}</span>
              </div>
            </div>
          )}

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
            <QuizForm
              questions={questions}
              attemptCount={attemptCount}
              maxAttempts={maxAttempts}
              onSubmit={handleSubmitQuiz}
              isLoading={isSubmitting}
            />
          )}
        </div>
      </div>
    </div>
  )
}
