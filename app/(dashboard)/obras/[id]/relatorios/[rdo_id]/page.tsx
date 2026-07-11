import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DeleteReportButton } from "../DeleteReportButton";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RdoDetailTabs } from "@/components/rdo/RdoDetailTabs";
import { RdoActionButtons } from "@/components/rdo/RdoActionButtons";
import { RdoPrintLayout } from "@/components/rdo/RdoPrintLayout";
import { ReportStatus } from "@/types/database";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Detalhes do Relatório",
};

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "text-gray-500 bg-gray-100 dark:bg-gray-800" },
  submitted: { label: "Enviado", color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30" },
  under_review: { label: "Em Revisão", color: "text-amber-500 bg-amber-100 dark:bg-amber-900/30" },
  approved: { label: "Aprovado", color: "text-green-500 bg-green-100 dark:bg-green-900/30" },
  returned: { label: "Devolvido", color: "text-red-500 bg-red-100 dark:bg-red-900/30" },
  cancelled: { label: "Cancelado", color: "text-gray-400 bg-gray-50 dark:bg-gray-900/10" },
};

export default async function RdoDetailPage({ params }: { params: Promise<{ id: string; rdo_id: string }> }) {
  const { id, rdo_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) redirect("/acesso-negado");

  // Fetch project
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, code")
    .eq("id", id)
    .single();

  if (!project) redirect("/obras");

  // Fetch report
  const { data: report, error } = await supabase
    .from("daily_reports")
    .select(`
      *,
      profiles!daily_reports_created_by_fkey (full_name)
    `)
    .eq("id", rdo_id)
    .eq("project_id", id)
    .single();

  if (error || !report) {
    redirect(`/obras/${id}/relatorios`);
  }

  // Verifica permissão
  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";
  let canEdit = isAdmin;
  let canApprove = isAdmin;

  if (!isAdmin) {
    const { data: isMember } = await supabase
      .from("project_members")
      .select("can_edit, can_approve")
      .eq("project_id", project.id)
      .eq("user_id", user.id)
      .single();
      
    if (!isMember) redirect("/acesso-negado");
    canEdit = isMember.can_edit;
    canApprove = isMember.can_approve;
  }

  // Format date
  const dateParts = report.report_date.split('-');
  const formattedDate = dateParts.length === 3 
    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
    : report.report_date;

  const statusInfo = statusMap[report.status] || statusMap.draft;

  // Server-side fetch all RDO related data to ensure instant rendering in PDF printout
  const { data: workforce } = await supabase
    .from("workforce_entries")
    .select("*")
    .eq("daily_report_id", rdo_id)
    .order("created_at", { ascending: true });

  const { data: equipment } = await supabase
    .from("equipment_entries")
    .select("*")
    .eq("daily_report_id", rdo_id)
    .order("created_at", { ascending: true });

  const { data: materials } = await supabase
    .from("material_entries")
    .select("*")
    .eq("daily_report_id", rdo_id)
    .order("created_at", { ascending: true });

  const { data: occurrences } = await supabase
    .from("occurrences")
    .select("*")
    .eq("daily_report_id", rdo_id)
    .order("created_at", { ascending: true });

  const { data: activitiesData } = await supabase
    .from("daily_report_sectors")
    .select("*")
    .eq("daily_report_id", rdo_id);

  const activities = ["civil", "eletrica", "mecanica"].map(s => {
    const existing = (activitiesData || []).find(d => d.sector === s);
    return existing || {
      sector: s,
      executed_activities: "",
      next_day_forecast: "",
      general_observations: "",
    };
  });

  const { data: attachmentsData } = await supabase
    .from("attachments")
    .select("*")
    .eq("daily_report_id", rdo_id)
    .order("created_at", { ascending: false });

  const attachments = await Promise.all((attachmentsData || []).map(async (att) => {
    if (!att.storage_path) return { ...att, url: null };
    const { data: urlData } = await supabase
      .storage
      .from("gestobra-files")
      .createSignedUrl(att.storage_path, 60 * 60);
    return {
      ...att,
      url: urlData?.signedUrl ?? null
    };
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: sectorMessages } = await (supabase as any)
    .from("sector_messages")
    .select("*")
    .eq("daily_report_id", rdo_id)
    .order("created_at", { ascending: true });

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between mb-2 print:hidden">
        <Link 
          href={`/obras/${id}/relatorios`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Lista de RDOs
        </Link>
      </div>

      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title">
              RDO: {formattedDate}
            </h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="page-subtitle">
            Obra: {project.name} | Criado por: {report.profiles?.full_name || "Sistema"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && (
            <DeleteReportButton reportId={report.id} projectId={project.id} />
          )}
          <RdoActionButtons 
            reportId={report.id} 
            status={report.status as ReportStatus} 
            canEdit={canEdit} 
            canApprove={canApprove} 
          />
        </div>
      </div>

      {/* Tabs Layout (Escondido na impressão) */}
      <div className="print:hidden">
        <Suspense fallback={<div className="py-10 text-center text-xs text-gray-500">Carregando abas...</div>}>
          <RdoDetailTabs report={report} project={project} />
        </Suspense>
      </div>

      {/* Printable Layout (Visível apenas na impressão) */}
      <RdoPrintLayout 
        report={report} 
        project={project} 
        workforce={workforce || []}
        equipment={equipment || []}
        materials={materials || []}
        occurrences={occurrences || []}
        activities={activities}
        attachments={attachments}
        sectorMessages={sectorMessages || []}
      />
    </div>
  );
}
