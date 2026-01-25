"use client"

import LoginForm from "@/components/auth/LoginForm"
import { LoginCredentials } from "@/types/user"
import Link from "next/link"

async function handleLogin(data: LoginCredentials) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Back to Home */}
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

        {/* Logo and Header */}
        <div className="animate-fadeInUp mb-12 text-center">
          <div className="mb-8 flex justify-center">
            <div className="animate-float flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl">
              <span className="text-2xl font-bold text-white">A</span>
            </div>
          </div>
          <h1 className="text-gradient mb-4 text-4xl font-bold">AlumConnect</h1>
          <p className="text-xl font-medium text-slate-600">
            동문 커뮤니티에 로그인하세요
          </p>
        </div>

        {/* Login Form */}
        <div
          className="card animate-fadeInUp"
          style={{ animationDelay: "0.2s" }}
        >
          <LoginForm onSubmit={handleLogin} />
        </div>

        {/* Footer */}
        <div
          className="animate-fadeInUp mt-10 text-center"
          style={{ animationDelay: "0.4s" }}
        >
          <p className="text-lg text-slate-600">
            계정이 없으신가요?{" "}
            <Link
              href="/register"
              className="font-semibold text-violet-600 transition-colors hover:text-violet-700"
            >
              회원가입하기
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div
          className="animate-fadeInUp mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6"
          style={{ animationDelay: "0.6s" }}
        >
          <h3 className="mb-4 text-lg font-bold text-blue-800">
            💡 테스트 계정
          </h3>
          <div className="space-y-3 text-blue-700">
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-1 font-semibold">관리자 계정</p>
              <p className="text-sm">admin@incheon-sci.hs.kr / admin123</p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white p-3">
              <p className="mb-1 font-semibold">일반 사용자</p>
              <p className="text-sm">회원가입 후 이용 가능</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
