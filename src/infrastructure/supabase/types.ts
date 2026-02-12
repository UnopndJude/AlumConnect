// Supabase Database Types
// These types are generated based on the domain entities

export type UserStatus = "pending" | "approved" | "rejected"
export type IntroductionStatus =
  | "student"
  | "employed"
  | "entrepreneur"
  | "graduate_student"
  | "other"
export type ContactPreference = "email" | "linkedin" | "phone" | "kakao"
export type LookingFor =
  | "mentoring"
  | "networking"
  | "collaboration"
  | "job_opportunities"
  | "investment"
export type QuestionType = "basic" | "facility" | "culture" | "class_specific"
export type Difficulty = "easy" | "medium" | "hard"
export type NewsletterStatus = "draft" | "published"
export type SectionType =
  | "alumni_in_media"
  | "member_announcements"
  | "industry_trends"
export type SubscriptionStatus = "active" | "unsubscribed"
export type AnnouncementStatus = "pending" | "approved" | "rejected"
export type ConnectionStatus = "pending" | "accepted" | "rejected"

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password: string
          name: string
          graduation_class: number
          status: UserStatus
          is_admin: boolean
          created_at: string
          approved_at: string | null
          rejected_at: string | null
        }
        Insert: {
          id?: string
          email: string
          password: string
          name: string
          graduation_class: number
          status?: UserStatus
          is_admin?: boolean
          created_at?: string
          approved_at?: string | null
          rejected_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          password?: string
          name?: string
          graduation_class?: number
          status?: UserStatus
          is_admin?: boolean
          created_at?: string
          approved_at?: string | null
          rejected_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          graduation_class: number
          is_verified: boolean
          is_admin: boolean
          alumni_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          graduation_class: number
          is_verified?: boolean
          is_admin?: boolean
          alumni_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          graduation_class?: number
          is_verified?: boolean
          is_admin?: boolean
          alumni_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "alumni"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni: {
        Row: {
          id: string
          name: string
          graduation_class: number
          birth_year: number | null
          is_registered: boolean
        }
        Insert: {
          id?: string
          name: string
          graduation_class: number
          birth_year?: number | null
          is_registered?: boolean
        }
        Update: {
          id?: string
          name?: string
          graduation_class?: number
          birth_year?: number | null
          is_registered?: boolean
        }
        Relationships: []
      }
      introductions: {
        Row: {
          id: string
          user_id: string
          name: string
          graduation_class: number
          status: IntroductionStatus
          field: string | null
          organization: string | null
          location: string | null
          self_introduction: string
          looking_for: LookingFor | null
          interests: string | null
          expertise: string | null
          projects: string | null
          contact_preference: ContactPreference | null
          contact_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          graduation_class: number
          status: IntroductionStatus
          field?: string | null
          organization?: string | null
          location?: string | null
          self_introduction: string
          looking_for?: LookingFor | null
          interests?: string | null
          expertise?: string | null
          projects?: string | null
          contact_preference?: ContactPreference | null
          contact_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          graduation_class?: number
          status?: IntroductionStatus
          field?: string | null
          organization?: string | null
          location?: string | null
          self_introduction?: string
          looking_for?: LookingFor | null
          interests?: string | null
          expertise?: string | null
          projects?: string | null
          contact_preference?: ContactPreference | null
          contact_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "introductions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          id: string
          type: QuestionType
          question: string
          options: string[]
          correct_index: number
          difficulty: Difficulty
          applicable_class_from: number | null
          applicable_class_to: number | null
          created_at: string
        }
        Insert: {
          id?: string
          type: QuestionType
          question: string
          options: string[]
          correct_index: number
          difficulty: Difficulty
          applicable_class_from?: number | null
          applicable_class_to?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: QuestionType
          question?: string
          options?: string[]
          correct_index?: number
          difficulty?: Difficulty
          applicable_class_from?: number | null
          applicable_class_to?: number | null
          created_at?: string
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          id: string
          email: string
          alumni_id: string | null
          alumni_matched: boolean
          question_ids: string[]
          attempt_count: number
          max_attempts: number
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          alumni_id?: string | null
          alumni_matched?: boolean
          question_ids: string[]
          attempt_count?: number
          max_attempts?: number
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          alumni_id?: string | null
          alumni_matched?: boolean
          question_ids?: string[]
          attempt_count?: number
          max_attempts?: number
          expires_at?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_alumni_id_fkey"
            columns: ["alumni_id"]
            isOneToOne: false
            referencedRelation: "alumni"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          id: string
          edition: number
          title: string
          status: NewsletterStatus
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          edition: number
          title: string
          status?: NewsletterStatus
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          edition?: number
          title?: string
          status?: NewsletterStatus
          published_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      newsletter_sections: {
        Row: {
          id: string
          newsletter_id: string
          type: SectionType
          title: string
          content: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          newsletter_id: string
          type: SectionType
          title: string
          content: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          newsletter_id?: string
          type?: SectionType
          title?: string
          content?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_sections_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          id: string
          email: string
          user_id: string | null
          status: SubscriptionStatus
          preferences: {
            optOutFromScraping: boolean
            contentPreferences: SectionType[]
          }
          subscribed_at: string
          unsubscribed_at: string | null
          unsubscribe_token: string
        }
        Insert: {
          id?: string
          email: string
          user_id?: string | null
          status?: SubscriptionStatus
          preferences?: {
            optOutFromScraping: boolean
            contentPreferences: SectionType[]
          }
          subscribed_at?: string
          unsubscribed_at?: string | null
          unsubscribe_token?: string
        }
        Update: {
          id?: string
          email?: string
          user_id?: string | null
          status?: SubscriptionStatus
          preferences?: {
            optOutFromScraping: boolean
            contentPreferences: SectionType[]
          }
          subscribed_at?: string
          unsubscribed_at?: string | null
          unsubscribe_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "auth.users"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          id: string
          author_id: string
          type: SectionType
          title: string
          content: string
          status: AnnouncementStatus
          reviewed_by: string | null
          reviewed_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          author_id: string
          type: SectionType
          title: string
          content: string
          status?: AnnouncementStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          type?: SectionType
          title?: string
          content?: string
          status?: AnnouncementStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          id: string
          requester_id: string
          receiver_id: string
          message: string | null
          status: ConnectionStatus
          responded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          receiver_id: string
          message?: string | null
          status?: ConnectionStatus
          responded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          receiver_id?: string
          message?: string | null
          status?: ConnectionStatus
          responded_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_status: UserStatus
      introduction_status: IntroductionStatus
      contact_preference: ContactPreference
      looking_for: LookingFor
      question_type: QuestionType
      difficulty: Difficulty
      newsletter_status: NewsletterStatus
      section_type: SectionType
      subscription_status: SubscriptionStatus
      announcement_status: AnnouncementStatus
      connection_status: ConnectionStatus
    }
  }
}
