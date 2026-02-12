interface SubscriberStatsProps {
  initialCount: number
}

export default function SubscriberStats({
  initialCount,
}: SubscriberStatsProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="mb-3 text-base font-semibold text-slate-600">
            활성 구독자
          </p>
          <p className="mb-2 text-4xl font-bold text-slate-800">
            {initialCount.toLocaleString()}명
          </p>
          <p className="text-sm font-medium text-green-600">
            뉴스레터 구독 중
          </p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-400 to-cyan-500">
          <span className="text-3xl text-white">📧</span>
        </div>
      </div>
    </div>
  )
}
