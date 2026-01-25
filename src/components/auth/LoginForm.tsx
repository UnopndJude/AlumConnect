"use client"

import { useState } from "react"
import { LoginCredentials } from "@/types/user"

interface LoginFormProps {
  onSubmit: (data: LoginCredentials) => Promise<{
    success: boolean
    message: string
    user?: {
      id: string
      email: string
      name: string
      graduationClass: number
      isAdmin: boolean
    }
  }>
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await onSubmit(formData)
      setMessage({
        type: result.success ? "success" : "error",
        text: result.message,
      })

      if (result.success) {
        setFormData({ email: "", password: "" })
        if (result.user?.isAdmin) {
          window.location.href = "/admin"
        } else {
          window.location.href = "/"
        }
      }
    } catch {
      setMessage({ type: "error", text: "로그인 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h2 className="mb-3 text-3xl font-bold text-slate-800">로그인</h2>
        <p className="text-lg text-slate-600">계정 정보를 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="비밀번호를 입력하세요"
            className="input"
          />
        </div>

        {message && (
          <div
            className={`rounded-xl p-4 font-medium ${
              message.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-3 text-lg">
                {message.type === "success" ? "✅" : "❌"}
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
              로그인 중...
            </div>
          ) : (
            "로그인하기"
          )}
        </button>
      </form>
    </div>
  )
}
