import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import { redirect } from "next/navigation"
import Link from "next/link"
import IntroductionCard from "@/components/introduction/IntroductionCard"

export default async function IntroductionsPage() {
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

  const user = userEntity.toPrimitives()

  const introductionEntities = await introductionRepository.findAll()
  const introductions = introductionEntities.map((i) => i.toPrimitives())

  const userIntroductionEntity = await introductionRepository.findByUserId(
    UserId.create(userId)
  )
  const userIntroduction = userIntroductionEntity
    ? userIntroductionEntity.toPrimitives()
    : null

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
              <span className="text-sm text-gray-600">
                안녕하세요, {user.name}님
              </span>
              {!userIntroduction ? (
                <Link
                  href="/introductions/new"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  내 소개 작성하기
                </Link>
              ) : (
                <Link
                  href={`/introductions/${userIntroduction.id}/edit`}
                  className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  내 소개 수정하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {introductions.length === 0 ? (
          <div className="py-12 text-center">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              아직 등록된 자기소개가 없습니다
            </h2>
            <p className="mb-6 text-gray-600">
              첫 번째로 자기소개를 작성해보세요!
            </p>
            <Link
              href="/introductions/new"
              className="rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              자기소개 작성하기
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  동문들의 자기소개
                </h2>
                <p className="mt-1 text-gray-600">
                  총 {introductions.length}명의 동문이 자기소개를 등록했습니다
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {introductions.map((introduction) => (
                <IntroductionCard
                  key={introduction.id}
                  introduction={introduction}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
