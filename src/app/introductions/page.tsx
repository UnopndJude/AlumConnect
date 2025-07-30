import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { getAllIntroductions, getIntroductionByUserId } from '@/lib/introductions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import IntroductionCard from '@/components/introduction/IntroductionCard'

export default async function IntroductionsPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = getUserById(userId)
  if (!user || user.status !== 'approved') {
    redirect('/')
  }

  const introductions = getAllIntroductions()
  const userIntroduction = getIntroductionByUserId(userId)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                AlumConnect
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 mt-1">동문 자기소개</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {user.name}님
              </span>
              {!userIntroduction ? (
                <Link
                  href="/introductions/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  내 소개 작성하기
                </Link>
              ) : (
                <Link
                  href={`/introductions/${userIntroduction.id}/edit`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  내 소개 수정하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {introductions.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              아직 등록된 자기소개가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              첫 번째로 자기소개를 작성해보세요!
            </p>
            <Link
              href="/introductions/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              자기소개 작성하기
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  동문들의 자기소개
                </h2>
                <p className="text-gray-600 mt-1">
                  총 {introductions.length}명의 동문이 자기소개를 등록했습니다
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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