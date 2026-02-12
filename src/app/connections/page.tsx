import { redirect } from "next/navigation"
import { getCurrentUser } from "@/infrastructure/supabase/auth"
import { container } from "@/infrastructure/di/container"
import { ProfileId } from "@/domain/profile"
import Link from "next/link"

export default async function ConnectionsPage() {
  const { user, profile } = await getCurrentUser()

  if (!user || !profile) {
    redirect("/login")
  }

  if (!profile.isVerified) {
    redirect("/")
  }

  const connectionRepository = container.getConnectionRepository()
  const profileRepository = container.getProfileRepository()

  // Get connections
  const [sentConnections, receivedConnections, acceptedConnections] =
    await Promise.all([
      connectionRepository.findByRequesterId(profile.id),
      connectionRepository.findByReceiverId(profile.id),
      connectionRepository.findAcceptedConnections(profile.id),
    ])

  // Get pending received connections
  const pendingReceived = receivedConnections.filter((c) => c.isPending)
  const pendingSent = sentConnections.filter((c) => c.isPending)

  // Get profile data for all connected users
  const userIds = new Set<string>()
  ;[...sentConnections, ...receivedConnections, ...acceptedConnections].forEach(
    (conn) => {
      userIds.add(conn.requesterId)
      userIds.add(conn.receiverId)
    }
  )
  userIds.delete(profile.id)

  const userProfiles = await Promise.all(
    Array.from(userIds).map((id) => profileRepository.findById(ProfileId.create(id)))
  )

  const profileMap = new Map(
    userProfiles
      .filter((p) => p !== null)
      .map((p) => [p!.id.getValue(), p!.toPrimitives()])
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <Link href="/" className="text-2xl font-bold text-blue-600">
                AlumConnect
              </Link>
              <h1 className="mt-1 text-xl font-semibold text-gray-900">
                내 연결
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                안녕하세요, {profile.name}님
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 px-1 pb-4 text-sm font-medium text-blue-600">
              받은 요청 ({pendingReceived.length})
            </button>
            <button className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              연결됨 ({acceptedConnections.length})
            </button>
            <button className="border-b-2 border-transparent px-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700">
              보낸 요청 ({pendingSent.length})
            </button>
          </nav>
        </div>

        {/* Pending Received */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            받은 연결 요청
          </h2>
          {pendingReceived.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-600">받은 연결 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReceived.map((conn) => {
                const connData = conn.toPrimitives()
                const requester = profileMap.get(connData.requesterId)
                if (!requester) return null

                return (
                  <div
                    key={connData.id}
                    className="rounded-lg bg-white p-6 shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {requester.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {requester.graduationClass}기
                        </p>
                        {connData.message && (
                          <p className="mt-2 text-sm text-gray-700">
                            {connData.message}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          {new Date(connData.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <form
                          action={`/api/connections/${connData.id}/respond`}
                          method="POST"
                        >
                          <input
                            type="hidden"
                            name="action"
                            value="accept"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                          >
                            수락
                          </button>
                        </form>
                        <form
                          action={`/api/connections/${connData.id}/respond`}
                          method="POST"
                        >
                          <input
                            type="hidden"
                            name="action"
                            value="reject"
                          />
                          <button
                            type="submit"
                            className="rounded-md bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700"
                          >
                            거절
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Accepted Connections */}
        <section className="mb-12">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            연결된 동문 ({acceptedConnections.length})
          </h2>
          {acceptedConnections.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-600">연결된 동문이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {acceptedConnections.map((conn) => {
                const connData = conn.toPrimitives()
                const otherUserId =
                  connData.requesterId === profile.id
                    ? connData.receiverId
                    : connData.requesterId
                const otherUser = profileMap.get(otherUserId)
                if (!otherUser) return null

                return (
                  <div
                    key={connData.id}
                    className="rounded-lg bg-white p-6 shadow"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">
                      {otherUser.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {otherUser.graduationClass}기
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                      연결됨:{" "}
                      {connData.respondedAt &&
                        new Date(connData.respondedAt).toLocaleDateString(
                          "ko-KR"
                        )}
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/profile/${otherUserId}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        프로필 보기
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Sent Connections */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            보낸 연결 요청 ({pendingSent.length})
          </h2>
          {pendingSent.length === 0 ? (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-600">보낸 연결 요청이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSent.map((conn) => {
                const connData = conn.toPrimitives()
                const receiver = profileMap.get(connData.receiverId)
                if (!receiver) return null

                return (
                  <div
                    key={connData.id}
                    className="rounded-lg bg-white p-6 shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {receiver.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {receiver.graduationClass}기
                        </p>
                        {connData.message && (
                          <p className="mt-2 text-sm text-gray-700">
                            &ldquo;{connData.message}&rdquo;
                          </p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                          보낸 날짜:{" "}
                          {new Date(connData.createdAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      </div>
                      <form
                        action={`/api/connections/${connData.id}`}
                        method="POST"
                      >
                        <input type="hidden" name="_method" value="DELETE" />
                        <button
                          type="submit"
                          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                        >
                          취소
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
