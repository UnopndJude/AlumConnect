import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from '@/components/auth/RegisterForm'
import { RegisterData } from '@/types/user'

describe('RegisterForm', () => {
  const mockOnSubmit = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    mockOnSubmit.mockClear()
  })

  it('should render all form fields', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('이름')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('졸업 기수')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호 확인')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '회원가입' })).toBeInTheDocument()
  })

  it('should display graduation class helper text', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('인천과학고등학교 졸업 기수를 입력해주세요')).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    mockOnSubmit.mockResolvedValue({ success: true, message: '회원가입 성공' })
    
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('졸업 기수'), '10')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: '홍길동',
        email: 'test@example.com',
        graduationClass: 10,
        password: 'password123'
      })
    })
  })

  it('should show error when passwords do not match', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('졸업 기수'), '10')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'different123')

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show error when graduation class is out of range', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('졸업 기수'), '100')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('기수는 1기부터 50기까지 입력 가능합니다.')).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should show success message on successful submission', async () => {
    mockOnSubmit.mockResolvedValue({ success: true, message: '회원가입이 완료되었습니다.' })
    
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('졸업 기수'), '10')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('회원가입이 완료되었습니다.')).toBeInTheDocument()
    })
  })

  it('should show error message on failed submission', async () => {
    mockOnSubmit.mockResolvedValue({ success: false, message: '이미 등록된 이메일입니다.' })
    
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'existing@example.com')
    await user.type(screen.getByLabelText('졸업 기수'), '10')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(screen.getByText('이미 등록된 이메일입니다.')).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이름'), '홍길동')
    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('졸업 기수'), '10')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')
    await user.type(screen.getByLabelText('비밀번호 확인'), 'password123')

    const submitButton = screen.getByRole('button', { name: '회원가입' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '처리 중...' })).toBeDisabled()
    })
  })

  it('should clear form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue({ success: true, message: '회원가입 성공' })
    
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText('이름')
    const emailInput = screen.getByLabelText('이메일')
    const classInput = screen.getByLabelText('졸업 기수')
    const passwordInput = screen.getByLabelText('비밀번호')
    const confirmPasswordInput = screen.getByLabelText('비밀번호 확인')

    await user.type(nameInput, '홍길동')
    await user.type(emailInput, 'test@example.com')
    await user.type(classInput, '10')
    await user.type(passwordInput, 'password123')
    await user.type(confirmPasswordInput, 'password123')

    await user.click(screen.getByRole('button', { name: '회원가입' }))

    await waitFor(() => {
      expect(nameInput).toHaveValue('')
      expect(emailInput).toHaveValue('')
      expect(classInput).toHaveValue(1) // 기본값
      expect(passwordInput).toHaveValue('')
      expect(confirmPasswordInput).toHaveValue('')
    })
  })

  it('should enforce required fields', async () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    // 필수 필드들이 required 속성을 가지는지 확인
    expect(screen.getByLabelText('이름')).toBeRequired()
    expect(screen.getByLabelText('이메일')).toBeRequired()
    expect(screen.getByLabelText('졸업 기수')).toBeRequired()
    expect(screen.getByLabelText('비밀번호')).toBeRequired()
    expect(screen.getByLabelText('비밀번호 확인')).toBeRequired()
  })

  it('should set correct input types', () => {
    render(<RegisterForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('이메일')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('졸업 기수')).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password')
    expect(screen.getByLabelText('비밀번호 확인')).toHaveAttribute('type', 'password')
  })
})