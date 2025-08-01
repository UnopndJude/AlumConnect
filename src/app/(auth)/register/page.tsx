import RegisterForm from '@/components/auth/RegisterForm'
import { RegisterData } from '@/types/user'
import Link from 'next/link'

async function handleRegister(data: RegisterData) {
  'use server'
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  return await response.json()
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-2xl">
        {/* Back to Home */}
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center text-slate-600 hover:text-violet-600 transition-colors font-medium">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            홈으로 돌아가기
          </Link>
        </div>

        {/* Logo and Header */}
        <div className="text-center mb-12 animate-fadeInUp">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-float">
              <span className="text-white text-2xl font-bold">A</span>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">
            AlumConnect
          </h1>
          <p className="text-slate-600 text-xl font-medium">
            인천과학고등학교 동문 커뮤니티에 가입하세요
          </p>
        </div>

        {/* Register Form */}
        <div className="card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <RegisterForm onSubmit={handleRegister} />
        </div>

        {/* Footer */}
        <div className="text-center mt-10 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <p className="text-slate-600 text-lg">
            이미 계정이 있으신가요?{' '}
            <Link 
              href="/login" 
              className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}