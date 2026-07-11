import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Calendar as CalendarIcon, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { RdoCalendar } from "@/components/rdo/RdoCalendar";

export const metadata: Metadata = {
  title: "Calendário de RDOs",
};

export default async function ObraCalendarioPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, code")
    .eq("id", id)
    .single();

  if (!project) redirect("/obras");

  // Verifica permissão (se não for admin, tem que ser membro)
  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";
  if (!isAdmin) {
    const { data: isMember } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", project.id)
      .eq("user_id", user.id)
      .single();
      
    if (!isMember) redirect("/acesso-negado");
  }

  // Fetch all RDOs for this project
  // Limit to avoid fetching thousands if the project has years of history. 
  // Em um cenário real de grande escala, passaríamos 'month/year' via query param
  // e buscaríamos apenas os daquele mês. Para simplificar o UX sem reload, 
  // vamos buscar os últimos 365 relatórios (aprox 1 ano), o que costuma bastar para o client.
  const { data: rdos } = await supabase
    .from("daily_reports")
    .select("id, report_date, status")
    .eq("project_id", id)
    .order("report_date", { ascending: false })
    .limit(365);

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between mb-2">
        <Link 
          href={`/obras/${id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para o Painel da Obra
        </Link>
      </div>

      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-blue-500" /> Calendário de RDOs
            </h1>
          </div>
          <p className="page-subtitle">
            Obra: {project.name}
          </p>
        </div>
        
        <Link href={`/obras/${id}/relatorios/novo`} className="btn btn-primary">
          Novo RDO
        </Link>
      </div>

      <RdoCalendar projectId={project.id} rdos={rdos || []} />
    </div>
  );
}
