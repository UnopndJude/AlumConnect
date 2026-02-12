import { Connection } from "@/domain/connection/entities/Connection"
import { IConnectionRepository } from "@/domain/connection/repositories/IConnectionRepository"
import { ConnectionId } from "@/domain/connection/value-objects"
import { ConnectionStatus } from "@/infrastructure/supabase/types"
import { createServerSupabaseClient } from "@/infrastructure/supabase"

export class SupabaseConnectionRepository implements IConnectionRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async save(connection: Connection): Promise<void> {
    const primitives = connection.toPrimitives()

    const { error } = await this.supabase.from("connections").upsert({
      id: primitives.id,
      requester_id: primitives.requesterId,
      receiver_id: primitives.receiverId,
      message: primitives.message,
      status: primitives.status,
      responded_at: primitives.respondedAt?.toISOString() || null,
      created_at: primitives.createdAt.toISOString(),
    })

    if (error) {
      throw new Error(`Failed to save connection: ${error.message}`)
    }
  }

  async findById(id: string): Promise<Connection | null> {
    const { data, error } = await this.supabase
      .from("connections")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByRequesterId(requesterId: string): Promise<Connection[]> {
    const { data, error } = await this.supabase
      .from("connections")
      .select("*")
      .eq("requester_id", requesterId)

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter((c) => c !== null)
  }

  async findByReceiverId(receiverId: string): Promise<Connection[]> {
    const { data, error } = await this.supabase
      .from("connections")
      .select("*")
      .eq("receiver_id", receiverId)

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter((c) => c !== null)
  }

  async findPendingForUser(userId: string): Promise<Connection[]> {
    const { data, error } = await this.supabase
      .from("connections")
      .select("*")
      .eq("receiver_id", userId)
      .eq("status", "pending")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter((c) => c !== null)
  }

  async findAcceptedConnections(userId: string): Promise<Connection[]> {
    const { data, error } = await this.supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
      .eq("status", "accepted")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter((c) => c !== null)
  }

  async findBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Connection | null> {
    const { data, error } = await this.supabase
      .from("connections")
      .select("*")
      .or(
        `and(requester_id.eq.${userId1},receiver_id.eq.${userId2}),and(requester_id.eq.${userId2},receiver_id.eq.${userId1})`
      )
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("connections")
      .delete()
      .eq("id", id)

    if (error) {
      throw new Error(`Failed to delete connection: ${error.message}`)
    }
  }

  private toDomain(row: {
    id: string
    requester_id: string
    receiver_id: string
    message: string | null
    status: ConnectionStatus
    responded_at: string | null
    created_at: string
  }): Connection | null {
    return Connection.reconstitute({
      id: ConnectionId.create(row.id),
      requesterId: row.requester_id,
      receiverId: row.receiver_id,
      message: row.message,
      status: row.status,
      respondedAt: row.responded_at ? new Date(row.responded_at) : null,
      createdAt: new Date(row.created_at),
    })
  }
}
