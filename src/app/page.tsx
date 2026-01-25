import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import Link from "next/link"

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
        <div className="animate-fadeInUp text-center">
          <div className="mb-10 flex justify-center">
            <div className="animate-float flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-2xl">
              <span className="text-4xl font-bold text-white">🎓</span>
            </div>
          </div>

          <h1 className="text-shadow mb-8 text-5xl leading-tight font-black md:text-7xl">
            <span className="text-gradient">인천과학고</span>
            <br />
            <span className="text-slate-800">동문 커뮤니티</span>
          </h1>

          <p className="mb-16 text-xl leading-relaxed text-slate-600 md:text-2xl">
            우리 동문들과 함께 성장하고 꿈을 이뤄나가는 특별한 공간 ✨
          </p>

          {!user && (
            <div className="animate-fadeInUp flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="btn btn-primary px-8 py-4 text-lg"
              >
                🚀 지금 시작하기
              </Link>
              <Link
                href="/login"
                className="btn btn-secondary px-8 py-4 text-lg"
              >
                로그인
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        {user ? (
          // Logged in user content
          <div className="space-y-8">
            {/* Welcome Card */}
            <div className="card animate-fadeInUp text-center">
              <div className="flex flex-col items-center space-y-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500">
                  <span className="text-3xl text-white">👋</span>
                </div>
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-slate-800">
                    환영합니다, {user.name}님!
                  </h2>
                  <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-slate-600">
                    {user.status === "approved"
                      ? "동문 커뮤니티에서 새로운 인연을 만들어보세요! 🎉"
                      : user.status === "pending"
                        ? "회원가입 승인을 기다리고 있어요. 곧 소식을 전해드릴게요! ⏳"
                        : "계정에 문제가 있어요. 관리자에게 문의해주세요 🤔"}
                  </p>
                  <Link href="/introductions" className="btn btn-primary">
                    동문들 만나기 →
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats and Actions Grid */}
            <div className="grid gap-8 md:grid-cols-2">
              {/* Stats Card */}
              <div className="card card-gradient animate-fadeInLeft text-center">
                <h3 className="mb-6 text-2xl font-bold text-white">
                  커뮤니티 현황
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">총 회원수</span>
                    <span className="text-2xl font-bold text-white">1명</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">승인 대기</span>
                    <span className="text-2xl font-bold text-white">0명</span>
                  </div>
                  <div className="mt-4 h-3 w-full rounded-full bg-white/20">
                    <div className="h-3 w-full rounded-full bg-white"></div>
                  </div>
                  <p className="mt-2 text-sm text-white/80">
                    모든 회원이 활성화되었습니다!
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card animate-fadeInRight text-center">
                <h3 className="mb-6 text-2xl font-bold text-slate-800">
                  빠른 액션
                </h3>
                <div className="space-y-4">
                  <button className="btn btn-secondary w-full justify-center">
                    <span className="mr-3">👤</span>
                    프로필 수정
                  </button>
                  <button className="btn btn-secondary w-full justify-center">
                    <span className="mr-3">💌</span>
                    메시지 보내기
                  </button>
                  <button className="btn btn-secondary w-full justify-center">
                    <span className="mr-3">📚</span>
                    게시글 작성
                  </button>
                </div>
              </div>
            </div>

            {/* Activity Feed */}
            <div
              className="card animate-fadeInUp text-center"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="mb-8 flex items-center justify-center space-x-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-blue-400 to-cyan-500">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">최근 활동</h3>
              </div>
              <div className="flex flex-col items-center justify-center py-16">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-3xl text-slate-400">📝</span>
                </div>
                <p className="mb-2 text-lg text-slate-500">
                  아직 활동이 없습니다.
                </p>
                <p className="text-sm text-slate-400">
                  동문들과 소통을 시작해보세요!
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Guest content
          <div className="grid gap-10 md:grid-cols-3">
            {/* Feature Cards */}
            <div className="card animate-fadeInUp text-center">
              <div className="mx-auto mb-8 flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-r from-red-400 to-pink-500">
                <span className="text-3xl text-white">🤝</span>
              </div>
              <h3 className="mb-6 text-2xl font-bold text-slate-800">
                네트워킹
              </h3>
              <p className="text-lg leading-relaxed text-slate-600">
                다양한 분야에서 활동하는 동문들과 연결되어 새로운 기회를
                발견하세요
              </p>
            </div>

            <div
              className="card animate-fadeInUp text-center"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="mx-auto mb-8 flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500">
                <span className="text-3xl text-white">💬</span>
              </div>
              <h3 className="mb-6 text-2xl font-bold text-slate-800">소통</h3>
              <p className="text-lg leading-relaxed text-slate-600">
                기수를 넘나드는 자유로운 소통으로 인과고의 정신을 이어가세요
              </p>
            </div>

            <div
              className="card animate-fadeInUp text-center"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="mx-auto mb-8 flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500">
                <span className="text-3xl text-white">🌟</span>
              </div>
              <h3 className="mb-6 text-2xl font-bold text-slate-800">성장</h3>
              <p className="text-lg leading-relaxed text-slate-600">
                선후배 간의 멘토링과 경험 공유로 함께 성장하는 커뮤니티
              </p>
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="bg-gradient-to-r from-violet-600 to-purple-600 py-20">
          <div className="animate-fadeInUp">
            <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl">
              지금 바로 시작하세요!
            </h2>
            <p className="mb-8 text-xl text-white/90">
              인천과학고등학교 동문이라면 누구나 참여할 수 있습니다
            </p>
            <Link
              href="/register"
              className="btn bg-white px-8 py-4 text-lg font-bold text-violet-600 hover:bg-white/90"
            >
              무료로 가입하기 🎉
            </Link>
          </div>
        </section>
      )}

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
