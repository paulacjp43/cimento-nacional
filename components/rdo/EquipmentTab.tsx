"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, Tractor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function EquipmentTab({ reportId, companyId, sector, canEdit = true }: { reportId: string, companyId: string, sector: string, canEdit?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("equipment_entries")
        .select("*")
        .eq("daily_report_id", reportId)
        .eq("sector", sector as any)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar equipamentos.");
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
    const newRow = {
      id: `temp-${Date.now()}`,
      isNew: true,
      name: "",
      quantity: 1,
      owner_company: "",
      hours_used: "",
      status: "operating",
      sector: sector,
      observations: "",
    };
    setEntries([...entries, newRow]);
  };

  const handleRemoveRow = async (id: string, isNew?: boolean) => {
    if (isNew) {
      setEntries(entries.filter(e => e.id !== id));
      return;
    }

    try {
      const { error } = await supabase
        .from("equipment_entries")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      setEntries(entries.filter(e => e.id !== id));
      toast.success("Equipamento removido.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover equipamento.");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const newEntries = entries.filter(e => e.isNew);
      if (newEntries.length === 0) {
        setSaving(false);
        return;
      }

      // Validate
      const invalid = newEntries.some(e => !e.name || !e.quantity);
      if (invalid) {
        toast.error("Preencha Nome do Equipamento e Quantidade em todos os registros novos.");
        setSaving(false);
        return;
      }

      const payload = newEntries.map(e => ({
        company_id: companyId,
        daily_report_id: reportId,
        name: e.name,
        quantity: parseInt(e.quantity),
        owner_company: e.owner_company || null,
        hours_used: parseFloat(e.hours_used) || null,
        status: e.status,
        sector: e.sector,
        observations: e.observations || null,
      }));

      const { error } = await supabase
        .from("equipment_entries")
        .insert(payload);

      if (error) throw error;
      
      toast.success("Equipamentos salvos com sucesso!");
      fetchEntries(); // Reload to get real IDs
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar equipamentos.");
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
          <Tractor className="w-4 h-4 text-primary-500" /> Registros de Equipamentos
        </h4>
        <button
          onClick={handleAddRow}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs py-1.5"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar Equipamento
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/30">
            <tr>
              <th className="px-3 py-2 font-medium">Equipamento <span className="text-red-500">*</span></th>
              <th className="px-3 py-2 font-medium w-20">Qtd <span className="text-red-500">*</span></th>
              <th className="px-3 py-2 font-medium">Proprietário</th>
              <th className="px-3 py-2 font-medium w-24">Horas Uso</th>
              <th className="px-3 py-2 font-medium w-36">Situação</th>
              <th className="px-3 py-2 font-medium w-32">Setor</th>
              <th className="px-3 py-2 font-medium">Observações</th>
              <th className="px-3 py-2 font-medium text-center w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground text-xs italic">
                  Nenhum equipamento registrado. Clique em &quot;Adicionar Equipamento&quot;.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr key={entry.id} className={entry.isNew ? "bg-primary-50/30 dark:bg-primary-900/10" : ""}>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      disabled={!entry.isNew}
                      value={entry.name}
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].name = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70 disabled:hover:border-transparent"
                      placeholder="Ex: Retroescavadeira"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      disabled={!entry.isNew}
                      value={entry.quantity}
                      min="1"
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].quantity = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      disabled={!entry.isNew}
                      value={entry.owner_company || ""}
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].owner_company = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                      placeholder="Empresa/Terceiro"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      disabled={!entry.isNew}
                      value={entry.hours_used || ""}
                      step="0.5"
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].hours_used = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <select
                      disabled={!entry.isNew}
                      value={entry.status || "operating"}
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].status = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70 text-gray-700 dark:text-gray-300"
                    >
                      <option value="operating">Operando</option>
                      <option value="stopped">Parado</option>
                      <option value="maintenance">Manutenção</option>
                      <option value="unavailable">Indisponível</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      disabled={!entry.isNew}
                      value={entry.sector || "civil"}
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].sector = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70 text-gray-700 dark:text-gray-300"
                    >
                      <option value="civil">Civil</option>
                      <option value="eletrica">Elétrica</option>
                      <option value="mecanica">Mecânica</option>
                      <option value="safety">Safety</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      disabled={!entry.isNew}
                      value={entry.observations || ""}
                      onChange={(e) => {
                        const newEntries = [...entries];
                        newEntries[index].observations = e.target.value;
                        setEntries(newEntries);
                      }}
                      className="w-full bg-transparent border-0 border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                      placeholder="Motivo de parada..."
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

      {entries.some(e => e.isNew) && (
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
