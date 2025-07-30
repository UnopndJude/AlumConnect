import LoginForm from '@/components/auth/LoginForm'
import { LoginCredentials } from '@/types/user'
import Link from 'next/link'

async function handleLogin(data: LoginCredentials) {
  'use server'
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-8">
          AlumConnect
        </h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          인천과학고등학교 동문 커뮤니티
        </p>
      </div>

      <LoginForm onSubmit={handleLogin} />

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          계정이 없으신가요?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-500">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}