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
      ai_recommendation: {
        Row: {
          context: Json
          created_at: string
          garment_id: string | null
          id: string
          message: string | null
          outfit_id: string | null
          status: Database["public"]["Enums"]["ai_reco_status"]
          trip_id: string | null
          type: Database["public"]["Enums"]["ai_reco_type"]
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          garment_id?: string | null
          id?: string
          message?: string | null
          outfit_id?: string | null
          status?: Database["public"]["Enums"]["ai_reco_status"]
          trip_id?: string | null
          type: Database["public"]["Enums"]["ai_reco_type"]
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: string
          garment_id?: string | null
          id?: string
          message?: string | null
          outfit_id?: string | null
          status?: Database["public"]["Enums"]["ai_reco_status"]
          trip_id?: string | null
          type?: Database["public"]["Enums"]["ai_reco_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendation_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendation_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendation_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_recommendation_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
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
      collection: {
        Row: {
          created_at: string
          id: string
          is_ai_generated: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_ai_generated?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_item: {
        Row: {
          collection_id: string
          garment_id: string
        }
        Insert: {
          collection_id: string
          garment_id: string
        }
        Update: {
          collection_id?: string
          garment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_item_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collection"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_item_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garment"
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
      garment: {
        Row: {
          brand_id: string | null
          category_id: string
          created_at: string
          deleted_at: string | null
          embedding: string | null
          id: string
          is_favorite: boolean
          last_worn_at: string | null
          name: string
          original_image_id: string | null
          primary_color_id: string
          processed_image_id: string | null
          purchase_price: number | null
          season: Database["public"]["Enums"]["season"] | null
          status: Database["public"]["Enums"]["garment_status"]
          style: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          category_id: string
          created_at?: string
          deleted_at?: string | null
          embedding?: string | null
          id?: string
          is_favorite?: boolean
          last_worn_at?: string | null
          name: string
          original_image_id?: string | null
          primary_color_id: string
          processed_image_id?: string | null
          purchase_price?: number | null
          season?: Database["public"]["Enums"]["season"] | null
          status?: Database["public"]["Enums"]["garment_status"]
          style?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string
          created_at?: string
          deleted_at?: string | null
          embedding?: string | null
          id?: string
          is_favorite?: boolean
          last_worn_at?: string | null
          name?: string
          original_image_id?: string | null
          primary_color_id?: string
          processed_image_id?: string | null
          purchase_price?: number | null
          season?: Database["public"]["Enums"]["season"] | null
          status?: Database["public"]["Enums"]["garment_status"]
          style?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garment_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_original_image_id_fkey"
            columns: ["original_image_id"]
            isOneToOne: false
            referencedRelation: "image_asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_primary_color_id_fkey"
            columns: ["primary_color_id"]
            isOneToOne: false
            referencedRelation: "color"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_processed_image_id_fkey"
            columns: ["processed_image_id"]
            isOneToOne: false
            referencedRelation: "image_asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      garment_fabric: {
        Row: {
          fabric_id: string
          garment_id: string
        }
        Insert: {
          fabric_id: string
          garment_id: string
        }
        Update: {
          fabric_id?: string
          garment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "garment_fabric_fabric_id_fkey"
            columns: ["fabric_id"]
            isOneToOne: false
            referencedRelation: "fabric"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "garment_fabric_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garment"
            referencedColumns: ["id"]
          },
        ]
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
      outfit: {
        Row: {
          cover_image_id: string | null
          created_at: string
          id: string
          match_score: number | null
          name: string | null
          occasion: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cover_image_id?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          name?: string | null
          occasion?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cover_image_id?: string | null
          created_at?: string
          id?: string
          match_score?: number | null
          name?: string | null
          occasion?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_cover_image_id_fkey"
            columns: ["cover_image_id"]
            isOneToOne: false
            referencedRelation: "image_asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_item: {
        Row: {
          garment_id: string
          id: string
          outfit_id: string
          pos_x: number
          pos_y: number
          rotation: number
          scale: number
          z_index: number
        }
        Insert: {
          garment_id: string
          id?: string
          outfit_id: string
          pos_x?: number
          pos_y?: number
          rotation?: number
          scale?: number
          z_index?: number
        }
        Update: {
          garment_id?: string
          id?: string
          outfit_id?: string
          pos_x?: number
          pos_y?: number
          rotation?: number
          scale?: number
          z_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "outfit_item_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_item_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit"
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
      style_preference: {
        Row: {
          id: string
          tag: string
          user_id: string
        }
        Insert: {
          id?: string
          tag: string
          user_id: string
        }
        Update: {
          id?: string
          tag?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "style_preference_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      trip: {
        Row: {
          created_at: string
          destination: string
          end_date: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["trip_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          end_date: string
          id?: string
          start_date: string
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          end_date?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["trip_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_day: {
        Row: {
          date: string
          id: string
          is_outfit_complete: boolean
          label: string | null
          outfit_id: string | null
          trip_id: string
        }
        Insert: {
          date: string
          id?: string
          is_outfit_complete?: boolean
          label?: string | null
          outfit_id?: string | null
          trip_id: string
        }
        Update: {
          date?: string
          id?: string
          is_outfit_complete?: boolean
          label?: string | null
          outfit_id?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_day_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfit"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_day_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_garment: {
        Row: {
          garment_id: string
          trip_id: string
        }
        Insert: {
          garment_id: string
          trip_id: string
        }
        Update: {
          garment_id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_garment_garment_id_fkey"
            columns: ["garment_id"]
            isOneToOne: false
            referencedRelation: "garment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_garment_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_snapshot: {
        Row: {
          condition: string | null
          date: string
          fetched_at: string
          id: string
          location: string | null
          temp_c: number | null
          trip_id: string | null
        }
        Insert: {
          condition?: string | null
          date: string
          fetched_at?: string
          id?: string
          location?: string | null
          temp_c?: number | null
          trip_id?: string | null
        }
        Update: {
          condition?: string | null
          date?: string
          fetched_at?: string
          id?: string
          location?: string | null
          temp_c?: number | null
          trip_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_snapshot_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trip"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_outfit_to_day: {
        Args: { p_date: string; p_outfit: string; p_trip: string }
        Returns: string
      }
      save_outfit: { Args: { items: Json; name: string }; Returns: string }
      search_garments: {
        Args: { match_count?: number; query_embedding: string }
        Returns: {
          id: string
          similarity: number
        }[]
      }
      soft_delete_garment: { Args: { g: string }; Returns: undefined }
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

