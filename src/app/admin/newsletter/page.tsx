import { cookies } from "next/headers"
import { container } from "@/infrastructure/di/container"
import { UserId } from "@/domain/user/value-objects"
import { redirect } from "next/navigation"
import Link from "next/link"
import NewsletterList from "@/components/admin/NewsletterList"
import AnnouncementReview from "@/components/admin/AnnouncementReview"
import SubscriberStats from "@/components/admin/SubscriberStats"

export default async function AdminNewsletterPage() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) {
    redirect("/login")
  }

  const userEntity = await container
    .getUserRepository()
    .findById(UserId.create(userId))
  if (!userEntity || !userEntity.isAdmin) {
    redirect("/")
  }

  const user = userEntity.toPrimitives()

  // Fetch initial data
  const newsletterRepository = container.getNewsletterRepository()
  const announcementRepository = container.getAnnouncementRepository()
  const subscriptionRepository = container.getSubscriptionRepository()

  const newsletters = await newsletterRepository.findAll()
  const pendingAnnouncements = await announcementRepository.findPending()
  const subscriberCount = await subscriptionRepository.countActive()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="nav fixed top-0 right-0 left-0 z-50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg">
                  <span className="text-xl font-bold text-white">📰</span>
                </div>
                <div>
                  <h1 className="text-gradient text-2xl font-bold">
                    뉴스레터 관리
                  </h1>
                  <p className="text-sm text-slate-500">Newsletter Admin</p>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex items-center space-x-6">
                <div className="hidden items-center space-x-3 rounded-full border border-white/50 bg-white/80 px-5 py-2.5 shadow-sm backdrop-blur-sm md:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-600">
                    <span className="text-sm font-semibold text-white">
                      {user.name.charAt(0)}
                    </span>
                  </div>
                  <span className="pr-1 text-sm font-medium text-slate-700">
                    {user.name}님
                  </span>
                </div>

                <Link
                  href="/admin"
                  className="font-medium text-slate-600 transition-colors hover:text-violet-600"
                >
                  관리자 홈
                </Link>

                <Link
                  href="/"
                  className="font-medium text-slate-600 transition-colors hover:text-violet-600"
                >
                  홈으로
                </Link>

                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="text-slate-500 transition-colors hover:text-slate-700"
                  >
                    로그아웃
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Header */}
          <div className="animate-fadeInUp mb-16 text-center">
            <h1 className="mb-6 text-5xl font-bold text-slate-800">
              뉴스레터 관리 대시보드
            </h1>
            <p className="text-2xl text-slate-600">
              뉴스레터, 공지사항, 구독자를 관리하세요
            </p>
          </div>

          {/* Stats Card */}
          <div className="animate-fadeInUp mb-16">
            <SubscriberStats initialCount={subscriberCount} />
          </div>

          {/* Newsletter Management */}
          <div
            className="animate-fadeInUp mb-16"
            style={{ animationDelay: "0.2s" }}
          >
            <NewsletterList
              initialNewsletters={newsletters.map((n) => n.toPrimitives())}
            />
          </div>

          {/* Announcement Review */}
          <div
            className="animate-fadeInUp"
            style={{ animationDelay: "0.4s" }}
          >
            <AnnouncementReview
              initialAnnouncements={pendingAnnouncements.map((a) =>
                a.toPrimitives()
              )}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
