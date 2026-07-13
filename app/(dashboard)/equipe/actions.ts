"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { UserRole } from "@/types/database";

export async function cancelInvitationAction(invitationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    throw new Error("Apenas administradores podem cancelar convites.");
  }

  const { error } = await supabase
    .from("invitations")
    .delete()
    .eq("id", invitationId)
    .eq("company_id", profile.company_id as string);

  if (error) {
    throw new Error(`Erro ao cancelar convite: ${error.message}`);
  }

  revalidatePath("/equipe");
}

export async function editTeamMemberAction(userId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    throw new Error("Apenas administradores podem editar membros da equipe.");
  }

  const role = formData.get("role") as string;
  const status = formData.get("status") as string;

  if (!role || !status) {
    throw new Error("Preencha todos os campos obrigatórios.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role: role as UserRole, status: status as "active" | "inactive" | "invited" | "suspended" })
    .eq("id", userId)
    .eq("company_id", profile.company_id as string);

  if (error) {
    throw new Error(`Erro ao atualizar membro: ${error.message}`);
  }

  revalidatePath("/equipe");
}

export async function deleteTeamMemberAction(userId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");
  if (user.id === userId) throw new Error("Você não pode excluir sua própria conta.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    throw new Error("Apenas administradores podem excluir membros.");
  }

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetProfile?.role === "company_admin" && profile.role !== "superadmin") {
    throw new Error("Apenas o Super Admin pode excluir outro administrador.");
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)
    .eq("company_id", profile.company_id as string);

  if (error) {
    throw new Error(`Erro ao excluir membro: ${error.message}`);
  }

  revalidatePath("/equipe");
}
