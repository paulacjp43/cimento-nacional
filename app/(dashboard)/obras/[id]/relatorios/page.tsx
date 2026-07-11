import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Plus, ArrowLeft, Calendar, User, Cloud, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Relatórios Diários de Obra",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusMap: Record<string, { label: string; icon: any; color: string }> = {
  draft: { label: "Rascunho", icon: Clock, color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  submitted: { label: "Enviado", icon: AlertCircle, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30" },
  under_review: { label: "Em Revisão", icon: AlertCircle, color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30" },
  approved: { label: "Aprovado", icon: CheckCircle2, color: "text-green-500 bg-green-100 dark:bg-green-900/30" },
  returned: { label: "Devolvido", icon: AlertCircle, color: "text-red-500 bg-red-100 dark:bg-red-900/30" },
  cancelled: { label: "Cancelado", icon: AlertCircle, color: "text-gray-400 bg-gray-50 dark:bg-gray-900/10" },
};

const weatherMap: Record<string, string> = {
  sunny: "Ensolarado",
  partly_cloudy: "Parcialmente Nublado",
  cloudy: "Nublado",
  rainy: "Chuvoso",
  heavy_rain: "Chuva Forte",
  other: "Outro",
};

export default async function RdoListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/acesso-negado");

  // Buscar detalhes da obra
  const { data: project, error: projError } = await supabase
    .from("projects")
    .select("id, name, code")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();

  if (projError || !project) redirect("/obras");

  // Verifica acesso (simplificado: admin ou membro)
  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";
  let canEdit = isAdmin;

  if (!isAdmin) {
    const { data: isMember } = await supabase
      .from("project_members")
      .select("can_edit")
      .eq("project_id", project.id)
      .eq("user_id", user.id)
      .single();
      
    if (!isMember) redirect("/acesso-negado");
    canEdit = isMember.can_edit;
  }

  // Buscar RDOs
  const { data: reports } = await supabase
    .from("daily_reports")
    .select(`
      id,
      report_date,
      status,
      weather_morning,
      weather_afternoon,
      created_by,
      profiles!daily_reports_created_by_fkey (full_name)
    `)
    .eq("project_id", project.id)
    .order("report_date", { ascending: false });

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Link 
          href={`/obras/${id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para a Obra
        </Link>
      </div>

      <div className="page-header flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary-500" /> Relatórios Diários
          </h1>
          <p className="page-subtitle">
            {project.name} {project.code && `(#${project.code})`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/obras/${id}/calendario`}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendário
          </Link>
          
          {canEdit && (
            <Link
              href={`/obras/${id}/relatorios/novo`}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo RDO
            </Link>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {reports && reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Data</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Clima (Manhã / Tarde)</th>
                  <th className="px-6 py-4 font-medium">Responsável</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {reports.map((report: any) => {
                  const s = statusMap[report.status || "draft"];
                  const StatusIcon = s.icon;
                  
                  // Formatar data (YYYY-MM-DD) -> (DD/MM/YYYY)
                  const dateParts = report.report_date.split('-');
                  const formattedDate = dateParts.length === 3 
                    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
                    : report.report_date;

                  return (
                    <tr key={report.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formattedDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${s.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1.5" title="Manhã">
                            <Cloud className="w-3.5 h-3.5" /> 
                            <span className="truncate max-w-[100px]">{weatherMap[report.weather_morning] || "-"}</span>
                          </div>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-1.5" title="Tarde">
                            <Cloud className="w-3.5 h-3.5" /> 
                            <span className="truncate max-w-[100px]">{weatherMap[report.weather_afternoon] || "-"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{report.profiles?.full_name || "Desconhecido"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/obras/${project.id}/relatorios/${report.id}`}
                          className="btn btn-primary py-1.5 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Abrir
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Nenhum relatório encontrado</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Nenhum relatório diário foi emitido para esta obra ainda. Clique em &quot;Novo RDO&quot; para criar o primeiro.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
