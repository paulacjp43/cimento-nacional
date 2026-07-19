"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save, CalendarCheck2, CheckSquare, XSquare, CalendarClock, StickyNote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const EMPTY_SECTOR = (reportId: string, companyId: string, sector: string) => ({
  daily_report_id: reportId,
  company_id: companyId,
  sector,
  status: "draft",
  day_forecast: "",
  executed_activities: "",
  not_executed_activities: "",
  next_day_forecast: "",
  general_observations: "",
});

interface SectorField {
  key: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  minHeight: string;
  accent: string;
}

const FIELDS: SectorField[] = [
  {
    key: "day_forecast",
    label: "Previsão do Dia",
    placeholder: "Descreva o que estava programado para ser executado neste dia...",
    icon: <CalendarCheck2 className="w-4 h-4 text-blue-500" />,
    minHeight: "min-h-[120px]",
    accent: "border-l-4 border-blue-400",
  },
  {
    key: "executed_activities",
    label: "Atividades Executadas",
    placeholder: "Descreva o que foi efetivamente realizado neste dia...",
    icon: <CheckSquare className="w-4 h-4 text-green-500" />,
    minHeight: "min-h-[140px]",
    accent: "border-l-4 border-green-400",
  },
  {
    key: "not_executed_activities",
    label: "Atividades Programadas Não Executadas",
    placeholder: "Liste o que estava previsto mas não foi realizado, e o motivo...",
    icon: <XSquare className="w-4 h-4 text-red-500" />,
    minHeight: "min-h-[100px]",
    accent: "border-l-4 border-red-400",
  },
  {
    key: "next_day_forecast",
    label: "Previsão para o Próximo Dia",
    placeholder: "O que está planejado para amanhã...",
    icon: <CalendarClock className="w-4 h-4 text-amber-500" />,
    minHeight: "min-h-[100px]",
    accent: "border-l-4 border-amber-400",
  },
  {
    key: "general_observations",
    label: "Observações Gerais",
    placeholder: "Observações adicionais relevantes para este setor...",
    icon: <StickyNote className="w-4 h-4 text-gray-400" />,
    minHeight: "min-h-[80px]",
    accent: "border-l-4 border-gray-300",
  },
];

export function ActivitiesTab({
  reportId,
  companyId,
  sector,
  canEdit = true,
}: {
  reportId: string;
  companyId: string;
  sector: string;
  canEdit?: boolean;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sectorData, setSectorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchSectors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("daily_report_sectors")
        .select("*")
        .eq("daily_report_id", reportId)
        .eq("sector", sector as any)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setSectorData(data || EMPTY_SECTOR(reportId, companyId, sector));
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar atividades.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSectors();
  }, [fetchSectors]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fields = {
        day_forecast: sectorData.day_forecast || "",
        executed_activities: sectorData.executed_activities || "",
        not_executed_activities: sectorData.not_executed_activities || "",
        next_day_forecast: sectorData.next_day_forecast || "",
        general_observations: sectorData.general_observations || "",
      };

      if (sectorData.id) {
        // Atualiza existente
        const { error } = await supabase
          .from("daily_report_sectors")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update(fields as any)
          .eq("id", sectorData.id);

        if (error) throw error;
      } else {
        // Insere novo
        const { error } = await supabase
          .from("daily_report_sectors")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({
            daily_report_id: reportId,
            company_id: companyId,
            sector: sector as "civil" | "eletrica" | "mecanica",
            status: "draft",
            ...fields,
          } as any);

        if (error) throw error;
        await fetchSectors();
      }

      toast.success("Atividades salvas com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar atividades.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setSectorData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!sectorData) return null;

  return (
    <div className="space-y-5">
      {FIELDS.map((field) => (
        <div key={field.key} className={`rounded-xl bg-white dark:bg-gray-900 shadow-sm border dark:border-gray-800 overflow-hidden ${field.accent}`}>
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            {field.icon}
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {field.label}
            </label>
          </div>
          <div className="px-4 pb-3">
            <textarea
              value={sectorData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              disabled={!canEdit}
              placeholder={field.placeholder}
              className={`w-full bg-transparent border-0 focus:ring-0 p-0 text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-y disabled:opacity-70 ${field.minHeight}`}
            />
          </div>
        </div>
      ))}

      {canEdit && (
        <div className="flex justify-end pt-2 border-t dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Atividades
          </button>
        </div>
      )}
    </div>
  );
}
