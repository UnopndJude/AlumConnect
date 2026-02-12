import { Subscription } from "@/domain/subscription/entities/Subscription"
import { ISubscriptionRepository } from "@/domain/subscription/repositories/ISubscriptionRepository"

const subscriptions: Map<string, Subscription> = new Map()

export class InMemorySubscriptionRepository implements ISubscriptionRepository {
  async save(subscription: Subscription): Promise<void> {
    subscriptions.set(subscription.id, subscription)
  }

  async findById(id: string): Promise<Subscription | null> {
    return subscriptions.get(id) || null
  }

  async findByEmail(email: string): Promise<Subscription | null> {
    for (const subscription of subscriptions.values()) {
      if (subscription.email.toLowerCase() === email.toLowerCase()) {
        return subscription
      }
    }
    return null
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    for (const subscription of subscriptions.values()) {
      if (subscription.userId === userId) {
        return subscription
      }
    }
    return null
  }

  async findAllActive(): Promise<Subscription[]> {
    return Array.from(subscriptions.values()).filter(
      (subscription) => subscription.isActive
    )
  }

  async countActive(): Promise<number> {
    return Array.from(subscriptions.values()).filter(
      (subscription) => subscription.isActive
    ).length
  }

  async findByUnsubscribeToken(token: string): Promise<Subscription | null> {
    for (const subscription of subscriptions.values()) {
      if (subscription.unsubscribeToken === token) {
        return subscription
      }
    }
    return null
  }
}
