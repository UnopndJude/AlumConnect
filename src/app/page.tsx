import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import Link from 'next/link'

export default async function Home() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  const user = userId ? getUserById(userId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-blue-600">AlumConnect</h1>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    안녕하세요, {user.name}님 ({user.graduationClass}기)
                  </span>
                  {user.isAdmin && (
                    <Link
                      href="/admin"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      관리자 패널
                    </Link>
                  )}
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      로그아웃
                    </button>
                  </form>
                </>
              ) : (
                <div className="space-x-4">
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    회원가입
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            인천과학고등학교 동문 커뮤니티
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            우리 동문들과 함께 소통하고 네트워킹하세요
          </p>

          {user ? (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">환영합니다!</h3>
              <p className="text-gray-600">
                {user.status === 'approved' 
                  ? '동문 커뮤니티에 오신 것을 환영합니다.' 
                  : user.status === 'pending' 
                    ? '회원가입 승인을 기다리고 있습니다.' 
                    : '회원가입에 문제가 있습니다. 관리자에게 문의해주세요.'
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold mb-4">시작하기</h3>
              <p className="text-gray-600 mb-6">
                인천과학고등학교 동문이시라면 지금 가입하여 동문들과 소통해보세요.
              </p>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              >
                회원가입하기
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
