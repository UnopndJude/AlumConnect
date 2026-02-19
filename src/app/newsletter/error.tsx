"use client"

export default function NewsletterError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        뉴스레터를 불러올 수 없습니다
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
  )
}
