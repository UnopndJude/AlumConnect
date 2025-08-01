'use client'

import LoginForm from '@/components/auth/LoginForm'
import { LoginCredentials } from '@/types/user'
import Link from 'next/link'

async function handleLogin(data: LoginCredentials) {
  const response = await fetch('/api/auth/login', {
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-6">
      <div className="w-full max-w-lg">
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
            동문 커뮤니티에 로그인하세요
          </p>
        </div>

        {/* Login Form */}
        <div className="card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
          <LoginForm onSubmit={handleLogin} />
        </div>

        {/* Footer */}
        <div className="text-center mt-10 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
          <p className="text-slate-600 text-lg">
            계정이 없으신가요?{' '}
            <Link 
              href="/register" 
              className="font-semibold text-violet-600 hover:text-violet-700 transition-colors"
            >
              회원가입하기
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="mt-10 p-6 bg-blue-50 rounded-xl border border-blue-200 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
          <h3 className="font-bold text-blue-800 mb-4 text-lg">💡 테스트 계정</h3>
          <div className="text-blue-700 space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-semibold mb-1">관리자 계정</p>
              <p className="text-sm">admin@incheon-sci.hs.kr / admin123</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-100">
              <p className="font-semibold mb-1">일반 사용자</p>
              <p className="text-sm">회원가입 후 이용 가능</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}