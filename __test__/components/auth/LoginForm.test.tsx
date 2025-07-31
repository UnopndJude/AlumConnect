import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '@/components/auth/LoginForm'

// window.location.href mocking
Object.defineProperty(window, 'location', {
  value: {
    href: ''
  },
  writable: true
})

describe('LoginForm', () => {
  const mockOnSubmit = vi.fn()
  const user = userEvent.setup()

  beforeEach(() => {
    mockOnSubmit.mockClear()
    window.location.href = ''
  })

  it('should render all form fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('이메일')).toBeInTheDocument()
    expect(screen.getByLabelText('비밀번호')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument()
  })

  it('should submit form with valid data', async () => {
    mockOnSubmit.mockResolvedValue({ success: true, message: '로그인 성공' })
    
    render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })

  it('should show success message and redirect on successful login', async () => {
    mockOnSubmit.mockResolvedValue({ success: true, message: '로그인되었습니다.' })
    
    render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('로그인되었습니다.')).toBeInTheDocument()
    })

    // 리다이렉트 확인
    await waitFor(() => {
      expect(window.location.href).toBe('/')
    })
  })

  it('should show error message on failed login', async () => {
    mockOnSubmit.mockResolvedValue({ success: false, message: '비밀번호가 일치하지 않습니다.' })
    
    render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword')

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
    })

    // 리다이렉트가 일어나지 않음을 확인
    expect(window.location.href).toBe('')
  })

  it('should show error message when submission throws error', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Network error'))
    
    render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(screen.getByText('로그인 중 오류가 발생했습니다.')).toBeInTheDocument()
    })
  })

  it('should disable submit button while loading', async () => {
    mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)))
    
    render(<LoginForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText('이메일'), 'test@example.com')
    await user.type(screen.getByLabelText('비밀번호'), 'password123')

    const submitButton = screen.getByRole('button', { name: '로그인' })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '로그인 중...' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '로그인 중...' })).toBeDisabled()
    })
  })

  it('should clear form after successful login', async () => {
    mockOnSubmit.mockResolvedValue({ success: true, message: '로그인 성공' })
    
    render(<LoginForm onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText('이메일')
    const passwordInput = screen.getByLabelText('비밀번호')

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')

    await user.click(screen.getByRole('button', { name: '로그인' }))

    await waitFor(() => {
      expect(emailInput).toHaveValue('')
      expect(passwordInput).toHaveValue('')
    })
  })

  it('should enforce required fields', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('이메일')).toBeRequired()
    expect(screen.getByLabelText('비밀번호')).toBeRequired()
  })

  it('should set correct input types', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText('이메일')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password')
  })
})