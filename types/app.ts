import type { Database } from "./database";

// Conveniência: tipos extraídos das tabelas
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectMember = Database["public"]["Tables"]["project_members"]["Row"];
export type DailyReport = Database["public"]["Tables"]["daily_reports"]["Row"];
export type DailyReportSector = Database["public"]["Tables"]["daily_report_sectors"]["Row"];
export type ReportActivity = Database["public"]["Tables"]["report_activities"]["Row"];
export type WorkforceEntry = Database["public"]["Tables"]["workforce_entries"]["Row"];
export type EquipmentEntry = Database["public"]["Tables"]["equipment_entries"]["Row"];
export type MaterialEntry = Database["public"]["Tables"]["material_entries"]["Row"];
export type Occurrence = Database["public"]["Tables"]["occurrences"]["Row"];
export type Attachment = Database["public"]["Tables"]["attachments"]["Row"];
export type ReportReview = Database["public"]["Tables"]["report_reviews"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];

// Tipos compostos para queries com joins
export type ProjectWithMembers = Project & {
  project_members?: ProjectMember[];
};

export type DailyReportWithSectors = DailyReport & {
  daily_report_sectors?: DailyReportSector[];
  created_by_profile?: Pick<Profile, "id" | "full_name" | "email">;
  approved_by_profile?: Pick<Profile, "id" | "full_name" | "email">;
};

export type ProjectMemberWithProfile = ProjectMember & {
  profile?: Profile;
};

// Estado da sessão do usuário
export interface UserSession {
  id: string;
  email: string;
  profile: Profile;
  company: Company | null;
}

// Props de navegação
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[];
}
