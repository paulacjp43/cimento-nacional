"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function OccurrencesTab({ reportId, companyId, projectId, sector, canEdit = true }: { reportId: string, companyId: string, projectId: string, sector: string, canEdit?: boolean }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const supabase = createClient();

  const fetchEntries = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("occurrences")
        .select("*")
        .eq("daily_report_id", reportId)
        .eq("sector", sector as any)
        .order("created_at", { ascending: true });
        
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ocorrências.");
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
      title: "",
      description: "",
      category: "occurrence_other",
      severity: "low",
      status: "open",
      occurred_at: "",
      action_taken: "",
      responsible: "",
      sector: sector,
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
        .from("occurrences")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      setEntries(entries.filter(e => e.id !== id));
      toast.success("Ocorrência removida.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao remover ocorrência.");
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
      const invalid = newEntries.some(e => !e.title || !e.description);
      if (invalid) {
        toast.error("Preencha o Título e a Descrição em todas as ocorrências novas.");
        setSaving(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const payload = newEntries.map(e => ({
        company_id: companyId,
        project_id: projectId,
        daily_report_id: reportId,
        title: e.title,
        description: e.description,
        category: e.category,
        severity: e.severity,
        status: e.status,
        occurred_at: e.occurred_at ? new Date(e.occurred_at).toISOString() : null,
        action_taken: e.action_taken || null,
        responsible: e.responsible || null,
        created_by: user?.id,
      }));

      const { error } = await supabase
        .from("occurrences")
        .insert(payload);

      if (error) throw error;
      
      toast.success("Ocorrências salvas com sucesso!");
      fetchEntries(); // Reload to get real IDs
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar ocorrências.");
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
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Registro de Ocorrências
        </h4>
        <button
          onClick={handleAddRow}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-xs py-1.5"
        >
          <Plus className="w-3.5 h-3.5 mr-1" /> Nova Ocorrência
        </button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs italic border rounded-lg border-dashed">
            Nenhuma ocorrência registrada neste dia. Clique em &quot;Nova Ocorrência&quot; se houver algum imprevisto.
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className={`p-4 border rounded-lg relative ${entry.isNew ? "bg-amber-50/30 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"}`}>
              <button
                onClick={() => handleRemoveRow(entry.id, entry.isNew)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 pr-8">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Título da Ocorrência *</label>
                  <input
                    type="text"
                    disabled={!entry.isNew}
                    value={entry.title}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].title = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70 font-medium"
                    placeholder="Ex: Falta de energia na betoneira"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Data/Hora (Opcional)</label>
                  <input
                    type="datetime-local"
                    disabled={!entry.isNew}
                    value={entry.occurred_at ? entry.occurred_at.substring(0, 16) : ""}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].occurred_at = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Categoria</label>
                  <select
                    disabled={!entry.isNew}
                    value={entry.category || "occurrence_other"}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].category = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                  >
                    <option value="occurrence_safety">Segurança</option>
                    <option value="occurrence_quality">Qualidade</option>
                    <option value="occurrence_delay">Atraso</option>
                    <option value="occurrence_environment">Meio Ambiente</option>
                    <option value="occurrence_other">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Gravidade</label>
                  <select
                    disabled={!entry.isNew}
                    value={entry.severity || "low"}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].severity = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Status</label>
                  <select
                    disabled={!entry.isNew}
                    value={entry.status || "open"}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].status = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                  >
                    <option value="open">Aberta</option>
                    <option value="in_treatment">Em Tratamento</option>
                    <option value="resolved">Resolvida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Responsável</label>
                  <input
                    type="text"
                    disabled={!entry.isNew}
                    value={entry.responsible || ""}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].responsible = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border-b border-gray-300 focus:border-primary-500 focus:ring-0 p-1 text-sm disabled:opacity-70"
                    placeholder="Nome/Equipe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Descrição Detalhada *</label>
                  <textarea
                    disabled={!entry.isNew}
                    value={entry.description}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].description = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border border-gray-300 rounded-md focus:border-primary-500 focus:ring-0 p-2 text-sm disabled:opacity-70 min-h-[60px]"
                    placeholder="O que aconteceu..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Ação Tomada</label>
                  <textarea
                    disabled={!entry.isNew}
                    value={entry.action_taken || ""}
                    onChange={(e) => {
                      const newEntries = [...entries];
                      newEntries[index].action_taken = e.target.value;
                      setEntries(newEntries);
                    }}
                    className="w-full bg-transparent border border-gray-300 rounded-md focus:border-primary-500 focus:ring-0 p-2 text-sm disabled:opacity-70 min-h-[60px]"
                    placeholder="O que foi feito para corrigir ou mitigar..."
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {entries.some(e => e.isNew) && (
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-sm bg-amber-600 hover:bg-amber-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Salvar Novas Ocorrências"}
          </button>
        </div>
      )}
    </div>
  );
}
