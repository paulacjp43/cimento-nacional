"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfileNameAction(newName: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");
  
  if (!newName || newName.trim().length < 2) {
    throw new Error("O nome deve ter pelo menos 2 caracteres.");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: newName.trim() })
    .eq("id", user.id);

  if (error) {
    throw new Error(`Erro ao atualizar nome: ${error.message}`);
  }

  revalidatePath("/perfil");
  revalidatePath("/dashboard"); // since header uses profile name
}
