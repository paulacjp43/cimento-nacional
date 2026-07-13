"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProjectMemberAction(projectId: string, userId: string, role: string, sector: string | null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  // Verificar se o usuário atual é admin da empresa
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    throw new Error("Apenas administradores podem gerenciar a equipe da obra.");
  }

  // Validar campos
  if (!userId || !role) {
    throw new Error("Usuário e função são obrigatórios.");
  }

  // Verificar se o projeto pertence à empresa do admin
  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .eq("company_id", profile.company_id as string)
    .single();

  if (!project) {
    throw new Error("Projeto não encontrado ou acesso negado.");
  }

  // Inserir membro
  const { error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: userId,
      role: role as any,
      sector: sector as any,
      company_id: profile.company_id as string,
    });

  if (error) {
    if (error.code === '23505') {
      throw new Error("Este usuário já está vinculado a esta obra.");
    }
    throw new Error(`Erro ao adicionar membro: ${error.message}`);
  }

  revalidatePath(`/obras/${projectId}/equipe`);
  revalidatePath(`/obras`); // Revalidar lista de obras para o usuário adicionado
}

export async function removeProjectMemberAction(projectId: string, memberId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    throw new Error("Apenas administradores podem gerenciar a equipe da obra.");
  }

  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("id", memberId)
    .eq("project_id", projectId)
    .eq("company_id", profile.company_id as string);

  if (error) {
    throw new Error(`Erro ao remover membro: ${error.message}`);
  }

  revalidatePath(`/obras/${projectId}/equipe`);
  revalidatePath(`/obras`);
}
