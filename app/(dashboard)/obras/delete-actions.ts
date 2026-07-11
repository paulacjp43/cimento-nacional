"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin")) {
    throw new Error("Apenas administradores podem excluir obras.");
  }

  // To safely delete a project without ON DELETE CASCADE, we must delete daily reports first.
  // First, get all reports for this project
  const { data: reports } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("project_id", projectId);

  if (reports && reports.length > 0) {
    for (const report of reports) {
      await deleteReportAction(report.id, projectId, false); // Don't redirect or revalidate inside loop
    }
  }

  // Delete project members
  await supabase.from("project_members").delete().eq("project_id", projectId);
  
  // Delete project occurrences
  await supabase.from("occurrences").delete().eq("project_id", projectId);
  
  // Delete project attachments
  await supabase.from("attachments").delete().eq("project_id", projectId);

  // Finally delete the project
  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    throw new Error(`Erro ao excluir obra: ${error.message}`);
  }

  revalidatePath("/obras");
  redirect("/obras");
}

export async function deleteReportAction(reportId: string, projectId: string, shouldRedirect = true) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "company_admin" && profile.role !== "superadmin" && profile.role !== "project_manager")) {
    throw new Error("Apenas administradores ou gestores podem excluir relatórios.");
  }

  // Delete all children records manually to prevent FK constraint errors
  await supabase.from("attachments").delete().eq("daily_report_id", reportId);
  await supabase.from("equipment_entries").delete().eq("daily_report_id", reportId);
  await supabase.from("material_entries").delete().eq("daily_report_id", reportId);
  await supabase.from("occurrences").delete().eq("daily_report_id", reportId);
  await supabase.from("workforce_entries").delete().eq("daily_report_id", reportId);
  
  // daily_report_sectors has a fk from report_activities
  const { data: sectors } = await supabase.from("daily_report_sectors").select("id").eq("daily_report_id", reportId);
  if (sectors && sectors.length > 0) {
    for (const sector of sectors) {
      await supabase.from("report_activities").delete().eq("daily_report_sector_id", sector.id);
    }
    await supabase.from("daily_report_sectors").delete().eq("daily_report_id", reportId);
  }

  await (supabase as any).from("sector_messages").delete().eq("daily_report_id", reportId);
  
  // Finally delete the report
  const { error } = await supabase.from("daily_reports").delete().eq("id", reportId);

  if (error) {
    throw new Error(`Erro ao excluir relatório: ${error.message}`);
  }

  if (shouldRedirect) {
    revalidatePath(`/obras/${projectId}/relatorios`);
    redirect(`/obras/${projectId}/relatorios`);
  }
}
