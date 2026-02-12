"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ConnectionRequestButton from "./ConnectionRequestButton"

interface Profile {
  id: string
  name: string
  graduationClass: number
  email?: string
  isVerified: boolean
  alumniId?: string | null
}

interface DirectoryListProps {
  query?: string
  graduationClass?: number
  page: number
  isVerified: boolean
  currentUserId: string
}

export default function DirectoryList({
  query,
  graduationClass,
  page,
  isVerified,
  currentUserId,
}: DirectoryListProps) {
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query) params.set("q", query)
        if (graduationClass) params.set("graduationClass", graduationClass.toString())
        params.set("page", page.toString())
        params.set("limit", "20")

        const response = await fetch(`/api/directory?${params.toString()}`)
        const result = await response.json()

        if (result.success) {
          setProfiles(result.data.profiles)
          setPagination(result.data.pagination)
        } else {
          console.error("Failed to fetch profiles:", result.message)
        }
      } catch (error) {
        console.error("Error fetching profiles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [query, graduationClass, page])

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow">
        <p className="text-gray-600">검색 결과가 없습니다.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          총 {pagination.total}명의 동문을 찾았습니다
        </p>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="rounded-lg bg-white p-6 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.name}
                </h3>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {profile.graduationClass}기
                  </span>
                  {profile.isVerified && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                      인증됨
                    </span>
                  )}
                </div>

                {/* Show additional info only for verified users */}
                {isVerified && profile.email && (
                  <div className="mt-3 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">이메일:</span>{" "}
                      {profile.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              {isVerified && profile.id !== currentUserId && (
                <ConnectionRequestButton receiverId={profile.id} />
              )}
              <Link
                href={`/profile/${profile.id}`}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                프로필 보기
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          {page > 1 && (
            <Link
              href={`/directory?${new URLSearchParams({
                ...(query && { q: query }),
                ...(graduationClass && {
                  graduationClass: graduationClass.toString(),
                }),
                page: (page - 1).toString(),
              }).toString()}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              이전
            </Link>
          )}

          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            {page} / {pagination.totalPages}
          </span>

          {page < pagination.totalPages && (
            <Link
              href={`/directory?${new URLSearchParams({
                ...(query && { q: query }),
                ...(graduationClass && {
                  graduationClass: graduationClass.toString(),
                }),
                page: (page + 1).toString(),
              }).toString()}`}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              다음
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
