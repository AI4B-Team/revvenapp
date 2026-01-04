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
      ai_story_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          prompt: string
          status: string
          updated_at: string
          user_id: string
          video_url: string | null
          voice_id: string | null
          voice_speed: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          prompt: string
          status?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
          voice_id?: string | null
          voice_speed?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          prompt?: string
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
          voice_id?: string | null
          voice_speed?: number | null
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
          scenes: Json | null
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
          scenes?: Json | null
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
          scenes?: Json | null
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
      audio_app_usage: {
        Row: {
          app_name: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          input_audio_url: string | null
          input_text: string | null
          output_audio_url: string | null
          output_text: string | null
          settings: Json | null
          status: string
          user_id: string
        }
        Insert: {
          app_name: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_audio_url?: string | null
          input_text?: string | null
          output_audio_url?: string | null
          output_text?: string | null
          settings?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          app_name?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          input_audio_url?: string | null
          input_text?: string | null
          output_audio_url?: string | null
          output_text?: string | null
          settings?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: []
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
      explainer_videos: {
        Row: {
          audio_url: string | null
          created_at: string
          duration: number | null
          error_message: string | null
          explanation: string | null
          id: string
          source_type: string
          source_url: string | null
          status: string
          title: string | null
          transcript: string | null
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          error_message?: string | null
          explanation?: string | null
          id?: string
          source_type: string
          source_url?: string | null
          status?: string
          title?: string | null
          transcript?: string | null
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          duration?: number | null
          error_message?: string | null
          explanation?: string | null
          id?: string
          source_type?: string
          source_url?: string | null
          status?: string
          title?: string | null
          transcript?: string | null
          updated_at?: string
          user_id?: string
          video_url?: string | null
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
      invite_codes: {
        Row: {
          code: string
          created_at: string
          creator_user_id: string
          id: string
          is_used: boolean
          used_at: string | null
          used_by_email: string | null
          used_by_name: string | null
          used_by_user_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          creator_user_id: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by_email?: string | null
          used_by_name?: string | null
          used_by_user_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          creator_user_id?: string
          id?: string
          is_used?: boolean
          used_at?: string | null
          used_by_email?: string | null
          used_by_name?: string | null
          used_by_user_id?: string | null
        }
        Relationships: []
      }
      lead_generation_history: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          keywords: string | null
          location: string
          num_leads: number
          platform: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          keywords?: string | null
          location: string
          num_leads: number
          platform: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          keywords?: string | null
          location?: string
          num_leads?: number
          platform?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posting_schedules: {
        Row: {
          account_id: string | null
          created_at: string
          day: string
          engagement: string
          id: string
          time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          created_at?: string
          day: string
          engagement?: string
          id?: string
          time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          created_at?: string
          day?: string
          engagement?: string
          id?: string
          time?: string
          updated_at?: string
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
      social_content_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          days: number
          error_message: string | null
          generated_posts: number | null
          id: string
          platforms: string[]
          prompt: string
          status: string
          total_posts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          days?: number
          error_message?: string | null
          generated_posts?: number | null
          id?: string
          platforms: string[]
          prompt: string
          status?: string
          total_posts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          days?: number
          error_message?: string | null
          generated_posts?: number | null
          id?: string
          platforms?: string[]
          prompt?: string
          status?: string
          total_posts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          account_handle: string | null
          account_name: string | null
          caption: string | null
          carousel_images: string[] | null
          created_at: string
          hashtags: string[] | null
          id: string
          image_url: string | null
          platform: string
          scheduled_date: string
          status: string
          title: string
          type: string | null
          updated_at: string
          user_id: string
          video_script: Json | null
        }
        Insert: {
          account_handle?: string | null
          account_name?: string | null
          caption?: string | null
          carousel_images?: string[] | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform: string
          scheduled_date: string
          status?: string
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
          video_script?: Json | null
        }
        Update: {
          account_handle?: string | null
          account_name?: string | null
          caption?: string | null
          carousel_images?: string[] | null
          created_at?: string
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          platform?: string
          scheduled_date?: string
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
          video_script?: Json | null
        }
        Relationships: []
      }
      transcript_comments: {
        Row: {
          author: string
          created_at: string
          id: string
          mentions: string[] | null
          replies: Json | null
          resolved: boolean
          segment_index: number
          text: string
          transcript_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          replies?: Json | null
          resolved?: boolean
          segment_index: number
          text: string
          transcript_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          replies?: Json | null
          resolved?: boolean
          segment_index?: number
          text?: string
          transcript_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transcript_highlights: {
        Row: {
          color: string
          created_at: string
          end_pos: number
          id: string
          segment_index: number
          start_pos: number
          transcript_id: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          end_pos: number
          id?: string
          segment_index: number
          start_pos: number
          transcript_id: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          end_pos?: number
          id?: string
          segment_index?: number
          start_pos?: number
          transcript_id?: string
          user_id?: string
        }
        Relationships: []
      }
      transcript_segments: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          image_url: string | null
          segment_index: number
          speaker: string
          start_time: string
          text: string
          transcript_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          image_url?: string | null
          segment_index: number
          speaker?: string
          start_time?: string
          text?: string
          transcript_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          image_url?: string | null
          segment_index?: number
          speaker?: string
          start_time?: string
          text?: string
          transcript_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_exports: {
        Row: {
          created_at: string
          duration: number | null
          file_size: number | null
          format: string | null
          id: string
          project_title: string
          resolution: string | null
          user_id: string
          video_url: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_size?: number | null
          format?: string | null
          id?: string
          project_title: string
          resolution?: string | null
          user_id: string
          video_url: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_size?: number | null
          format?: string | null
          id?: string
          project_title?: string
          resolution?: string | null
          user_id?: string
          video_url?: string
        }
        Relationships: []
      }
      user_products: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string
          id: string
          name: string
          url: string
          user_id: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string
          id?: string
          name: string
          url: string
          user_id: string
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string
          id?: string
          name?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_videos: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string
          duration: number | null
          id: string
          name: string
          url: string
          user_id: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          name: string
          url: string
          user_id: string
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string
          duration?: number | null
          id?: string
          name?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      user_voices: {
        Row: {
          cloudinary_public_id: string | null
          created_at: string
          duration: number
          elevenlabs_voice_id: string | null
          id: string
          name: string
          prompt: string | null
          source: string | null
          status: string
          type: string
          url: string
          user_id: string
        }
        Insert: {
          cloudinary_public_id?: string | null
          created_at?: string
          duration?: number
          elevenlabs_voice_id?: string | null
          id?: string
          name: string
          prompt?: string | null
          source?: string | null
          status?: string
          type?: string
          url: string
          user_id: string
        }
        Update: {
          cloudinary_public_id?: string | null
          created_at?: string
          duration?: number
          elevenlabs_voice_id?: string | null
          id?: string
          name?: string
          prompt?: string | null
          source?: string | null
          status?: string
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
