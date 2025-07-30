import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { getIntroductionById } from '@/lib/introductions'
import { redirect } from 'next/navigation'
import IntroductionForm from '@/components/introduction/IntroductionForm'
import { IntroductionFormData } from '@/types/introduction'
import Link from 'next/link'

interface EditIntroductionPageProps {
  params: { id: string }
}

async function handleSubmit(id: string, data: IntroductionFormData) {
  'use server'
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/introductions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export default async function EditIntroductionPage({ params }: EditIntroductionPageProps) {
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

  // 본인의 자기소개인지 확인
  if (introduction.userId !== userId) {
    redirect('/introductions')
  }

  const initialData: IntroductionFormData = {
    currentStatus: introduction.currentStatus,
    field: introduction.field,
    organization: introduction.organization,
    selfIntroduction: introduction.selfIntroduction,
    location: introduction.location,
    interests: introduction.interests,
    recentProjects: introduction.recentProjects,
    careerPath: introduction.careerPath,
    adviceForJuniors: introduction.adviceForJuniors,
    lookingFor: introduction.lookingFor,
    contactPreference: introduction.contactPreference,
    linkedIn: introduction.linkedIn,
    website: introduction.website
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
              <h1 className="text-xl font-semibold text-gray-900 mt-1">자기소개 수정</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/introductions/${introduction.id}`}
                className="text-blue-600 hover:text-blue-500"
              >
                취소
              </Link>
              <Link
                href="/introductions"
                className="text-gray-600 hover:text-gray-500"
              >
                목록으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            자기소개 수정하기
          </h2>
          <p className="text-gray-600">
            자기소개 내용을 수정할 수 있습니다. 
            변경하고 싶은 부분만 수정하시면 됩니다.
          </p>
        </div>

        <IntroductionForm 
          initialData={initialData}
          onSubmit={(data) => handleSubmit(params.id, data)}
          isEdit={true}
        />
      </main>
    </div>
  )
}