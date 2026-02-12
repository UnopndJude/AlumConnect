"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface ConnectionRequestButtonProps {
  receiverId: string
}

export default function ConnectionRequestButton({
  receiverId,
}: ConnectionRequestButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showMessageInput, setShowMessageInput] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        const response = await fetch("/api/connections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            receiverId,
            message: message.trim() || undefined,
          }),
        })

        const result = await response.json()

        if (result.success) {
          setSuccess(true)
          setShowMessageInput(false)
          setMessage("")
          setTimeout(() => {
            router.refresh()
          }, 1000)
        } else {
          setError(result.message || "연결 요청을 보내는데 실패했습니다.")
        }
      } catch (err) {
        console.error("Error sending connection request:", err)
        setError("연결 요청을 보내는데 실패했습니다.")
      }
    })
  }

  if (success) {
    return (
      <span className="text-sm text-green-600">연결 요청을 보냈습니다!</span>
    )
  }

  if (showMessageInput) {
    return (
      <form onSubmit={handleSubmit} className="w-full space-y-2">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="간단한 메시지를 남겨주세요 (선택사항)"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          disabled={isPending}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? "전송 중..." : "전송"}
          </button>
          <button
            type="button"
            onClick={() => setShowMessageInput(false)}
            disabled={isPending}
            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            취소
          </button>
        </div>
      </form>
    )
  }

  return (
    <button
      onClick={() => setShowMessageInput(true)}
      className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
    >
      연결 요청
    </button>
  )
}
