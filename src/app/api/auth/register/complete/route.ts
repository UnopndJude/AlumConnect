import { NextRequest, NextResponse } from "next/server"
import { container } from "@/infrastructure/di/container"
import { RegisterUserUseCase } from "@/application/user/use-cases/RegisterUser"
import { IAlumniRepository } from "@/domain/alumni/repositories/IAlumniRepository"

interface CompleteRegistrationRequest {
  sessionId: string
  email: string
  password: string
  name: string
  graduationClass: number
}

export async function POST(request: NextRequest) {
  try {
    const body: CompleteRegistrationRequest = await request.json()
    const { sessionId, email, password, name, graduationClass } = body

    if (!sessionId || !email || !password || !name || !graduationClass) {
      return NextResponse.json(
        { success: false, message: "모든 필드를 입력해주세요." },
        { status: 400 }
      )
    }

    const sessionRepo = container.getQuizSessionRepository()
    const session = await sessionRepo.findByIdString(sessionId)

    if (!session) {
      return NextResponse.json(
        { success: false, message: "유효하지 않은 세션입니다." },
        { status: 400 }
      )
    }

    if (session.email !== email) {
      return NextResponse.json(
        { success: false, message: "세션 이메일이 일치하지 않습니다." },
        { status: 400 }
      )
    }

    const quizPassed = session.attemptCount > 0
    const shouldAutoApprove = session.canAutoApprove(quizPassed)

    const useCase = new RegisterUserUseCase(
      container.getUserRepository(),
      container.getPasswordHasher()
    )

    const result = await useCase.execute(
      { email, password, name, graduationClass },
      { autoApprove: shouldAutoApprove }
    )

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.message },
        { status: 400 }
      )
    }

    // Mark alumni as registered if matched
    if (session.alumniMatched && session.alumniId) {
      const alumniRepo: IAlumniRepository = container.getAlumniRepository()
      const alumni = await alumniRepo.findById(session.alumniId)
      if (alumni) {
        alumni.markAsRegistered()
        await alumniRepo.save(alumni)
      }
    }

    // Delete quiz session
    await sessionRepo.delete(session.sessionId)

    const message = shouldAutoApprove
      ? "회원가입이 완료되었습니다. 바로 로그인하실 수 있습니다."
      : "회원가입이 완료되었습니다. 관리자의 승인을 기다려주세요."

    return NextResponse.json({
      success: true,
      autoApproved: shouldAutoApprove,
      message,
      user: result.value.user,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
