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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          caption: string | null
          company_id: string
          created_at: string
          daily_report_id: string | null
          daily_report_sector_id: string | null
          deleted_at: string | null
          description: string | null
          display_order: number | null
          file_name: string
          file_size_bytes: number | null
          file_type: string
          id: string
          latitude: number | null
          location_label: string | null
          longitude: number | null
          mime_type: string | null
          occurrence_id: string | null
          original_name: string
          project_id: string
          sector: Database["public"]["Enums"]["sector_type"] | null
          storage_path: string
          uploader_id: string | null
        }
        Insert: {
          caption?: string | null
          company_id: string
          created_at?: string
          daily_report_id?: string | null
          daily_report_sector_id?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          file_name: string
          file_size_bytes?: number | null
          file_type: string
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          mime_type?: string | null
          occurrence_id?: string | null
          original_name: string
          project_id: string
          sector?: Database["public"]["Enums"]["sector_type"] | null
          storage_path: string
          uploader_id?: string | null
        }
        Update: {
          caption?: string | null
          company_id?: string
          created_at?: string
          daily_report_id?: string | null
          daily_report_sector_id?: string | null
          deleted_at?: string | null
          description?: string | null
          display_order?: number | null
          file_name?: string
          file_size_bytes?: number | null
          file_type?: string
          id?: string
          latitude?: number | null
          location_label?: string | null
          longitude?: number | null
          mime_type?: string | null
          occurrence_id?: string | null
          original_name?: string
          project_id?: string
          sector?: Database["public"]["Enums"]["sector_type"] | null
          storage_path?: string
          uploader_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_daily_report_sector_id_fkey"
            columns: ["daily_report_sector_id"]
            isOneToOne: false
            referencedRelation: "daily_report_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_occurrence_id_fkey"
            columns: ["occurrence_id"]
            isOneToOne: false
            referencedRelation: "occurrences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          company_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          company_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      concrete_control: {
        Row: {
          id: string
          company_id: string
          project_id: string
          daily_report_id: string
          molding_date: string
          structural_element: string
          supplier: string | null
          concrete_class: string | null
          slump: number | null
          volume: number | null
          delivery_note: string | null
          test_age_1: number | null
          strength_1: number | null
          test_age_2: number | null
          strength_2: number | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          project_id: string
          daily_report_id: string
          molding_date: string
          structural_element: string
          supplier?: string | null
          concrete_class?: string | null
          slump?: number | null
          volume?: number | null
          delivery_note?: string | null
          test_age_1?: number | null
          strength_1?: number | null
          test_age_2?: number | null
          strength_2?: number | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          project_id?: string
          daily_report_id?: string
          molding_date?: string
          structural_element?: string
          supplier?: string | null
          concrete_class?: string | null
          slump?: number | null
          volume?: number | null
          delivery_note?: string | null
          test_age_1?: number | null
          strength_1?: number | null
          test_age_2?: number | null
          strength_2?: number | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "concrete_control_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concrete_control_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concrete_control_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          }
        ]
      }
      companies: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          responsible: string | null
          state: string | null
          status: Database["public"]["Enums"]["company_status"]
          trade_name: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          responsible?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          responsible?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["company_status"]
          trade_name?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          allowed_image_types: string[]
          allowed_video_types: string[]
          company_id: string
          created_at: string
          id: string
          max_image_size_mb: number
          max_pdf_size_mb: number
          max_video_size_mb: number
          updated_at: string
        }
        Insert: {
          allowed_image_types?: string[]
          allowed_video_types?: string[]
          company_id: string
          created_at?: string
          id?: string
          max_image_size_mb?: number
          max_pdf_size_mb?: number
          max_video_size_mb?: number
          updated_at?: string
        }
        Update: {
          allowed_image_types?: string[]
          allowed_video_types?: string[]
          company_id?: string
          created_at?: string
          id?: string
          max_image_size_mb?: number
          max_pdf_size_mb?: number
          max_video_size_mb?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_report_sectors: {
        Row: {
          actions_taken: string | null
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string
          executed_activities: string | null
          general_observations: string | null
          id: string
          next_day_forecast: string | null
          sector: Database["public"]["Enums"]["sector_type"]
          safety_metrics: Json | null
          status: Database["public"]["Enums"]["report_status"]
          team_description: string | null
          updated_at: string
          updated_by: string | null
          work_front: string | null
        }
        Insert: {
          actions_taken?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id: string
          executed_activities?: string | null
          general_observations?: string | null
          id?: string
          next_day_forecast?: string | null
          sector: Database["public"]["Enums"]["sector_type"]
          safety_metrics?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
          team_description?: string | null
          updated_at?: string
          updated_by?: string | null
          work_front?: string | null
        }
        Update: {
          actions_taken?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string
          executed_activities?: string | null
          general_observations?: string | null
          id?: string
          next_day_forecast?: string | null
          sector?: Database["public"]["Enums"]["sector_type"]
          safety_metrics?: Json | null
          status?: Database["public"]["Enums"]["report_status"]
          team_description?: string | null
          updated_at?: string
          updated_by?: string | null
          work_front?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_report_sectors_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_sectors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_sectors_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_report_sectors_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_reports: {
        Row: {
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          day_of_week: string | null
          day_situation: Database["public"]["Enums"]["day_situation"] | null
          deleted_at: string | null
          end_time: string | null
          general_observations: string | null
          had_rain: boolean | null
          id: string
          project_id: string
          rain_period: string | null
          report_date: string
          report_number: number | null
          reviewed_by: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["report_status"]
          temperature: number | null
          updated_at: string
          updated_by: string | null
          version: number
          weather_afternoon:
            | Database["public"]["Enums"]["weather_condition"]
            | null
          weather_morning:
            | Database["public"]["Enums"]["weather_condition"]
            | null
        }
        Insert: {
          approved_by?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          day_of_week?: string | null
          day_situation?: Database["public"]["Enums"]["day_situation"] | null
          deleted_at?: string | null
          end_time?: string | null
          general_observations?: string | null
          had_rain?: boolean | null
          id?: string
          project_id: string
          rain_period?: string | null
          report_date: string
          report_number?: number | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          temperature?: number | null
          updated_at?: string
          updated_by?: string | null
          version?: number
          weather_afternoon?:
            | Database["public"]["Enums"]["weather_condition"]
            | null
          weather_morning?:
            | Database["public"]["Enums"]["weather_condition"]
            | null
        }
        Update: {
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          day_of_week?: string | null
          day_situation?: Database["public"]["Enums"]["day_situation"] | null
          deleted_at?: string | null
          end_time?: string | null
          general_observations?: string | null
          had_rain?: boolean | null
          id?: string
          project_id?: string
          rain_period?: string | null
          report_date?: string
          report_number?: number | null
          reviewed_by?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          temperature?: number | null
          updated_at?: string
          updated_by?: string | null
          version?: number
          weather_afternoon?:
            | Database["public"]["Enums"]["weather_condition"]
            | null
          weather_morning?:
            | Database["public"]["Enums"]["weather_condition"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_reports_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_entries: {
        Row: {
          company_id: string
          created_at: string
          daily_report_id: string
          hours_used: number | null
          id: string
          identifier: string | null
          name: string
          observations: string | null
          owner_company: string | null
          quantity: number
          sector: Database["public"]["Enums"]["sector_type"] | null
          status: Database["public"]["Enums"]["equipment_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          daily_report_id: string
          hours_used?: number | null
          id?: string
          identifier?: string | null
          name: string
          observations?: string | null
          owner_company?: string | null
          quantity?: number
          sector?: Database["public"]["Enums"]["sector_type"] | null
          status?: Database["public"]["Enums"]["equipment_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          daily_report_id?: string
          hours_used?: number | null
          id?: string
          identifier?: string | null
          name?: string
          observations?: string | null
          owner_company?: string | null
          quantity?: number
          sector?: Database["public"]["Enums"]["sector_type"] | null
          status?: Database["public"]["Enums"]["equipment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "equipment_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_entries_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          company_id: string
          created_at: string | null
          created_by: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          status: string
          token: string
          updated_at: string | null
        }
        Insert: {
          accepted_at?: string | null
          company_id: string
          created_at?: string | null
          created_by?: string | null
          email: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          token?: string
          updated_at?: string | null
        }
        Update: {
          accepted_at?: string | null
          company_id?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          token?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      material_entries: {
        Row: {
          company_id: string
          created_at: string
          daily_report_id: string
          id: string
          invoice_number: string | null
          material_name: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          observations: string | null
          quantity: number
          sector: Database["public"]["Enums"]["sector_type"] | null
          storage_location: string | null
          supplier: string | null
          unit: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          daily_report_id: string
          id?: string
          invoice_number?: string | null
          material_name: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          observations?: string | null
          quantity: number
          sector?: Database["public"]["Enums"]["sector_type"] | null
          storage_location?: string | null
          supplier?: string | null
          unit?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          daily_report_id?: string
          id?: string
          invoice_number?: string | null
          material_name?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          observations?: string | null
          quantity?: number
          sector?: Database["public"]["Enums"]["sector_type"] | null
          storage_location?: string | null
          supplier?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "material_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_entries_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          company_id: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          company_id: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          company_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      occurrences: {
        Row: {
          action_taken: string | null
          category: Database["public"]["Enums"]["occurrence_category"]
          company_id: string
          created_at: string
          created_by: string | null
          daily_report_id: string | null
          deleted_at: string | null
          description: string
          id: string
          occurred_at: string | null
          project_id: string
          resolution_deadline: string | null
          responsible: string | null
          sector: Database["public"]["Enums"]["sector_type"] | null
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["occurrence_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action_taken?: string | null
          category: Database["public"]["Enums"]["occurrence_category"]
          company_id: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string | null
          deleted_at?: string | null
          description: string
          id?: string
          occurred_at?: string | null
          project_id: string
          resolution_deadline?: string | null
          responsible?: string | null
          sector?: Database["public"]["Enums"]["sector_type"] | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["occurrence_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action_taken?: string | null
          category?: Database["public"]["Enums"]["occurrence_category"]
          company_id?: string
          created_at?: string
          created_by?: string | null
          daily_report_id?: string | null
          deleted_at?: string | null
          description?: string
          id?: string
          occurred_at?: string | null
          project_id?: string
          resolution_deadline?: string | null
          responsible?: string | null
          sector?: Database["public"]["Enums"]["sector_type"] | null
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["occurrence_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "occurrences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "occurrences_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_id: string | null
          created_at: string
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_id?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          can_approve: boolean
          can_edit: boolean
          can_export_pdf: boolean
          can_view: boolean
          company_id: string
          created_at: string
          end_date: string | null
          id: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          sector: Database["public"]["Enums"]["sector_type"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          can_approve?: boolean
          can_edit?: boolean
          can_export_pdf?: boolean
          can_view?: boolean
          company_id: string
          created_at?: string
          end_date?: string | null
          id?: string
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          sector?: Database["public"]["Enums"]["sector_type"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          can_approve?: boolean
          can_edit?: boolean
          can_export_pdf?: boolean
          can_view?: boolean
          company_id?: string
          created_at?: string
          end_date?: string | null
          id?: string
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          sector?: Database["public"]["Enums"]["sector_type"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          address: string | null
          agreement_number: string | null
          art_rrt_number: string | null
          city: string | null
          client: string | null
          cnpj_contractor: string | null
          code: string | null
          company_id: string
          completion_pct: number | null
          contract_number: string | null
          contract_value: number | null
          contractor: string | null
          cover_image_url: string | null
          crea_cau: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          fiscal_responsible: string | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          observations: string | null
          planned_end: string | null
          planned_start: string | null
          state: string | null
          status: Database["public"]["Enums"]["project_status"]
          technical_responsible: string | null
          updated_at: string
          updated_by: string | null
          zip_code: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          address?: string | null
          agreement_number?: string | null
          art_rrt_number?: string | null
          city?: string | null
          client?: string | null
          cnpj_contractor?: string | null
          code?: string | null
          company_id: string
          completion_pct?: number | null
          contract_number?: string | null
          contract_value?: number | null
          contractor?: string | null
          cover_image_url?: string | null
          crea_cau?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          fiscal_responsible?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          observations?: string | null
          planned_end?: string | null
          planned_start?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          technical_responsible?: string | null
          updated_at?: string
          updated_by?: string | null
          zip_code?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          address?: string | null
          agreement_number?: string | null
          art_rrt_number?: string | null
          city?: string | null
          client?: string | null
          cnpj_contractor?: string | null
          code?: string | null
          company_id?: string
          completion_pct?: number | null
          contract_number?: string | null
          contract_value?: number | null
          contractor?: string | null
          cover_image_url?: string | null
          crea_cau?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          fiscal_responsible?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          observations?: string | null
          planned_end?: string | null
          planned_start?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          technical_responsible?: string | null
          updated_at?: string
          updated_by?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      report_activities: {
        Row: {
          company_id: string
          created_at: string
          daily_report_sector_id: string
          description: string
          end_time: string | null
          id: string
          location: string | null
          observations: string | null
          order_index: number | null
          percentage: number | null
          quantity: number | null
          responsible: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["activity_status"]
          unit: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          daily_report_sector_id: string
          description: string
          end_time?: string | null
          id?: string
          location?: string | null
          observations?: string | null
          order_index?: number | null
          percentage?: number | null
          quantity?: number | null
          responsible?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["activity_status"]
          unit?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          daily_report_sector_id?: string
          description?: string
          end_time?: string | null
          id?: string
          location?: string | null
          observations?: string | null
          order_index?: number | null
          percentage?: number | null
          quantity?: number | null
          responsible?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["activity_status"]
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_activities_daily_report_sector_id_fkey"
            columns: ["daily_report_sector_id"]
            isOneToOne: false
            referencedRelation: "daily_report_sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      report_reviews: {
        Row: {
          action: Database["public"]["Enums"]["review_action"]
          company_id: string
          created_at: string
          daily_report_id: string
          daily_report_sector_id: string | null
          id: string
          notes: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["review_action"]
          company_id: string
          created_at?: string
          daily_report_id: string
          daily_report_sector_id?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["review_action"]
          company_id?: string
          created_at?: string
          daily_report_id?: string
          daily_report_sector_id?: string | null
          id?: string
          notes?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_reviews_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_reviews_daily_report_sector_id_fkey"
            columns: ["daily_report_sector_id"]
            isOneToOne: false
            referencedRelation: "daily_report_sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workforce_entries: {
        Row: {
          company_id: string
          company_name: string | null
          created_at: string
          daily_report_id: string
          hours_worked: number | null
          id: string
          observations: string | null
          quantity: number
          role: string
          sector: Database["public"]["Enums"]["sector_type"] | null
        }
        Insert: {
          company_id: string
          company_name?: string | null
          created_at?: string
          daily_report_id: string
          hours_worked?: number | null
          id?: string
          observations?: string | null
          quantity?: number
          role: string
          sector?: Database["public"]["Enums"]["sector_type"] | null
        }
        Update: {
          company_id?: string
          company_name?: string | null
          created_at?: string
          daily_report_id?: string
          hours_worked?: number | null
          id?: string
          observations?: string | null
          quantity?: number
          role?: string
          sector?: Database["public"]["Enums"]["sector_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "workforce_entries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workforce_entries_daily_report_id_fkey"
            columns: ["daily_report_id"]
            isOneToOne: false
            referencedRelation: "daily_reports"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_token: string }
        Returns: boolean
      }
      get_my_company_id: { Args: never; Returns: string }
      get_my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_project_role: {
        Args: { p_project_id: string }
        Returns: Database["public"]["Enums"]["project_role"]
      }
      is_project_member: { Args: { p_project_id: string }; Returns: boolean }
    }
    Enums: {
      activity_status:
        | "not_started"
        | "in_progress"
        | "completed"
        | "suspended"
        | "rescheduled"
      company_status: "active" | "inactive"
      day_situation: "normal" | "partial" | "suspended" | "halted" | "no_work"
      equipment_status: "operating" | "stopped" | "maintenance" | "unavailable"
      movement_type: "received" | "used" | "returned" | "rejected"
      notification_type:
        | "report_submitted"
        | "report_approved"
        | "report_returned"
        | "occurrence_critical"
        | "occurrence_deadline"
        | "missing_report"
        | "user_assigned"
      occurrence_category:
        | "technical"
        | "safety"
        | "climate"
        | "material"
        | "equipment"
        | "workforce"
        | "project"
        | "inspection"
        | "contract"
        | "other"
      occurrence_status: "open" | "in_treatment" | "resolved" | "cancelled"
      project_role: "manager" | "civil" | "electrical" | "mechanical" | "viewer" | "safety"
      project_status:
        | "planned"
        | "in_progress"
        | "halted"
        | "suspended"
        | "completed"
        | "archived"
      report_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "approved"
        | "returned"
        | "cancelled"
        | "not_applicable"
        | "partial_approval"
        | "partial_returned"
      review_action:
        | "created"
        | "edited"
        | "submitted"
        | "reviewed"
        | "approved"
        | "returned"
        | "reopened"
        | "cancelled"
      sector_type: "civil" | "eletrica" | "mecanica" | "safety"
      severity_level: "low" | "medium" | "high" | "critical"
      user_role:
        | "superadmin"
        | "company_admin"
        | "project_manager"
        | "civil_responsible"
        | "electrical_responsible"
        | "mechanical_responsible"
        | "viewer"
      user_status: "active" | "inactive" | "invited" | "suspended"
      weather_condition:
        | "sunny"
        | "partly_cloudy"
        | "cloudy"
        | "rainy"
        | "heavy_rain"
        | "other"
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
      activity_status: [
        "not_started",
        "in_progress",
        "completed",
        "suspended",
        "rescheduled",
      ],
      company_status: ["active", "inactive"],
      day_situation: ["normal", "partial", "suspended", "halted", "no_work"],
      equipment_status: ["operating", "stopped", "maintenance", "unavailable"],
      movement_type: ["received", "used", "returned", "rejected"],
      notification_type: [
        "report_submitted",
        "report_approved",
        "report_returned",
        "occurrence_critical",
        "occurrence_deadline",
        "missing_report",
        "user_assigned",
      ],
      occurrence_category: [
        "technical",
        "safety",
        "climate",
        "material",
        "equipment",
        "workforce",
        "project",
        "inspection",
        "contract",
        "other",
      ],
      occurrence_status: ["open", "in_treatment", "resolved", "cancelled"],
      project_role: ["manager", "civil", "electrical", "mechanical", "viewer", "safety"],
      project_status: [
        "planned",
        "in_progress",
        "halted",
        "suspended",
        "completed",
        "archived",
      ],
      report_status: [
        "draft",
        "submitted",
        "under_review",
        "approved",
        "returned",
        "cancelled",
        "not_applicable",
        "partial_approval",
        "partial_returned",
      ],
      review_action: [
        "created",
        "edited",
        "submitted",
        "reviewed",
        "approved",
        "returned",
        "reopened",
        "cancelled",
      ],
      sector_type: ["civil", "eletrica", "mecanica", "safety"],
      severity_level: ["low", "medium", "high", "critical"],
      user_role: [
        "superadmin",
        "company_admin",
        "project_manager",
        "civil_responsible",
        "electrical_responsible",
        "mechanical_responsible",
        "viewer",
      ],
      user_status: ["active", "inactive", "invited", "suspended"],
      weather_condition: [
        "sunny",
        "partly_cloudy",
        "cloudy",
        "rainy",
        "heavy_rain",
        "other",
      ],
    },
  },
} as const
export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type ProjectRole = Database['public']['Enums']['project_role'];
export type ProjectStatus = Database['public']['Enums']['project_status'];
export type ReportStatus = Database['public']['Enums']['report_status'];
export type SeverityLevel = Database['public']['Enums']['severity_level'];
export type OccurrenceStatus = Database['public']['Enums']['occurrence_status'];
export type WeatherCondition = Database['public']['Enums']['weather_condition'];
export type DaySituation = Database['public']['Enums']['day_situation'];
export type ActivityStatus = Database['public']['Enums']['activity_status'];
