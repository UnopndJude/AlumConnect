"use client"

import { useState } from "react"
import NewsletterForm from "./NewsletterForm"
import type { NewsletterPrimitives } from "@/domain/newsletter/entities/Newsletter"

interface NewsletterListProps {
  initialNewsletters: NewsletterPrimitives[]
}

export default function NewsletterList({
  initialNewsletters,
}: NewsletterListProps) {
  const [newsletters, setNewsletters] =
    useState<NewsletterPrimitives[]>(initialNewsletters)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [isDistributing, setIsDistributing] = useState<string | null>(null)

  const refreshNewsletters = async () => {
    try {
      const response = await fetch("/api/admin/newsletter")
      if (!response.ok) {
        console.error("Newsletter API error:", response.status)
        return
      }
      const data = await response.json()

      if (data.success) {
        setNewsletters(data.data)
      }
    } catch (error) {
      console.error("Failed to refresh newsletters:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 뉴스레터를 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/newsletter/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "뉴스레터가 삭제되었습니다." })
        setNewsletters((prev) => prev.filter((n) => n.id !== id))
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({ type: "error", text: "삭제 중 오류가 발생했습니다." })
    }
  }

  const handlePublish = async (id: string) => {
    if (
      !confirm(
        "이 뉴스레터를 발행하시겠습니까? 발행 후에는 수정할 수 없습니다."
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/newsletter/${id}/publish`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setMessage({ type: "success", text: "뉴스레터가 발행되었습니다." })
        await refreshNewsletters()
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({ type: "error", text: "발행 중 오류가 발생했습니다." })
    }
  }

  const handleDistribute = async (id: string) => {
    if (
      !confirm(
        "이 뉴스레터를 모든 구독자에게 발송하시겠습니까? 이 작업은 취소할 수 없습니다."
      )
    ) {
      return
    }

    setIsDistributing(id)
    try {
      const response = await fetch(`/api/admin/newsletter/${id}/distribute`, {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        setMessage({
          type: "success",
          text: `뉴스레터가 ${data.sent}명에게 발송되었습니다.${data.failed > 0 ? ` (${data.failed}명 실패)` : ""}`,
        })
      } else {
        setMessage({ type: "error", text: data.message })
      }
    } catch {
      setMessage({ type: "error", text: "발송 중 오류가 발생했습니다." })
    } finally {
      setIsDistributing(null)
    }
  }

  const handleSaveComplete = () => {
    setIsCreating(false)
    setEditingId(null)
    refreshNewsletters()
    setMessage({ type: "success", text: "뉴스레터가 저장되었습니다." })
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
  }

  const drafts = newsletters.filter((n) => n.status === "draft")
  const published = newsletters.filter((n) => n.status === "published")

  return (
    <div className="card">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="mb-4 text-3xl font-bold text-slate-800">
            뉴스레터 관리
          </h2>
          <p className="text-lg text-slate-600">
            뉴스레터를 생성하고 발행하세요
          </p>
        </div>
        {!isCreating && !editingId && (
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary px-6 py-3 text-base"
          >
            <span className="mr-2 text-lg">➕</span>새 뉴스레터
          </button>
        )}
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

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mb-12">
          <NewsletterForm
            newsletter={
              editingId
                ? newsletters.find((n) => n.id === editingId)
                : undefined
            }
            onSave={handleSaveComplete}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Drafts Section */}
      {drafts.length > 0 && (
        <div className="mb-12">
          <h3 className="mb-6 text-2xl font-bold text-slate-800">
            임시 저장 ({drafts.length})
          </h3>
          <div className="space-y-4">
            {drafts.map((newsletter) => (
              <div
                key={newsletter.id}
                className="card border border-slate-200 transition-all hover:border-violet-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                        제 {newsletter.edition}호
                      </span>
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                        임시저장
                      </span>
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-slate-800">
                      {newsletter.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {newsletter.sections.length}개 섹션 •{" "}
                      {new Date(newsletter.createdAt).toLocaleDateString(
                        "ko-KR"
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setEditingId(newsletter.id)}
                      className="btn bg-slate-500 px-4 py-2 text-sm text-white hover:bg-slate-600"
                      disabled={!!editingId || isCreating}
                    >
                      <span className="mr-2">✏️</span>
                      편집
                    </button>
                    <button
                      onClick={() => handlePublish(newsletter.id)}
                      className="btn btn-primary px-4 py-2 text-sm"
                      disabled={
                        newsletter.sections.length === 0 ||
                        !!editingId ||
                        isCreating
                      }
                    >
                      <span className="mr-2">📤</span>
                      발행
                    </button>
                    <button
                      onClick={() => handleDelete(newsletter.id)}
                      className="btn bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
                      disabled={!!editingId || isCreating}
                    >
                      <span className="mr-2">🗑️</span>
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Published Section */}
      {published.length > 0 && (
        <div>
          <h3 className="mb-6 text-2xl font-bold text-slate-800">
            발행됨 ({published.length})
          </h3>
          <div className="space-y-4">
            {published.map((newsletter) => (
              <div
                key={newsletter.id}
                className="card border border-slate-200 transition-all hover:border-violet-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-3">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                        제 {newsletter.edition}호
                      </span>
                      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                        발행됨
                      </span>
                    </div>
                    <h4 className="mb-2 text-xl font-bold text-slate-800">
                      {newsletter.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {newsletter.sections.length}개 섹션 •{" "}
                      {newsletter.publishedAt &&
                        new Date(newsletter.publishedAt).toLocaleDateString(
                          "ko-KR"
                        )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleDistribute(newsletter.id)}
                      className="btn btn-primary px-4 py-2 text-sm"
                      disabled={isDistributing === newsletter.id}
                    >
                      {isDistributing === newsletter.id ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          발송 중...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">📨</span>
                          구독자에게 발송
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {newsletters.length === 0 && !isCreating && (
        <div className="py-20 text-center">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
            <span className="text-4xl text-slate-400">📰</span>
          </div>
          <h3 className="mb-4 text-3xl font-bold text-slate-800">
            아직 뉴스레터가 없습니다
          </h3>
          <p className="text-xl text-slate-600">
            첫 번째 뉴스레터를 만들어보세요!
          </p>
        </div>
      )}
    </div>
  )
}
