import { container } from "@/infrastructure/di/container"
import Link from "next/link"

export default async function NewsletterListPage() {
  const newsletterRepository = container.getNewsletterRepository()
  const newsletterEntities = await newsletterRepository.findAllPublished()
  const newsletters = newsletterEntities.map((n) => n.toPrimitives())

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
              href="/"
              className="font-medium text-slate-600 transition-colors hover:text-violet-600"
            >
              홈으로
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-16">
        <div className="animate-fadeInUp text-center">
          <div className="mb-10 flex justify-center">
            <div className="animate-float flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl">
              <span className="text-4xl font-bold text-white">📰</span>
            </div>
          </div>

          <h1 className="text-shadow mb-8 text-5xl leading-tight font-black md:text-7xl">
            <span className="text-gradient">동문 뉴스레터</span>
          </h1>

          <p className="mb-16 text-xl leading-relaxed text-slate-600 md:text-2xl">
            동문들의 소식과 업계 동향을 전해드립니다
          </p>
        </div>
      </section>

      {/* Newsletter List */}
      <section className="py-12">
        <div className="container mx-auto max-w-4xl">
          {newsletters.length === 0 ? (
            <div className="card animate-fadeInUp text-center">
              <div className="flex flex-col items-center space-y-6 py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-3xl text-slate-400">📭</span>
                </div>
                <div>
                  <h2 className="mb-4 text-2xl font-bold text-slate-800">
                    아직 발행된 뉴스레터가 없습니다
                  </h2>
                  <p className="text-lg text-slate-600">
                    첫 번째 뉴스레터가 곧 발행될 예정입니다
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {newsletters.map((newsletter, index) => (
                <Link
                  key={newsletter.id}
                  href={`/newsletter/${newsletter.id}`}
                  className="card animate-fadeInUp block"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        <span className="inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                          #{newsletter.edition}호
                        </span>
                        {newsletter.publishedAt && (
                          <span className="text-sm text-slate-500">
                            {new Date(
                              newsletter.publishedAt
                            ).toLocaleDateString("ko-KR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h2 className="mb-3 text-2xl font-bold text-slate-800">
                        {newsletter.title}
                      </h2>
                      <p className="text-slate-600">
                        {newsletter.sections.length}개 섹션
                      </p>
                    </div>
                    <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
                      <span className="text-xl text-white">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 bg-slate-50 py-12">
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
