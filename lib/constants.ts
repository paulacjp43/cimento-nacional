import type { UserRole, ProjectRole, ReportStatus, ProjectStatus, SeverityLevel, OccurrenceStatus, WeatherCondition, DaySituation, ActivityStatus } from "@/types/database";

// ─── Labels em português ─────────────────────────────────────────

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  superadmin: "Superadministrador",
  company_admin: "Administrador da Empresa",
  project_manager: "Gestor da Obra",
  civil_responsible: "Responsável Civil",
  electrical_responsible: "Responsável Elétrica",
  mechanical_responsible: "Responsável Mecânica",
  viewer: "Visualizador",
};

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  manager: "Gestor",
  civil: "Civil",
  electrical: "Elétrica",
  mechanical: "Mecânica",
  safety: "Segurança",
  viewer: "Visualizador",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  draft: "Rascunho",
  submitted: "Enviado",
  under_review: "Em Revisão",
  approved: "Aprovado",
  returned: "Devolvido",
  cancelled: "Cancelado",
  not_applicable: "Não se Aplica",
  partial_approval: "Aprovação Parcial",
  partial_returned: "Devolução Parcial",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: "Planejada",
  in_progress: "Em Andamento",
  halted: "Paralisada",
  suspended: "Suspensa",
  completed: "Concluída",
  archived: "Arquivada",
};

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  open: "Aberta",
  in_treatment: "Em Tratamento",
  resolved: "Resolvida",
  cancelled: "Cancelada",
};

export const WEATHER_LABELS: Record<WeatherCondition, string> = {
  sunny: "Ensolarado",
  partly_cloudy: "Parcialmente Nublado",
  cloudy: "Nublado",
  rainy: "Chuvoso",
  heavy_rain: "Chuva Intensa",
  other: "Outro",
};

export const DAY_SITUATION_LABELS: Record<DaySituation, string> = {
  normal: "Trabalho Normal",
  partial: "Trabalho Parcial",
  suspended: "Atividades Suspensas",
  halted: "Obra Paralisada",
  no_work: "Sem Expediente",
};

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  not_started: "Não Iniciada",
  in_progress: "Em Execução",
  completed: "Concluída",
  suspended: "Suspensa",
  rescheduled: "Reprogramada",
};

export const SECTOR_LABELS = {
  civil: "Civil",
  eletrica: "Elétrica",
  mecanica: "Mecânica",
  safety: "Segurança do Trabalho",
} as const;

// ─── Cores de status para badges ─────────────────────────────────

export const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  submitted: "bg-blue-100 text-blue-700 border-blue-200",
  under_review: "bg-purple-100 text-purple-700 border-purple-200",
  approved: "bg-green-100 text-green-700 border-green-200",
  returned: "bg-amber-100 text-amber-700 border-amber-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  not_applicable: "bg-gray-200 text-gray-700 border-gray-300",
  partial_approval: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial_returned: "bg-rose-100 text-rose-700 border-rose-200",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  planned: "bg-gray-100 text-gray-700 border-gray-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  halted: "bg-red-100 text-red-700 border-red-200",
  suspended: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  low: "bg-green-100 text-green-700 border-green-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

// ─── Opções de formulários ────────────────────────────────────────

export const WORKFORCE_ROLES = [
  "Engenheiro", "Técnico", "Encarregado", "Mestre de Obras",
  "Pedreiro", "Servente", "Eletricista", "Mecânico",
  "Operador", "Motorista", "Soldador", "Carpinteiro",
  "Armador", "Pintor", "Outros",
];

export const OCCURRENCE_CATEGORIES = [
  { value: "technical", label: "Técnica" },
  { value: "safety", label: "Segurança" },
  { value: "climate", label: "Clima" },
  { value: "material", label: "Material" },
  { value: "equipment", label: "Equipamento" },
  { value: "workforce", label: "Mão de Obra" },
  { value: "project", label: "Projeto" },
  { value: "inspection", label: "Fiscalização" },
  { value: "contract", label: "Contrato" },
  { value: "other", label: "Outra" },
];

export const BRAZIL_STATES = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA",
  "MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN",
  "RS","RO","RR","SC","SP","SE","TO",
];

// ─── Configurações de calendário ──────────────────────────────────

export const CALENDAR_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  empty: { bg: "bg-gray-100", text: "text-gray-400", label: "Sem registro" },
  draft: { bg: "bg-amber-100", text: "text-amber-700", label: "Rascunho" },
  submitted: { bg: "bg-blue-100", text: "text-blue-700", label: "Enviado" },
  under_review: { bg: "bg-purple-100", text: "text-purple-700", label: "Em Revisão" },
  approved: { bg: "bg-green-100", text: "text-green-700", label: "Aprovado" },
  returned: { bg: "bg-orange-100", text: "text-orange-700", label: "Devolvido" },
  critical_occurrence: { bg: "bg-red-100", text: "text-red-700", label: "Ocorrência Crítica" },
};
