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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          created_at: string
          id: string
          line: string
          ref: string
          user_id: string
          zone: string
        }
        Insert: {
          created_at?: string
          id?: string
          line: string
          ref?: string
          user_id: string
          zone: string
        }
        Update: {
          created_at?: string
          id?: string
          line?: string
          ref?: string
          user_id?: string
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      categories: {
        Row: {
          description: string
          id: string
          image_url: string | null
          name: string
          sort_order: number
        }
        Insert: {
          description?: string
          id: string
          image_url?: string | null
          name: string
          sort_order?: number
        }
        Update: {
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      opinions: {
        Row: {
          armo_sin_ayuda: boolean | null
          carrito_resumen: string | null
          codigo_encuestador: string | null
          comentario: string | null
          comment: string | null
          created_at: string
          id: string
          lo_usaria: string | null
          name: string | null
          order_code: string | null
          precio_justo: string | null
          rating: number | null
          satisfaccion: number | null
          servicio_preferido: string | null
          tiempo_segundos: number | null
          whatsapp: string | null
          zona: string | null
        }
        Insert: {
          armo_sin_ayuda?: boolean | null
          carrito_resumen?: string | null
          codigo_encuestador?: string | null
          comentario?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          lo_usaria?: string | null
          name?: string | null
          order_code?: string | null
          precio_justo?: string | null
          rating?: number | null
          satisfaccion?: number | null
          servicio_preferido?: string | null
          tiempo_segundos?: number | null
          whatsapp?: string | null
          zona?: string | null
        }
        Update: {
          armo_sin_ayuda?: boolean | null
          carrito_resumen?: string | null
          codigo_encuestador?: string | null
          comentario?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          lo_usaria?: string | null
          name?: string | null
          order_code?: string | null
          precio_justo?: string | null
          rating?: number | null
          satisfaccion?: number | null
          servicio_preferido?: string | null
          tiempo_segundos?: number | null
          whatsapp?: string | null
          zona?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opinions_order_code_fkey"
            columns: ["order_code"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["code"]
          },
        ]
      }
      order_items_photos: {
        Row: {
          client_comment: string | null
          id: string
          item_index: number
          order_code: string
          photo_url: string | null
          real_price: number | null
          responded_at: string | null
          status: string
          updated_at: string
          uploaded_at: string
        }
        Insert: {
          client_comment?: string | null
          id?: string
          item_index: number
          order_code: string
          photo_url?: string | null
          real_price?: number | null
          responded_at?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string
        }
        Update: {
          client_comment?: string | null
          id?: string
          item_index?: number
          order_code?: string
          photo_url?: string | null
          real_price?: number | null
          responded_at?: string | null
          status?: string
          updated_at?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_photos_order_code_fkey"
            columns: ["order_code"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["code"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          business: string
          code: string
          contact: string
          created_at: string
          delivery_date: string | null
          doc_number: string | null
          doc_type: string | null
          history: Json
          id: string
          items: Json
          packages: number
          payment_method: string | null
          payment_plan: string | null
          payment_status: string
          phone: string
          reference: string | null
          service: string
          service_fee: number
          shipping_fee: number
          slot: string | null
          status: string
          subtotal: number
          taxi: Json | null
          total: number
          user_id: string | null
          weight_kg: number
          zone: string | null
        }
        Insert: {
          address?: string | null
          business: string
          code?: string
          contact: string
          created_at?: string
          delivery_date?: string | null
          doc_number?: string | null
          doc_type?: string | null
          history?: Json
          id?: string
          items?: Json
          packages?: number
          payment_method?: string | null
          payment_plan?: string | null
          payment_status?: string
          phone: string
          reference?: string | null
          service: string
          service_fee?: number
          shipping_fee?: number
          slot?: string | null
          status?: string
          subtotal?: number
          taxi?: Json | null
          total?: number
          user_id?: string | null
          weight_kg?: number
          zone?: string | null
        }
        Update: {
          address?: string | null
          business?: string
          code?: string
          contact?: string
          created_at?: string
          delivery_date?: string | null
          doc_number?: string | null
          doc_type?: string | null
          history?: Json
          id?: string
          items?: Json
          packages?: number
          payment_method?: string | null
          payment_plan?: string | null
          payment_status?: string
          phone?: string
          reference?: string | null
          service?: string
          service_fee?: number
          shipping_fee?: number
          slot?: string | null
          status?: string
          subtotal?: number
          taxi?: Json | null
          total?: number
          user_id?: string | null
          weight_kg?: number
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          availability: string
          category_id: string | null
          description: string
          format: string
          id: string
          image_url: string | null
          name: string
          photo_type: string | null
          price: number
          quality: string
          unit: string
          updated_at: string
          vendor_id: string
          weight_kg: number
        }
        Insert: {
          active?: boolean
          availability?: string
          category_id?: string | null
          description?: string
          format: string
          id?: string
          image_url?: string | null
          name: string
          photo_type?: string | null
          price?: number
          quality?: string
          unit: string
          updated_at?: string
          vendor_id: string
          weight_kg?: number
        }
        Update: {
          active?: boolean
          availability?: string
          category_id?: string | null
          description?: string
          format?: string
          id?: string
          image_url?: string | null
          name?: string
          photo_type?: string | null
          price?: number
          quality?: string
          unit?: string
          updated_at?: string
          vendor_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string
          created_at: string
          doc_number: string
          doc_type: string
          owner_name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_name?: string
          created_at?: string
          doc_number?: string
          doc_type?: string
          owner_name?: string
          phone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_name?: string
          created_at?: string
          doc_number?: string
          doc_type?: string
          owner_name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          address: string
          attachment_name: string | null
          attachment_path: string | null
          business: string
          code: string
          contact: string
          created_at: string
          delivery_date: string
          id: string
          items: Json
          phone: string
          reference: string | null
          status: string
          user_id: string | null
          zone: string
        }
        Insert: {
          address: string
          attachment_name?: string | null
          attachment_path?: string | null
          business: string
          code: string
          contact: string
          created_at?: string
          delivery_date: string
          id?: string
          items?: Json
          phone: string
          reference?: string | null
          status?: string
          user_id?: string | null
          zone: string
        }
        Update: {
          address?: string
          attachment_name?: string | null
          attachment_path?: string | null
          business?: string
          code?: string
          contact?: string
          created_at?: string
          delivery_date?: string
          id?: string
          items?: Json
          phone?: string
          reference?: string | null
          status?: string
          user_id?: string | null
          zone?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      settings: {
        Row: {
          id: number
          tariffs: Json
          updated_at: string
          whatsapp: string
        }
        Insert: {
          id?: number
          tariffs: Json
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          id?: number
          tariffs?: Json
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      taxis: {
        Row: {
          created_at: string
          driver: string
          id: string
          phone: string
          plate: string
          user_id: string
        }
        Insert: {
          created_at?: string
          driver: string
          id?: string
          phone?: string
          plate: string
          user_id: string
        }
        Update: {
          created_at?: string
          driver?: string
          id?: string
          phone?: string
          plate?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taxis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      vendors: {
        Row: {
          active: boolean
          contact: string
          id: string
          name: string
          pavilion: string
          phone: string
          rating: number
          schedule: string
          specialty: string
          stall: string
          verified: boolean
        }
        Insert: {
          active?: boolean
          contact?: string
          id: string
          name: string
          pavilion?: string
          phone?: string
          rating?: number
          schedule?: string
          specialty?: string
          stall?: string
          verified?: boolean
        }
        Update: {
          active?: boolean
          contact?: string
          id?: string
          name?: string
          pavilion?: string
          phone?: string
          rating?: number
          schedule?: string
          specialty?: string
          stall?: string
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_dashboard: { Args: never; Returns: Json }
      create_order: { Args: { p: Json }; Returns: string }
      get_order_by_code: {
        Args: { _code: string }
        Returns: {
          address: string | null
          business: string
          code: string
          contact: string
          created_at: string
          delivery_date: string | null
          doc_number: string | null
          doc_type: string | null
          history: Json
          id: string
          items: Json
          packages: number
          payment_method: string | null
          payment_plan: string | null
          payment_status: string
          phone: string
          reference: string | null
          service: string
          service_fee: number
          shipping_fee: number
          slot: string | null
          status: string
          subtotal: number
          taxi: Json | null
          total: number
          user_id: string | null
          weight_kg: number
          zone: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_order_photos: {
        Args: { _code: string }
        Returns: {
          client_comment: string | null
          id: string
          item_index: number
          order_code: string
          photo_url: string | null
          real_price: number | null
          responded_at: string | null
          status: string
          updated_at: string
          uploaded_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "order_items_photos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      respond_photo: {
        Args: {
          _approve: boolean
          _code: string
          _comment?: string
          _item_index: number
        }
        Returns: string
      }
      top_products: {
        Args: { _days?: number; _limit?: number }
        Returns: {
          product_id: string
          units: number
        }[]
      }
      valid_address: { Args: { v: string }; Returns: boolean }
      valid_person: { Args: { v: string }; Returns: boolean }
      valid_served_zone: { Args: { v: string }; Returns: boolean }
      validate_delivery_day: { Args: { v: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
