"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
    .eq("company_id", profile.company_id);

  if (error) {
    throw new Error(`Erro ao cancelar convite: ${error.message}`);
  }

  revalidatePath("/equipe");
}
