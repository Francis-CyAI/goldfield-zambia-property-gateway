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
      assessment_submissions: {
        Row: {
          answers: Json | null
          assessment_id: string | null
          feedback: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          student_id: string | null
          submitted_at: string
        }
        Insert: {
          answers?: Json | null
          assessment_id?: string | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          submitted_at?: string
        }
        Update: {
          answers?: Json | null
          assessment_id?: string | null
          feedback?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          student_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_submissions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          passing_marks: number | null
          questions: Json | null
          time_limit_minutes: number | null
          title: string
          total_marks: number | null
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          passing_marks?: number | null
          questions?: Json | null
          time_limit_minutes?: number | null
          title: string
          total_marks?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          passing_marks?: number | null
          questions?: Json | null
          time_limit_minutes?: number | null
          title?: string
          total_marks?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          check_in: string
          check_out: string
          created_at: string | null
          guest_count: number
          guest_id: string
          id: string
          property_id: string
          status: string | null
          total_price: number
          updated_at: string | null
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string | null
          guest_count?: number
          guest_id: string
          id?: string
          property_id: string
          status?: string | null
          total_price: number
          updated_at?: string | null
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string | null
          guest_count?: number
          guest_id?: string
          id?: string
          property_id?: string
          status?: string | null
          total_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_guest_id"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_materials: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          course_id: string | null
          created_at: string
          description: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_public: boolean | null
          mime_type: string | null
          order_index: number | null
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          order_index?: number | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          course_id?: string | null
          created_at?: string
          description?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          order_index?: number | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          duration_weeks: number | null
          id: string
          institution_id: string | null
          instructor_name: string | null
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          institution_id?: string | null
          instructor_name?: string | null
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_weeks?: number | null
          id?: string
          institution_id?: string | null
          instructor_name?: string | null
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          student_limit: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          student_limit?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          student_limit?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          institution_id: string | null
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          institution_id?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          institution_id?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_institution"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          amenities: Json | null
          bathrooms: number
          bedrooms: number
          created_at: string | null
          description: string | null
          host_id: string
          id: string
          images: Json | null
          is_active: boolean | null
          location: string
          max_guests: number
          price_per_night: number
          property_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amenities?: Json | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string | null
          description?: string | null
          host_id: string
          id?: string
          images?: Json | null
          is_active?: boolean | null
          location: string
          max_guests?: number
          price_per_night: number
          property_type?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amenities?: Json | null
          bathrooms?: number
          bedrooms?: number
          created_at?: string | null
          description?: string | null
          host_id?: string
          id?: string
          images?: Json | null
          is_active?: boolean | null
          location?: string
          max_guests?: number
          price_per_night?: number
          property_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_properties_host_id"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          booking_id: string | null
          comment: string | null
          created_at: string | null
          guest_id: string
          id: string
          property_id: string
          rating: number
        }
        Insert: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guest_id: string
          id?: string
          property_id: string
          rating: number
        }
        Update: {
          booking_id?: string | null
          comment?: string | null
          created_at?: string | null
          guest_id?: string
          id?: string
          property_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_reviews_guest_id"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string | null
          enrollment_date: string
          id: string
          institution_id: string | null
          progress_percentage: number | null
          status: Database["public"]["Enums"]["enrollment_status"] | null
          student_id: string | null
          unique_student_id: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          enrollment_date?: string
          id?: string
          institution_id?: string | null
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: string | null
          unique_student_id?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          enrollment_date?: string
          id?: string
          institution_id?: string | null
          progress_percentage?: number | null
          status?: Database["public"]["Enums"]["enrollment_status"] | null
          student_id?: string | null
          unique_student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrollments_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_wishlists_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      content_type: "video" | "document" | "book" | "assessment" | "image"
      enrollment_status: "active" | "inactive" | "suspended" | "completed"
      user_role: "student" | "institution_admin" | "super_admin"
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
    Enums: {
      content_type: ["video", "document", "book", "assessment", "image"],
      enrollment_status: ["active", "inactive", "suspended", "completed"],
      user_role: ["student", "institution_admin", "super_admin"],
    },
  },
} as const
