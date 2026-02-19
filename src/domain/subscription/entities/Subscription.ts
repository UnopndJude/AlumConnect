export type SubscriptionStatus = "active" | "unsubscribed"

export interface SubscriptionPreferences {
  optOutFromScraping: boolean
  contentPreferences: string[] // e.g., ["alumni_in_media", "member_announcements"]
}

export interface SubscriptionProps {
  id: string
  email: string
  userId: string | null // null for anonymous subscribers
  status: SubscriptionStatus
  preferences: SubscriptionPreferences
  subscribedAt: Date
  unsubscribedAt: Date | null
  unsubscribeToken: string
}

const defaultPreferences: SubscriptionPreferences = {
  optOutFromScraping: false,
  contentPreferences: [
    "alumni_in_media",
    "member_announcements",
    "industry_trends",
  ],
}

export class Subscription {
  private constructor(private props: SubscriptionProps) {}

  static create(email: string, userId?: string | null): Subscription {
    return new Subscription({
      id: crypto.randomUUID(),
      email,
      userId: userId ?? null,
      status: "active",
      preferences: { ...defaultPreferences },
      subscribedAt: new Date(),
      unsubscribedAt: null,
      unsubscribeToken: crypto.randomUUID(),
    })
  }

  static generateUnsubscribeToken(): string {
    return crypto.randomUUID()
  }

  static fromPrimitives(props: SubscriptionProps): Subscription {
    return new Subscription(props)
  }

  get id(): string {
    return this.props.id
  }
  get email(): string {
    return this.props.email
  }
  get userId(): string | null {
    return this.props.userId
  }
  get status(): SubscriptionStatus {
    return this.props.status
  }
  get preferences(): SubscriptionPreferences {
    return this.props.preferences
  }
  get subscribedAt(): Date {
    return new Date(this.props.subscribedAt.getTime())
  }
  get unsubscribedAt(): Date | null {
    return this.props.unsubscribedAt
      ? new Date(this.props.unsubscribedAt.getTime())
      : null
  }
  get unsubscribeToken(): string {
    return this.props.unsubscribeToken
  }
  get isActive(): boolean {
    return this.props.status === "active"
  }
  get isLinked(): boolean {
    return this.props.userId !== null
  }

  unsubscribe(): void {
    if (this.props.status === "unsubscribed") {
      throw new Error("Already unsubscribed")
    }
    this.props.status = "unsubscribed"
    this.props.unsubscribedAt = new Date()
  }

  resubscribe(): void {
    this.props.status = "active"
    this.props.unsubscribedAt = null
  }

  linkToUser(userId: string): void {
    this.props.userId = userId
  }

  updatePreferences(preferences: Partial<SubscriptionPreferences>): void {
    this.props.preferences = {
      ...this.props.preferences,
      ...preferences,
    }
  }

  toPrimitives(): SubscriptionProps {
    return { ...this.props }
  }
}
