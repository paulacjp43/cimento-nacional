"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  const supabaseAdmin = createAdminClient();

  // Enviar convite via Auth Admin
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email.toLowerCase(),
    {
      data: {
        role: role,
        company_id: profile.company_id,
      },
      // Configurar o redirecionamento para a tela de definição de senha
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/definir-senha`
    }
  );

  if (inviteError) {
    console.error("Erro ao enviar convite via Admin:", inviteError);
    if (inviteError.status === 429) {
      return { error: "Limite temporário de envio de e-mails atingido. Tente novamente em instantes." };
    }
    return { error: `Erro ao enviar convite: ${inviteError.message}` };
  }

  // Registrar na tabela invitations para auditoria/listagem
  const { error } = await supabase
    .from("invitations")
    .insert({
      company_id: profile.company_id,
      email: email.toLowerCase(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: role as any,
      created_by: user.id
    });

  if (error) {
    if (error.code === "23505") {
      // Se já existe um convite pendente, podemos apenas atualizar ou ignorar,
      // pois o email já foi reenviado pelo admin.inviteUserByEmail acima.
    } else {
      console.error(error);
    }
  }

  revalidatePath("/equipe");
  return { success: true };
}
