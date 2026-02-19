export default function AdminNewsletterLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-64 rounded bg-gray-200" />
        <div className="mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-6 w-1/3 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 rounded bg-gray-200" />
                  <div className="h-8 w-16 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
