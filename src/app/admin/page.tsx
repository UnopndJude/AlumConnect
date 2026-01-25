import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import { redirect } from "next/navigation"
import Link from "next/link"
import UserApprovalList from "@/components/admin/UserApprovalList"

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    redirect("/login")
  }

  const userEntity = await container
    .getUserRepository()
    .findById(UserId.create(userId))
  if (!userEntity || !userEntity.isAdmin) {
    redirect("/")
  }

  const user = userEntity.toPrimitives()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="nav fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                  <span className="text-xl font-bold text-white">👑</span>
                </div>
                <div>
                  <h1 className="text-gradient text-2xl font-bold">
                    관리자 패널
                  </h1>
                  <p className="text-sm text-slate-500">Admin Dashboard</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex items-center space-x-6">
                <div className="hidden items-center space-x-3 rounded-full border border-white/50 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
                    <span className="text-sm font-semibold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="pr-1 text-sm font-medium text-slate-700">
                    {user.name}님
                  </span>
                </div>

                <Link
                  href="/"
                  className="font-medium text-slate-600 transition-colors hover:text-violet-600"
                >
                  홈으로
                </Link>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="text-slate-500 transition-colors hover:text-slate-700"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* Header */}
          <div className="animate-fadeInUp mb-16 text-center">
            <h1 className="mb-6 text-5xl font-bold text-slate-800">
              관리자 대시보드
            </h1>
            <p className="text-2xl text-slate-600">
              AlumConnect 커뮤니티를 관리하세요
            </p>
          </div>

          {/* Stats Cards */}
          <div className="mx-auto mb-16 max-w-5xl">
            <div className="grid gap-10 md:grid-cols-3">
              <div className="card animate-fadeInLeft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-3 text-base font-semibold text-slate-600">
                      총 사용자
                    </p>
                    <p className="mb-2 text-4xl font-bold text-slate-800">1</p>
                    <p className="text-sm font-medium text-green-600">
                      활성 사용자
                    </p>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500">
                    <span className="text-3xl text-white">👥</span>
                  </div>
                </div>
              </div>

              <div
                className="card animate-fadeInUp"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-3 text-base font-semibold text-slate-600">
                      승인 대기
                    </p>
                    <p className="mb-2 text-4xl font-bold text-slate-800">0</p>
                    <p className="text-sm font-medium text-amber-600">
                      검토 필요
                    </p>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500">
                    <span className="text-3xl text-white">⏳</span>
                  </div>
                </div>
              </div>

              <div
                className="card animate-fadeInRight"
                style={{ animationDelay: "0.4s" }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-3 text-base font-semibold text-slate-600">
                      승인 완료
                    </p>
                    <p className="mb-2 text-4xl font-bold text-slate-800">1</p>
                    <p className="text-sm font-medium text-green-600">
                      관리자 포함
                    </p>
                  </div>
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-green-400 to-emerald-500">
                    <span className="text-3xl text-white">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="animate-fadeInUp" style={{ animationDelay: "0.6s" }}>
            <UserApprovalList />
          </div>
        </div>
      </main>
    </div>
  )
}
