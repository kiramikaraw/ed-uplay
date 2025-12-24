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
      battle_pass_rewards: {
        Row: {
          created_at: string | null
          id: string
          is_premium: boolean | null
          level: number
          reward_type: string
          reward_value: Json
          season_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          level: number
          reward_type: string
          reward_value: Json
          season_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_premium?: boolean | null
          level?: number
          reward_type?: string
          reward_value?: Json
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battle_pass_rewards_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "battle_pass_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      battle_pass_seasons: {
        Row: {
          created_at: string | null
          description: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          name: string
          starts_at: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ends_at: string
          id?: string
          is_active?: boolean | null
          name: string
          starts_at: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          starts_at?: string
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
      chapters: {
        Row: {
          created_at: string | null
          description: string | null
          grade: number
          id: string
          name: string
          order_index: number | null
          semester: number | null
          topic_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          grade: number
          id?: string
          name: string
          order_index?: number | null
          semester?: number | null
          topic_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          grade?: number
          id?: string
          name?: string
          order_index?: number | null
          semester?: number | null
          topic_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_topic_id_fkey"
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
      daily_rewards: {
        Row: {
          claimed_at: string | null
          id: string
          reward_amount: number
          reward_date: string
          reward_type: string
          streak_day: number | null
          user_id: string
        }
        Insert: {
          claimed_at?: string | null
          id?: string
          reward_amount: number
          reward_date?: string
          reward_type: string
          streak_day?: number | null
          user_id: string
        }
        Update: {
          claimed_at?: string | null
          id?: string
          reward_amount?: number
          reward_date?: string
          reward_type?: string
          streak_day?: number | null
          user_id?: string
        }
        Relationships: []
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
      learning_path_nodes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_index: number | null
          path_id: string
          position_x: number | null
          position_y: number | null
          prerequisite_node_id: string | null
          title: string
          topic_id: string | null
          xp_reward: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          path_id: string
          position_x?: number | null
          position_y?: number | null
          prerequisite_node_id?: string | null
          title: string
          topic_id?: string | null
          xp_reward?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number | null
          path_id?: string
          position_x?: number | null
          position_y?: number | null
          prerequisite_node_id?: string | null
          title?: string
          topic_id?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_path_nodes_path_id_fkey"
            columns: ["path_id"]
            isOneToOne: false
            referencedRelation: "learning_paths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_nodes_prerequisite_node_id_fkey"
            columns: ["prerequisite_node_id"]
            isOneToOne: false
            referencedRelation: "learning_path_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_path_nodes_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_paths: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          icon: string | null
          id: string
          name: string
          order_index: number | null
          subject_id: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          icon?: string | null
          id?: string
          name: string
          order_index?: number | null
          subject_id?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          icon?: string | null
          id?: string
          name?: string
          order_index?: number | null
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_paths_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
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
      lucky_spin_history: {
        Row: {
          created_at: string | null
          id: string
          is_premium_spin: boolean | null
          reward_amount: number
          reward_type: string
          spin_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_premium_spin?: boolean | null
          reward_amount: number
          reward_type: string
          spin_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_premium_spin?: boolean | null
          reward_amount?: number
          reward_type?: string
          spin_date?: string
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
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          payment_method: string | null
          payment_reference: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string | null
          payment_reference?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
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
      question_banks: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty"]
          explanation: string | null
          hints: Json | null
          id: string
          image_url: string | null
          options: Json
          question_text: string
          source: string | null
          times_answered: number | null
          times_correct: number | null
          topic_id: string
          video_explanation_url: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          hints?: Json | null
          id?: string
          image_url?: string | null
          options: Json
          question_text: string
          source?: string | null
          times_answered?: number | null
          times_correct?: number | null
          topic_id: string
          video_explanation_url?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty"]
          explanation?: string | null
          hints?: Json | null
          id?: string
          image_url?: string | null
          options?: Json
          question_text?: string
          source?: string | null
          times_answered?: number | null
          times_correct?: number | null
          topic_id?: string
          video_explanation_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_banks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
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
      quiz_sessions: {
        Row: {
          completed_at: string | null
          correct_answers: number | null
          created_at: string | null
          id: string
          questions_data: Json | null
          quiz_mode: string
          score: number | null
          started_at: string | null
          time_spent_seconds: number | null
          topic_id: string
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          questions_data?: Json | null
          quiz_mode?: string
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          topic_id: string
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          questions_data?: Json | null
          quiz_mode?: string
          score?: number | null
          started_at?: string | null
          time_spent_seconds?: number | null
          topic_id?: string
          total_questions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_sessions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          total_earnings: number | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          total_earnings?: number | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          total_earnings?: number | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referral_uses: {
        Row: {
          code_id: string | null
          created_at: string | null
          id: string
          referred_user_id: string
          reward_given: boolean | null
        }
        Insert: {
          code_id?: string | null
          created_at?: string | null
          id?: string
          referred_user_id: string
          reward_given?: boolean | null
        }
        Update: {
          code_id?: string | null
          created_at?: string | null
          id?: string
          referred_user_id?: string
          reward_given?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_uses_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
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
      subscription_plans: {
        Row: {
          created_at: string | null
          features: Json
          id: string
          is_active: boolean | null
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
        }
        Insert: {
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
        }
        Update: {
          created_at?: string | null
          features?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
        }
        Relationships: []
      }
      topic_statistics: {
        Row: {
          average_time_seconds: number | null
          correct_answers: number | null
          created_at: string | null
          id: string
          last_practiced: string | null
          mastery_score: number | null
          topic_id: string
          total_attempts: number | null
          updated_at: string | null
          user_id: string
          weak_areas: Json | null
        }
        Insert: {
          average_time_seconds?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          mastery_score?: number | null
          topic_id: string
          total_attempts?: number | null
          updated_at?: string | null
          user_id: string
          weak_areas?: Json | null
        }
        Update: {
          average_time_seconds?: number | null
          correct_answers?: number | null
          created_at?: string | null
          id?: string
          last_practiced?: string | null
          mastery_score?: number | null
          topic_id?: string
          total_attempts?: number | null
          updated_at?: string | null
          user_id?: string
          weak_areas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "topic_statistics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
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
      tryout_answers: {
        Row: {
          created_at: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          session_id: string
          time_spent_seconds: number | null
          user_answer: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          session_id: string
          time_spent_seconds?: number | null
          user_answer?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          session_id?: string
          time_spent_seconds?: number | null
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tryout_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "tryout_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tryout_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tryout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_packages: {
        Row: {
          created_at: string | null
          description: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          end_date: string | null
          id: string
          is_active: boolean | null
          is_premium: boolean | null
          start_date: string | null
          title: string
          total_questions: number | null
          tryout_type_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          education_level: Database["public"]["Enums"]["education_level"]
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          start_date?: string | null
          title: string
          total_questions?: number | null
          tryout_type_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          education_level?: Database["public"]["Enums"]["education_level"]
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          is_premium?: boolean | null
          start_date?: string | null
          title?: string
          total_questions?: number | null
          tryout_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryout_packages_tryout_type_id_fkey"
            columns: ["tryout_type_id"]
            isOneToOne: false
            referencedRelation: "tryout_types"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          image_url: string | null
          options: Json | null
          order_index: number | null
          points: number | null
          question_text: string
          question_type: string | null
          section_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text: string
          question_type?: string | null
          section_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          image_url?: string | null
          options?: Json | null
          order_index?: number | null
          points?: number | null
          question_text?: string
          question_type?: string | null
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryout_questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "tryout_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_sections: {
        Row: {
          created_at: string | null
          duration_minutes: number
          id: string
          name: string
          order_index: number | null
          package_id: string
        }
        Insert: {
          created_at?: string | null
          duration_minutes: number
          id?: string
          name: string
          order_index?: number | null
          package_id: string
        }
        Update: {
          created_at?: string | null
          duration_minutes?: number
          id?: string
          name?: string
          order_index?: number | null
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryout_sections_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tryout_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          package_id: string
          percentage: number | null
          ranking: number | null
          started_at: string | null
          status: string | null
          total_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          package_id: string
          percentage?: number | null
          ranking?: number | null
          started_at?: string | null
          status?: string | null
          total_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          package_id?: string
          percentage?: number | null
          ranking?: number | null
          started_at?: string | null
          status?: string | null
          total_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryout_sessions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "tryout_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      tryout_types: {
        Row: {
          created_at: string | null
          description: string | null
          duration_minutes: number
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
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
      user_battle_pass: {
        Row: {
          claimed_rewards: number[] | null
          created_at: string | null
          current_level: number | null
          current_xp: number | null
          id: string
          is_premium: boolean | null
          season_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          claimed_rewards?: number[] | null
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          id?: string
          is_premium?: boolean | null
          season_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          claimed_rewards?: number[] | null
          created_at?: string | null
          current_level?: number | null
          current_xp?: number | null
          id?: string
          is_premium?: boolean | null
          season_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_battle_pass_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "battle_pass_seasons"
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
      user_path_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          node_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          node_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_path_progress_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "learning_path_nodes"
            referencedColumns: ["id"]
          },
        ]
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
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string | null
          expires_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          plan_id: string | null
          started_at: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      video_lessons: {
        Row: {
          created_at: string | null
          description: string | null
          duration_seconds: number | null
          id: string
          is_premium: boolean | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          topic_id: string
          video_provider: string
          video_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          topic_id: string
          video_provider?: string
          video_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_seconds?: number | null
          id?: string
          is_premium?: boolean | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          topic_id?: string
          video_provider?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      video_progress: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          last_watched_at: string | null
          user_id: string
          video_id: string
          watched_seconds: number | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          user_id: string
          video_id: string
          watched_seconds?: number | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          last_watched_at?: string | null
          user_id?: string
          video_id?: string
          watched_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "video_lessons"
            referencedColumns: ["id"]
          },
        ]
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
