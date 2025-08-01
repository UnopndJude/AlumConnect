'use client'

import { useState, useEffect } from 'react'
import { User } from '@/types/user'

interface PendingUser {
  id: string
  email: string
  name: string
  graduationClass: number
  status: string
  createdAt: string
}

export default function UserApprovalList() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      
      if (data.success) {
        setPendingUsers(data.users)
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '사용자 목록을 불러오는 데 실패했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'PATCH'
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: '사용자가 승인되었습니다.' })
        setPendingUsers(prev => prev.filter(user => user.id !== userId))
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '승인 처리 중 오류가 발생했습니다.' })
    }
  }

  const handleReject = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'PATCH'
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage({ type: 'success', text: '사용자가 거부되었습니다.' })
        setPendingUsers(prev => prev.filter(user => user.id !== userId))
      } else {
        setMessage({ type: 'error', text: data.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '거부 처리 중 오류가 발생했습니다.' })
    }
  }

  if (isLoading) {
    return (
      <div className="card text-center py-12">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-600">로딩 중...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">사용자 승인 관리</h2>
        <p className="text-slate-600 text-lg mb-6">가입 신청한 사용자들을 검토하고 승인하세요</p>
        <div className="inline-flex items-center space-x-4 px-6 py-3 bg-violet-50 rounded-full border border-violet-200">
          <span className="text-violet-600 text-xl">👥</span>
          <span className="text-base font-semibold text-violet-800">
            {pendingUsers.length}명 대기 중
          </span>
        </div>
      </div>

      {message && (
        <div className={`p-6 rounded-xl font-medium mb-10 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <span className="mr-4 text-xl">
              {message.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="text-lg">{message.text}</span>
          </div>
        </div>
      )}

      {pendingUsers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-slate-400 text-4xl">📭</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4">승인 대기 중인 사용자가 없습니다</h3>
          <p className="text-slate-600 text-xl">모든 사용자가 처리되었습니다! 🎉</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {pendingUsers.map((user, index) => (
            <div 
              key={user.id} 
              className="card border border-slate-200 hover:border-violet-300 hover:shadow-lg transition-all animate-fadeInUp" 
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">{user.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{user.name}</h3>
                    <p className="text-slate-600 font-medium text-lg mb-3">{user.email}</p>
                    <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        {user.graduationClass}기
                      </span>
                      <span className="text-sm text-slate-500 font-medium">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleApprove(user.id)}
                    className="btn btn-primary text-base px-6 py-3"
                  >
                    <span className="mr-3 text-lg">✓</span>
                    승인
                  </button>
                  <button
                    onClick={() => handleReject(user.id)}
                    className="btn bg-red-500 text-white hover:bg-red-600 text-base px-6 py-3"
                  >
                    <span className="mr-3 text-lg">✕</span>
                    거부
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}