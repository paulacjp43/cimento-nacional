"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface WorkforceEntry {
  id: string;
  isNew?: boolean;
  role: string;
  quantity: number | string;
  company_name: string | null;
  hours_worked: number | string | null;
  sector: "civil" | "eletrica" | "mecanica" | null;
  observations: string | null;
  daily_report_id?: string;
  company_id?: string;
  created_at?: string;
}

export function WorkforceTab({ reportId, companyId, sector, canEdit = true }: { reportId: string, companyId: string, sector: string, canEdit?: boolean }) {
  const [entries, setEntries] = useState<WorkforceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("workforce_entries")
        .select("*")
        .eq("daily_report_id", reportId)
        .eq("sector", sector as any)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar efetivo.");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEntries();
  }, [fetchEntries]);

  const handleAddRow = () => {
    const newRow: WorkforceEntry = {
      id: `temp-${Date.now()}`,
      isNew: true,
      role: "",
      quantity: 1,
      company_name: "",
      hours_worked: 8,
      sector: sector as any,
      observations: "",
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
        .from("workforce_entries")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast.success("Registro removido.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover registro.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newEntries = entries.filter((e) => e.isNew);
      if (newEntries.length === 0) {
        setSaving(false);
        toast.info("Nenhum registro novo para salvar.");
        return;
      }

      const invalid = newEntries.some((e) => !e.role || !e.quantity);
      if (invalid) {
        toast.error("Preencha Função e Quantidade em todos os registros novos.");
        setSaving(false);
        return;
      }

      const payload = newEntries.map((e) => ({
        company_id: companyId,
        daily_report_id: reportId,
        role: e.role,
        quantity: parseInt(String(e.quantity)),
        company_name: e.company_name || null,
        hours_worked: parseFloat(String(e.hours_worked)) || null,
        sector: e.sector,
        observations: e.observations || null,
      }));

      const { error } = await supabase
        .from("workforce_entries")
        .insert(payload);

      if (error) throw error;
      
      toast.success("Efetivo salvo com sucesso!");
      fetchEntries();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar registros.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-500" /> Registros de Mão de Obra
        </h4>
        <button
          onClick={handleAddRow}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs py-1.5"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Linha
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/30">
            <tr>
              <th className="px-3 py-2 font-medium">Função (Cargo) <span className="text-red-500">*</span></th>
              <th className="px-3 py-2 font-medium w-24">Qtd <span className="text-red-500">*</span></th>
              <th className="px-3 py-2 font-medium">Empresa</th>
              <th className="px-3 py-2 font-medium w-24">Horas</th>
              <th className="px-3 py-2 font-medium w-32">Setor</th>
              <th className="px-3 py-2 font-medium">Observações</th>
              <th className="px-3 py-2 font-medium text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground text-xs italic">
                  Nenhum registro de efetivo. Clique em &quot;Adicionar Linha&quot;.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr key={entry.id} className={entry.isNew ? "bg-primary-50/30 dark:bg-primary-900/10" : ""}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      disabled={!entry.isNew}
                      value={entry.role}
                      onChange={(e) => {
                        setEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], role: e.target.value };
                          return updated;
                        });
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70 disabled:hover:border-transparent"
                      placeholder="Ex: Pedreiro"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      disabled={!entry.isNew}
                      value={entry.quantity}
                      min="1"
                      onChange={(e) => {
                        setEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], quantity: e.target.value };
                          return updated;
                        });
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      disabled={!entry.isNew}
                      value={entry.company_name || ""}
                      onChange={(e) => {
                        setEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], company_name: e.target.value };
                          return updated;
                        });
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                      placeholder="Própria / Terceirizada"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      disabled={!entry.isNew}
                      value={entry.hours_worked || ""}
                      step="0.5"
                      onChange={(e) => {
                        setEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], hours_worked: e.target.value };
                          return updated;
                        });
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      disabled={!entry.isNew}
                      value={entry.sector || "civil"}
                      onChange={(e) => {
                        setEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], sector: e.target.value as "civil" | "eletrica" | "mecanica" | null };
                          return updated;
                        });
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70 text-gray-700 dark:text-gray-300"
                    >
                      <option value="civil">Civil</option>
                      <option value="eletrica">Elétrica</option>
                      <option value="mecanica">Mecânica</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      disabled={!entry.isNew}
                      value={entry.observations || ""}
                      onChange={(e) => {
                        setEntries((prev) => {
                          const updated = [...prev];
                          updated[index] = { ...updated[index], observations: e.target.value };
                          return updated;
                        });
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                      placeholder="Obs..."
                    />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleRemoveRow(entry.id, entry.isNew)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {entries.some((e) => e.isNew) && (
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-sm"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Salvar Novos Registros"}
          </button>
        </div>
      )}
    </div>
  );
}
