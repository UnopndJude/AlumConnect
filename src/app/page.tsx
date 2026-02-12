import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import Link from "next/link"
import { NewsletterSubscribeForm } from "@/components/newsletter/NewsletterSubscribeForm"

export default async function Home() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  let user = null
  if (userId) {
    const userEntity = await container
      .getUserRepository()
      .findById(UserId.create(userId))
    user = userEntity ? userEntity.toPrimitives() : null
  }

  // Fetch recent newsletters for public view
  interface NewsletterDisplay {
    id: string
    edition: number
    title: string
    publishedAt: Date | null
    sections: Array<{
      id: string
      type: string
      title: string
      content: string
      order: number
    }>
  }
  let recentNewsletters: NewsletterDisplay[] = []
  if (!user) {
    const newsletterRepository = container.getNewsletterRepository()
    const newsletterEntities = await newsletterRepository.findAllPublished()
    recentNewsletters = newsletterEntities
      .slice(0, 3)
      .map((n) => n.toPrimitives())
  }

  return (
    <div className="min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="nav top-0 right-0 left-0 z-50">
        <div className="flex h-20 items-center justify-center">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                <span className="text-lg font-bold text-white">A</span>
              </div>
              <h1 className="text-gradient text-2xl font-bold">AlumConnect</h1>
            </div>

            {/* Navigation Items */}
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <div className="hidden items-center space-x-3 rounded-full border border-white/50 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm md:flex">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
                      <span className="text-sm font-semibold text-white">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <span className="pr-1 text-sm font-medium text-slate-700">
                      {user.name} ({user.graduationClass}기)
                    </span>
                  </div>

                  <Link
                    href="/introductions"
                    className="font-medium text-slate-600 transition-colors hover:text-violet-600"
                  >
                    동문 소개
                  </Link>

                  {user.isAdmin && (
                    <Link href="/admin" className="btn btn-primary">
                      관리자
                    </Link>
                  )}

                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-slate-500 transition-colors hover:text-slate-700"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className="font-medium text-slate-600 transition-colors hover:text-violet-600"
                  >
                    로그인
                  </Link>
                  <Link href="/register" className="btn btn-primary">
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16">
        {!user ? (
          // Public Hero - Newsletter focused
          <div className="animate-fadeInUp text-center max-w-4xl mx-auto px-4">
            <div className="mb-10 flex justify-center">
              <div className="animate-float flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl">
                <span className="text-4xl font-bold text-white">📰</span>
              </div>
            </div>

            <h1 className="text-shadow mb-6 text-5xl leading-tight font-black md:text-7xl">
              <span className="text-gradient">인천과학고</span>
              <br />
              <span className="text-slate-800">동문 뉴스레터</span>
            </h1>

            <p className="mb-12 text-xl leading-relaxed text-slate-600 md:text-2xl">
              동문들의 소식과 업계 트렌드를 매주 이메일로 받아보세요
            </p>

            {/* Newsletter Subscription Form */}
            <div className="mb-8">
              <NewsletterSubscribeForm />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>또는</span>
              <Link
                href="/newsletter"
                className="font-medium text-violet-600 hover:text-violet-700 underline"
              >
                뉴스레터 아카이브 보기
              </Link>
            </div>
          </div>
        ) : (
          // Authenticated Hero - Welcome message
          <div className="animate-fadeInUp text-center">
            <div className="mb-10 flex justify-center">
              <div className="animate-float flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500 shadow-2xl">
                <span className="text-4xl font-bold text-white">👋</span>
              </div>
            </div>

            <h1 className="text-shadow mb-6 text-5xl leading-tight font-black md:text-6xl">
              <span className="text-slate-800">환영합니다,</span>
              <br />
              <span className="text-gradient">{user.name}님!</span>
            </h1>

            <p className="mb-8 text-xl leading-relaxed text-slate-600 md:text-2xl">
              {user.status === "approved"
                ? "동문 커뮤니티에서 새로운 인연을 만들어보세요"
                : user.status === "pending"
                ? "회원가입 승인을 기다리고 있어요. 곧 소식을 전해드릴게요"
                : "계정에 문제가 있어요. 관리자에게 문의해주세요"}
            </p>
          </div>
        )}
      </section>

      {/* Main Content */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        {user ? (
          // Authenticated user content
          <div className="space-y-8">
            {/* Quick Links */}
            <div className="grid gap-6 md:grid-cols-3">
              <Link
                href="/introductions"
                className="card animate-fadeInUp text-center hover:scale-105 transition-transform"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
                  <span className="text-2xl text-white">👥</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">동문 소개</h3>
                <p className="mt-2 text-sm text-slate-600">
                  동문들을 만나보세요
                </p>
              </Link>

              <Link
                href="/connections"
                className="card animate-fadeInUp text-center hover:scale-105 transition-transform"
                style={{ animationDelay: "0.1s" }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500">
                  <span className="text-2xl text-white">🤝</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">연결</h3>
                <p className="mt-2 text-sm text-slate-600">
                  동문들과 연결하세요
                </p>
              </Link>

              <Link
                href="/announcements"
                className="card animate-fadeInUp text-center hover:scale-105 transition-transform"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-pink-400 to-rose-500">
                  <span className="text-2xl text-white">📢</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">공지사항</h3>
                <p className="mt-2 text-sm text-slate-600">
                  최신 소식을 확인하세요
                </p>
              </Link>
            </div>

            {/* Verification Status */}
            {user.status !== "approved" && (
              <div className="card card-gradient animate-fadeInUp text-center">
                <h3 className="mb-4 text-2xl font-bold text-white">
                  {user.status === "pending" ? "승인 대기 중" : "계정 상태 확인"}
                </h3>
                <p className="mb-6 text-white/90">
                  {user.status === "pending"
                    ? "관리자가 회원가입을 검토 중입니다. 승인이 완료되면 모든 기능을 사용하실 수 있습니다."
                    : "계정에 문제가 있습니다. 관리자에게 문의해주세요."}
                </p>
              </div>
            )}

            {/* Recent Activity */}
            <div className="card animate-fadeInUp">
              <div className="mb-6 flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-400 to-emerald-500">
                  <span className="text-xl text-white">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">최근 활동</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-2xl text-slate-400">📝</span>
                </div>
                <p className="mb-2 text-slate-600">아직 활동이 없습니다</p>
                <p className="text-sm text-slate-400">
                  동문들과 소통을 시작해보세요!
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Public content
          <div className="space-y-20">
            {/* Features Section */}
            <div>
              <h2 className="text-shadow mb-12 text-3xl font-bold text-center text-slate-800 md:text-4xl">
                AlumConnect 특징
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="card animate-fadeInUp text-center">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600">
                    <span className="text-2xl text-white">📰</span>
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-slate-800">
                    뉴스레터
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    동문 소식과 업계 트렌드를 매주 이메일로 받아보세요
                  </p>
                </div>

                <div
                  className="card animate-fadeInUp text-center"
                  style={{ animationDelay: "0.15s" }}
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500">
                    <span className="text-2xl text-white">🤝</span>
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-slate-800">
                    네트워킹
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    동문 간 연결 (verified members only)
                  </p>
                </div>

                <div
                  className="card animate-fadeInUp text-center"
                  style={{ animationDelay: "0.3s" }}
                >
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-pink-400 to-rose-500">
                    <span className="text-2xl text-white">📢</span>
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-slate-800">
                    소식 제보
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    동문 소식 공유 (verified members only)
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Newsletters */}
            {recentNewsletters.length > 0 && (
              <div>
                <h2 className="text-shadow mb-12 text-3xl font-bold text-center text-slate-800 md:text-4xl">
                  최근 뉴스레터
                </h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {recentNewsletters.map((newsletter, index) => (
                    <Link
                      key={newsletter.id}
                      href={`/newsletter/${newsletter.id}`}
                      className="card animate-fadeInUp block"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="mb-3 flex items-center space-x-2">
                        <span className="inline-flex items-center rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          #{newsletter.edition}호
                        </span>
                        {newsletter.publishedAt && (
                          <span className="text-xs text-slate-500">
                            {new Date(
                              newsletter.publishedAt
                            ).toLocaleDateString("ko-KR", {
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <h3 className="mb-2 text-lg font-bold text-slate-800">
                        {newsletter.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {newsletter.sections.length}개 섹션
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Link
                    href="/newsletter"
                    className="btn btn-secondary px-6 py-3"
                  >
                    모든 뉴스레터 보기
                  </Link>
                </div>
              </div>
            )}

            {/* Login/Register CTA */}
            <div className="card card-gradient animate-fadeInUp text-center">
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                더 많은 기능을 원하시나요?
              </h2>
              <p className="mb-8 text-lg text-white/90">
                회원가입하고 동문 네트워크에 참여하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="btn bg-white px-8 py-4 text-lg font-bold text-violet-600 hover:bg-white/90"
                >
                  회원가입
                </Link>
                <Link
                  href="/login"
                  className="btn bg-white/20 border-2 border-white px-8 py-4 text-lg font-bold text-white hover:bg-white/30"
                >
                  로그인
                </Link>
              </div>
            </div>
          </div>
        )}
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
