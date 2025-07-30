'use client'

import Link from 'next/link'
import { Introduction } from '@/types/introduction'
import { STATUS_OPTIONS, LOOKING_FOR_OPTIONS } from '@/types/introduction'

interface IntroductionCardProps {
  introduction: Introduction
}

export default function IntroductionCard({ introduction }: IntroductionCardProps) {
  const getStatusLabel = (value: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  const getLookingForLabel = (value?: string) => {
    if (!value) return null
    const option = LOOKING_FOR_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            {introduction.userName}
          </h3>
          <p className="text-sm text-gray-600">
            {introduction.userGraduationClass}기 · {getStatusLabel(introduction.currentStatus)}
          </p>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(introduction.createdAt).toLocaleDateString('ko-KR')}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-700 w-16">분야:</span>
          <span className="text-gray-600">{introduction.field}</span>
        </div>
        <div className="flex items-center text-sm">
          <span className="font-medium text-gray-700 w-16">소속:</span>
          <span className="text-gray-600">{introduction.organization}</span>
        </div>
        {introduction.location && (
          <div className="flex items-center text-sm">
            <span className="font-medium text-gray-700 w-16">지역:</span>
            <span className="text-gray-600">{introduction.location}</span>
          </div>
        )}
      </div>

      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {introduction.selfIntroduction}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {introduction.lookingFor && (
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {getLookingForLabel(introduction.lookingFor)}
          </span>
        )}
        {introduction.interests && (
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            관심사: {introduction.interests}
          </span>
        )}
      </div>

      <Link
        href={`/introductions/${introduction.id}`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        자세히 보기
      </Link>
    </div>
  )
}