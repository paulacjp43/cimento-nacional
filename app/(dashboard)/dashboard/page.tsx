import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  HardHat,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  RotateCcw,
  CalendarX,
  TrendingUp,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReportStatus, SeverityLevel } from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface ReportRow {
  id: string;
  report_date: string;
  status: ReportStatus;
  project_id: string;
  projects: { name: string } | null;
}

interface OccurrenceRow {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: string;
  project_id: string;
  projects: { name: string } | null;
}

interface ProfileRow {
  id: string;
  full_name: string;
  role: string;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  const profile = profileData as ProfileRow | null;
  if (!profile) redirect("/login");

  const [
    { count: totalProjects },
    { count: activeProjects },
    { count: haltedProjects },
    { count: completedProjects },
    { count: todayReports },
    { count: pendingReports },
    { count: submittedReports },
    { count: returnedReports },
    { count: openOccurrences },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "in_progress").is("deleted_at", null),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "halted").is("deleted_at", null),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed").is("deleted_at", null),
    supabase.from("daily_reports").select("*", { count: "exact", head: true }).eq("report_date", new Date().toISOString().split("T")[0]).is("deleted_at", null),
    supabase.from("daily_reports").select("*", { count: "exact", head: true }).eq("status", "draft").is("deleted_at", null),
    supabase.from("daily_reports").select("*", { count: "exact", head: true }).eq("status", "submitted").is("deleted_at", null),
    supabase.from("daily_reports").select("*", { count: "exact", head: true }).eq("status", "returned").is("deleted_at", null),
    supabase.from("occurrences").select("*", { count: "exact", head: true }).eq("status", "open").is("deleted_at", null),
  ]);

  const { data: recentReportsRaw } = await supabase
    .from("daily_reports")
    .select("id, report_date, status, project_id, projects(name)")
    .order("created_at", { ascending: false })
    .limit(5)
    .is("deleted_at", null);

  const { data: recentOccurrencesRaw } = await supabase
    .from("occurrences")
    .select("id, title, severity, status, project_id, projects(name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5)
    .is("deleted_at", null);

  const recentReports = (recentReportsRaw ?? []) as ReportRow[];
  const recentOccurrences = (recentOccurrencesRaw ?? []) as OccurrenceRow[];

  const statCards: StatCard[] = [
    { label: "Total de Obras", value: totalProjects ?? 0, icon: <HardHat className="w-5 h-5" />, color: "#1d4ed8", bgColor: "#eff6ff" },
    { label: "Em Andamento", value: activeProjects ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: "#059669", bgColor: "#f0fdf4" },
    { label: "Paralisadas", value: haltedProjects ?? 0, icon: <AlertTriangle className="w-5 h-5" />, color: "#dc2626", bgColor: "#fef2f2" },
    { label: "Concluídas", value: completedProjects ?? 0, icon: <CheckCircle className="w-5 h-5" />, color: "#16a34a", bgColor: "#f0fdf4" },
    { label: "Relatórios Hoje", value: todayReports ?? 0, icon: <FileText className="w-5 h-5" />, color: "#0891b2", bgColor: "#f0f9ff" },
    { label: "Rascunhos", value: pendingReports ?? 0, icon: <Clock className="w-5 h-5" />, color: "#d97706", bgColor: "#fffbeb" },
    { label: "Aguardando Revisão", value: submittedReports ?? 0, icon: <FileText className="w-5 h-5" />, color: "#7c3aed", bgColor: "#faf5ff" },
    { label: "Devolvidos", value: returnedReports ?? 0, icon: <RotateCcw className="w-5 h-5" />, color: "#ea580c", bgColor: "#fff7ed" },
    { label: "Ocorrências Abertas", value: openOccurrences ?? 0, icon: <AlertTriangle className="w-5 h-5" />, color: "#dc2626", bgColor: "#fef2f2" },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    draft: { label: "Rascunho", color: "#d97706" },
    submitted: { label: "Enviado", color: "#2563eb" },
    under_review: { label: "Em Revisão", color: "#7c3aed" },
    approved: { label: "Aprovado", color: "#16a34a" },
    returned: { label: "Devolvido", color: "#ea580c" },
    cancelled: { label: "Cancelado", color: "#6b7280" },
  };

  const severityColors: Record<string, string> = {
    low: "#16a34a", medium: "#d97706", high: "#ea580c", critical: "#dc2626",
  };

  const severityLabels: Record<string, string> = {
    low: "Baixa", medium: "Média", high: "Alta", critical: "Crítica",
  };

  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";

  return (
    <div className="fade-in space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Bem-vindo, {profile.full_name.split(" ")[0]}! Aqui está o resumo do sistema.
          </p>
        </div>
        <div className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.slice(0, isAdmin ? 9 : 6).map((card) => (
          <div key={card.label} className="card card-hover">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: card.bgColor, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              {card.value}
            </p>
            <p className="text-sm mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* Listas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatórios recentes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Últimos Relatórios
            </h2>
            <a href="/relatorios" className="text-sm font-medium" style={{ color: "var(--color-primary-700)" }}>
              Ver todos
            </a>
          </div>
          {recentReports.length === 0 ? (
            <div className="empty-state py-8">
              <CalendarX style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 0.75rem" }} aria-hidden="true" />
              <p className="empty-state-title">Nenhum relatório encontrado</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Os relatórios preenchidos aparecerão aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReports.map((report) => {
                const st = statusLabels[report.status] ?? { label: report.status, color: "#6b7280" };
                return (
                  <a key={report.id} href={`/relatorios/${report.id}`}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "var(--color-surface-muted)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                        {report.projects?.name ?? "Obra"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                        {new Date(report.report_date + "T00:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="badge ml-3 flex-shrink-0" style={{ background: `${st.color}15`, color: st.color, borderColor: `${st.color}30` }}>
                      {st.label}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Ocorrências abertas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Ocorrências Abertas
            </h2>
            <a href="/ocorrencias" className="text-sm font-medium" style={{ color: "var(--color-primary-700)" }}>
              Ver todas
            </a>
          </div>
          {recentOccurrences.length === 0 ? (
            <div className="empty-state py-8">
              <CheckCircle aria-hidden="true" style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 0.75rem", color: "#10b981", opacity: 0.5 }} />
              <p className="empty-state-title">Nenhuma ocorrência aberta</p>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Ótimo! Não há ocorrências pendentes.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOccurrences.map((occ) => {
                const color = severityColors[occ.severity] ?? "#6b7280";
                const sevLabel = severityLabels[occ.severity] ?? occ.severity;
                return (
                  <a key={occ.id} href={`/ocorrencias/${occ.id}`}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: "var(--color-surface-muted)" }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{occ.title}</p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: "var(--color-text-muted)" }}>
                        {occ.projects?.name ?? "—"}
                      </p>
                    </div>
                    <span className="badge ml-3 flex-shrink-0" style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
                      {sevLabel}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
