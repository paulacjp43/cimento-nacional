import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  HardHat,
  FileText,
  AlertTriangle,
  Clock,
  TrendingUp,
  MessageSquare,
  Calendar,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
  daily_report_id: string | null;
  projects: { name: string } | null;
}

interface ProjectRow {
  id: string;
  name: string;
  completion_pct: number | null;
  status: string;
  client: string | null;
  code: string | null;
}

interface SectorMessageRow {
  id: string;
  sender_name: string;
  from_sector: string;
  to_sector: string;
  message: string;
  is_alert: boolean;
  created_at: string;
  daily_report_id: string;
  daily_reports: {
    report_date: string;
    project_id: string;
    projects: {
      name: string;
    } | null;
  } | null;
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

  // Fetch count statistics
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

  // Fetch active projects progress list
  const { data: activeProjectsListRaw } = await supabase
    .from("projects")
    .select("id, name, completion_pct, status, client, code")
    .eq("status", "in_progress")
    .limit(3)
    .is("deleted_at", null);

  const activeProjectsList = (activeProjectsListRaw ?? []) as ProjectRow[];

  // Fetch recent RDOs
  const { data: recentReportsRaw } = await supabase
    .from("daily_reports")
    .select("id, report_date, status, project_id, projects(name)")
    .order("created_at", { ascending: false })
    .limit(5)
    .is("deleted_at", null);

  const recentReports = (recentReportsRaw ?? []) as ReportRow[];

  // Fetch open occurrences
  const { data: recentOccurrencesRaw } = await supabase
    .from("occurrences")
    .select("id, title, severity, status, project_id, daily_report_id, projects(name)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(5)
    .is("deleted_at", null);

  const recentOccurrences = (recentOccurrencesRaw ?? []) as OccurrenceRow[];

  // Fetch recent sector messages for dashboard wall
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentMessagesRaw } = await (supabase as any)
    .from("sector_messages")
    .select(`
      id,
      sender_name,
      from_sector,
      to_sector,
      message,
      is_alert,
      created_at,
      daily_report_id,
      daily_reports (
        report_date,
        project_id,
        projects (
          name
        )
      )
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  const recentMessages = (recentMessagesRaw ?? []) as SectorMessageRow[];

  const statCards: StatCard[] = [
    { label: "Obras Ativas", value: activeProjects ?? 0, icon: <TrendingUp className="w-5 h-5" />, color: "#16a34a", bgColor: "#f0fdf4" },
    { label: "Relatórios de Hoje", value: todayReports ?? 0, icon: <FileText className="w-5 h-5" />, color: "#0284c7", bgColor: "#f0f9ff" },
    { label: "Aguardando Revisão", value: submittedReports ?? 0, icon: <Clock className="w-5 h-5" />, color: "#7c3aed", bgColor: "#faf5ff" },
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
    low: "#16a34a",
    medium: "#d97706",
    high: "#ea580c",
    critical: "#dc2626",
  };

  const severityLabels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  };

  const sectorLabelsMap: Record<string, string> = {
    civil: "Civil",
    eletrica: "Elétrica",
    mecanica: "Mecânica",
    geral: "Geral",
  };

  return (
    <div className="fade-in space-y-6">
      
      {/* ─── BANNER DE BOAS-VINDAS PREMIUM ─── */}
      <div 
        className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-lg border border-slate-850"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 70%, #1d4ed8 100%)" }}
      >
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
            <circle cx="400" cy="300" r="300" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="300" r="200" stroke="white" strokeWidth="1" />
          </svg>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Olá, {profile.full_name.split(" ")[0]}!
            </h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl leading-relaxed">
              Resumo operacional: O portal registra <strong>{activeProjects}</strong> obras ativas (de {totalProjects} cadastradas, com {haltedProjects} paralisadas e {completedProjects} concluídas). Há {pendingReports} rascunhos de relatórios pendentes e {returnedReports} relatórios devolvidos para ajuste. Ocorrências em aberto: {openOccurrences}.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold tracking-wider text-right self-stretch md:self-auto">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* ─── CARDS DE MÉTRICAS PRINCIPAIS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card card-hover flex flex-col justify-between p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-150">{card.value}</p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{card.label}</p>
              </div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-transparent shadow-sm"
                style={{ background: card.bgColor, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── CONTEÚDO PRINCIPAL EM DUAS COLUNAS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA (2/3 de largura no desktop): Obras e Relatórios */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Progresso das Obras */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-emerald-500" /> Progresso Físico das Obras Ativas
              </h2>
              <Link href="/obras" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                Ver todas as obras
              </Link>
            </div>

            {activeProjectsList.length === 0 ? (
              <p className="text-xs italic text-gray-500">Nenhuma obra em andamento encontrada.</p>
            ) : (
              <div className="space-y-4">
                {activeProjectsList.map((proj) => {
                  const pct = proj.completion_pct ?? 0;
                  return (
                    <div key={proj.id} className="space-y-2">
                      <div className="flex justify-between items-start text-xs">
                        <div>
                          <span className="font-bold text-gray-800 dark:text-gray-200 block">{proj.name}</span>
                          <span className="text-[10px] text-gray-500">Cliente: {proj.client || "—"}</span>
                        </div>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{pct}%</span>
                      </div>
                      
                      {/* Barra de Progresso Customizada */}
                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card: Relatórios Diários Recentes */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-500" /> Últimos Relatórios Diários (RDO)
              </h2>
            </div>
            
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-xs italic text-gray-400">Nenhum RDO encontrado.</div>
            ) : (
              <div className="space-y-2">
                {recentReports.map((report) => {
                  const st = statusLabels[report.status] ?? { label: report.status, color: "#6b7280" };
                  const rdoDate = report.report_date.split('-');
                  const rdoFormatted = rdoDate.length === 3 ? `${rdoDate[2]}/${rdoDate[1]}/${rdoDate[0]}` : report.report_date;
                  
                  return (
                    <Link
                      key={report.id}
                      href={`/obras/${report.project_id}/relatorios/${report.id}`}
                      className="flex items-center justify-between p-3 rounded-xl border border-gray-50 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all shadow-sm"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                          {report.projects?.name ?? "Obra"}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" /> RDO: {rdoFormatted}
                        </p>
                      </div>
                      <span
                        className="badge text-[10px] font-bold px-2 py-0.5 border"
                        style={{
                          backgroundColor: `${st.color}15`,
                          color: st.color,
                          borderColor: `${st.color}35`,
                        }}
                      >
                        {st.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* COLUNA DIREITA (1/3 de largura no desktop): Alertas Setoriais e Ocorrências */}
        <div className="space-y-6">
          
          {/* Card: Mural de Alertas Recentes */}
          <div className="card p-5 space-y-4 bg-slate-50/50 dark:bg-gray-900/10 border-gray-150 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-violet-500" /> Avisos e Notas Recentes
              </h2>
              <Link href="/comunicacao" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">
                Ver todos
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <p className="text-xs italic text-gray-500 py-4 text-center">Nenhum aviso setorial registrado.</p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`p-3 rounded-xl border text-[11px] space-y-2 shadow-sm ${
                      msg.is_alert 
                        ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/40" 
                        : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-850"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{msg.sender_name}</span>
                      <span className="text-[9px] font-semibold text-blue-700 bg-blue-50 px-1 rounded uppercase">
                        {sectorLabelsMap[msg.from_sector]} ➡️ {sectorLabelsMap[msg.to_sector]}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 leading-normal line-clamp-2">
                      {msg.message}
                    </p>

                    <div className="flex justify-between items-center border-t border-gray-50 dark:border-gray-800 pt-2 text-[9px] text-gray-400">
                      <span>RDO: {formatDate(msg.daily_reports?.report_date)}</span>
                      <Link 
                        href={`/obras/${msg.daily_reports?.project_id}/relatorios/${msg.daily_report_id}?tab=comunicacao`}
                        className="text-primary-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        Responder <ArrowRight className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card: Ocorrências Abertas */}
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" /> Ocorrências Abertas
              </h2>
            </div>

            {recentOccurrences.length === 0 ? (
              <div className="text-center py-6 text-xs italic text-emerald-600 dark:text-emerald-400 font-medium">
                ✅ Nenhuma ocorrência aberta! Obra limpa.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentOccurrences.map((occ) => {
                  const color = severityColors[occ.severity] ?? "#6b7280";
                  const sevLabel = severityLabels[occ.severity] ?? occ.severity;
                  
                  return (
                    <Link
                      key={occ.id}
                      href={occ.daily_report_id ? `/obras/${occ.project_id}/relatorios/${occ.daily_report_id}?tab=ocorrencias` : "#"}
                      className="block p-3 rounded-xl border border-gray-50 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all shadow-sm"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{occ.title}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                            Obra: {occ.projects?.name ?? "—"}
                          </p>
                        </div>
                        <span
                          className="badge text-[9px] font-bold px-2 py-0.5 border flex-shrink-0"
                          style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            borderColor: `${color}35`,
                          }}
                        >
                          {sevLabel}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
