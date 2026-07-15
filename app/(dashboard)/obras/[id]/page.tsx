import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HardHat, Edit, Users, Calendar, MapPin, Building2, ChevronRight, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { ProjectDocuments } from "./ProjectDocuments";

export const metadata: Metadata = {
  title: "Detalhes da Obra",
};

const statusMap: Record<string, { label: string; color: string }> = {
  planned: { label: "Planejada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  in_progress: { label: "Em Andamento", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  halted: { label: "Paralisada", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  suspended: { label: "Suspensa", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  completed: { label: "Concluída", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
  archived: { label: "Arquivada", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

export default async function ObraDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    redirect("/acesso-negado");
  }

  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";

  // Buscar detalhes da obra
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();

  if (error || !project) {
    // Pode não ser admin e não ter acesso
    redirect("/obras");
  }


  return (
    <div className="fade-in space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-muted-foreground mb-2">
        <Link href="/obras" className="hover:text-primary-600 transition-colors">Obras</Link>
        <ChevronRight className="w-4 h-4 mx-1" />
        <span className="text-gray-900 dark:text-white truncate">{project.name}</span>
      </nav>

      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="page-title">{project.name}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[project.status]?.color || statusMap['planned'].color}`}>
              {statusMap[project.status]?.label || "Planejada"}
            </span>
          </div>
          {project.code && (
            <p className="page-subtitle text-primary-600 dark:text-primary-400 font-medium text-sm">
              Código: #{project.code}
            </p>
          )}
        </div>
        
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <DeleteProjectButton projectId={project.id} />
            <Link
              href={`/obras/${project.id}/editar`}
              className="btn btn-primary"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar Obra
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Detalhes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800">
              Informações Contratuais
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Cliente</p>
                <p className="font-medium text-gray-900 dark:text-white">{project.client || "Não informado"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1.5"><HardHat className="w-4 h-4" /> Construtora</p>
                <p className="font-medium text-gray-900 dark:text-white">{project.contractor || "Não informado"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Localização</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {[project.city, project.state].filter(Boolean).join(" - ") || "Não informado"}
                </p>
              </div>
            </div>

            {project.description && (
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-muted-foreground mb-2 text-sm">Descrição / Escopo</p>
                <p className="text-sm text-gray-900 dark:text-gray-300 whitespace-pre-wrap">{project.description}</p>
              </div>
            )}
          </div>

          <ProjectDocuments projectId={project.id} />
        </div>

        {/* Coluna Direita: Ações Rápidas e Dashboard */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800">
              Módulos
            </h2>
            <div className="space-y-3">
              <Link href={`/obras/${project.id}/relatorios`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group">
                <div className="bg-primary-100 text-primary-600 p-2 rounded-md group-hover:bg-primary-200 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Relatórios Diários</p>
                  <p className="text-xs text-muted-foreground">Acessar e criar RDOs</p>
                </div>
              </Link>
              
              <Link href={`/obras/${project.id}/calendario`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group">
                <div className="bg-blue-100 text-blue-600 p-2 rounded-md group-hover:bg-blue-200 transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Calendário</p>
                  <p className="text-xs text-muted-foreground">Visão mensal da obra</p>
                </div>
              </Link>

              {isAdmin && (
                <Link href={`/obras/${project.id}/equipe`} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all group">
                  <div className="bg-amber-100 text-amber-600 p-2 rounded-md group-hover:bg-amber-200 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">Equipe da Obra</p>
                    <p className="text-xs text-muted-foreground">Gerenciar vinculações</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
