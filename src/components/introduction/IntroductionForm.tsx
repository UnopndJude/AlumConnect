"use client"

import { useState } from "react"
import {
  IntroductionFormData,
  IntroductionStatus,
  LookingFor,
  ContactPreference,
  STATUS_OPTIONS,
  CONTACT_PREFERENCE_OPTIONS,
  LOOKING_FOR_OPTIONS,
} from "@/types/introduction"

interface IntroductionFormProps {
  initialData?: IntroductionFormData
  onSubmit: (
    data: IntroductionFormData
  ) => Promise<{ success: boolean; message: string }>
  isEdit?: boolean
}

export default function IntroductionForm({
  initialData,
  onSubmit,
  isEdit = false,
}: IntroductionFormProps) {
  const [formData, setFormData] = useState<IntroductionFormData>(
    initialData || {
      name: "",
      graduationClass: 1,
      status: "student" as IntroductionStatus,
      selfIntroduction: "",
    }
  )
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

      if (result.success && !isEdit) {
        setFormData({
          name: "",
          graduationClass: 1,
          status: "student" as IntroductionStatus,
          selfIntroduction: "",
        })
      }
    } catch {
      setMessage({ type: "error", text: "저장 중 오류가 발생했습니다." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">필수 정보</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="status"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              현재 상태 *
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as IntroductionStatus,
                })
              }
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">선택해주세요</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="field"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              전공/업무 분야
            </label>
            <input
              type="text"
              id="field"
              value={formData.field || ""}
              onChange={(e) =>
                setFormData({ ...formData, field: e.target.value })
              }
              placeholder="예: 컴퓨터공학, 생명과학, 기계공학, 금융, 컨설팅 등"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="organization"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              소속 (학교/회사/기관)
            </label>
            <input
              type="text"
              id="organization"
              value={formData.organization || ""}
              onChange={(e) =>
                setFormData({ ...formData, organization: e.target.value })
              }
              placeholder="예: 서울대학교, 삼성전자, 한국과학기술원 등"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="selfIntroduction"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              간단한 자기소개 *
            </label>
            <textarea
              id="selfIntroduction"
              value={formData.selfIntroduction}
              onChange={(e) =>
                setFormData({ ...formData, selfIntroduction: e.target.value })
              }
              required
              rows={4}
              placeholder="동문들에게 간단히 자신을 소개해주세요"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">선택 정보</h3>
        <p className="mb-4 text-sm text-gray-600">
          아래 정보는 선택적으로 입력할 수 있습니다.
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="location"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              거주 지역
            </label>
            <input
              type="text"
              id="location"
              value={formData.location || ""}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="예: 서울, 경기, 미국 뉴욕 등"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="interests"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              관심사/취미
            </label>
            <input
              type="text"
              id="interests"
              value={formData.interests || ""}
              onChange={(e) =>
                setFormData({ ...formData, interests: e.target.value })
              }
              placeholder="예: 독서, 운동, 프로그래밍, 여행 등"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="expertise"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              전문 분야
            </label>
            <input
              type="text"
              id="expertise"
              value={formData.expertise || ""}
              onChange={(e) =>
                setFormData({ ...formData, expertise: e.target.value })
              }
              placeholder="예: 인공지능, 데이터 분석, 웹 개발 등"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="projects"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              프로젝트/연구
            </label>
            <textarea
              id="projects"
              value={formData.projects || ""}
              onChange={(e) =>
                setFormData({ ...formData, projects: e.target.value })
              }
              rows={3}
              placeholder="진행한 프로젝트나 연구를 소개해주세요"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="lookingFor"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              찾고 있는 것
            </label>
            <select
              id="lookingFor"
              value={formData.lookingFor || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lookingFor: (e.target.value || undefined) as
                    | LookingFor
                    | undefined,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">선택해주세요</option>
              {LOOKING_FOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contactPreference"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              연락 선호 방법
            </label>
            <select
              id="contactPreference"
              value={formData.contactPreference || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  contactPreference: (e.target.value || undefined) as
                    | ContactPreference
                    | undefined,
                })
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">선택해주세요</option>
              {CONTACT_PREFERENCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="contactInfo"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              연락처 정보
            </label>
            <input
              type="text"
              id="contactInfo"
              value={formData.contactInfo || ""}
              onChange={(e) =>
                setFormData({ ...formData, contactInfo: e.target.value })
              }
              placeholder="이메일, 전화번호, 카카오톡 ID 등"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-md p-3 ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "저장 중..." : isEdit ? "수정하기" : "등록하기"}
        </button>
      </div>
    </form>
  )
}
