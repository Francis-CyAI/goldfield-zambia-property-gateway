export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action: string
          admin_user_id: string | null
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          id: string
          permissions: string[]
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: string[]
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: string[]
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          admin_type: string
          branch_location: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          permissions: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_type: string
          branch_location?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_type?: string
          branch_location?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          permissions?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          address: string
          application_fee: number
          application_type: string
          city: string
          country: string
          courses_interested: string | null
          created_at: string
          email: string
          experience: string | null
          first_name: string | null
          id: string
          institution_name: string | null
          last_name: string | null
          motivation: string | null
          payment_method: string | null
          payment_reference: string | null
          phone: string
          previous_education: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string | null
          status: string
          study_mode: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          application_fee: number
          application_type: string
          city: string
          country?: string
          courses_interested?: string | null
          created_at?: string
          email: string
          experience?: string | null
          first_name?: string | null
          id?: string
          institution_name?: string | null
          last_name?: string | null
          motivation?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          phone: string
          previous_education?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: string
          study_mode?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          application_fee?: number
          application_type?: string
          city?: string
          country?: string
          courses_interested?: string | null
          created_at?: string
          email?: string
          experience?: string | null
          first_name?: string | null
          id?: string
          institution_name?: string | null
          last_name?: string | null
          motivation?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          phone?: string
          previous_education?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: string
          study_mode?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
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
      booking_requests: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          expires_at: string
          guest_count: number
          guest_id: string
          host_id: string
          id: string
          message: string | null
          property_id: string
          status: string
          total_price: number | null
          updated_at: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          expires_at?: string
          guest_count?: number
          guest_id: string
          host_id: string
          id?: string
          message?: string | null
          property_id: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          expires_at?: string
          guest_count?: number
          guest_id?: string
          host_id?: string
          id?: string
          message?: string | null
          property_id?: string
          status?: string
          total_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
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
      branches: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          location: string
          manager_id: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          manager_id?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          manager_id?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content: string | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          module_id: string | null
          order_index: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          module_id?: string | null
          order_index?: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          module_id?: string | null
          order_index?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "course_modules"
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
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          course_id: string | null
          created_at: string
          id: string
          rating: number
          review_text: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          id?: string
          rating: number
          review_text?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          id?: string
          rating?: number
          review_text?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
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
      guest_inquiries: {
        Row: {
          check_in_date: string | null
          check_out_date: string | null
          created_at: string
          guest_count: number | null
          guest_id: string
          host_id: string
          id: string
          inquiry_type: string
          message: string
          property_id: string
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          guest_count?: number | null
          guest_id: string
          host_id: string
          id?: string
          inquiry_type?: string
          message: string
          property_id: string
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          check_in_date?: string | null
          check_out_date?: string | null
          created_at?: string
          guest_count?: number | null
          guest_id?: string
          host_id?: string
          id?: string
          inquiry_type?: string
          message?: string
          property_id?: string
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      host_earnings: {
        Row: {
          average_rate_kwacha: number
          created_at: string
          host_id: string
          id: string
          month: number
          occupancy_rate: number
          total_bookings: number
          total_earnings_kwacha: number
          total_earnings_usd: number
          updated_at: string
          year: number
        }
        Insert: {
          average_rate_kwacha?: number
          created_at?: string
          host_id: string
          id?: string
          month: number
          occupancy_rate?: number
          total_bookings?: number
          total_earnings_kwacha?: number
          total_earnings_usd?: number
          updated_at?: string
          year: number
        }
        Update: {
          average_rate_kwacha?: number
          created_at?: string
          host_id?: string
          id?: string
          month?: number
          occupancy_rate?: number
          total_bookings?: number
          total_earnings_kwacha?: number
          total_earnings_usd?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
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
      messages: {
        Row: {
          booking_id: string | null
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          property_id: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          booking_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          property_id?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          booking_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          property_id?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      partner_subscription_tiers: {
        Row: {
          created_at: string
          featured_placement: boolean | null
          features: string[]
          id: string
          max_listings: number | null
          monthly_price: number
          name: string
          priority_support: boolean | null
        }
        Insert: {
          created_at?: string
          featured_placement?: boolean | null
          features?: string[]
          id?: string
          max_listings?: number | null
          monthly_price: number
          name: string
          priority_support?: boolean | null
        }
        Update: {
          created_at?: string
          featured_placement?: boolean | null
          features?: string[]
          id?: string
          max_listings?: number | null
          monthly_price?: number
          name?: string
          priority_support?: boolean | null
        }
        Relationships: []
      }
      partner_subscriptions: {
        Row: {
          business_type: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          monthly_fee: number
          partner_name: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_type: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_fee?: number
          partner_name: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_type?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          monthly_fee?: number
          partner_name?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_records: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          enrollment_id: string | null
          id: string
          payment_date: string | null
          payment_method: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          enrollment_id?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          enrollment_id?: string | null
          id?: string
          payment_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_records_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_commissions: {
        Row: {
          booking_amount: number
          booking_id: string | null
          commission_amount: number
          commission_rate: number
          created_at: string
          host_id: string
          id: string
          processed_at: string | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_amount: number
          booking_id?: string | null
          commission_amount: number
          commission_rate?: number
          created_at?: string
          host_id: string
          id?: string
          processed_at?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_amount?: number
          booking_id?: string | null
          commission_amount?: number
          commission_rate?: number
          created_at?: string
          host_id?: string
          id?: string
          processed_at?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_commissions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
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
      property_amenities: {
        Row: {
          amenity_category: string | null
          amenity_name: string
          created_at: string
          id: string
          is_highlighted: boolean | null
          property_id: string
        }
        Insert: {
          amenity_category?: string | null
          amenity_name: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          property_id: string
        }
        Update: {
          amenity_category?: string | null
          amenity_name?: string
          created_at?: string
          id?: string
          is_highlighted?: boolean | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean
          minimum_stay: number | null
          price_override: number | null
          property_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean
          minimum_stay?: number | null
          price_override?: number | null
          property_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean
          minimum_stay?: number | null
          price_override?: number | null
          property_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_locations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string
          country: string
          created_at: string
          id: string
          latitude: number
          longitude: number
          postal_code: string | null
          property_id: string
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city: string
          country?: string
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          postal_code?: string | null
          property_id: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          postal_code?: string | null
          property_id?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_locations_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: true
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_payouts: {
        Row: {
          amount_kwacha: number
          amount_usd: number
          booking_id: string
          created_at: string
          exchange_rate: number
          host_id: string
          id: string
          payout_date: string
          payout_method: string
          property_id: string
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount_kwacha: number
          amount_usd: number
          booking_id: string
          created_at?: string
          exchange_rate: number
          host_id: string
          id?: string
          payout_date: string
          payout_method?: string
          property_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_kwacha?: number
          amount_usd?: number
          booking_id?: string
          created_at?: string
          exchange_rate?: number
          host_id?: string
          id?: string
          payout_date?: string
          payout_method?: string
          property_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_views: {
        Row: {
          id: string
          ip_address: unknown | null
          property_id: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          property_id: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          property_id?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          lesson_id: string | null
          max_score: number | null
          score: number | null
          student_id: string
          time_taken_minutes: number | null
        }
        Insert: {
          answers: Json
          completed_at?: string
          id?: string
          lesson_id?: string | null
          max_score?: number | null
          score?: number | null
          student_id: string
          time_taken_minutes?: number | null
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          lesson_id?: string | null
          max_score?: number | null
          score?: number | null
          student_id?: string
          time_taken_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          id: string
          lesson_id: string | null
          options: Json | null
          order_index: number
          points: number | null
          question_text: string
          question_type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          options?: Json | null
          order_index?: number
          points?: number | null
          question_text: string
          question_type?: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          options?: Json | null
          order_index?: number
          points?: number | null
          question_text?: string
          question_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
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
      saved_searches: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          notification_enabled: boolean | null
          search_criteria: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          notification_enabled?: boolean | null
          search_criteria: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          notification_enabled?: boolean | null
          search_criteria?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      student_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          enrollment_id: string | null
          id: string
          lesson_id: string | null
          student_id: string
          time_spent_minutes: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string | null
          id?: string
          lesson_id?: string | null
          student_id: string
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          enrollment_id?: string | null
          id?: string
          lesson_id?: string | null
          student_id?: string
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "student_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          analytics_access: boolean | null
          created_at: string
          features: string[]
          id: string
          max_bookings: number | null
          max_properties: number | null
          name: string
          price: number
          priority_support: boolean | null
        }
        Insert: {
          analytics_access?: boolean | null
          created_at?: string
          features?: string[]
          id?: string
          max_bookings?: number | null
          max_properties?: number | null
          name: string
          price: number
          priority_support?: boolean | null
        }
        Update: {
          analytics_access?: boolean | null
          created_at?: string
          features?: string[]
          id?: string
          max_bookings?: number | null
          max_properties?: number | null
          name?: string
          price?: number
          priority_support?: boolean | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read_at: string | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_tier_id: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier_id: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_tier_id?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_subscription_tier_id_fkey"
            columns: ["subscription_tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
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
      calculate_platform_commission: {
        Args: { booking_id: string; user_tier?: string }
        Returns: undefined
      }
      check_admin_permission: {
        Args: { user_id: string; required_type?: string }
        Returns: boolean
      }
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
      content_type: ["video", "document", "book", "assessment", "image"],
      enrollment_status: ["active", "inactive", "suspended", "completed"],
      user_role: ["student", "institution_admin", "super_admin"],
    },
  },
} as const
