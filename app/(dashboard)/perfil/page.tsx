import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Mail, Shield, Building2 } from "lucide-react";
import type { Metadata } from "next";
import { UserRole } from "@/types/database";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ChangeNameForm } from "./ChangeNameForm";

export const metadata: Metadata = {
  title: "Meu Perfil",
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

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, company:companies(name)")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <User className="w-6 h-6 text-primary-500" /> Meu Perfil
        </h1>
        <p className="page-subtitle">
          Gerencie suas informações pessoais e senha de acesso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Informações do Usuário */}
        <div className="md:col-span-1 space-y-6">
          <div className="card p-6">
            <ChangeNameForm initialName={profile.full_name} />
            <div className="flex flex-col items-center pb-6 border-b border-gray-100 dark:border-gray-800">
              <span className={`mt-2 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit ${roleMap[profile.role as UserRole]?.color || "bg-gray-100 text-gray-800"}`}>
                {profile.role === 'company_admin' && <Shield className="w-3 h-3" />}
                {roleMap[profile.role as UserRole]?.label || profile.role}
              </span>
            </div>

            <div className="pt-6 space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">E-mail</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{profile.email}</p>
                </div>
              </div>

              {profile.company && (
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Empresa Vinculada</p>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{(profile.company as any).name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Formulário de Senha */}
        <div className="md:col-span-2">
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
