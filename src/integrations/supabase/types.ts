export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      auth_logs: {
        Row: {
          auth_method: string | null
          created_at: string | null
          failure_reason: string | null
          id: string
          ip_address: unknown | null
          nas_ip_address: unknown | null
          nas_port: number | null
          session_id: string | null
          success: boolean
          user_agent: string | null
          username: string
        }
        Insert: {
          auth_method?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          nas_ip_address?: unknown | null
          nas_port?: number | null
          session_id?: string | null
          success: boolean
          user_agent?: string | null
          username: string
        }
        Update: {
          auth_method?: string | null
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          ip_address?: unknown | null
          nas_ip_address?: unknown | null
          nas_port?: number | null
          session_id?: string | null
          success?: boolean
          user_agent?: string | null
          username?: string
        }
        Relationships: []
      }
      network_policies: {
        Row: {
          allowed_services: string[] | null
          created_at: string | null
          description: string | null
          destination_networks: string[] | null
          enabled: boolean | null
          id: string
          name: string
          priority: number | null
          source_networks: string[] | null
          time_restrictions: Json | null
          updated_at: string | null
          user_groups: string[] | null
        }
        Insert: {
          allowed_services?: string[] | null
          created_at?: string | null
          description?: string | null
          destination_networks?: string[] | null
          enabled?: boolean | null
          id?: string
          name: string
          priority?: number | null
          source_networks?: string[] | null
          time_restrictions?: Json | null
          updated_at?: string | null
          user_groups?: string[] | null
        }
        Update: {
          allowed_services?: string[] | null
          created_at?: string | null
          description?: string | null
          destination_networks?: string[] | null
          enabled?: boolean | null
          id?: string
          name?: string
          priority?: number | null
          source_networks?: string[] | null
          time_restrictions?: Json | null
          updated_at?: string | null
          user_groups?: string[] | null
        }
        Relationships: []
      }
      radius_servers: {
        Row: {
          cpu_usage: number | null
          created_at: string | null
          disk_usage: number | null
          id: string
          ip_address: unknown
          last_heartbeat: string | null
          memory_usage: number | null
          name: string
          port: number | null
          shared_secret: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cpu_usage?: number | null
          created_at?: string | null
          disk_usage?: number | null
          id?: string
          ip_address: unknown
          last_heartbeat?: string | null
          memory_usage?: number | null
          name: string
          port?: number | null
          shared_secret: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cpu_usage?: number | null
          created_at?: string | null
          disk_usage?: number | null
          id?: string
          ip_address?: unknown
          last_heartbeat?: string | null
          memory_usage?: number | null
          name?: string
          port?: number | null
          shared_secret?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      radius_sessions: {
        Row: {
          bytes_received: number | null
          bytes_sent: number | null
          end_time: string | null
          framed_ip_address: unknown | null
          id: string
          nas_ip_address: unknown | null
          nas_port: number | null
          session_duration: number | null
          session_id: string
          start_time: string | null
          status: string | null
          username: string
        }
        Insert: {
          bytes_received?: number | null
          bytes_sent?: number | null
          end_time?: string | null
          framed_ip_address?: unknown | null
          id?: string
          nas_ip_address?: unknown | null
          nas_port?: number | null
          session_duration?: number | null
          session_id: string
          start_time?: string | null
          status?: string | null
          username: string
        }
        Update: {
          bytes_received?: number | null
          bytes_sent?: number | null
          end_time?: string | null
          framed_ip_address?: unknown | null
          id?: string
          nas_ip_address?: unknown | null
          nas_port?: number | null
          session_duration?: number | null
          session_id?: string
          start_time?: string | null
          status?: string | null
          username?: string
        }
        Relationships: []
      }
      radius_users: {
        Row: {
          auth_methods: string[] | null
          created_at: string | null
          failed_attempts: number | null
          id: string
          last_login: string | null
          locked_until: string | null
          password_hash: string
          updated_at: string | null
          user_profile_id: string | null
          username: string
        }
        Insert: {
          auth_methods?: string[] | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_login?: string | null
          locked_until?: string | null
          password_hash: string
          updated_at?: string | null
          user_profile_id?: string | null
          username: string
        }
        Update: {
          auth_methods?: string[] | null
          created_at?: string | null
          failed_attempts?: number | null
          id?: string
          last_login?: string | null
          locked_until?: string | null
          password_hash?: string
          updated_at?: string | null
          user_profile_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "radius_users_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          full_name: string
          id: string
          role: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          full_name: string
          id: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          full_name?: string
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_user: {
        Args: {
          admin_email: string
          admin_password: string
          admin_name?: string
        }
        Returns: Json
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      promote_to_admin: {
        Args: { user_email: string }
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
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
