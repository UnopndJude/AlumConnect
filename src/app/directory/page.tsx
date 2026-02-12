import { redirect } from "next/navigation"
import { getCurrentUser } from "@/infrastructure/supabase/auth"
import Link from "next/link"
import DirectorySearch from "./DirectorySearch"
import DirectoryList from "./DirectoryList"

interface DirectoryPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function DirectoryPage({
  searchParams,
}: DirectoryPageProps) {
  const { user, profile } = await getCurrentUser()

  if (!user || !profile) {
    redirect("/login")
  }

  // Await searchParams in Next.js 15
  const params = await searchParams

  // Extract search params
  const query = typeof params.q === "string" ? params.q : undefined
  const graduationClass =
    typeof params.graduationClass === "string"
      ? parseInt(params.graduationClass, 10)
      : undefined
  const page =
    typeof params.page === "string"
      ? parseInt(params.page, 10)
      : 1

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                AlumConnect
              </Link>
              <h1 className="mt-1 text-xl font-semibold text-gray-900">
                동문 디렉토리
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {profile.name}님
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Verification Notice for Non-Verified Users */}
        {!profile.isVerified && (
          <div className="mb-6 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  제한된 접근
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    동문 인증을 완료하면 전체 프로필 정보를 확인하고 연결
                    요청을 보낼 수 있습니다.
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/verify"
                    className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                  >
                    지금 인증하기 →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Form */}
        <DirectorySearch
          initialQuery={query}
          initialGraduationClass={graduationClass}
        />

        {/* Directory List */}
        <DirectoryList
          query={query}
          graduationClass={graduationClass}
          page={page}
          isVerified={profile.isVerified}
          currentUserId={profile.id}
        />
      </main>
    </div>
  )
}
