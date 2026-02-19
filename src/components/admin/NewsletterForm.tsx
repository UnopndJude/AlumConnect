"use client"

import { useState } from "react"
import type { NewsletterPrimitives } from "@/domain/newsletter/entities/Newsletter"
import type { NewsletterSectionProps } from "@/domain/newsletter/entities/NewsletterSection"

interface NewsletterFormProps {
  newsletter?: NewsletterPrimitives
  onSave: () => void
  onCancel: () => void
}

const SECTION_TYPES = [
  {
    value: "alumni_in_media",
    label: "언론에 비친 동문",
    icon: "📰",
  },
  {
    value: "member_announcements",
    label: "회원 소식",
    icon: "📢",
  },
  {
    value: "industry_trends",
    label: "업계 동향",
    icon: "📊",
  },
] as const

type SectionType = (typeof SECTION_TYPES)[number]["value"]

interface SectionFormData {
  id?: string
  type: SectionType
  title: string
  content: string
  order: number
}

export default function NewsletterForm({
  newsletter,
  onSave,
  onCancel,
}: NewsletterFormProps) {
  const [title, setTitle] = useState(newsletter?.title || "")
  const [sections, setSections] = useState<SectionFormData[]>(
    newsletter?.sections.map((s) => ({
      id: s.id,
      type: s.type as SectionType,
      title: s.title,
      content: s.content,
      order: s.order,
    })) || []
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newsletterId, setNewsletterId] = useState(newsletter?.id)

  const addSection = () => {
    setSections([
      ...sections,
      {
        type: "alumni_in_media",
        title: "",
        content: "",
        order: sections.length,
      },
    ])
  }

  const updateSection = (
    index: number,
    field: keyof SectionFormData,
    value: string | number
  ) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], [field]: value }
    setSections(newSections)
  }

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setError(null)

    if (!title.trim()) {
      setError("제목을 입력해주세요.")
      return
    }

    setIsSaving(true)

    try {
      let currentId = newsletterId

      // Create or update newsletter
      if (!currentId) {
        // Create new newsletter
        const response = await fetch("/api/admin/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        })
        const data = await response.json()

        if (!data.success) {
          setError(data.message)
          setIsSaving(false)
          return
        }

        currentId = data.data.id
        setNewsletterId(currentId)
      } else if (title !== newsletter?.title) {
        // Update title
        const response = await fetch(`/api/admin/newsletter/${currentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        })
        const data = await response.json()

        if (!data.success) {
          setError(data.message)
          setIsSaving(false)
          return
        }
      }

      // Get existing sections
      const existingResponse = await fetch(
        `/api/admin/newsletter/${currentId}/sections`
      )
      if (!existingResponse.ok) {
        setError("섹션 목록 조회에 실패했습니다.")
        setIsSaving(false)
        return
      }
      const existingData = await existingResponse.json()
      const existingSections = existingData.success ? existingData.data : []

      // Remove deleted sections
      for (const existing of existingSections) {
        const stillExists = sections.some((s) => s.id === existing.id)
        if (!stillExists) {
          await fetch(
            `/api/admin/newsletter/${currentId}/sections/${existing.id}`,
            { method: "DELETE" }
          )
        }
      }

      // Add or update sections
      for (const section of sections) {
        if (!section.title.trim() || !section.content.trim()) {
          continue // Skip empty sections
        }

        if (section.id) {
          // Update existing section
          const existing = existingSections.find(
            (s: NewsletterSectionProps) => s.id === section.id
          )
          if (
            !existing ||
            existing.title !== section.title ||
            existing.content !== section.content
          ) {
            const response = await fetch(
              `/api/admin/newsletter/${currentId}/sections/${section.id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: section.title,
                  content: section.content,
                }),
              }
            )
            const data = await response.json()
            if (!data.success) {
              console.error("Failed to update section:", data.message)
            }
          }
        } else {
          // Create new section
          const response = await fetch(
            `/api/admin/newsletter/${currentId}/sections`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                type: section.type,
                title: section.title,
                content: section.content,
                order: section.order,
              }),
            }
          )
          const data = await response.json()
          if (data.success) {
            // Update section with generated ID
            section.id = data.data.id
          } else {
            console.error("Failed to create section:", data.message)
          }
        }
      }

      onSave()
    } catch (error) {
      console.error("Save error:", error)
      setError("저장 중 오류가 발생했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="card border-2 border-violet-300">
      <h3 className="mb-8 text-2xl font-bold text-slate-800">
        {newsletter ? "뉴스레터 편집" : "새 뉴스레터 만들기"}
      </h3>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          <div className="flex items-center">
            <span className="mr-3 text-lg">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Title Input */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          뉴스레터 제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 2024년 2월 뉴스레터"
          className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
        />
      </div>

      {/* Sections */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-bold text-slate-800">섹션</h4>
          <button
            onClick={addSection}
            className="btn bg-slate-500 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            <span className="mr-2">➕</span>
            섹션 추가
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
            <p className="text-slate-600">
              섹션을 추가하여 뉴스레터 내용을 작성하세요
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div
                key={section.id || index}
                className="rounded-lg border border-slate-200 bg-slate-50 p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-600">
                    섹션 {index + 1}
                  </span>
                  <button
                    onClick={() => removeSection(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <span className="text-lg">🗑️</span>
                  </button>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    섹션 타입
                  </label>
                  <select
                    value={section.type}
                    onChange={(e) =>
                      updateSection(index, "type", e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                  >
                    {SECTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    섹션 제목
                  </label>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) =>
                      updateSection(index, "title", e.target.value)
                    }
                    placeholder="섹션 제목을 입력하세요"
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    섹션 내용
                  </label>
                  <textarea
                    value={section.content}
                    onChange={(e) =>
                      updateSection(index, "content", e.target.value)
                    }
                    placeholder="섹션 내용을 입력하세요"
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-800 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          onClick={onCancel}
          className="btn bg-slate-500 px-6 py-3 text-white hover:bg-slate-600"
          disabled={isSaving}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="btn btn-primary px-6 py-3"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              저장 중...
            </>
          ) : (
            <>
              <span className="mr-2">💾</span>
              저장
            </>
          )}
        </button>
      </div>
    </div>
  )
}
