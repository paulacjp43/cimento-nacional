import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { HardHat, Plus, MapPin, Building2, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Obras",
};

const statusMap: Record<string, { label: string; color: string }> = {
  planned: { label: "Planejada", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  in_progress: { label: "Em Andamento", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  halted: { label: "Paralisada", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  suspended: { label: "Suspensa", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  completed: { label: "Concluída", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
  archived: { label: "Arquivada", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
};

export default async function ObrasPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return (
      <div className="empty-state py-12 card text-center">
        <HardHat className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="empty-state-title">Acesso Restrito</h2>
        <p className="text-muted-foreground mt-2">Você não está vinculado a nenhuma empresa.</p>
      </div>
    );
  }

  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";

  // Buscar obras
  // Se for admin, vê todas. Se for membro, vê apenas as que está vinculado via project_members.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let projects: any[] = [];
  
  if (isAdmin) {
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });
    
    if (data) projects = data;
  } else {
    // Para usuários normais, precisa juntar com project_members
    const { data } = await supabase
      .from("project_members")
      .select("projects(*)")
      .eq("user_id", user.id);
      
    if (data) {
      projects = data.map((m: unknown) => (m as { projects: unknown }).projects).filter(Boolean);
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <HardHat className="w-6 h-6 text-primary-500" /> Obras
          </h1>
          <p className="page-subtitle">
            Gerencie todas as obras e projetos da sua empresa.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/obras/nova"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Obra
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state py-16 card">
          <Building2 className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-700" aria-hidden="true" />
          <p className="empty-state-title">Nenhuma obra encontrada</p>
          <p className="text-sm mt-2 max-w-md mx-auto text-muted-foreground">
            {isAdmin 
              ? "Você ainda não cadastrou nenhuma obra. Clique no botão acima para começar."
              : "Você não está vinculado a nenhuma obra no momento. Solicite acesso ao administrador."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div 
              key={project.id} 
              className="card p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 w-12 h-12 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                  <HardHat className="w-6 h-6" />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusMap[project.status]?.color || statusMap['planned'].color}`}>
                  {statusMap[project.status]?.label || "Planejada"}
                </span>
              </div>
              
              <div className="mb-4 flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {project.name}
                </h3>
                {project.code && (
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mt-1">
                    #{project.code}
                  </p>
                )}
              </div>
              
              <div className="space-y-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                {project.client && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span className="truncate">{project.client}</span>
                  </div>
                )}
                {(project.city || project.state) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {[project.city, project.state].filter(Boolean).join(" - ")}
                    </span>
                  </div>
                )}
                <div className="pt-4 mt-2 flex justify-between w-full border-t border-gray-100 dark:border-gray-800">
                  <Link 
                    href={`/obras/${project.id}`}
                    className="text-sm font-medium text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    Painel da Obra
                  </Link>
                  <Link 
                    href={`/obras/${project.id}/calendario`}
                    className="text-sm font-medium text-primary-600 flex items-center hover:text-primary-700 transition-colors z-10"
                  >
                    Ver RDOs <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
