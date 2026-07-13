"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function acceptInvitation(email: string, userId: string) {
  try {
    const supabaseAdmin = createAdminClient();

    // 1. Buscar e atualizar o convite para 'accepted'
    const { data: inv, error: invError } = await supabaseAdmin
      .from("invitations")
      .update({ 
        status: "accepted", 
        accepted_at: new Date().toISOString() 
      })
      .eq("email", email)
      .eq("status", "pending")
      .select("company_id, role")
      .single();

    if (invError || !inv) {
      console.error("Erro ao aceitar convite (ou não encontrado):", invError);
      return { success: false, error: "Convite não encontrado ou já aceito." };
    }

    // 2. Atualizar o perfil do usuário com a role e company_id
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({
        company_id: inv.company_id,
        role: inv.role
      })
      .eq("id", userId);

    if (profileError) {
      console.error("Erro ao atualizar perfil do usuário:", profileError);
      return { success: false, error: "Erro ao vincular perfil à empresa." };
    }

    return { success: true };
  } catch (error) {
    console.error("Erro inesperado em acceptInvitation:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}
