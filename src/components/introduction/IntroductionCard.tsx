"use client"

import Link from "next/link"
import { Introduction } from "@/types/introduction"
import { STATUS_OPTIONS, LOOKING_FOR_OPTIONS } from "@/types/introduction"

interface IntroductionCardProps {
  introduction: Introduction
}

export default function IntroductionCard({
  introduction,
}: IntroductionCardProps) {
  const getStatusLabel = (value: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const getLookingForLabel = (value?: string) => {
    if (!value) return null
    const option = LOOKING_FOR_OPTIONS.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-md transition-shadow hover:shadow-lg">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {introduction.name}
          </h3>
          <p className="text-sm text-gray-600">
            {introduction.graduationClass}기 ·{" "}
            {getStatusLabel(introduction.status)}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(introduction.createdAt).toLocaleDateString("ko-KR")}
        </span>
      </div>

      <div className="mb-4 space-y-2">
        {introduction.field && (
          <div className="flex items-center text-sm">
            <span className="w-16 font-medium text-gray-700">분야:</span>
            <span className="text-gray-600">{introduction.field}</span>
          </div>
        )}
        {introduction.organization && (
          <div className="flex items-center text-sm">
            <span className="w-16 font-medium text-gray-700">소속:</span>
            <span className="text-gray-600">{introduction.organization}</span>
          </div>
        )}
        {introduction.location && (
          <div className="flex items-center text-sm">
            <span className="w-16 font-medium text-gray-700">지역:</span>
            <span className="text-gray-600">{introduction.location}</span>
          </div>
        )}
      </div>

      <p className="mb-4 line-clamp-3 text-sm text-gray-700">
        {introduction.selfIntroduction}
      </p>

      <div className="mb-4 flex flex-wrap gap-2">
        {introduction.lookingFor && (
          <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
            {getLookingForLabel(introduction.lookingFor)}
          </span>
        )}
        {introduction.interests && (
          <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
            관심사: {introduction.interests}
          </span>
        )}
      </div>

      <Link
        href={`/introductions/${introduction.id}`}
        className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        자세히 보기
      </Link>
    </div>
  )
}
