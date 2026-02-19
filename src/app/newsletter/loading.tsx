export default function NewsletterLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow">
              <div className="h-6 w-1/3 rounded bg-gray-200" />
              <div className="mt-4 h-4 w-full rounded bg-gray-200" />
              <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
