import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import UserApprovalList from '@/components/admin/UserApprovalList'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value

  if (!userId) {
    redirect('/login')
  }

  const user = getUserById(userId)
  if (!user || !user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">👑</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">관리자 패널</h1>
                  <p className="text-sm text-slate-500">Admin Dashboard</p>
                </div>
              </div>
              
              {/* Navigation Items */}
              <div className="flex items-center space-x-6">
                <div className="hidden md:flex items-center space-x-3 px-5 py-2.5 bg-white/80 rounded-full backdrop-blur-sm border border-white/50 shadow-sm">
                  <div className="w-9 h-9 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">{user.name.charAt(0)}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700 pr-1">
                    {user.name}님
                  </span>
                </div>
                
                <Link href="/" className="text-slate-600 hover:text-violet-600 font-medium transition-colors">
                  홈으로
                </Link>
                
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="text-slate-500 hover:text-slate-700 transition-colors">
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
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-16 animate-fadeInUp">
            <h1 className="text-5xl font-bold text-slate-800 mb-6">관리자 대시보드</h1>
            <p className="text-2xl text-slate-600">AlumConnect 커뮤니티를 관리하세요</p>
          </div>

          {/* Stats Cards */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="grid md:grid-cols-3 gap-10">
              <div className="card animate-fadeInLeft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-600 mb-3">총 사용자</p>
                    <p className="text-4xl font-bold text-slate-800 mb-2">1</p>
                    <p className="text-sm text-green-600 font-medium">활성 사용자</p>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-3xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-600 mb-3">승인 대기</p>
                    <p className="text-4xl font-bold text-slate-800 mb-2">0</p>
                    <p className="text-sm text-amber-600 font-medium">검토 필요</p>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-3xl">⏳</span>
                  </div>
                </div>
              </div>

              <div className="card animate-fadeInRight" style={{animationDelay: '0.4s'}}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-600 mb-3">승인 완료</p>
                    <p className="text-4xl font-bold text-slate-800 mb-2">1</p>
                    <p className="text-sm text-green-600 font-medium">관리자 포함</p>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-3xl">✅</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="animate-fadeInUp" style={{animationDelay: '0.6s'}}>
            <UserApprovalList />
          </div>
        </div>
      </main>
    </div>
  )
}