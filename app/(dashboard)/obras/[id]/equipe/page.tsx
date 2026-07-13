import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Shield } from "lucide-react";
import type { Metadata } from "next";
import { AddMemberForm } from "./AddMemberForm";
import { RemoveMemberButton } from "./RemoveMemberButton";

export const metadata: Metadata = {
  title: "Equipe da Obra",
};

const projectRoleMap: Record<string, { label: string; color: string }> = {
  manager: { label: "Gestor", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  member: { label: "Membro", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  viewer: { label: "Visualizador", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
};

const sectorMap: Record<string, string> = {
  civil: "Civil",
  eletrica: "Elétrica",
  mecanica: "Mecânica",
};

export default async function ProjectTeamPage({ params }: { params: Promise<{ id: string }> }) {
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

  if (!isAdmin) {
    redirect(`/obras/${id}`);
  }

  // Buscar detalhes do projeto
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id as string)
    .single();

  if (!project) {
    redirect("/obras");
  }

  // Buscar membros já vinculados
  const { data: projectMembersData } = await supabase
    .from("project_members")
    .select("*, profiles(*)")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  const linkedMembers = (projectMembersData || []).filter(pm => pm.profiles != null);
  const linkedUserIds = linkedMembers.map(pm => {
    const p = Array.isArray(pm.profiles) ? pm.profiles[0] : pm.profiles;
    return p?.id;
  }).filter(Boolean);

  // Buscar todos os usuários da empresa que ainda não estão vinculados
  let availableUsers: any[] = [];
  const { data: allUsers } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", profile.company_id as string)
    .eq("status", "active")
    .order("full_name");

  if (allUsers) {
    availableUsers = allUsers
      .filter(u => !linkedUserIds.includes(u.id))
      .map(u => ({
        id: u.id,
        full_name: u.full_name || "",
        email: u.email || "",
        role: u.role || "member"
      }));
  }

  return (
    <div className="fade-in space-y-6">
      <nav className="flex items-center text-sm font-medium text-muted-foreground mb-2">
        <Link href="/obras" className="hover:text-primary-600 transition-colors">Obras</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href={`/obras/${project.id}`} className="hover:text-primary-600 transition-colors truncate max-w-[150px] sm:max-w-xs">{project.name}</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900 dark:text-white">Equipe</span>
      </nav>

      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Users className="w-6 h-6 text-primary-500" /> Equipe da Obra
        </h1>
        <p className="page-subtitle">
          Gerencie o acesso e as funções dos colaboradores no projeto <strong>{project.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <AddMemberForm projectId={project.id} availableUsers={availableUsers} />
        </div>

        <div className="xl:col-span-2">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-500" /> Membros Vinculados
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Usuário</th>
                    <th className="px-6 py-4 font-medium">Função</th>
                    <th className="px-6 py-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {linkedMembers.map((pm: any) => {
                    const profile = Array.isArray(pm.profiles) ? pm.profiles[0] : pm.profiles;
                    if (!profile) return null;
                    return (
                      <tr key={pm.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-xs">
                              {profile.full_name?.substring(0, 2).toUpperCase() || "??"}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                                {profile.full_name}
                                {profile.role === 'company_admin' && <span title="Admin Global"><Shield className="w-3 h-3 text-amber-500" /></span>}
                              </p>
                              <p className="text-xs text-muted-foreground">{profile.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${projectRoleMap[pm.role || 'member']?.color || projectRoleMap['member'].color}`}>
                              {projectRoleMap[pm.role || 'member']?.label || pm.role}
                            </span>
                            {pm.sector && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                Setor: {sectorMap[pm.sector] || pm.sector}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <RemoveMemberButton 
                            projectId={project.id} 
                            memberId={pm.id} 
                            memberName={profile.full_name || 'Usuário'} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                  
                  {linkedMembers.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground text-sm">
                        Nenhum membro vinculado a esta obra.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
