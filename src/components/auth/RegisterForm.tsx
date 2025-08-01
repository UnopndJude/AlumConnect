'use client'

import { useState } from 'react'
import { RegisterData } from '@/types/user'

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<{ success: boolean; message: string }>
}

export default function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    name: '',
    graduationClass: 1
  })
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' })
      return
    }

    if (formData.graduationClass < 1 || formData.graduationClass > 50) {
      setMessage({ type: 'error', text: '기수는 1기부터 50기까지 입력 가능합니다.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const result = await onSubmit(formData)
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      })
      
      if (result.success) {
        setFormData({
          email: '',
          password: '',
          name: '',
          graduationClass: 1
        })
        setConfirmPassword('')
      }
    } catch (error) {
      setMessage({ type: 'error', text: '회원가입 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">회원가입</h2>
        <p className="text-slate-600 text-lg">동문 커뮤니티에 가입하세요</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-base font-semibold text-slate-700 mb-3">
            이름
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="실명을 입력하세요"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-base font-semibold text-slate-700 mb-3">
            이메일
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="이메일을 입력하세요"
            className="input"
          />
        </div>

        <div>
          <label htmlFor="graduationClass" className="block text-base font-semibold text-slate-700 mb-3">
            졸업 기수
          </label>
          <input
            type="number"
            id="graduationClass"
            min="1"
            max="50"
            value={formData.graduationClass}
            onChange={(e) => setFormData({ ...formData, graduationClass: parseInt(e.target.value) || 1 })}
            required
            className="input"
            placeholder="몇 기인지 숫자로 입력하세요"
          />
          <p className="text-sm text-slate-500 mt-3 flex items-center">
            <span className="mr-2">ℹ️</span>
            인천과학고등학교 졸업 기수를 입력해주세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-base font-semibold text-slate-700 mb-3">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              placeholder="6자 이상"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-base font-semibold text-slate-700 mb-3">
              비밀번호 확인
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="비밀번호 재입력"
              className="input"
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl font-medium ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              <span className="mr-3 text-lg">
                {message.type === 'success' ? '✅' : '❌'}
              </span>
              {message.text}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full text-base py-4"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              처리 중...
            </div>
          ) : (
            '회원가입하기'
          )}
        </button>
      </form>

      <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start text-blue-800">
          <span className="mr-4 text-2xl">💡</span>
          <div>
            <p className="font-semibold text-lg mb-2">회원가입 승인 안내</p>
            <p className="leading-relaxed">
              회원가입 후 관리자의 승인을 기다려주세요. 승인 완료까지 1-2일 정도 소요될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}