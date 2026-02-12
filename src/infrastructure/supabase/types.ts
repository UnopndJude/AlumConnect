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
    }
  }
}
