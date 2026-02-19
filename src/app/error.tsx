"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          오류가 발생했습니다
        </h2>
        <p className="mb-6 text-gray-600">
          {error.message || "잠시 후 다시 시도해주세요."}
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
