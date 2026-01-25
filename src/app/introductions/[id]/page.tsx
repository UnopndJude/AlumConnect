import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  STATUS_OPTIONS,
  CONTACT_PREFERENCE_OPTIONS,
  LOOKING_FOR_OPTIONS,
} from "@/types/introduction"

interface IntroductionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function IntroductionDetailPage({
  params,
}: IntroductionDetailPageProps) {
  const { id } = await params
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    redirect("/login")
  }

  const userRepository = container.getUserRepository()
  const introductionRepository = container.getIntroductionRepository()

  const userEntity = await userRepository.findById(UserId.create(userId))
  if (!userEntity || !userEntity.status.isApproved()) {
    redirect("/")
  }

  const introductionEntity = await introductionRepository.findById(id)
  if (!introductionEntity) {
    redirect("/introductions")
  }

  const introduction = introductionEntity.toPrimitives()

  const getStatusLabel = (value: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const getContactPreferenceLabel = (value?: string) => {
    if (!value) return null
    const option = CONTACT_PREFERENCE_OPTIONS.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const getLookingForLabel = (value?: string) => {
    if (!value) return null
    const option = LOOKING_FOR_OPTIONS.find((opt) => opt.value === value)
    return option ? option.label : value
  }

  const isOwner = introduction.userId === userId

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
                동문 자기소개
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/introductions"
                className="text-blue-600 hover:text-blue-500"
              >
                목록으로 돌아가기
              </Link>
              {isOwner && (
                <Link
                  href={`/introductions/${introduction.id}/edit`}
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  수정하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="border-b bg-blue-50 px-6 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {introduction.name}
                </h2>
                <p className="mt-1 text-gray-600">
                  {introduction.graduationClass}기 ·{" "}
                  {getStatusLabel(introduction.status)}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(introduction.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  기본 정보
                </h3>
                <div className="space-y-2">
                  {introduction.field && (
                    <div>
                      <span className="font-medium text-gray-700">
                        전공/업무 분야:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {introduction.field}
                      </span>
                    </div>
                  )}
                  {introduction.organization && (
                    <div>
                      <span className="font-medium text-gray-700">소속:</span>
                      <span className="ml-2 text-gray-600">
                        {introduction.organization}
                      </span>
                    </div>
                  )}
                  {introduction.location && (
                    <div>
                      <span className="font-medium text-gray-700">
                        거주 지역:
                      </span>
                      <span className="ml-2 text-gray-600">
                        {introduction.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {(introduction.lookingFor || introduction.contactPreference) && (
                <div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    연결 정보
                  </h3>
                  <div className="space-y-2">
                    {introduction.lookingFor && (
                      <div>
                        <span className="font-medium text-gray-700">
                          찾고 있는 것:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {getLookingForLabel(introduction.lookingFor)}
                        </span>
                      </div>
                    )}
                    {introduction.contactPreference && (
                      <div>
                        <span className="font-medium text-gray-700">
                          연락 선호 방법:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {getContactPreferenceLabel(
                            introduction.contactPreference
                          )}
                        </span>
                      </div>
                    )}
                    {introduction.contactInfo && (
                      <div>
                        <span className="font-medium text-gray-700">
                          연락처:
                        </span>
                        <span className="ml-2 text-gray-600">
                          {introduction.contactInfo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                자기소개
              </h3>
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                  {introduction.selfIntroduction}
                </p>
              </div>
            </div>

            {introduction.interests && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  관심사/취미
                </h3>
                <p className="text-gray-700">{introduction.interests}</p>
              </div>
            )}

            {introduction.expertise && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  전문 분야
                </h3>
                <p className="text-gray-700">{introduction.expertise}</p>
              </div>
            )}

            {introduction.projects && (
              <div>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                  프로젝트/연구
                </h3>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="leading-relaxed whitespace-pre-wrap text-gray-700">
                    {introduction.projects}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
