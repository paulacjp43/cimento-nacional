import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RdoPrintLayout } from "@/components/rdo/RdoPrintLayout";
import { PrintButton } from "@/components/rdo/PrintButton";

export const metadata: Metadata = {
  title: "Visão Consolidada - RDO",
};

export default async function RdoPrintPage({ 
  params,
  searchParams,
}: { 
  params: Promise<{ id: string; rdo_id: string }>;
  searchParams: Promise<{ sector?: string }>;
}) {
  const { id, rdo_id } = await params;
  const { sector } = await searchParams;
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

  // Verifica permissão para a visão consolidada
  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";
  
  if (!isAdmin) {
    const { data: isMember } = await supabase
      .from("project_members")
      .select("can_edit, can_approve")
      .eq("project_id", project.id)
      .eq("user_id", user.id)
      .single();
      
    // Se não for admin e não for gestor/aprovador, não pode ver o consolidado completo?
    // Podemos permitir leitura se ele tiver acesso a alguma coisa, mas para manter simples:
    if (!isMember) redirect("/acesso-negado");
  }

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

  const activities = ["civil", "eletrica", "mecanica", "safety"].map(s => {
    const existing = (activitiesData || []).find(d => d.sector === s);
    return existing || {
      sector: s,
      status: "draft",
      executed_activities: "",
      next_day_forecast: "",
      general_observations: "",
    };
  });

  const { data: attachmentsData } = await supabase
    .from("attachments")
    .select(`
      *,
      profiles!attachments_uploader_id_fkey(full_name)
    `)
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
    <div className="bg-slate-100 min-h-screen pb-12">
      {/* Barra de controle */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 print:hidden shadow-sm">
        <Link 
          href={`/obras/${id}/relatorios/${rdo_id}`}
          className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o RDO
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm font-medium">
            {sector ? "Impressão de Setor (Preview)" : "Visão Consolidada (Preview de Impressão)"}
          </span>
          {/* Client component wrapper for print */}
          <PrintButton />
        </div>
      </div>

      <div className="max-w-[21cm] mx-auto mt-8 shadow-xl">
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
          previewMode={true}
          singleSector={sector}
        />
      </div>
    </div>
  );
}
