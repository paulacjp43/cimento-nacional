"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ActivitiesTab({ reportId, companyId, sector, canEdit = true }: { reportId: string, companyId: string, sector: string, canEdit?: boolean }) {
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
        
      if (error && error.code !== "PGRST116") throw error; // Ignore not found error
      
      setSectorData(data || {
        daily_report_id: reportId,
        company_id: companyId,
        sector: sector,
        status: "draft",
        executed_activities: "",
        next_day_forecast: "",
        general_observations: "",
      });
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
      if (sectorData.id) {
        // Update existing
        const { error } = await supabase
          .from("daily_report_sectors")
          .update({
            executed_activities: sectorData.executed_activities,
            next_day_forecast: sectorData.next_day_forecast,
            general_observations: sectorData.general_observations,
          })
          .eq("id", sectorData.id);
          
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("daily_report_sectors")
          .insert({
            daily_report_id: reportId,
            company_id: companyId,
            sector: sector as "civil" | "eletrica" | "mecanica",
            status: "draft",
            executed_activities: sectorData.executed_activities,
            next_day_forecast: sectorData.next_day_forecast,
            general_observations: sectorData.general_observations,
          });
          
        if (error) throw error;
        // Refresh to get ID
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
    setSectorData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  if (!sectorData) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Atividades Executadas (Hoje)
          </label>
          <textarea
            value={sectorData.executed_activities || ""}
            onChange={(e) => handleChange("executed_activities", e.target.value)}
            disabled={!canEdit}
            placeholder="Descreva as atividades executadas neste dia..."
            className="input min-h-[150px] resize-y"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Previsão para o Próximo Dia
          </label>
          <textarea
            value={sectorData.next_day_forecast || ""}
            onChange={(e) => handleChange("next_day_forecast", e.target.value)}
            disabled={!canEdit}
            placeholder="O que está planejado para amanhã..."
            className="input min-h-[150px] resize-y"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Observações Gerais
        </label>
        <textarea
          value={sectorData.general_observations || ""}
          onChange={(e) => handleChange("general_observations", e.target.value)}
          disabled={!canEdit}
          placeholder="Observações adicionais relevantes para este setor..."
          className="input min-h-[100px] resize-y"
        />
      </div>

      {canEdit && (
        <div className="flex justify-end pt-4 border-t dark:border-gray-800">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-primary"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Atividades
          </button>
        </div>
      )}
    </div>
  );
}
