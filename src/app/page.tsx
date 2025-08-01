import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import Link from 'next/link'

export default async function Home() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const user = userId ? getUserById(userId) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 items-center justify-center">
      {/* Navigation */}
      <nav className="nav  top-0 left-0 right-0 z-50">
          <div className="flex justify-center items-center h-20">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <h1 className="text-2xl font-bold text-gradient">AlumConnect</h1>
              </div>
              
              {/* Navigation Items */}
              <div className="flex items-center space-x-6">
                {user ? (
                  <>
                    <div className="hidden md:flex items-center space-x-3 px-5 py-2.5 bg-white/80 rounded-full backdrop-blur-sm border border-white/50 shadow-sm">
                      <div className="w-9 h-9 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">{user.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-700 pr-1">
                        {user.name} ({user.graduationClass}기)
                      </span>
                    </div>
                    
                    <Link href="/introductions" className="text-slate-600 hover:text-violet-600 font-medium transition-colors">
                      동문 소개
                    </Link>
                    
                    {user.isAdmin && (
                      <Link href="/admin" className="btn btn-primary">
                        관리자
                      </Link>
                    )}
                    
                    <form action="/api/auth/logout" method="POST">
                      <button type="submit" className="text-slate-500 hover:text-slate-700 transition-colors">
                        로그아웃
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex items-center space-x-4">
                    <Link href="/login" className="text-slate-600 hover:text-violet-600 font-medium transition-colors">
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
          <div className="text-center animate-fadeInUp">
            <div className="flex justify-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center animate-float shadow-2xl">
                <span className="text-white text-4xl font-bold">🎓</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-8 text-shadow leading-tight">
              <span className="text-gradient">인천과학고</span>
              <br />
              <span className="text-slate-800">동문 커뮤니티</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-16 leading-relaxed">
              우리 동문들과 함께 성장하고 꿈을 이뤄나가는 특별한 공간 ✨
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp">
                <Link href="/register" className="btn btn-primary text-lg px-8 py-4">
                  🚀 지금 시작하기
                </Link>
                <Link href="/login" className="btn btn-secondary text-lg px-8 py-4">
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
                    <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-3xl">👋</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-4 text-slate-800">환영합니다, {user.name}님!</h2>
                      <p className="text-slate-600 mb-8 text-lg leading-relaxed max-w-2xl mx-auto">
                        {user.status === 'approved' 
                          ? '동문 커뮤니티에서 새로운 인연을 만들어보세요! 🎉' 
                          : user.status === 'pending' 
                            ? '회원가입 승인을 기다리고 있어요. 곧 소식을 전해드릴게요! ⏳' 
                            : '계정에 문제가 있어요. 관리자에게 문의해주세요 🤔'
                        }
                      </p>
                      <Link href="/introductions" className="btn btn-primary">
                        동문들 만나기 →
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Stats and Actions Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Stats Card */}
                  <div className="card card-gradient animate-fadeInLeft text-center">
                    <h3 className="text-2xl font-bold mb-6 text-white">커뮤니티 현황</h3>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">총 회원수</span>
                        <span className="text-2xl font-bold text-white">1명</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">승인 대기</span>
                        <span className="text-2xl font-bold text-white">0명</span>
                      </div>
                      <div className="w-full h-3 bg-white/20 rounded-full mt-4">
                        <div className="w-full h-3 bg-white rounded-full"></div>
                      </div>
                      <p className="text-white/80 text-sm mt-2">모든 회원이 활성화되었습니다!</p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="card animate-fadeInRight text-center">
                    <h3 className="text-2xl font-bold mb-6 text-slate-800">빠른 액션</h3>
                    <div className="space-y-4">
                      <button className="w-full btn btn-secondary justify-center">
                        <span className="mr-3">👤</span>
                        프로필 수정
                      </button>
                      <button className="w-full btn btn-secondary justify-center">
                        <span className="mr-3">💌</span>
                        메시지 보내기
                      </button>
                      <button className="w-full btn btn-secondary justify-center">
                        <span className="mr-3">📚</span>
                        게시글 작성
                      </button>
                    </div>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="card animate-fadeInUp text-center" style={{animationDelay: '0.2s'}}>
                  <div className="flex items-center justify-center space-x-4 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">📊</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">최근 활동</h3>
                  </div>
                  <div className="flex flex-col justify-center items-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                      <span className="text-slate-400 text-3xl">📝</span>
                    </div>
                    <p className="text-slate-500 text-lg mb-2">아직 활동이 없습니다.</p>
                    <p className="text-sm text-slate-400">동문들과 소통을 시작해보세요!</p>
                  </div>
                </div>
            </div>
          ) : (
            // Guest content
              <div className="grid md:grid-cols-3 gap-10">
                {/* Feature Cards */}
                <div className="card text-center animate-fadeInUp">
                  <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <span className="text-white text-3xl">🤝</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-800">네트워킹</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    다양한 분야에서 활동하는 동문들과 연결되어 새로운 기회를 발견하세요
                  </p>
                </div>

                <div className="card text-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <span className="text-white text-3xl">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-800">소통</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    기수를 넘나드는 자유로운 소통으로 인과고의 정신을 이어가세요
                  </p>
                </div>

                <div className="card text-center animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <span className="text-white text-3xl">🌟</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-6 text-slate-800">성장</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    선후배 간의 멘토링과 경험 공유로 함께 성장하는 커뮤니티
                  </p>
              </div>
            </div>
          )}
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-r from-violet-600 to-purple-600">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                지금 바로 시작하세요!
              </h2>
              <p className="text-xl text-white/90 mb-8">
                인천과학고등학교 동문이라면 누구나 참여할 수 있습니다
              </p>
              <Link href="/register" className="btn bg-white text-violet-600 hover:bg-white/90 text-lg px-8 py-4 font-bold">
                무료로 가입하기 🎉
              </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 bg-slate-50">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">AlumConnect</h3>
            <p className="text-slate-600 mb-6">인천과학고등학교 동문 커뮤니티</p>
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