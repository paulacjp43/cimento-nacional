"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addProjectMemberAction(projectId: string, userId: string, role: string, sector: string | null) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
      return { success: false, error: "Apenas administradores podem gerenciar a equipe da obra." };
    }

    if (!userId || !role) {
      return { success: false, error: "Usuário e função são obrigatórios." };
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("company_id", profile.company_id as string)
      .single();

    if (!project) {
      return { success: false, error: "Projeto não encontrado ou acesso negado." };
    }

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
        return { success: false, error: "Este usuário já está vinculado a esta obra." };
      }
      return { success: false, error: `Erro no banco (Cod: ${error.code}): ${error.message} - Detalhes: ${error.details || ''}` };
    }

    revalidatePath(`/obras/${projectId}/equipe`);
    revalidatePath(`/obras`); 
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Erro inesperado: ${err.message}` };
  }
}

export async function removeProjectMemberAction(projectId: string, memberId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Não autenticado" };

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, company_id")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
      return { success: false, error: "Apenas administradores podem gerenciar a equipe da obra." };
    }

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId)
      .eq("project_id", projectId)
      .eq("company_id", profile.company_id as string);

    if (error) {
      return { success: false, error: `Erro no banco (Cod: ${error.code}): ${error.message}` };
    }

    revalidatePath(`/obras/${projectId}/equipe`);
    revalidatePath(`/obras`);
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: `Erro inesperado: ${err.message}` };
  }
}
