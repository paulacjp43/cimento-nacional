import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Users, UserPlus, Shield, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import { UserRole } from "@/types/database";
import { CancelInvitationButton } from "./CancelInvitationButton";

export const metadata: Metadata = {
  title: "Equipe",
};

const roleMap: Record<UserRole, { label: string; color: string }> = {
  superadmin: { label: "Super Admin", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" },
  company_admin: { label: "Administrador", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  project_manager: { label: "Gestor", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" },
  civil_responsible: { label: "Civil", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  electrical_responsible: { label: "Elétrica", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  mechanical_responsible: { label: "Mecânica", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  viewer: { label: "Visualizador", color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusMap: Record<string, { label: string; icon: any; color: string }> = {
  active: { label: "Ativo", icon: CheckCircle2, color: "text-green-500" },
  invited: { label: "Convidado", icon: Clock, color: "text-amber-500" },
  inactive: { label: "Inativo", icon: AlertCircle, color: "text-gray-500" },
};

export default async function EquipePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get current user's profile to check company_id and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return (
      <div className="empty-state py-12 card text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
        <h2 className="empty-state-title">Acesso Restrito</h2>
        <p className="text-muted-foreground mt-2">Você não está vinculado a nenhuma empresa.</p>
      </div>
    );
  }

  const isAdmin = profile.role === "company_admin" || profile.role === "superadmin";

  // Fetch team members
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: members, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("full_name");

  // Fetch pending invitations (if admin)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let pendingInvitations: any[] = [];
  if (isAdmin) {
    const { data: inv } = await supabase
      .from("invitations")
      .select("*")
      .eq("company_id", profile.company_id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    
    if (inv) pendingInvitations = inv;
  }

  return (
    <div className="fade-in space-y-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Users className="w-6 h-6 text-primary-500" /> Equipe
          </h1>
          <p className="page-subtitle">
            Gerencie os usuários e níveis de acesso da sua empresa.
          </p>
        </div>
        {isAdmin && (
          <a
            href="/equipe/novo"
            className="btn btn-primary"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Convidar Membro
          </a>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Perfil de Acesso</th>
                <th className="px-6 py-4 font-medium">Status</th>
                {isAdmin && <th className="px-6 py-4 font-medium text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {members?.map((member: any) => (
                <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-xs">
                        {member.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {member.full_name}
                          {member.id === user.id && (
                            <span className="ml-2 text-xs text-muted-foreground">(Você)</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${roleMap[member.role as UserRole].color}`}>
                      {member.role === 'company_admin' && <Shield className="w-3 h-3" />}
                      {roleMap[member.role as UserRole].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      {(() => {
                        const s = statusMap[member.status || "active"];
                        const Icon = s.icon;
                        return (
                          <>
                            <Icon className={`w-4 h-4 ${s.color}`} />
                            <span className="text-gray-600 dark:text-gray-300">{s.label}</span>
                          </>
                        );
                      })()}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      {member.role !== "company_admin" && (
                        <a href={`/equipe/${member.id}/editar`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Editar
                        </a>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              
              {/* Convites Pendentes */}
              {pendingInvitations.map((inv) => (
                <tr key={inv.id} className="bg-gray-50/30 dark:bg-gray-800/10">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-500 dark:text-gray-400 italic">
                          Aguardando cadastro
                        </p>
                        <p className="text-xs text-muted-foreground">{inv.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1.5 ${roleMap[inv.role as UserRole].color} opacity-70`}>
                      {roleMap[inv.role as UserRole].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span className="text-gray-500">Convite Pendente</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <CancelInvitationButton invitationId={inv.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {members?.length === 0 && pendingInvitations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Nenhum membro encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
