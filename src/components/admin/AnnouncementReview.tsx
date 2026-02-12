"use client"

import { useState } from "react"
import type { AnnouncementPrimitives } from "@/domain/announcement/entities/Announcement"

interface AnnouncementReviewProps {
  initialAnnouncements: AnnouncementPrimitives[]
}

const ANNOUNCEMENT_TYPE_LABELS = {
  alumni_in_media: "언론에 비친 동문",
  member_announcements: "회원 소식",
  industry_trends: "업계 동향",
} as const

const ANNOUNCEMENT_TYPE_ICONS = {
  alumni_in_media: "📰",
  member_announcements: "📢",
  industry_trends: "📊",
} as const

export default function AnnouncementReview({
  initialAnnouncements,
}: AnnouncementReviewProps) {
  const [announcements, setAnnouncements] =
    useState<AnnouncementPrimitives[]>(initialAnnouncements)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    if (!confirm("이 공지사항을 승인하시겠습니까?")) {
      return
    }

    setIsProcessing(id)
    try {
      const response = await fetch(
        `/api/admin/announcements/${id}/approve`,
        {
          method: "POST",
        }
      )
      const data = await response.json()

      if (data.success) {
        setMessage({
          type: "success",
          text: "공지사항이 승인되었습니다.",
        })
        setAnnouncements((prev) => prev.filter((a) => a.id !== id))
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({
        type: "error",
        text: "승인 처리 중 오류가 발생했습니다.",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setMessage({
        type: "error",
        text: "거부 사유를 입력해주세요.",
      })
      return
    }

    setIsProcessing(id)
    try {
      const response = await fetch(
        `/api/admin/announcements/${id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      )
      const data = await response.json()

      if (data.success) {
        setMessage({
          type: "success",
          text: "공지사항이 거부되었습니다.",
        })
        setAnnouncements((prev) => prev.filter((a) => a.id !== id))
        setRejectingId(null)
        setRejectionReason("")
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({
        type: "error",
        text: "거부 처리 중 오류가 발생했습니다.",
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const startReject = (id: string) => {
    setRejectingId(id)
    setRejectionReason("")
    setMessage(null)
  }

  const cancelReject = () => {
    setRejectingId(null)
    setRejectionReason("")
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-slate-800">
          공지사항 검토
        </h2>
        <p className="mb-6 text-lg text-slate-600">
          회원이 제출한 공지사항을 검토하고 승인하세요
        </p>
        <div className="inline-flex items-center space-x-4 rounded-full border border-amber-200 bg-amber-50 px-6 py-3">
          <span className="text-xl text-amber-600">⏳</span>
          <span className="text-base font-semibold text-amber-800">
            {announcements.length}개 대기 중
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

      {announcements.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <span className="text-4xl text-slate-400">📭</span>
          </div>
          <h3 className="mb-4 text-3xl font-bold text-slate-800">
            검토 대기 중인 공지사항이 없습니다
          </h3>
          <p className="text-xl text-slate-600">
            모든 공지사항이 처리되었습니다! 🎉
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-4xl space-y-6">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="card animate-fadeInUp border border-slate-200 transition-all hover:border-violet-300 hover:shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center space-x-3">
                      <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-800">
                        {
                          ANNOUNCEMENT_TYPE_ICONS[
                            announcement.type as keyof typeof ANNOUNCEMENT_TYPE_ICONS
                          ]
                        }{" "}
                        {
                          ANNOUNCEMENT_TYPE_LABELS[
                            announcement.type as keyof typeof ANNOUNCEMENT_TYPE_LABELS
                          ]
                        }
                      </span>
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-slate-800">
                      {announcement.title}
                    </h3>
                    <p className="mb-4 whitespace-pre-wrap text-base text-slate-700">
                      {announcement.content}
                    </p>
                    <p className="text-sm text-slate-500">
                      제출일:{" "}
                      {new Date(announcement.createdAt).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Actions or Rejection Form */}
                {rejectingId === announcement.id ? (
                  <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6">
                    <h4 className="mb-4 text-lg font-bold text-red-800">
                      거부 사유 입력
                    </h4>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="공지사항을 거부하는 이유를 입력하세요..."
                      rows={4}
                      className="mb-4 w-full rounded-lg border border-red-300 px-4 py-2 text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    />
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={cancelReject}
                        className="btn bg-slate-500 px-4 py-2 text-sm text-white hover:bg-slate-600"
                        disabled={isProcessing === announcement.id}
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleReject(announcement.id)}
                        className="btn bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                        disabled={
                          isProcessing === announcement.id ||
                          !rejectionReason.trim()
                        }
                      >
                        {isProcessing === announcement.id ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            처리 중...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">✕</span>
                            거부 확정
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-end space-x-3 border-t border-slate-200 pt-4">
                    <button
                      onClick={() => handleApprove(announcement.id)}
                      className="btn btn-primary px-6 py-3 text-base"
                      disabled={isProcessing === announcement.id}
                    >
                      {isProcessing === announcement.id ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          처리 중...
                        </>
                      ) : (
                        <>
                          <span className="mr-3 text-lg">✓</span>
                          승인
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => startReject(announcement.id)}
                      className="btn bg-red-500 px-6 py-3 text-base text-white hover:bg-red-600"
                      disabled={isProcessing === announcement.id}
                    >
                      <span className="mr-3 text-lg">✕</span>
                      거부
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
