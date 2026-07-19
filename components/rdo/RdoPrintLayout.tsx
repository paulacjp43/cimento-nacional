"use client";

import { Sun, Cloud, CloudRain, AlertCircle } from "lucide-react";
import Image from "next/image";

interface RdoPrintLayoutProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  workforce: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  equipment: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  materials: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  concreteControl?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  occurrences: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activities: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectorMessages: any[];
  singleSector?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const weatherMap: Record<string, { label: string; icon: any }> = {
  sunny: { label: "Ensolarado", icon: Sun },
  partly_cloudy: { label: "Parcialmente Nublado", icon: Cloud },
  cloudy: { label: "Nublado", icon: Cloud },
  rainy: { label: "Chuvoso", icon: CloudRain },
  heavy_rain: { label: "Chuva Forte", icon: CloudRain },
  other: { label: "Outro", icon: AlertCircle },
};

const situationMap: Record<string, string> = {
  normal: "Expediente Normal",
  partial: "Expediente Parcial",
  halted: "Paralisado",
  holiday: "Feriado/Folga",
};

const severityMap: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  critical: "Crítica",
};

import { REPORT_STATUS_LABELS } from "@/lib/constants";

export function RdoPrintLayout({ 
  report, 
  project, 
  workforce, 
  equipment, 
  materials, 
  concreteControl = [],
  occurrences, 
  activities, 
  attachments,
  sectorMessages,
  previewMode = false,
  singleSector
}: RdoPrintLayoutProps & { previewMode?: boolean }) {
  // Format Date
  const dateParts = report.report_date.split('-');
  const formattedDate = dateParts.length === 3 
    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
    : report.report_date;

  const morningWeather = weatherMap[report.weather_morning] || weatherMap.other;
  const afternoonWeather = weatherMap[report.weather_afternoon] || weatherMap.other;
  const statusLabel = REPORT_STATUS_LABELS[report.status as keyof typeof REPORT_STATUS_LABELS] || "Rascunho";

  const sectorsList = [
    { id: "civil", label: "Civil" },
    { id: "eletrica", label: "Elétrica" },
    { id: "mecanica", label: "Mecânica" },
    { id: "safety", label: "Segurança do Trabalho" },
  ];

  const filteredSectorsList = singleSector 
    ? sectorsList.filter(s => s.id === singleSector)
    : sectorsList;

  return (
    <div className={`${previewMode ? 'block py-8 bg-slate-100' : 'hidden print:block'} w-full text-black bg-white`}>
      
      {/* ─── PÁGINA DE RESUMO (CAPA) ─── */}
      <div className="print-page border-2 border-slate-300 p-8 rounded-lg mb-6 min-h-[1050px] flex flex-col relative">
        <div className="flex items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white overflow-hidden p-1 flex-shrink-0 flex items-center justify-center border-2 border-slate-200 rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Logo Cimento Nacional" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">CIMENTO NACIONAL</h1>
              <h2 className="text-lg text-slate-500 font-medium">
                {singleSector 
                  ? `Relatório Diário de Obra - Setor: ${filteredSectorsList[0]?.label || "Específico"}`
                  : "Relatório Diário de Obra Consolidado"
                }
              </h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-slate-700 bg-slate-100 border border-slate-200 px-4 py-2 rounded inline-block mb-1">
              {singleSector 
                ? `STATUS: ${REPORT_STATUS_LABELS[activities.find(a => a.sector === singleSector)?.status as keyof typeof REPORT_STATUS_LABELS]?.toUpperCase() || "PENDENTE"}`
                : `STATUS CONSOLIDADO: ${statusLabel.toUpperCase()}`
              }
            </div>
            <p className="text-sm text-slate-500 mt-1">RDO Nº: {String(report.report_number || report.id).substring(0,8).padStart(5, '0')}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">CÓD. VERIFICAÇÃO: {report.id.substring(0, 13).toUpperCase()}</p>
          </div>
        </div>
        
        <hr className="border-slate-300 my-6" />
        
        <div className="grid grid-cols-2 md:grid-cols-2 gap-8 text-sm mb-12 p-6 bg-slate-50 border border-slate-200 rounded-lg">
          <div>
            <span className="text-slate-500 font-medium block text-xs uppercase tracking-wider">Obra</span>
            <span className="font-bold text-slate-900 text-lg">{project.name}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-xs uppercase tracking-wider">Código do Projeto</span>
            <span className="font-bold text-slate-900 text-lg">{project.code || "-"}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-xs uppercase tracking-wider">Data do Relatório</span>
            <span className="font-bold text-slate-900 text-lg">{formattedDate}</span>
          </div>
          <div>
            <span className="text-slate-500 font-medium block text-xs uppercase tracking-wider">Situação da Obra</span>
            <span className="font-bold text-slate-900 text-lg">{situationMap[report.day_situation] || "Normal"}</span>
          </div>
        </div>

        <h3 className="text-lg font-bold border-b-2 border-slate-200 pb-2 mb-4 text-slate-800">
          Condições Climáticas
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm mb-8">
          <div className="p-4 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block text-xs font-semibold mb-1">Manhã</span>
            <span className="font-bold text-slate-800 flex items-center gap-2">
              {(() => {
                const Icon = morningWeather.icon;
                return Icon ? <Icon className="w-4 h-4" /> : null;
              })()} {morningWeather.label}
            </span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block text-xs font-semibold mb-1">Tarde</span>
            <span className="font-bold text-slate-800 flex items-center gap-2">
              {(() => {
                const Icon = afternoonWeather.icon;
                return Icon ? <Icon className="w-4 h-4" /> : null;
              })()} {afternoonWeather.label}
            </span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <span className="text-slate-500 block text-xs font-semibold mb-1">Horário de Trabalho</span>
            <span className="font-bold text-slate-800">{report.work_start_time?.substring(0,5) || "07:00"} às {report.work_end_time?.substring(0,5) || "17:00"}</span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <span className="text-slate-500 block text-xs font-semibold mb-1">Ocorrência de Chuva</span>
            <span className="font-bold text-slate-800">
              {report.had_rain ? `Sim ${report.rain_start_time ? `(${report.rain_start_time?.substring(0,5)}h às ${report.rain_end_time?.substring(0,5)}h)` : ""}` : "Não"}
            </span>
          </div>
        </div>

        {report.comments && (
          <div className="mb-8">
            <h3 className="text-lg font-bold border-b-2 border-slate-200 pb-2 mb-4 text-slate-800">
              Comentários Gerais
            </h3>
            <div className="text-sm bg-slate-50 border border-slate-200 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-line leading-relaxed">{report.comments}</p>
            </div>
          </div>
        )}

        {!singleSector && (
          <div className="mt-auto pt-8 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-800 mb-4 text-center">Resumo de Aprovações</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {sectorsList.map(s => {
                const sec = activities.find(a => a.sector === s.id) || { status: 'draft' };
                const isApproved = sec.status === 'approved';
                return (
                  <div key={s.id} className="text-center p-3 border border-slate-200 rounded bg-slate-50">
                    <span className="block font-bold text-slate-800">{s.label}</span>
                    <span className={`text-xs font-semibold mt-1 block ${isApproved ? 'text-green-600' : 'text-slate-500'}`}>
                      {REPORT_STATUS_LABELS[sec.status as keyof typeof REPORT_STATUS_LABELS] || "Pendente"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── PÁGINAS POR SETOR ─── */}
      {filteredSectorsList.map(sectorInfo => {
        // Filter data for this sector
        const sectorActivities = activities.find(a => a.sector === sectorInfo.id);
        const sectorWorkforce = workforce.filter(w => w.sector === sectorInfo.id);
        const sectorEquipment = equipment.filter(e => e.sector === sectorInfo.id);
        const sectorMaterials = materials.filter(m => m.sector === sectorInfo.id);
        const sectorOccurrences = occurrences.filter(o => o.sector === sectorInfo.id);
        const sectorAttachments = attachments.filter(a => a.sector === sectorInfo.id);

        // Se o setor não tiver atividades e estiver vazio, podemos pular ou mostrar vazio. Vamos mostrar o cabeçalho no mínimo.
        if (!sectorActivities) return null;

        const isOptimizedHidden = false; // sectorActivities.status === 'not_applicable';

        const secStatusLabel = REPORT_STATUS_LABELS[sectorActivities.status as keyof typeof REPORT_STATUS_LABELS] || "Pendente";
        
        // Extrai as métricas de segurança (se for o setor safety)
        const safetyMetrics = sectorActivities.safety_metrics as any || {};

        return (
          <div key={sectorInfo.id} className="print-page w-full min-h-[1050px]" style={{ pageBreakBefore: 'always' }}>
            <div className="border border-slate-300 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">
                  SETOR: {sectorInfo.label}
                </h2>
                <div className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded">
                  STATUS: {secStatusLabel.toUpperCase()}
                </div>
              </div>
            </div>

            {/* DADOS DE SEGURANÇA (Apenas para o setor safety) */}
            {sectorInfo.id === "safety" && (
              <div className="card p-4 mb-4 border border-slate-200 rounded-lg">
                <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">Controle de Segurança (SST)</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1 mb-1">DDS (Diálogo Diário de Segurança):</span>
                    {safetyMetrics.dds_realizado ? (
                      <div>
                        <p><strong>Realizado:</strong> Sim</p>
                        <p><strong>Tema:</strong> {safetyMetrics.dds_tema || "-"}</p>
                        <p><strong>Responsável:</strong> {safetyMetrics.dds_responsavel || "-"}</p>
                        <p><strong>Participantes:</strong> {safetyMetrics.dds_participantes || "0"}</p>
                      </div>
                    ) : (
                      <p className="text-red-600">Não Realizado</p>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1 mb-1">Rotinas / Liberações:</span>
                    <p><strong>Inspeções:</strong> {safetyMetrics.inspecoes_realizadas ? "Sim" : "Não"}</p>
                    <p><strong>Permissão Trab. (PT):</strong> {safetyMetrics.permissao_trabalho ? "Sim" : "Não"}</p>
                    <p><strong>Uso EPI:</strong> {safetyMetrics.uso_epi ? "Ok" : "Falta"}</p>
                    <p><strong>Uso EPC:</strong> {safetyMetrics.uso_epc ? "Ok" : "Falta"}</p>
                  </div>
                </div>
                
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-700 block mb-2">Trabalhos Especiais Realizados:</span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {safetyMetrics.trabalho_altura && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">Altura</span>}
                    {safetyMetrics.trabalho_confinado && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">Espaço Confinado</span>}
                    {safetyMetrics.trabalho_quente && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">Trabalho a Quente</span>}
                    {safetyMetrics.interdicao_area && <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">Interdição de Área</span>}
                    {!safetyMetrics.trabalho_altura && !safetyMetrics.trabalho_confinado && !safetyMetrics.trabalho_quente && !safetyMetrics.interdicao_area && <span className="text-slate-500 italic">Nenhum</span>}
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <span className="font-bold text-slate-700 block mb-2 text-red-600">Ocorrências Críticas Registradas:</span>
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    {safetyMetrics.nao_conformidades && <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Não Conformidade</span>}
                    {safetyMetrics.atos_inseguros && <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Ato Inseguro</span>}
                    {safetyMetrics.condicoes_inseguras && <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Condição Insegura</span>}
                    {safetyMetrics.incidentes && <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Incidente</span>}
                    {safetyMetrics.quase_acidentes && <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Quase Acidente</span>}
                    {safetyMetrics.acidentes && <span className="bg-red-600 text-white px-2 py-1 rounded font-bold">ACIDENTE</span>}
                    {safetyMetrics.primeiros_socorros && <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold">Primeiros Socorros</span>}
                    {!safetyMetrics.nao_conformidades && !safetyMetrics.atos_inseguros && !safetyMetrics.condicoes_inseguras && !safetyMetrics.incidentes && !safetyMetrics.quase_acidentes && !safetyMetrics.acidentes && !safetyMetrics.primeiros_socorros && <span className="text-slate-500 italic text-green-600">Nenhuma ocorrência registrada.</span>}
                  </div>
                  
                  {(safetyMetrics.nao_conformidades || safetyMetrics.atos_inseguros || safetyMetrics.condicoes_inseguras || safetyMetrics.incidentes || safetyMetrics.quase_acidentes || safetyMetrics.acidentes || safetyMetrics.primeiros_socorros) && (
                    <div className="bg-red-50 p-2 rounded text-[10px] space-y-1 mt-2">
                      <p><strong>Situação:</strong> {safetyMetrics.situacao_ocorrencia || "-"}</p>
                      <p><strong>Medidas Corretivas (Imediata):</strong> {safetyMetrics.medidas_corretivas || "-"}</p>
                      <p><strong>Pendências (Futuras):</strong> {safetyMetrics.pendencias_seguranca || "-"}</p>
                      <p><strong>Responsável Correção:</strong> {safetyMetrics.responsavel_correcao || "-"} | <strong>Prazo:</strong> {safetyMetrics.prazo_correcao || "-"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ATIVIDADES (Apenas para setores normais) */}
            {sectorInfo.id !== "safety" && (
              <div className="card p-4 mb-4 border border-slate-200 rounded-lg">
                <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">Atividades</h3>
                <div className="space-y-3 text-xs">
                  {sectorActivities.day_forecast && (
                    <div>
                      <span className="font-bold text-slate-700 block border-b border-slate-100 pb-0.5 mb-0.5">Previsão do Dia (Hoje):</span>
                      <p className="text-slate-600 whitespace-pre-line">{sectorActivities.day_forecast}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-700 block border-b border-slate-100 pb-0.5 mb-0.5">Atividades Executadas (Hoje):</span>
                    <p className="text-slate-600 whitespace-pre-line">{sectorActivities.executed_activities || "Nenhuma atividade declarada."}</p>
                  </div>
                  {sectorActivities.not_executed_activities && (
                    <div>
                      <span className="font-bold text-slate-700 block border-b border-slate-100 pb-0.5 mb-0.5">Atividades Programadas Não Executadas:</span>
                      <p className="text-slate-600 whitespace-pre-line">{sectorActivities.not_executed_activities}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-slate-700 block border-b border-slate-100 pb-0.5 mb-0.5">Previsão para o Próximo Dia (Amanhã):</span>
                    <p className="text-slate-600 whitespace-pre-line">{sectorActivities.next_day_forecast || "Nenhuma previsão declarada."}</p>
                  </div>
                </div>
                {sectorActivities.general_observations && (
                  <div className="mt-3 text-xs bg-slate-50 p-2 rounded border border-slate-200">
                    <span className="font-bold text-slate-700 block mb-0.5">Observações:</span>
                    <p className="text-slate-600 whitespace-pre-line">{sectorActivities.general_observations}</p>
                  </div>
                )}
              </div>
            )}

            {/* EFETIVO */}
            <div className="card p-4 mb-4 border border-slate-200 rounded-lg">
              <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-2 text-slate-800">Efetivo</h3>
              {sectorWorkforce.length === 0 ? (
                <p className="text-xs italic text-slate-400">Nenhum registro.</p>
              ) : (
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-1 border">Função / Cargo</th>
                      <th className="text-center w-12 p-1 border">Qtd</th>
                      <th className="text-left p-1 border">Empresa</th>
                      <th className="text-center w-16 p-1 border">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorWorkforce.map((entry) => (
                      <tr key={entry.id}>
                        <td className="p-1 border">{entry.role}</td>
                        <td className="p-1 border text-center font-bold">{entry.quantity}</td>
                        <td className="p-1 border">{entry.company_name || "Própria"}</td>
                        <td className="p-1 border text-center">{entry.hours_worked || "8"}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* EQUIPAMENTOS */}
            <div className="card p-4 mb-4 border border-slate-200 rounded-lg">
              <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-2 text-slate-800">Equipamentos</h3>
              {sectorEquipment.length === 0 ? (
                <p className="text-xs italic text-slate-400">Nenhum registro.</p>
              ) : (
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-1 border">Equipamento</th>
                      <th className="text-center w-12 p-1 border">Qtd</th>
                      <th className="text-center w-24 p-1 border">Uso (h)</th>
                      <th className="text-left w-24 p-1 border">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorEquipment.map((entry) => (
                      <tr key={entry.id}>
                        <td className="p-1 border font-medium">{entry.name}</td>
                        <td className="p-1 border text-center">{entry.quantity}</td>
                        <td className="p-1 border text-center">{entry.hours_used || "-"}h</td>
                        <td className="p-1 border">{entry.status === "operating" ? "Operando" : entry.status === "stopped" ? "Parado" : "Manutenção"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* MATERIAIS */}
            <div className="card p-4 mb-4 border border-slate-200 rounded-lg">
              <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-2 text-slate-800">Materiais</h3>
              {sectorMaterials.length === 0 ? (
                <p className="text-xs italic text-slate-400">Nenhum registro.</p>
              ) : (
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="text-left p-1 border">Material</th>
                      <th className="text-center w-16 p-1 border">Qtd</th>
                      <th className="text-center w-16 p-1 border">Unid</th>
                      <th className="text-left w-24 p-1 border">Movimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sectorMaterials.map((entry) => (
                      <tr key={entry.id}>
                        <td className="p-1 border font-medium">{entry.material_name}</td>
                        <td className="p-1 border text-center">{entry.quantity}</td>
                        <td className="p-1 border text-center uppercase">{entry.unit}</td>
                        <td className="p-1 border">{entry.movement_type === 'received' ? 'Recebido' : 'Utilizado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* CONTROLE TECNOLÓGICO (Somente no setor Civil) */}
            {sectorInfo.id === "civil" && (
              <div className="card p-4 mb-4 border border-slate-200 rounded-lg" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-2 text-slate-800">Acompanhamento de Controle Tecnológico (Concreto)</h3>
                {concreteControl.length === 0 ? (
                  <p className="text-xs italic text-slate-400">Nenhum registro de controle tecnológico.</p>
                ) : (
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-1 border">Membro Estrutural</th>
                        <th className="text-center w-20 p-1 border">Data Moldagem</th>
                        <th className="text-left p-1 border">Fornecedor</th>
                        <th className="text-center w-16 p-1 border">Classe (Fck)</th>
                        <th className="text-center w-16 p-1 border">Slump (mm)</th>
                        <th className="text-center w-16 p-1 border">Vol (m³)</th>
                        <th className="text-left p-1 border">NF / Lacre</th>
                        <th className="text-center w-16 p-1 border">7d (MPa)</th>
                        <th className="text-center w-16 p-1 border">28d (MPa)</th>
                        <th className="text-center w-20 p-1 border">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {concreteControl.map((entry: any) => {
                        const dateParts = entry.molding_date.split('-');
                        const formattedMoldingDate = dateParts.length === 3 
                          ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
                          : entry.molding_date;
                        return (
                          <tr key={entry.id}>
                            <td className="p-1 border font-medium">{entry.structural_element}</td>
                            <td className="p-1 border text-center">{formattedMoldingDate}</td>
                            <td className="p-1 border">{entry.supplier || "-"}</td>
                            <td className="p-1 border text-center">{entry.concrete_class || "-"}</td>
                            <td className="p-1 border text-center">{entry.slump || "-"}</td>
                            <td className="p-1 border text-center">{entry.volume || "-"}</td>
                            <td className="p-1 border">{entry.delivery_note || "-"}</td>
                            <td className="p-1 border text-center">{entry.strength_7d || "-"}</td>
                            <td className="p-1 border text-center">{entry.strength_28d || "-"}</td>
                            <td className={`p-1 border text-center font-semibold ${
                              entry.status === 'Aprovado' ? 'text-green-600' :
                              entry.status === 'Reprovado' ? 'text-red-600' : 'text-amber-600'
                            }`}>{entry.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* OCORRÊNCIAS */}
            {sectorOccurrences.length > 0 && (
              <div className="card p-4 mb-4 border border-slate-200 rounded-lg">
                <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-2 text-slate-800 text-red-600">Ocorrências</h3>
                <div className="space-y-3">
                  {sectorOccurrences.map(occ => (
                    <div key={occ.id} className="border border-red-100 bg-red-50/30 p-2 rounded text-[10px]">
                      <div className="flex justify-between mb-1">
                        <strong className="text-red-700">{occ.title}</strong>
                        <span className="font-mono text-red-600">{severityMap[occ.severity]}</span>
                      </div>
                      <p className="text-slate-600 mb-1">{occ.description}</p>
                      {occ.action_taken && (
                        <p className="text-slate-500"><strong>Ação Tomada:</strong> {occ.action_taken}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANEXOS */}
            {sectorAttachments.length > 0 && (
              <div className="card p-4 mb-4 border border-slate-200 rounded-lg" style={{ pageBreakInside: 'avoid' }}>
                <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">Laudo Fotográfico - Setor {sectorInfo.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4">
                  {sectorAttachments.map((att, index) => {
                    const timeStr = att.created_at ? new Date(att.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-';
                    return (
                      <div key={att.id} className="border border-slate-200 rounded-lg overflow-hidden flex flex-col bg-slate-50 print:break-inside-avoid">
                        <div className="aspect-[4/3] h-48 print:h-48 sm:h-auto relative bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-200">
                          {att.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={att.url} alt={att.caption || att.original_name} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs text-slate-400">Sem Imagem</span>
                          )}
                          <div className="absolute top-2 left-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                            FOTO {(sectorAttachments.length - index).toString().padStart(2, '0')}
                          </div>
                        </div>
                        <div className="p-3 text-[10px] space-y-1 bg-white flex-1">
                          <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1.5 leading-tight">
                            {att.caption || <span className="text-slate-400 font-normal italic">Sem legenda</span>}
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-slate-600">
                            <div><strong>Local:</strong> {att.location_label || "—"}</div>
                            <div><strong>Setor:</strong> {sectorInfo.label}</div>
                            <div><strong>Horário:</strong> {timeStr}</div>
                            <div><strong>Responsável:</strong> {att.profiles?.full_name?.split(' ')[0] || "—"}</div>
                            <div className="col-span-2"><strong>Atividade:</strong> {att.description || "—"}</div>
                            {att.latitude && att.longitude && (
                              <div className="col-span-2 text-slate-500 font-mono text-[9px]">
                                <strong>GPS:</strong> {Number(att.latitude).toFixed(5)}, {Number(att.longitude).toFixed(5)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        );
      })}
      {/* Estilos Específicos para Impressão */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            background-color: white !important;
          }
          .print-page {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            min-height: 0 !important;
          }
          @page {
            margin: 1.5cm;
            size: A4;
          }
          .card {
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  );
}
