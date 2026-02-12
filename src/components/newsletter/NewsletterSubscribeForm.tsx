"use client"

import { useState } from "react"

export function NewsletterSubscribeForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) {
      setStatus("error")
      setMessage("이메일을 입력해주세요")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setStatus("error")
      setMessage("올바른 이메일 형식을 입력해주세요")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "뉴스레터 구독이 완료되었습니다!")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "구독에 실패했습니다. 다시 시도해주세요.")
      }
    } catch {
      setStatus("error")
      setMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto" noValidate>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소를 입력하세요"
          className="input flex-1"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          className="btn btn-primary whitespace-nowrap"
          disabled={status === "loading"}
        >
          {status === "loading" ? "구독 중..." : "구독하기"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-4 p-4 rounded-lg text-center ${
            status === "success"
              ? "bg-green-50 text-green-700"
              : status === "error"
              ? "bg-red-50 text-red-700"
              : ""
          }`}
        >
          {message}
        </div>
      )}
    </form>
  )
}
