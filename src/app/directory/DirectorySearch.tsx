"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

interface DirectorySearchProps {
  initialQuery?: string
  initialGraduationClass?: number
}

export default function DirectorySearch({
  initialQuery = "",
  initialGraduationClass,
}: DirectorySearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState(initialQuery)
  const [graduationClass, setGraduationClass] = useState(
    initialGraduationClass?.toString() || ""
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (query) {
      params.set("q", query)
    } else {
      params.delete("q")
    }

    if (graduationClass) {
      params.set("graduationClass", graduationClass)
    } else {
      params.delete("graduationClass")
    }

    // Reset to page 1 on new search
    params.delete("page")

    startTransition(() => {
      router.push(`/directory?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setQuery("")
    setGraduationClass("")
    startTransition(() => {
      router.push("/directory")
    })
  }

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label
              htmlFor="query"
              className="block text-sm font-medium text-gray-700"
            >
              이름
            </label>
            <input
              type="text"
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색할 이름을 입력하세요"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={isPending}
            />
          </div>

          <div>
            <label
              htmlFor="graduationClass"
              className="block text-sm font-medium text-gray-700"
            >
              졸업 기수
            </label>
            <input
              type="number"
              id="graduationClass"
              value={graduationClass}
              onChange={(e) => setGraduationClass(e.target.value)}
              placeholder="예: 5"
              min="1"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isPending ? "검색 중..." : "검색"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isPending}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            초기화
          </button>
        </div>
      </form>
    </div>
  )
}
