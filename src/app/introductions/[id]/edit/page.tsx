import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import { redirect } from "next/navigation"
import IntroductionForm from "@/components/introduction/IntroductionForm"
import { IntroductionFormData } from "@/types/introduction"
import Link from "next/link"

interface EditIntroductionPageProps {
  params: Promise<{ id: string }>
}

async function handleSubmit(id: string, data: IntroductionFormData) {
  "use server"

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/introductions/${id}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  )

  return await response.json()
}

export default async function EditIntroductionPage({
  params,
}: EditIntroductionPageProps) {
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

  if (introduction.userId !== userId) {
    redirect("/introductions")
  }

  const initialData: IntroductionFormData = {
    name: introduction.name,
    graduationClass: introduction.graduationClass,
    status: introduction.status,
    field: introduction.field,
    organization: introduction.organization,
    location: introduction.location,
    selfIntroduction: introduction.selfIntroduction,
    lookingFor: introduction.lookingFor,
    interests: introduction.interests,
    expertise: introduction.expertise,
    projects: introduction.projects,
    contactPreference: introduction.contactPreference,
    contactInfo: introduction.contactInfo,
  }

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
                자기소개 수정
              </h1>
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

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            자기소개 수정하기
          </h2>
          <p className="text-gray-600">
            자기소개 내용을 수정할 수 있습니다. 변경하고 싶은 부분만 수정하시면
            됩니다.
          </p>
        </div>

        <IntroductionForm
          initialData={initialData}
          onSubmit={(data) => handleSubmit(id, data)}
          isEdit={true}
        />
      </main>
    </div>
  )
}
