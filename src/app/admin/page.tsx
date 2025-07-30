import { cookies } from 'next/headers'
import { getUserById } from '@/lib/database'
import { redirect } from 'next/navigation'
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">관리자 패널</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">안녕하세요, {user.name}님</span>
              <form action="/api/auth/logout" method="POST">
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  로그아웃
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <UserApprovalList />
      </main>
    </div>
  )
}