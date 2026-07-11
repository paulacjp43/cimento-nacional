"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createInvitation(formData: FormData) {
  const email = formData.get("email") as string;
  const role = formData.get("role") as string;

  if (!email || !role) {
    return { error: "E-mail e Perfil de acesso são obrigatórios." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Não autenticado." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    return { error: "Sem permissão para gerar convites." };
  }

  const { data: inv, error } = await supabase
    .from("invitations")
    .insert({
      company_id: profile.company_id,
      email: email.toLowerCase(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: role as any,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um convite pendente para este e-mail." };
    }
    console.error(error);
    return { error: "Falha ao gerar o convite. Tente novamente." };
  }

  revalidatePath("/equipe");
  return { success: true, token: inv.token };
}
