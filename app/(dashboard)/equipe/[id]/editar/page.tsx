import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { UserCog, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditTeamForm } from "./EditTeamForm";
import { UserRole } from "@/types/database";

export default async function EditarMembroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    redirect("/acesso-negado");
  }

  const { data: member } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id as string)
    .single();

  if (!member) {
    redirect("/equipe");
  }


  return (
    <div className="fade-in space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <Link 
          href="/equipe"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Equipe
        </Link>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="bg-primary-100 text-primary-600 p-3 rounded-lg dark:bg-primary-900/30 dark:text-primary-400">
            <UserCog className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Editar Membro</h1>
            <p className="text-sm text-muted-foreground">
              {member.full_name} ({member.email})
            </p>
          </div>
        </div>

        <EditTeamForm 
          userId={member.id} 
          initialRole={member.role as UserRole} 
          initialStatus={member.status || "active"} 
        />
      </div>
    </div>
  );
}
