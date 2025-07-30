'use client'

import { useState } from 'react'
import { 
  IntroductionFormData, 
  STATUS_OPTIONS, 
  CONTACT_PREFERENCE_OPTIONS,
  LOOKING_FOR_OPTIONS 
} from '@/types/introduction'

interface IntroductionFormProps {
  initialData?: IntroductionFormData
  onSubmit: (data: IntroductionFormData) => Promise<{ success: boolean; message: string }>
  isEdit?: boolean
}

export default function IntroductionForm({ initialData, onSubmit, isEdit = false }: IntroductionFormProps) {
  const [formData, setFormData] = useState<IntroductionFormData>(initialData || {
    currentStatus: '',
    field: '',
    organization: '',
    selfIntroduction: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await onSubmit(formData)
      setMessage({ 
        type: result.success ? 'success' : 'error', 
        text: result.message 
      })
      
      if (result.success && !isEdit) {
        setFormData({
          currentStatus: '',
          field: '',
          organization: '',
          selfIntroduction: ''
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">필수 정보</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              현재 상태 *
            </label>
            <select
              id="currentStatus"
              value={formData.currentStatus}
              onChange={(e) => setFormData({ ...formData, currentStatus: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
              전공/업무 분야 *
            </label>
            <input
              type="text"
              id="field"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              required
              placeholder="예: 컴퓨터공학, 생명과학, 기계공학, 금융, 컨설팅 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
              소속 (학교/회사/기관) *
            </label>
            <input
              type="text"
              id="organization"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              required
              placeholder="예: 서울대학교, 삼성전자, 한국과학기술원 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="selfIntroduction" className="block text-sm font-medium text-gray-700 mb-1">
              간단한 자기소개 *
            </label>
            <textarea
              id="selfIntroduction"
              value={formData.selfIntroduction}
              onChange={(e) => setFormData({ ...formData, selfIntroduction: e.target.value })}
              required
              rows={4}
              placeholder="동문들에게 간단히 자신을 소개해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">선택 정보</h3>
        <p className="text-sm text-gray-600 mb-4">아래 정보는 선택적으로 입력할 수 있습니다.</p>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              거주 지역
            </label>
            <input
              type="text"
              id="location"
              value={formData.location || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="예: 서울, 경기, 미국 뉴욕 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
              관심사/취미
            </label>
            <input
              type="text"
              id="interests"
              value={formData.interests || ''}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="예: 독서, 운동, 프로그래밍, 여행 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="recentProjects" className="block text-sm font-medium text-gray-700 mb-1">
              최근 프로젝트/연구
            </label>
            <textarea
              id="recentProjects"
              value={formData.recentProjects || ''}
              onChange={(e) => setFormData({ ...formData, recentProjects: e.target.value })}
              rows={3}
              placeholder="최근에 진행한 프로젝트나 연구를 소개해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="careerPath" className="block text-sm font-medium text-gray-700 mb-1">
              진로 여정
            </label>
            <textarea
              id="careerPath"
              value={formData.careerPath || ''}
              onChange={(e) => setFormData({ ...formData, careerPath: e.target.value })}
              rows={3}
              placeholder="졸업 후 어떤 길을 걸어왔는지 간단히 소개해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="adviceForJuniors" className="block text-sm font-medium text-gray-700 mb-1">
              후배들에게 하고 싶은 말
            </label>
            <textarea
              id="adviceForJuniors"
              value={formData.adviceForJuniors || ''}
              onChange={(e) => setFormData({ ...formData, adviceForJuniors: e.target.value })}
              rows={3}
              placeholder="후배들에게 도움이 될 만한 조언이나 경험을 공유해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="lookingFor" className="block text-sm font-medium text-gray-700 mb-1">
              찾고 있는 것
            </label>
            <select
              id="lookingFor"
              value={formData.lookingFor || ''}
              onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              {LOOKING_FOR_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="contactPreference" className="block text-sm font-medium text-gray-700 mb-1">
              연락 선호 방법
            </label>
            <select
              id="contactPreference"
              value={formData.contactPreference || ''}
              onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              {CONTACT_PREFERENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="linkedIn" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn 프로필
            </label>
            <input
              type="url"
              id="linkedIn"
              value={formData.linkedIn || ''}
              onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              개인 웹사이트/블로그
            </label>
            <input
              type="url"
              id="website"
              value={formData.website || ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '저장 중...' : isEdit ? '수정하기' : '등록하기'}
        </button>
      </div>
    </form>
  )
}