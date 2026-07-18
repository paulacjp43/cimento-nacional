"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { WeatherCondition, DaySituation, ReportStatus } from "@/types/database";

export async function createDailyReportAction(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) throw new Error("Empresa não encontrada");

  const report_date = formData.get("report_date") as string;
  const weather_morning = formData.get("weather_morning") as WeatherCondition;
  const weather_afternoon = formData.get("weather_afternoon") as WeatherCondition;
  const temperature = formData.get("temperature") ? parseInt(formData.get("temperature") as string, 10) : null;
  const day_situation = formData.get("day_situation") as DaySituation;
  const had_rain = formData.get("had_rain") === "on";

  // Check if report already exists for this date
  const { data: existing } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("project_id", projectId)
    .eq("report_date", report_date)
    .maybeSingle();

  if (existing) {
    throw new Error("Já existe um relatório criado para esta data.");
  }

  // Validate if the user is authorized to create reports (Admin, Manager, etc.)
  const { data: hasAccess, error: accessError } = await supabase
    .rpc("can_view_project" as any, { p_project_id: projectId });

  if (accessError || !hasAccess) {
    throw new Error("Usuário não tem permissão para acessar esta obra.");
  }

  const { data: profileRole } = await supabase.rpc("get_my_role" as any);
  const { data: projectRole } = await supabase.rpc("get_project_role" as any, { p_project_id: projectId });

  if (profileRole !== 'company_admin' && profileRole !== 'superadmin' && projectRole !== 'manager') {
    throw new Error("Apenas administradores e gerentes de obra podem iniciar um RDO.");
  }

  // Insert the daily report
  const { data: newReport, error: insertError } = await supabase
    .from("daily_reports")
    .insert({
      company_id: profile.company_id,
      project_id: projectId,
      report_date,
      weather_morning,
      weather_afternoon,
      temperature,
      day_situation,
      had_rain,
      created_by: user.id,
      status: "draft"
    })
    .select("id")
    .single();

  if (insertError) throw insertError;

  // Now create the 4 sectors automatically
  const sectors = ["civil", "eletrica", "mecanica", "safety"];
  
  for (const sector of sectors) {
    await supabase.from("daily_report_sectors").insert({
      company_id: profile.company_id,
      daily_report_id: newReport.id,
      sector: sector as any,
      status: "draft" as any,
      created_by: user.id
    });
  }

  revalidatePath(`/obras/${projectId}/relatorios`);
  return newReport.id;
}

export async function updateAllSectorsStatusAction(reportId: string, projectId: string, status: ReportStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  // Check if user is admin or manager
  const { data: profileRole } = await supabase.rpc("get_my_role" as any);
  const { data: projectRole } = await supabase.rpc("get_project_role" as any, { p_project_id: projectId });

  if (profileRole !== 'company_admin' && profileRole !== 'superadmin' && projectRole !== 'manager') {
    throw new Error("Apenas administradores e gerentes podem atualizar o status de todos os setores de uma vez.");
  }
  
  const { error } = await supabase
    .from("daily_report_sectors")
    .update({ status: status as any })
    .eq("daily_report_id", reportId);

  if (error) throw error;

  revalidatePath(`/obras/${projectId}/relatorios/${reportId}`);
  revalidatePath(`/obras/${projectId}/relatorios`);
}

export async function updateSectorStatusAction(reportId: string, projectId: string, sector: string, status: ReportStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autenticado");

  const { data: profileRole } = await supabase.rpc("get_my_role" as any);
  const { data: projectRole } = await supabase.rpc("get_project_role" as any, { p_project_id: projectId });

  const isManagerOrAdmin = profileRole === 'company_admin' || profileRole === 'superadmin' || projectRole === 'manager';
  const isSectorResponsible = projectRole === sector || (projectRole === 'electrical' && sector === 'eletrica') || (projectRole === 'mechanical' && sector === 'mecanica');

  if (!isManagerOrAdmin && !isSectorResponsible) {
    throw new Error("Você não tem permissão para atualizar o status deste setor.");
  }

  // Se o status for de aprovação ou devolução, requer manager ou admin
  if ((status === 'approved' || status === 'returned' || status === 'under_review') && !isManagerOrAdmin) {
    if (status === 'under_review' && isSectorResponsible) {
       // O responsável pelo setor PODE enviar para revisão.
    } else {
       throw new Error("Você não tem permissão para aprovar ou devolver este setor.");
    }
  }

  const { error } = await supabase
    .from("daily_report_sectors")
    .update({ status: status as any })
    .eq("daily_report_id", reportId)
    .eq("sector", sector as any);

  if (error) throw error;

  revalidatePath(`/obras/${projectId}/relatorios/${reportId}`);
  revalidatePath(`/obras/${projectId}/relatorios`);
}
