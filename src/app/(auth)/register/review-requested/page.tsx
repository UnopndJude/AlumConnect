import Link from "next/link"

export default function ReviewRequestedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-6 py-12">
      <div className="w-full max-w-xl">
        <div className="card text-center">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-10 w-10 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="mb-4 text-3xl font-bold text-slate-800">
              관리자 검토가 필요합니다
            </h1>
            <p className="text-lg leading-relaxed text-slate-600">
              회원가입 신청이 접수되었습니다.
              <br />
              관리자 검토 후 승인이 완료되면 로그인하실 수 있습니다.
            </p>
          </div>

          <div className="mb-8 rounded-xl bg-slate-50 p-6">
            <h2 className="mb-3 font-semibold text-slate-800">
              왜 검토가 필요한가요?
            </h2>
            <ul className="space-y-2 text-left text-sm text-slate-600">
              <li className="flex items-start">
                <span className="mr-2 text-slate-400">*</span>
                동문 DB에서 정보를 찾을 수 없거나
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-slate-400">*</span>
                동문 인증 퀴즈를 통과하지 못한 경우
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-slate-400">*</span>
                관리자가 추가 확인이 필요하다고 판단한 경우
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              검토에는 보통 1-2일이 소요됩니다.
              <br />
              승인 완료 시 별도 안내가 없으며 바로 로그인 가능합니다.
            </p>

            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link href="/" className="btn btn-secondary px-6 py-3">
                홈으로 돌아가기
              </Link>
              <Link href="/login" className="btn btn-primary px-6 py-3">
                로그인 시도하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
