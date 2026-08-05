export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brand: {
        Row: {
          id: string
          is_global: boolean
          name: string
          user_id: string | null
        }
        Insert: {
          id?: string
          is_global?: boolean
          name: string
          user_id?: string | null
        }
        Update: {
          id?: string
          is_global?: boolean
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      category: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          sort: number
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          sort?: number
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          sort?: number
        }
        Relationships: [
          {
            foreignKeyName: "category_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
        ]
      }
      color: {
        Row: {
          hex: string
          id: string
          name: string
        }
        Insert: {
          hex: string
          id?: string
          name: string
        }
        Update: {
          hex?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      fabric: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      image_asset: {
        Row: {
          bytes: number | null
          created_at: string
          height: number | null
          id: string
          mime: string | null
          storage_path: string
          type: Database["public"]["Enums"]["image_type"]
          user_id: string
          width: number | null
        }
        Insert: {
          bytes?: number | null
          created_at?: string
          height?: number | null
          id?: string
          mime?: string | null
          storage_path: string
          type: Database["public"]["Enums"]["image_type"]
          user_id: string
          width?: number | null
        }
        Update: {
          bytes?: number | null
          created_at?: string
          height?: number | null
          id?: string
          mime?: string | null
          storage_path?: string
          type?: Database["public"]["Enums"]["image_type"]
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "image_asset_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          avatar_asset_id: string | null
          created_at: string
          display_name: string | null
          email: string | null
          has_completed_onboarding: boolean
          id: string
          language: string
          theme_pref: Database["public"]["Enums"]["theme_pref"]
          units_pref: Database["public"]["Enums"]["units_pref"]
          updated_at: string
          view_density_pref: Database["public"]["Enums"]["view_density"]
        }
        Insert: {
          avatar_asset_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          has_completed_onboarding?: boolean
          id: string
          language?: string
          theme_pref?: Database["public"]["Enums"]["theme_pref"]
          units_pref?: Database["public"]["Enums"]["units_pref"]
          updated_at?: string
          view_density_pref?: Database["public"]["Enums"]["view_density"]
        }
        Update: {
          avatar_asset_id?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          has_completed_onboarding?: boolean
          id?: string
          language?: string
          theme_pref?: Database["public"]["Enums"]["theme_pref"]
          units_pref?: Database["public"]["Enums"]["units_pref"]
          updated_at?: string
          view_density_pref?: Database["public"]["Enums"]["view_density"]
        }
        Relationships: [
          {
            foreignKeyName: "profile_avatar_fk"
            columns: ["avatar_asset_id"]
            isOneToOne: false
            referencedRelation: "image_asset"
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
      ai_reco_status: "active" | "dismissed" | "applied"
      ai_reco_type:
        | "outfit_suggestion"
        | "forgotten_piece"
        | "packing_insight"
        | "wardrobe_insight"
        | "wardrobe_whisper"
        | "texture_clash"
        | "nudge"
      garment_status: "processing" | "active" | "archived"
      image_type: "original" | "processed" | "avatar" | "outfit_cover"
      season: "spring" | "summer" | "fall" | "winter"
      theme_pref: "light" | "dark" | "system"
      trip_status: "upcoming" | "active" | "past"
      units_pref: "metric" | "imperial"
      view_density: "editorial" | "compact" | "categories"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      ai_reco_status: ["active", "dismissed", "applied"],
      ai_reco_type: [
        "outfit_suggestion",
        "forgotten_piece",
        "packing_insight",
        "wardrobe_insight",
        "wardrobe_whisper",
        "texture_clash",
        "nudge",
      ],
      garment_status: ["processing", "active", "archived"],
      image_type: ["original", "processed", "avatar", "outfit_cover"],
      season: ["spring", "summer", "fall", "winter"],
      theme_pref: ["light", "dark", "system"],
      trip_status: ["upcoming", "active", "past"],
      units_pref: ["metric", "imperial"],
      view_density: ["editorial", "compact", "categories"],
    },
  },
} as const

