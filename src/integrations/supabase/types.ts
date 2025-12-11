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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_characters: {
        Row: {
          bio: string
          cloudinary_public_id: string | null
          created_at: string
          id: string
          image_url: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio: string
          cloudinary_public_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string
          cloudinary_public_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_videos: {
        Row: {
          character_bio: string
          character_id: string | null
          character_image_url: string
          character_name: string
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          status: string
          user_id: string
          video_generation_model: string
          video_script: string | null
          video_style: string
          video_topic: string
          video_url: string | null
          webhook_response: Json | null
        }
        Insert: {
          character_bio: string
          character_id?: string | null
          character_image_url: string
          character_name: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          user_id: string
          video_generation_model?: string
          video_script?: string | null
          video_style: string
          video_topic: string
          video_url?: string | null
          webhook_response?: Json | null
        }
        Update: {
          character_bio?: string
          character_id?: string | null
          character_image_url?: string
          character_name?: string
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          status?: string
          user_id?: string
          video_generation_model?: string
          video_script?: string | null
          video_style?: string
          video_topic?: string
          video_url?: string | null
          webhook_response?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_videos_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "ai_characters"
            referencedColumns: ["id"]
          },
        ]
      }
      editor_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          aspect_ratio: string | null
          category: string | null
          cloudinary_public_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          image_url: string | null
          kie_task_id: string | null
          model: string | null
          prompt: string
          reference_image_url: string | null
          reference_image_urls: string[] | null
          status: string | null
          user_id: string
        }
        Insert: {
          aspect_ratio?: string | null
          category?: string | null
          cloudinary_public_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          kie_task_id?: string | null
          model?: string | null
          prompt: string
          reference_image_url?: string | null
          reference_image_urls?: string[] | null
          status?: string | null
          user_id: string
        }
        Update: {
          aspect_ratio?: string | null
          category?: string | null
          cloudinary_public_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          kie_task_id?: string | null
          model?: string | null
          prompt?: string
          reference_image_url?: string | null
          reference_image_urls?: string[] | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      reference_images: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string
          id: string
          image_url: string
          original_filename: string | null
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string
          id?: string
          image_url: string
          original_filename?: string | null
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string
          id?: string
          image_url?: string
          original_filename?: string | null
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_voices: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string
          duration: number
          id: string
          name: string
          type: string
          url: string
          user_id: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string
          duration?: number
          id?: string
          name: string
          type?: string
          url: string
          user_id: string
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string
          duration?: number
          id?: string
          name?: string
          type?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
