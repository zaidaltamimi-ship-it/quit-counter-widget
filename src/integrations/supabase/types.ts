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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      addictions: {
        Row: {
          created_at: string
          id: string
          per_day: number
          price_per_unit: number
          quit_date: string
          reduction_mode: boolean
          type: string
          units_per_pack: number
          updated_at: string
          user_id: string
          weekly_target: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          per_day?: number
          price_per_unit?: number
          quit_date: string
          reduction_mode?: boolean
          type: string
          units_per_pack?: number
          updated_at?: string
          user_id: string
          weekly_target?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          per_day?: number
          price_per_unit?: number
          quit_date?: string
          reduction_mode?: boolean
          type?: string
          units_per_pack?: number
          updated_at?: string
          user_id?: string
          weekly_target?: number | null
        }
        Relationships: []
      }
      friend_invitations: {
        Row: {
          created_at: string
          id: string
          recipient_email: string
          sender_id: string
          status: string
          token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          recipient_email: string
          sender_id: string
          status?: string
          token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          recipient_email?: string
          sender_id?: string
          status?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          status: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      health_entries: {
        Row: {
          addiction_id: string
          created_at: string
          date: string
          diastolic: number | null
          heart_rate: number | null
          id: string
          note: string | null
          peak_flow: number | null
          systolic: number | null
          user_id: string
          weight: number | null
        }
        Insert: {
          addiction_id: string
          created_at?: string
          date: string
          diastolic?: number | null
          heart_rate?: number | null
          id?: string
          note?: string | null
          peak_flow?: number | null
          systolic?: number | null
          user_id: string
          weight?: number | null
        }
        Update: {
          addiction_id?: string
          created_at?: string
          date?: string
          diastolic?: number | null
          heart_rate?: number | null
          id?: string
          note?: string | null
          peak_flow?: number | null
          systolic?: number | null
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_entries_addiction_id_fkey"
            columns: ["addiction_id"]
            isOneToOne: false
            referencedRelation: "addictions"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          friendship_id: string
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          friendship_id: string
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          friendship_id?: string
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_friendship_id_fkey"
            columns: ["friendship_id"]
            isOneToOne: false
            referencedRelation: "friendships"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          addiction_id: string
          craving: number
          created_at: string
          date: string
          id: string
          mood: number
          note: string | null
          user_id: string
        }
        Insert: {
          addiction_id: string
          craving: number
          created_at?: string
          date: string
          id?: string
          mood: number
          note?: string | null
          user_id: string
        }
        Update: {
          addiction_id?: string
          craving?: number
          created_at?: string
          date?: string
          id?: string
          mood?: number
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_entries_addiction_id_fkey"
            columns: ["addiction_id"]
            isOneToOne: false
            referencedRelation: "addictions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_logs: {
        Row: {
          actual: number
          addiction_id: string
          created_at: string
          id: string
          user_id: string
          week: string
        }
        Insert: {
          actual?: number
          addiction_id: string
          created_at?: string
          id?: string
          user_id: string
          week: string
        }
        Update: {
          actual?: number
          addiction_id?: string
          created_at?: string
          id?: string
          user_id?: string
          week?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_logs_addiction_id_fkey"
            columns: ["addiction_id"]
            isOneToOne: false
            referencedRelation: "addictions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_friendship_member: {
        Args: { _friendship_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
