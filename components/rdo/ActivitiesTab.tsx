"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function ActivitiesTab({ reportId, companyId }: { reportId: string, companyId: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sectors, setSectors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSector, setActiveSector] = useState("civil");

  const supabase = createClient();

  const fetchSectors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("daily_report_sectors")
        .select("*")
        .eq("daily_report_id", reportId);
        
      if (error) throw error;
      
      // Ensure we have default objects for the 3 main sectors if they don't exist
      const defaultSectors = ["civil", "eletrica", "mecanica"].map(s => {
        const existing = data?.find(d => d.sector === s);
        return existing || {
          daily_report_id: reportId,
          company_id: companyId,
          sector: s,
          status: "draft",
          executed_activities: "",
          next_day_forecast: "",
          general_observations: "",
        };
      });
      
      setSectors(defaultSectors);
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
      const currentSectorData = sectors.find(s => s.sector === activeSector);
      
      if (currentSectorData.id) {
        // Update existing
        const { error } = await supabase
          .from("daily_report_sectors")
          .update({
            executed_activities: currentSectorData.executed_activities,
            next_day_forecast: currentSectorData.next_day_forecast,
            general_observations: currentSectorData.general_observations,
          })
          .eq("id", currentSectorData.id);
          
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("daily_report_sectors")
          .insert({
            daily_report_id: reportId,
            company_id: companyId,
            sector: activeSector as "civil" | "eletrica" | "mecanica",
            status: "draft",
            executed_activities: currentSectorData.executed_activities,
            next_day_forecast: currentSectorData.next_day_forecast,
            general_observations: currentSectorData.general_observations,
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
    setSectors(prev => prev.map(s => {
      if (s.sector === activeSector) {
        return { ...s, [field]: value };
      }
      return s;
    }));
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  const currentData = sectors.find(s => s.sector === activeSector) || {};

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
        {["civil", "eletrica", "mecanica"].map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSector(sec)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSector === sec 
                ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {sec.charAt(0).toUpperCase() + sec.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Atividades Executadas (Hoje)
          </label>
          <textarea
            rows={5}
            value={currentData.executed_activities || ""}
            onChange={(e) => handleChange("executed_activities", e.target.value)}
            className="input resize-none"
            placeholder="Descreva detalhadamente os serviços executados..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Atividades Programadas (Amanhã)
          </label>
          <textarea
            rows={3}
            value={currentData.next_day_forecast || ""}
            onChange={(e) => handleChange("next_day_forecast", e.target.value)}
            className="input resize-none"
            placeholder="O que está programado para o próximo dia útil?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observações Gerais / Interferências
          </label>
          <textarea
            rows={2}
            value={currentData.general_observations || ""}
            onChange={(e) => handleChange("general_observations", e.target.value)}
            className="input resize-none"
            placeholder="Falta de material, problemas técnicos, etc..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary min-w-[140px] justify-center"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
            <><Save className="w-4 h-4 mr-2" /> Salvar {activeSector.charAt(0).toUpperCase() + activeSector.slice(1)}</>
          )}
        </button>
      </div>
    </div>
  );
}
