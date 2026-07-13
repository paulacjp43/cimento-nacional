"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldAlert, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface SafetyMetricsTabProps {
  reportId: string;
  canEdit: boolean;
}

export function SafetyMetricsTab({ reportId, canEdit }: SafetyMetricsTabProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const [metrics, setMetrics] = useState<any>({
    dds_realizado: false,
    dds_tema: "",
    dds_responsavel: "",
    dds_participantes: 0,
    inspecoes_realizadas: false,
    nao_conformidades: false,
    atos_inseguros: false,
    condicoes_inseguras: false,
    incidentes: false,
    acidentes: false,
    quase_acidentes: false,
    primeiros_socorros: false,
    interdicao_area: false,
    permissao_trabalho: false,
    trabalho_altura: false,
    trabalho_confinado: false,
    trabalho_quente: false,
    uso_epi: true,
    uso_epc: true,
    medidas_corretivas: "",
    pendencias_seguranca: "",
    responsavel_correcao: "",
    prazo_correcao: "",
    situacao_ocorrencia: "",
    observacoes_gerais: ""
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("daily_report_sectors")
      .select("safety_metrics")
      .eq("daily_report_id", reportId)
      .eq("sector", "safety")
      .single();

    if (error) {
      console.error(error);
    } else if (data?.safety_metrics) {
      setMetrics({ ...metrics, ...(data.safety_metrics as any) });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    const { error } = await supabase
      .from("daily_report_sectors")
      .update({ safety_metrics: metrics })
      .eq("daily_report_id", reportId)
      .eq("sector", "safety");

    if (error) {
      toast.error("Erro ao salvar métricas de segurança");
    } else {
      toast.success("Métricas salvas com sucesso");
    }
    setSaving(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setMetrics({ ...metrics, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setMetrics({ ...metrics, [name]: value });
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          Métricas e Controle de Segurança do Trabalho
        </h3>
        {canEdit && (
          <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Salvar Controle de Segurança
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Bloco de DDS */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Diálogo Diário de Segurança (DDS)
          </h4>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="dds_realizado" checked={metrics.dds_realizado} onChange={handleChange} disabled={!canEdit} className="rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm font-medium">DDS Realizado hoje?</span>
            </label>
            {metrics.dds_realizado && (
              <div className="space-y-3 pl-6 border-l-2 border-gray-200 dark:border-gray-700 mt-2">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tema do DDS</label>
                  <input type="text" name="dds_tema" value={metrics.dds_tema} onChange={handleChange} disabled={!canEdit} className="input w-full py-1 text-sm" placeholder="Ex: Uso correto do cinto de segurança" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Responsável</label>
                    <input type="text" name="dds_responsavel" value={metrics.dds_responsavel} onChange={handleChange} disabled={!canEdit} className="input w-full py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Participantes</label>
                    <input type="number" name="dds_participantes" value={metrics.dds_participantes} onChange={handleChange} disabled={!canEdit} className="input w-full py-1 text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bloco de Inspeções e Rotinas */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Rotinas e Liberações
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="inspecoes_realizadas" checked={metrics.inspecoes_realizadas} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Inspeções Realizadas</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="permissao_trabalho" checked={metrics.permissao_trabalho} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Permissão de Trab. (PT)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="uso_epi" checked={metrics.uso_epi} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Uso de EPI Padrão</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="uso_epc" checked={metrics.uso_epc} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Uso de EPC Padrão</span>
            </label>
          </div>
        </div>

        {/* Bloco de Tipos de Trabalho Especiais */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-amber-50 dark:bg-amber-900/10 md:col-span-2">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-500">
            <AlertTriangle className="w-4 h-4" /> Trabalhos Especiais Realizados
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="trabalho_altura" checked={metrics.trabalho_altura} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Trabalho em Altura</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="trabalho_confinado" checked={metrics.trabalho_confinado} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Espaço Confinado</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="trabalho_quente" checked={metrics.trabalho_quente} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Trabalho a Quente</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="interdicao_area" checked={metrics.interdicao_area} onChange={handleChange} disabled={!canEdit} className="rounded" />
              <span>Interdição de Área</span>
            </label>
          </div>
        </div>

        {/* Bloco de Ocorrências Críticas */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-red-50 dark:bg-red-900/10 md:col-span-2">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm text-red-700 dark:text-red-500">
            <ShieldAlert className="w-4 h-4" /> Ocorrências Críticas e Desvios
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="nao_conformidades" checked={metrics.nao_conformidades} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span>Não Conformidade</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="atos_inseguros" checked={metrics.atos_inseguros} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span>Ato Inseguro</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="condicoes_inseguras" checked={metrics.condicoes_inseguras} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span>Condição Insegura</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="incidentes" checked={metrics.incidentes} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span>Incidente</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="quase_acidentes" checked={metrics.quase_acidentes} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span>Quase Acidente</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="acidentes" checked={metrics.acidentes} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span className="font-bold text-red-600">ACIDENTE</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="primeiros_socorros" checked={metrics.primeiros_socorros} onChange={handleChange} disabled={!canEdit} className="rounded text-red-500 focus:ring-red-500" />
              <span>Primeiros Socorros</span>
            </label>
          </div>

          {/* Campos de texto para detalhes caso alguma ocorrência seja marcada */}
          {(metrics.nao_conformidades || metrics.atos_inseguros || metrics.condicoes_inseguras || metrics.incidentes || metrics.quase_acidentes || metrics.acidentes) && (
            <div className="space-y-4 pt-4 border-t border-red-200 dark:border-red-900/30">
              <div className="p-3 bg-white dark:bg-gray-800 rounded border border-red-100 dark:border-red-900">
                <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-2">Detalhes Obrigatórios de Desvios/Ocorrências</p>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Situação da Ocorrência</label>
                    <input type="text" name="situacao_ocorrencia" value={metrics.situacao_ocorrencia} onChange={handleChange} disabled={!canEdit} className="input w-full py-1.5 text-sm" placeholder="Resumo do que aconteceu" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Medidas Corretivas Adotadas Imediatamente</label>
                    <textarea name="medidas_corretivas" value={metrics.medidas_corretivas} onChange={handleChange} disabled={!canEdit} className="input w-full py-1.5 text-sm" rows={2} placeholder="O que foi feito na hora?" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Pendências de Segurança (Ações futuras)</label>
                    <textarea name="pendencias_seguranca" value={metrics.pendencias_seguranca} onChange={handleChange} disabled={!canEdit} className="input w-full py-1.5 text-sm" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Responsável pela Correção</label>
                      <input type="text" name="responsavel_correcao" value={metrics.responsavel_correcao} onChange={handleChange} disabled={!canEdit} className="input w-full py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Prazo para Correção</label>
                      <input type="date" name="prazo_correcao" value={metrics.prazo_correcao} onChange={handleChange} disabled={!canEdit} className="input w-full py-1.5 text-sm" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Observações Gerais */}
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/20 md:col-span-2">
          <label className="block text-sm font-semibold mb-2">Observações Gerais de Segurança</label>
          <textarea 
            name="observacoes_gerais" 
            value={metrics.observacoes_gerais} 
            onChange={handleChange} 
            disabled={!canEdit} 
            className="input w-full text-sm" 
            rows={3} 
            placeholder="Relate outras informações importantes do dia..." 
          />
        </div>

      </div>
    </div>
  );
}
