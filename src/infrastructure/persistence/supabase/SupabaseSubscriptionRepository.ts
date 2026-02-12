import { Subscription } from "@/domain/subscription/entities/Subscription"
import { ISubscriptionRepository } from "@/domain/subscription/repositories/ISubscriptionRepository"
import type { SubscriptionPreferences } from "@/domain/subscription/entities/Subscription"
import { createServerSupabaseClient } from "@/infrastructure/supabase"
import type { SectionType } from "@/infrastructure/supabase/types"

export class SupabaseSubscriptionRepository implements ISubscriptionRepository {
  private get supabase() {
    return createServerSupabaseClient()
  }

  async save(subscription: Subscription): Promise<void> {
    const primitives = subscription.toPrimitives()

    const { error } = await this.supabase
      .from("newsletter_subscriptions")
      .upsert({
        id: primitives.id,
        email: primitives.email.toLowerCase(),
        user_id: primitives.userId,
        status: primitives.status,
        preferences: {
          optOutFromScraping: primitives.preferences.optOutFromScraping,
          contentPreferences: primitives.preferences
            .contentPreferences as SectionType[],
        },
        subscribed_at: primitives.subscribedAt.toISOString(),
        unsubscribed_at: primitives.unsubscribedAt?.toISOString() || null,
        unsubscribe_token: primitives.unsubscribeToken,
      })

    if (error) {
      throw new Error(`Failed to save subscription: ${error.message}`)
    }
  }

  async findById(id: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByEmail(email: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async findAllActive(): Promise<Subscription[]> {
    const { data, error } = await this.supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("status", "active")

    if (error || !data) return []
    return data.map((row) => this.toDomain(row)).filter((s) => s !== null)
  }

  async countActive(): Promise<number> {
    const { count, error } = await this.supabase
      .from("newsletter_subscriptions")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")

    if (error) return 0
    return count || 0
  }

  async findByUnsubscribeToken(token: string): Promise<Subscription | null> {
    const { data, error } = await this.supabase
      .from("newsletter_subscriptions")
      .select("*")
      .eq("unsubscribe_token", token)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  private toDomain(row: {
    id: string
    email: string
    user_id: string | null
    status: string
    preferences: SubscriptionPreferences
    subscribed_at: string
    unsubscribed_at: string | null
    unsubscribe_token: string
  }): Subscription | null {
    return Subscription.fromPrimitives({
      id: row.id,
      email: row.email,
      userId: row.user_id,
      status: row.status as "active" | "unsubscribed",
      preferences: row.preferences,
      subscribedAt: new Date(row.subscribed_at),
      unsubscribedAt: row.unsubscribed_at
        ? new Date(row.unsubscribed_at)
        : null,
      unsubscribeToken: row.unsubscribe_token,
    })
  }
}
