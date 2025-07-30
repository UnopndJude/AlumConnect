import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { getIntroductionByUserId } from '@/lib/introductions'
import { redirect } from 'next/navigation'
import IntroductionForm from '@/components/introduction/IntroductionForm'
import { IntroductionFormData } from '@/types/introduction'
import Link from 'next/link'

async function handleSubmit(data: IntroductionFormData) {
  'use server'
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/introductions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export default async function NewIntroductionPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = getUserById(userId)
  if (!user || user.status !== 'approved') {
    redirect('/')
  }

  // 이미 자기소개가 있는지 확인
  const existingIntroduction = getIntroductionByUserId(userId)
  if (existingIntroduction) {
    redirect(`/introductions/${existingIntroduction.id}/edit`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                AlumConnect
              </Link>
              <h1 className="text-xl font-semibold text-gray-900 mt-1">자기소개 작성</h1>
            </div>
            <Link
              href="/introductions"
              className="text-blue-600 hover:text-blue-500"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            안녕하세요, {user.name}님! ({user.graduationClass}기)
          </h2>
          <p className="text-gray-600">
            동문들에게 자신을 소개해보세요. 필수 정보만 입력하시거나, 
            더 많은 정보를 공유하여 동문들과 더 깊은 네트워킹을 할 수 있습니다.
          </p>
        </div>

        <IntroductionForm onSubmit={handleSubmit} />
      </main>
    </div>
  )
}