"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface RegistrationComplete {
  autoApproved: boolean
  message: string
}

export default function VerifyPage() {
  const router = useRouter()
  const [data, setData] = useState<RegistrationComplete | null>(null)

  useEffect(() => {
    // Skip if data already loaded (handles React Strict Mode double-run)
    if (data) return

    const stored = sessionStorage.getItem("registrationComplete")
    if (!stored) {
      router.push("/register")
      return
    }

    const parsed = JSON.parse(stored)
    setData(parsed)
    // Remove after setting data to prevent re-read issues
    sessionStorage.removeItem("registrationComplete")
  }, [router, data])

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="card text-center">
          <div className="mb-8">
            <div
              className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${
                data.autoApproved ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {data.autoApproved ? (
                <svg
                  className="h-10 w-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="h-10 w-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <h1 className="mb-4 text-3xl font-bold text-slate-800">
              {data.autoApproved
                ? "가입이 완료되었습니다!"
                : "가입 신청이 완료되었습니다"}
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              {data.message}
            </p>
          </div>

          {data.autoApproved ? (
            <div className="space-y-4">
              <p className="text-slate-500">
                동문 인증이 완료되어 바로 서비스를 이용하실 수 있습니다.
              </p>
              <Link href="/login" className="btn btn-primary w-full py-3">
                로그인하기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-50 p-6">
                <p className="text-sm leading-relaxed text-blue-800">
                  관리자 검토 후 승인이 완료되면 로그인하실 수 있습니다.
                  <br />
                  검토에는 보통 1-2일이 소요됩니다.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link href="/" className="btn btn-secondary px-6 py-3">
                  홈으로 돌아가기
                </Link>
                <Link href="/login" className="btn btn-primary px-6 py-3">
                  로그인 시도하기
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
