"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Award, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface ConcreteEntry {
  id: string;
  isNew?: boolean;
  isModified?: boolean;
  molding_date: string;
  structural_element: string;
  supplier: string | null;
  concrete_class: string | null;
  slump: number | string | null;
  volume: number | string | null;
  delivery_note: string | null;
  strength_7d: number | string | null;
  strength_28d: number | string | null;
  status: string;
  daily_report_id?: string | null;
  company_id?: string | null;
  project_id?: string | null;
  created_at?: string | null;
}

export function ConcreteControlTab({
  reportId,
  companyId,
  projectId,
  canEdit = true,
}: {
  reportId: string;
  companyId: string;
  projectId: string;
  canEdit?: boolean;
}) {
  const [entries, setEntries] = useState<ConcreteEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("concrete_control")
        .select("*")
        .eq("daily_report_id", reportId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setEntries((data as any[]) || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar controle tecnológico.");
    } finally {
      setLoading(false);
    }
  }, [reportId, supabase]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleAddRow = () => {
    const today = new Date().toISOString().split("T")[0];
    const newRow: ConcreteEntry = {
      id: `temp-${Date.now()}`,
      isNew: true,
      molding_date: today,
      structural_element: "",
      supplier: "",
      concrete_class: "",
      slump: "",
      volume: "",
      delivery_note: "",
      strength_7d: "",
      strength_28d: "",
      status: "Aguardando",
    };
    setEntries((prev) => [...prev, newRow]);
  };

  const handleRemoveRow = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("concrete_control")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Registro de controle tecnológico removido.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover registro.");
    }
  };

  const handleFieldChange = (index: number, field: keyof ConcreteEntry, value: any) => {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
        isModified: !updated[index].isNew ? true : undefined,
      };
      return updated;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newEntries = entries.filter((e) => e.isNew);
      const modifiedEntries = entries.filter((e) => e.isModified && !e.isNew);

      // Validação rápida
      const invalidNew = newEntries.some((e) => !e.structural_element || !e.molding_date);
      const invalidMod = modifiedEntries.some((e) => !e.structural_element || !e.molding_date);
      if (invalidNew || invalidMod) {
        toast.error("Preencha o Elemento Estrutural e a Data de Moldagem.");
        setSaving(false);
        return;
      }

      // 1. Inserir novos
      if (newEntries.length > 0) {
        const insertPayload = newEntries.map((e) => ({
          company_id: companyId,
          project_id: projectId,
          daily_report_id: reportId,
          molding_date: e.molding_date,
          structural_element: e.structural_element,
          supplier: e.supplier || null,
          concrete_class: e.concrete_class || null,
          slump: e.slump ? parseInt(String(e.slump)) : null,
          volume: e.volume ? parseFloat(String(e.volume)) : null,
          delivery_note: e.delivery_note || null,
          strength_7d: e.strength_7d ? parseFloat(String(e.strength_7d)) : null,
          strength_28d: e.strength_28d ? parseFloat(String(e.strength_28d)) : null,
          status: e.status || "Aguardando",
        }));

        const { error: insError } = await supabase
          .from("concrete_control")
          .insert(insertPayload);

        if (insError) throw insError;
      }

      // 2. Atualizar existentes modificados
      if (modifiedEntries.length > 0) {
        for (const e of modifiedEntries) {
          const { error: updError } = await supabase
            .from("concrete_control")
            .update({
              molding_date: e.molding_date,
              structural_element: e.structural_element,
              supplier: e.supplier || null,
              concrete_class: e.concrete_class || null,
              slump: e.slump ? parseInt(String(e.slump)) : null,
              volume: e.volume ? parseFloat(String(e.volume)) : null,
              delivery_note: e.delivery_note || null,
              strength_7d: e.strength_7d ? parseFloat(String(e.strength_7d)) : null,
              strength_28d: e.strength_28d ? parseFloat(String(e.strength_28d)) : null,
              status: e.status,
            })
            .eq("id", e.id);

          if (updError) throw updError;
        }
      }

      toast.success("Controle tecnológico salvo com sucesso!");
      fetchEntries();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar controle tecnológico.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary-500" /> Acompanhamento de Controle Tecnológico (Concreto)
        </h4>
        {canEdit && (
          <button
            onClick={handleAddRow}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs py-1.5"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Ensaio
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-muted-foreground bg-gray-50 dark:bg-gray-800/30 uppercase tracking-wider">
            <tr>
              <th className="px-2 py-2 font-medium w-32">Membro Estrutural *</th>
              <th className="px-2 py-2 font-medium w-28">Data Moldagem *</th>
              <th className="px-2 py-2 font-medium">Fornecedor</th>
              <th className="px-2 py-2 font-medium w-24">Classe (Fck)</th>
              <th className="px-2 py-2 font-medium w-16 text-center">Slump (mm)</th>
              <th className="px-2 py-2 font-medium w-16 text-center">Vol (m³)</th>
              <th className="px-2 py-2 font-medium">NF / Lacre</th>
              <th className="px-2 py-2 font-medium w-16 text-center">7d (MPa)</th>
              <th className="px-2 py-2 font-medium w-16 text-center">28d (MPa)</th>
              <th className="px-2 py-2 font-medium w-28 text-center">Status</th>
              {canEdit && <th className="px-2 py-2 font-medium text-center w-10"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={canEdit ? 11 : 10}
                  className="px-3 py-8 text-center text-muted-foreground text-xs italic"
                >
                  Nenhum registro de controle tecnológico neste RDO.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={
                    entry.isNew
                      ? "bg-primary-50/30 dark:bg-primary-900/10"
                      : entry.isModified
                      ? "bg-amber-50/20 dark:bg-amber-900/5"
                      : ""
                  }
                >
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={entry.structural_element}
                      onChange={(e) =>
                        handleFieldChange(index, "structural_element", e.target.value)
                      }
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="Ex: Laje L1"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="date"
                      disabled={!canEdit}
                      value={entry.molding_date}
                      onChange={(e) =>
                        handleFieldChange(index, "molding_date", e.target.value)
                      }
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={entry.supplier || ""}
                      onChange={(e) => handleFieldChange(index, "supplier", e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="Fornecedor"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={entry.concrete_class || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "concrete_class", e.target.value)
                      }
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="Ex: C30"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      disabled={!canEdit}
                      value={entry.slump ?? ""}
                      onChange={(e) => handleFieldChange(index, "slump", e.target.value)}
                      className="w-full text-center bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="mm"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      step="any"
                      disabled={!canEdit}
                      value={entry.volume ?? ""}
                      onChange={(e) => handleFieldChange(index, "volume", e.target.value)}
                      className="w-full text-center bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="m³"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={entry.delivery_note || ""}
                      onChange={(e) =>
                        handleFieldChange(index, "delivery_note", e.target.value)
                      }
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="NF / Lacre"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      step="any"
                      disabled={!canEdit}
                      value={entry.strength_7d ?? ""}
                      onChange={(e) =>
                        handleFieldChange(index, "strength_7d", e.target.value)
                      }
                      className="w-full text-center bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="MPa"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="number"
                      step="any"
                      disabled={!canEdit}
                      value={entry.strength_28d ?? ""}
                      onChange={(e) =>
                        handleFieldChange(index, "strength_28d", e.target.value)
                      }
                      className="w-full text-center bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75"
                      placeholder="MPa"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      disabled={!canEdit}
                      value={entry.status}
                      onChange={(e) => handleFieldChange(index, "status", e.target.value)}
                      className={`w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-xs disabled:opacity-75 font-semibold text-center ${
                        entry.status === "Aprovado"
                          ? "text-green-600 dark:text-green-400"
                          : entry.status === "Reprovado"
                          ? "text-red-600 dark:text-red-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <option value="Aguardando" className="text-amber-600 font-medium">Aguardando</option>
                      <option value="Aprovado" className="text-green-600 font-medium">Aprovado</option>
                      <option value="Reprovado" className="text-red-600 font-medium">Reprovado</option>
                    </select>
                  </td>
                  {canEdit && (
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => handleRemoveRow(entry.id, entry.isNew)}
                        className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {canEdit && entries.some((e) => e.isNew || e.isModified) && (
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-xs"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Controle Tecnológico
          </button>
        </div>
      )}
    </div>
  );
}
