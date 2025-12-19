export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assignments: {
        Row: {
          class_id: string
          created_at: string | null
          due_date: string | null
          game_id: string
          id: string
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          due_date?: string | null
          game_id: string
          id?: string
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          due_date?: string | null
          game_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      bookmarks: {
        Row: {
          created_at: string
          game_id: string | null
          id: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id?: string | null
          id?: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string | null
          id?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      class_members: {
        Row: {
          class_id: string
          id: string
          joined_at: string | null
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string | null
          student_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_members_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string | null
          description: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          id: string
          join_code: string | null
          name: string
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          id?: string
          join_code?: string | null
          name: string
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          id?: string
          join_code?: string | null
          name?: string
          teacher_id?: string
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          activity_date: string
          created_at: string
          games_played: number
          id: string
          time_spent_minutes: number
          user_id: string
          xp_earned: number
        }
        Insert: {
          activity_date?: string
          created_at?: string
          games_played?: number
          id?: string
          time_spent_minutes?: number
          user_id: string
          xp_earned?: number
        }
        Update: {
          activity_date?: string
          created_at?: string
          games_played?: number
          id?: string
          time_spent_minutes?: number
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      daily_challenge_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenge_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          bonus_points: number
          challenge_date: string
          created_at: string
          game_id: string
          id: string
        }
        Insert: {
          bonus_points?: number
          challenge_date: string
          created_at?: string
          game_id: string
          id?: string
        }
        Update: {
          bonus_points?: number
          challenge_date?: string
          created_at?: string
          game_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string
          discussion_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          discussion_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          discussion_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          class_id: string
          content: string
          created_at: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          class_id: string
          content: string
          created_at?: string
          id?: string
          title: string
          user_id: string
        }
        Update: {
          class_id?: string
          content?: string
          created_at?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discussions_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          correct_answers: number | null
          game_id: string
          id: string
          score: number | null
          started_at: string | null
          time_spent_seconds: number | null
          total_questions: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          correct_answers?: number | null
          game_id: string
          id?: string
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          correct_answers?: number | null
          game_id?: string
          id?: string
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          total_questions?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty"] | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          points_per_correct: number | null
          time_limit_seconds: number | null
          title: string
          topic_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          points_per_correct?: number | null
          time_limit_seconds?: number | null
          title: string
          topic_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"] | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          points_per_correct?: number | null
          time_limit_seconds?: number | null
          title?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parent_children: {
        Row: {
          child_id: string
          created_at: string
          id: string
          parent_id: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          parent_id: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          parent_id?: string
        }
        Relationships: []
      }
      parental_controls: {
        Row: {
          allowed_end_time: string | null
          allowed_start_time: string | null
          blocked_game_types: string[] | null
          child_id: string
          content_filter_level: string | null
          created_at: string
          daily_time_limit_minutes: number | null
          id: string
          notifications_enabled: boolean | null
          parent_id: string
          updated_at: string
        }
        Insert: {
          allowed_end_time?: string | null
          allowed_start_time?: string | null
          blocked_game_types?: string[] | null
          child_id: string
          content_filter_level?: string | null
          created_at?: string
          daily_time_limit_minutes?: number | null
          id?: string
          notifications_enabled?: boolean | null
          parent_id: string
          updated_at?: string
        }
        Update: {
          allowed_end_time?: string | null
          allowed_start_time?: string | null
          blocked_game_types?: string[] | null
          child_id?: string
          content_filter_level?: string | null
          created_at?: string
          daily_time_limit_minutes?: number | null
          id?: string
          notifications_enabled?: boolean | null
          parent_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          full_name: string
          id: string
          school_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          full_name: string
          id: string
          school_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          full_name?: string
          id?: string
          school_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          explanation: string | null
          game_id: string
          id: string
          image_url: string | null
          options: Json | null
          order_index: number | null
          question_text: string
          question_type: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          explanation?: string | null
          game_id: string
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          question_text: string
          question_type?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          explanation?: string | null
          game_id?: string
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          question_text?: string
          question_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_battles: {
        Row: {
          battle_code: string | null
          challenger_id: string
          challenger_score: number | null
          completed_at: string | null
          created_at: string
          game_id: string | null
          id: string
          opponent_id: string | null
          opponent_score: number | null
          status: string
          winner_id: string | null
        }
        Insert: {
          battle_code?: string | null
          challenger_id: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          game_id?: string | null
          id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          status?: string
          winner_id?: string | null
        }
        Update: {
          battle_code?: string | null
          challenger_id?: string
          challenger_score?: number | null
          completed_at?: string | null
          created_at?: string
          game_id?: string | null
          id?: string
          opponent_id?: string | null
          opponent_score?: number | null
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_battles_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      study_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          class_id: string
          created_at: string
          creator_id: string
          description: string | null
          id: string
          max_members: number
          name: string
        }
        Insert: {
          class_id: string
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          max_members?: number
          name: string
        }
        Update: {
          class_id?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          max_members?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_groups_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      study_schedule: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          game_id: string | null
          id: string
          is_completed: boolean
          reminder_sent: boolean
          scheduled_date: string
          scheduled_time: string | null
          title: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          game_id?: string | null
          id?: string
          is_completed?: boolean
          reminder_sent?: boolean
          scheduled_date: string
          scheduled_time?: string | null
          title: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          game_id?: string | null
          id?: string
          is_completed?: boolean
          reminder_sent?: boolean
          scheduled_date?: string
          scheduled_time?: string | null
          title?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_schedule_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_schedule_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string | null
          description: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          id: string
          name: string
          order_index: number | null
          subject_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          id?: string
          name: string
          order_index?: number | null
          subject_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          id?: string
          name?: string
          order_index?: number | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_coins: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_owned_items: {
        Row: {
          id: string
          item_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          item_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          item_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          language: string
          notification_email: boolean
          notification_push: boolean
          onboarding_completed: boolean
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          notification_email?: boolean
          notification_push?: boolean
          onboarding_completed?: boolean
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          notification_email?: boolean
          notification_push?: boolean
          onboarding_completed?: boolean
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          games_played: number | null
          id: string
          last_played_at: string | null
          mastery_level: number | null
          topic_id: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          games_played?: number | null
          id?: string
          last_played_at?: string | null
          mastery_level?: number | null
          topic_id: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          games_played?: number | null
          id?: string
          last_played_at?: string | null
          mastery_level?: number | null
          topic_id?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "student" | "teacher" | "parent"
      difficulty: "easy" | "medium" | "hard"
      education_level: "sd" | "smp" | "sma"
      game_type: "quiz" | "drag_drop" | "memory" | "puzzle"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "teacher", "parent"],
      difficulty: ["easy", "medium", "hard"],
      education_level: ["sd", "smp", "sma"],
      game_type: ["quiz", "drag_drop", "memory", "puzzle"],
    },
  },
} as const
