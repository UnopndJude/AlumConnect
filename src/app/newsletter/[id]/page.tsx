import { container } from "@/infrastructure/di/container"
import Link from "next/link"
import { redirect } from "next/navigation"

interface NewsletterDetailPageProps {
  params: Promise<{ id: string }>
}

const SECTION_TYPE_LABELS = {
  alumni_in_media: "언론에 소개된 동문",
  member_announcements: "동문 소식",
  industry_trends: "업계 동향",
}

const SECTION_TYPE_ICONS = {
  alumni_in_media: "📰",
  member_announcements: "📢",
  industry_trends: "📊",
}

export default async function NewsletterDetailPage({
  params,
}: NewsletterDetailPageProps) {
  const { id } = await params
  const newsletterRepository = container.getNewsletterRepository()

  const newsletterEntity = await newsletterRepository.findById(id)

  if (!newsletterEntity || !newsletterEntity.isPublished) {
    redirect("/newsletter")
  }

  const newsletter = newsletterEntity.toPrimitives()
  const sortedSections = [...newsletter.sections].sort(
    (a, b) => a.order - b.order
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="nav top-0 right-0 left-0 z-50">
        <div className="flex h-20 items-center justify-center">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                  <span className="text-lg font-bold text-white">A</span>
                </div>
                <h1 className="text-gradient text-2xl font-bold">
                  AlumConnect
                </h1>
              </Link>
            </div>
            <Link
              href="/newsletter"
              className="font-medium text-slate-600 transition-colors hover:text-violet-600"
            >
              ← 목록으로
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-8">
        <div className="container mx-auto max-w-4xl">
          <div className="card animate-fadeInUp">
            <div className="mb-4 flex items-center space-x-3">
              <span className="inline-flex items-center rounded-full bg-violet-100 px-4 py-2 text-lg font-semibold text-violet-700">
                #{newsletter.edition}호
              </span>
              {newsletter.publishedAt && (
                <span className="text-slate-500">
                  {new Date(newsletter.publishedAt).toLocaleDateString(
                    "ko-KR",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              )}
            </div>
            <h1 className="mb-4 text-4xl font-black text-slate-800">
              {newsletter.title}
            </h1>
            <p className="text-slate-600">
              {newsletter.sections.length}개 섹션으로 구성되어 있습니다
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter Sections */}
      <section className="pb-20">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-8">
            {sortedSections.map((section, index) => (
              <div
                key={section.id}
                className="card animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6 flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
                    <span className="text-2xl">
                      {SECTION_TYPE_ICONS[
                        section.type as keyof typeof SECTION_TYPE_ICONS
                      ] || "📝"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="inline-block rounded-md bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                        {SECTION_TYPE_LABELS[
                          section.type as keyof typeof SECTION_TYPE_LABELS
                        ] || section.type}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {section.title}
                    </h2>
                  </div>
                </div>
                <div className="rounded-lg bg-slate-50 p-6">
                  <div className="prose prose-slate max-w-none">
                    <p className="leading-relaxed whitespace-pre-wrap text-slate-700">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to List */}
      <section className="pb-20">
        <div className="container mx-auto max-w-4xl text-center">
          <Link
            href="/newsletter"
            className="btn btn-primary px-8 py-4 text-lg"
          >
            ← 뉴스레터 목록으로
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 py-12">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
              <span className="font-bold text-white">A</span>
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-800">AlumConnect</h3>
          <p className="mb-6 text-slate-600">인천과학고등학교 동문 커뮤니티</p>
          <div className="flex justify-center space-x-8 text-sm text-slate-500">
            <span>© 2024 AlumConnect</span>
            <span>•</span>
            <span>Made with ❤️ for ISHS Alumni</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
