import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/obras/ProjectForm";
import { HardHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editar Obra",
};

export default async function EditarObraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    redirect("/acesso-negado");
  }

  // Buscar dados da obra
  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();

  if (error || !project) {
    redirect("/obras");
  }

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/obras/${id}`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="page-title flex items-center gap-2">
            <HardHat className="w-6 h-6 text-primary-500" /> 
            Editar Obra
          </h1>
          <p className="page-subtitle text-sm">
            Atualize os dados contratuais e informações básicas do projeto.
          </p>
        </div>
      </div>

      <ProjectForm initialData={project} companyId={profile.company_id} />
    </div>
  );
}
