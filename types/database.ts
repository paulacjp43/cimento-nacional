export type UserRole =
  | "superadmin"
  | "company_admin"
  | "project_manager"
  | "civil_responsible"
  | "electrical_responsible"
  | "mechanical_responsible"
  | "viewer";

export type ProjectRole = "manager" | "civil" | "electrical" | "mechanical" | "viewer";
export type SectorType = "civil" | "eletrica" | "mecanica";
export type ReportStatus = "draft" | "submitted" | "under_review" | "approved" | "returned" | "cancelled";
export type WeatherCondition = "sunny" | "partly_cloudy" | "cloudy" | "rainy" | "heavy_rain" | "other";
export type DaySituation = "normal" | "partial" | "suspended" | "halted" | "no_work";
export type ActivityStatus = "not_started" | "in_progress" | "completed" | "suspended" | "rescheduled";
export type ProjectStatus = "planned" | "in_progress" | "halted" | "suspended" | "completed" | "archived";
export type SeverityLevel = "low" | "medium" | "high" | "critical";
export type OccurrenceStatus = "open" | "in_treatment" | "resolved" | "cancelled";
export type OccurrenceCategory = "technical" | "safety" | "climate" | "material" | "equipment" | "workforce" | "project" | "inspection" | "contract" | "other";
export type MovementType = "received" | "used" | "returned" | "rejected";
export type EquipmentStatus = "operating" | "stopped" | "maintenance" | "unavailable";
export type CompanyStatus = "active" | "inactive";
export type UserStatus = "active" | "inactive" | "invited" | "suspended";
export type ReviewAction = "created" | "edited" | "submitted" | "reviewed" | "approved" | "returned" | "reopened" | "cancelled";
export type NotificationType = "report_submitted" | "report_approved" | "report_returned" | "occurrence_critical" | "occurrence_deadline" | "missing_report" | "user_assigned";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          trade_name: string | null;
          cnpj: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          logo_url: string | null;
          responsible: string | null;
          status: CompanyStatus;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["companies"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      company_settings: {
        Row: {
          id: string;
          company_id: string;
          max_image_size_mb: number;
          max_video_size_mb: number;
          max_pdf_size_mb: number;
          allowed_image_types: string[];
          allowed_video_types: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["company_settings"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["company_settings"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          company_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          role: UserRole;
          avatar_url: string | null;
          status: UserStatus;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          company_id: string;
          code: string | null;
          name: string;
          description: string | null;
          client: string | null;
          contractor: string | null;
          cnpj_contractor: string | null;
          contract_number: string | null;
          agreement_number: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          latitude: number | null;
          longitude: number | null;
          planned_start: string | null;
          planned_end: string | null;
          actual_start: string | null;
          actual_end: string | null;
          contract_value: number | null;
          technical_responsible: string | null;
          crea_cau: string | null;
          fiscal_responsible: string | null;
          art_rrt_number: string | null;
          status: ProjectStatus;
          completion_pct: number;
          observations: string | null;
          cover_image_url: string | null;
          logo_url: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      project_members: {
        Row: {
          id: string;
          company_id: string;
          project_id: string;
          user_id: string;
          role: ProjectRole;
          sector: SectorType | null;
          start_date: string | null;
          end_date: string | null;
          status: UserStatus;
          can_view: boolean;
          can_edit: boolean;
          can_approve: boolean;
          can_export_pdf: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["project_members"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["project_members"]["Insert"]>;
      };
      daily_reports: {
        Row: {
          id: string;
          company_id: string;
          project_id: string;
          report_date: string;
          report_number: number | null;
          day_of_week: string | null;
          start_time: string | null;
          end_time: string | null;
          weather_morning: WeatherCondition | null;
          weather_afternoon: WeatherCondition | null;
          temperature: number | null;
          had_rain: boolean;
          rain_period: string | null;
          day_situation: DaySituation;
          general_observations: string | null;
          status: ReportStatus;
          version: number;
          created_by: string | null;
          reviewed_by: string | null;
          approved_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_reports"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["daily_reports"]["Insert"]>;
      };
      daily_report_sectors: {
        Row: {
          id: string;
          company_id: string;
          daily_report_id: string;
          sector: SectorType;
          planned_activities: string | null;
          executed_activities: string | null;
          work_front: string | null;
          team_description: string | null;
          inspections_done: string | null;
          tests_done: string | null;
          problems_found: string | null;
          actions_taken: string | null;
          pending_issues: string | null;
          next_day_forecast: string | null;
          general_observations: string | null;
          status: ReportStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["daily_report_sectors"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["daily_report_sectors"]["Insert"]>;
      };
      report_activities: {
        Row: {
          id: string;
          company_id: string;
          daily_report_sector_id: string;
          description: string;
          location: string | null;
          quantity: number | null;
          unit: string | null;
          percentage: number | null;
          start_time: string | null;
          end_time: string | null;
          responsible: string | null;
          status: ActivityStatus;
          observations: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_activities"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["report_activities"]["Insert"]>;
      };
      workforce_entries: {
        Row: {
          id: string;
          company_id: string;
          daily_report_id: string;
          sector: SectorType | null;
          role: string;
          quantity: number;
          company_name: string | null;
          hours_worked: number | null;
          observations: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workforce_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workforce_entries"]["Insert"]>;
      };
      equipment_entries: {
        Row: {
          id: string;
          company_id: string;
          daily_report_id: string;
          sector: SectorType | null;
          name: string;
          identifier: string | null;
          quantity: number;
          hours_used: number | null;
          status: EquipmentStatus;
          owner_company: string | null;
          observations: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["equipment_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["equipment_entries"]["Insert"]>;
      };
      material_entries: {
        Row: {
          id: string;
          company_id: string;
          daily_report_id: string;
          sector: SectorType | null;
          material_name: string;
          movement_type: MovementType;
          quantity: number;
          unit: string | null;
          supplier: string | null;
          invoice_number: string | null;
          storage_location: string | null;
          observations: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["material_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["material_entries"]["Insert"]>;
      };
      occurrences: {
        Row: {
          id: string;
          company_id: string;
          project_id: string;
          daily_report_id: string | null;
          sector: SectorType | null;
          category: OccurrenceCategory;
          title: string;
          description: string;
          occurred_at: string | null;
          severity: SeverityLevel;
          action_taken: string | null;
          responsible: string | null;
          resolution_deadline: string | null;
          status: OccurrenceStatus;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["occurrences"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["occurrences"]["Insert"]>;
      };
      attachments: {
        Row: {
          id: string;
          company_id: string;
          project_id: string;
          daily_report_id: string | null;
          daily_report_sector_id: string | null;
          occurrence_id: string | null;
          sector: SectorType | null;
          uploader_id: string | null;
          file_name: string;
          original_name: string;
          file_type: string;
          mime_type: string | null;
          file_size_bytes: number | null;
          storage_path: string;
          caption: string | null;
          description: string | null;
          location_label: string | null;
          latitude: number | null;
          longitude: number | null;
          display_order: number;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["attachments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
      };
      report_reviews: {
        Row: {
          id: string;
          company_id: string;
          daily_report_id: string;
          daily_report_sector_id: string | null;
          action: ReviewAction;
          user_id: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["report_reviews"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["report_reviews"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          type: NotificationType;
          title: string;
          body: string | null;
          entity_type: string | null;
          entity_id: string | null;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          company_id: string | null;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          old_values: Record<string, unknown> | null;
          new_values: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_company_id: { Args: Record<never, never>; Returns: string };
      get_my_role: { Args: Record<never, never>; Returns: UserRole };
      is_project_member: { Args: { p_project_id: string }; Returns: boolean };
      get_project_role: { Args: { p_project_id: string }; Returns: ProjectRole };
    };
    Enums: {
      user_role: UserRole;
      project_role: ProjectRole;
      sector_type: SectorType;
      report_status: ReportStatus;
      weather_condition: WeatherCondition;
      day_situation: DaySituation;
      activity_status: ActivityStatus;
      project_status: ProjectStatus;
      severity_level: SeverityLevel;
      occurrence_status: OccurrenceStatus;
      occurrence_category: OccurrenceCategory;
      movement_type: MovementType;
      equipment_status: EquipmentStatus;
      company_status: CompanyStatus;
      user_status: UserStatus;
      review_action: ReviewAction;
      notification_type: NotificationType;
    };
  };
}
