import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { getIntroductionById } from '@/lib/introductions'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { STATUS_OPTIONS, CONTACT_PREFERENCE_OPTIONS, LOOKING_FOR_OPTIONS } from '@/types/introduction'

interface IntroductionDetailPageProps {
  params: { id: string }
}

export default async function IntroductionDetailPage({ params }: IntroductionDetailPageProps) {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = getUserById(userId)
  if (!user || user.status !== 'approved') {
    redirect('/')
  }

  const introduction = getIntroductionById(params.id)
  if (!introduction) {
    redirect('/introductions')
  }

  const getStatusLabel = (value: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  const getContactPreferenceLabel = (value?: string) => {
    if (!value) return null
    const option = CONTACT_PREFERENCE_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  const getLookingForLabel = (value?: string) => {
    if (!value) return null
    const option = LOOKING_FOR_OPTIONS.find(opt => opt.value === value)
    return option ? option.label : value
  }

  const isOwner = introduction.userId === userId

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
              <Link
                href="/introductions"
                className="text-blue-600 hover:text-blue-500"
              >
                목록으로 돌아가기
              </Link>
              {isOwner && (
                <Link
                  href={`/introductions/${introduction.id}/edit`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  수정하기
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {introduction.userName}
                </h2>
                <p className="text-gray-600 mt-1">
                  {introduction.userGraduationClass}기 · {getStatusLabel(introduction.currentStatus)}
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(introduction.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 필수 정보 */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">기본 정보</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">전공/업무 분야:</span>
                    <span className="ml-2 text-gray-600">{introduction.field}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">소속:</span>
                    <span className="ml-2 text-gray-600">{introduction.organization}</span>
                  </div>
                  {introduction.location && (
                    <div>
                      <span className="font-medium text-gray-700">거주 지역:</span>
                      <span className="ml-2 text-gray-600">{introduction.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {(introduction.lookingFor || introduction.contactPreference) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">연결 정보</h3>
                  <div className="space-y-2">
                    {introduction.lookingFor && (
                      <div>
                        <span className="font-medium text-gray-700">찾고 있는 것:</span>
                        <span className="ml-2 text-gray-600">{getLookingForLabel(introduction.lookingFor)}</span>
                      </div>
                    )}
                    {introduction.contactPreference && (
                      <div>
                        <span className="font-medium text-gray-700">연락 선호 방법:</span>
                        <span className="ml-2 text-gray-600">{getContactPreferenceLabel(introduction.contactPreference)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 자기소개 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">자기소개</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {introduction.selfIntroduction}
                </p>
              </div>
            </div>

            {/* 관심사 */}
            {introduction.interests && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">관심사/취미</h3>
                <p className="text-gray-700">{introduction.interests}</p>
              </div>
            )}

            {/* 최근 프로젝트/연구 */}
            {introduction.recentProjects && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">최근 프로젝트/연구</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {introduction.recentProjects}
                  </p>
                </div>
              </div>
            )}

            {/* 진로 여정 */}
            {introduction.careerPath && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">진로 여정</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {introduction.careerPath}
                  </p>
                </div>
              </div>
            )}

            {/* 후배들에게 하고 싶은 말 */}
            {introduction.adviceForJuniors && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">후배들에게 하고 싶은 말</h3>
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {introduction.adviceForJuniors}
                  </p>
                </div>
              </div>
            )}

            {/* 링크들 */}
            {(introduction.linkedIn || introduction.website) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">링크</h3>
                <div className="space-y-2">
                  {introduction.linkedIn && (
                    <a
                      href={introduction.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-500"
                    >
                      LinkedIn 프로필 →
                    </a>
                  )}
                  {introduction.website && (
                    <a
                      href={introduction.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-500 ml-4"
                    >
                      개인 웹사이트 →
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}