import { Subscription } from "../entities/Subscription"

export interface ISubscriptionRepository {
  save(subscription: Subscription): Promise<void>
  findById(id: string): Promise<Subscription | null>
  findByEmail(email: string): Promise<Subscription | null>
  findByUserId(userId: string): Promise<Subscription | null>
  findByUnsubscribeToken(token: string): Promise<Subscription | null>
  findAllActive(): Promise<Subscription[]>
  countActive(): Promise<number>
}
