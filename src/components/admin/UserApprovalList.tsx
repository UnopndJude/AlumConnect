"use client"

import { useState, useEffect } from "react"

interface PendingUser {
  id: string
  email: string
  name: string
  graduationClass: number
  status: string
  createdAt: string
}

export default function UserApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.success) {
        setPendingUsers(data.users)
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({
        type: "error",
        text: "사용자 목록을 불러오는 데 실패했습니다.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: "PATCH",
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "사용자가 승인되었습니다." })
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId))
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({ type: "error", text: "승인 처리 중 오류가 발생했습니다." })
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: "PATCH",
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "사용자가 거부되었습니다." })
        setPendingUsers((prev) => prev.filter((user) => user.id !== userId))
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({ type: "error", text: "거부 처리 중 오류가 발생했습니다." })
    }
  }

  if (isLoading) {
    return (
      <div className="card py-12 text-center">
        <div className="flex items-center justify-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent"></div>
          <span className="text-lg font-medium text-slate-600">로딩 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-slate-800">
          사용자 승인 관리
        </h2>
        <p className="mb-6 text-lg text-slate-600">
          가입 신청한 사용자들을 검토하고 승인하세요
        </p>
        <div className="inline-flex items-center space-x-4 rounded-full border border-violet-200 bg-violet-50 px-6 py-3">
          <span className="text-xl text-violet-600">👥</span>
          <span className="text-base font-semibold text-violet-800">
            {pendingUsers.length}명 대기 중
          </span>
        </div>
      </div>

      {message && (
        <div
          className={`mb-10 rounded-xl p-6 font-medium ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center">
            <span className="mr-4 text-xl">
              {message.type === "success" ? "✅" : "❌"}
            </span>
            <span className="text-lg">{message.text}</span>
          </div>
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <span className="text-4xl text-slate-400">📭</span>
          </div>
          <h3 className="mb-4 text-3xl font-bold text-slate-800">
            승인 대기 중인 사용자가 없습니다
          </h3>
          <p className="text-xl text-slate-600">
            모든 사용자가 처리되었습니다! 🎉
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6">
          {pendingUsers.map((user, index) => (
            <div
              key={user.id}
              className="card animate-fadeInUp border border-slate-200 transition-all hover:border-violet-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col items-center justify-between space-y-6 md:flex-row md:space-y-0">
                <div className="flex flex-col items-center space-y-4 text-center md:flex-row md:space-y-0 md:space-x-6 md:text-left">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-400 to-purple-500">
                    <span className="text-xl font-bold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold text-slate-800">
                      {user.name}
                    </h3>
                    <p className="mb-3 text-lg font-medium text-slate-600">
                      {user.email}
                    </p>
                    <div className="flex flex-col items-center space-y-2 md:flex-row md:space-y-0 md:space-x-6">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800">
                        {user.graduationClass}기
                      </span>
                      <span className="text-sm font-medium text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="btn btn-primary px-6 py-3 text-base"
                  >
                    <span className="mr-3 text-lg">✓</span>
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="btn bg-red-500 px-6 py-3 text-base text-white hover:bg-red-600"
                  >
                    <span className="mr-3 text-lg">✕</span>
                    거부
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
