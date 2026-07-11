"use client";

import { Sun, Cloud, CloudRain, AlertCircle } from "lucide-react";

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
  occurrences: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activities: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attachments: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectorMessages: any[];
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

const categoryMap: Record<string, string> = {
  occurrence_safety: "Segurança",
  occurrence_quality: "Qualidade",
  occurrence_delay: "Atraso",
  occurrence_environment: "Meio Ambiente",
  occurrence_other: "Outro",
};

const statusMap: Record<string, string> = {
  open: "Aberta",
  in_treatment: "Em Tratamento",
  resolved: "Resolvida",
};

const movementMap: Record<string, string> = {
  received: "Recebido",
  used: "Utilizado",
  returned: "Devolvido",
  rejected: "Rejeitado",
};

const statusLabelMap: Record<string, string> = {
  draft: "Rascunho",
  submitted: "Enviado",
  under_review: "Em Revisão",
  approved: "Aprovado",
  returned: "Devolvido",
  cancelled: "Cancelado",
};

export function RdoPrintLayout({ 
  report, 
  project, 
  workforce, 
  equipment, 
  materials, 
  occurrences, 
  activities, 
  attachments,
  sectorMessages 
}: RdoPrintLayoutProps) {
  // Format Date
  const dateParts = report.report_date.split('-');
  const formattedDate = dateParts.length === 3 
    ? `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}` 
    : report.report_date;

  const morningWeather = weatherMap[report.weather_morning] || weatherMap.other;
  const afternoonWeather = weatherMap[report.weather_afternoon] || weatherMap.other;
  const statusLabel = statusLabelMap[report.status] || "Rascunho";

  return (
    <div className="hidden print:block w-full text-black bg-white">
      
      {/* ─── CABEÇALHO TIMBRADO ─── */}
      <div className="border border-slate-300 p-4 rounded-lg mb-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-white overflow-hidden p-1 flex-shrink-0 flex items-center justify-center border border-slate-200 rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Logo Cimento Nacional" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-800">CIMENTO NACIONAL</h2>
              <p className="text-xs text-slate-500 font-medium">Relatório Diário de Obra (RDO)</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded inline-block mb-1">
              STATUS: {statusLabel.toUpperCase()}
            </div>
            <p className="text-xs text-slate-500">Emitido por: {report.profiles?.full_name || "Sistema"}</p>
          </div>
        </div>
        
        <hr className="border-slate-200 my-3" />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Obra:</span>
            <span className="font-bold text-slate-900">{project.name}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Código do Projeto:</span>
            <span className="font-bold text-slate-900">{project.code || "-"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Data do Relatório:</span>
            <span className="font-bold text-slate-900">{formattedDate}</span>
          </div>
          <div>
            <span className="text-slate-400 font-medium block">Situação da Obra:</span>
            <span className="font-bold text-slate-900">{situationMap[report.day_situation] || "Normal"}</span>
          </div>
        </div>
      </div>

      {/* ─── SEÇÃO 1: INFORMAÇÕES GERAIS ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          1. Condições Gerais & Clima
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
          <div>
            <span className="text-slate-500 block">Tempo Manhã:</span>
            <span className="font-semibold text-slate-800">{morningWeather.label}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Tempo Tarde:</span>
            <span className="font-semibold text-slate-800">{afternoonWeather.label}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Início Expediente:</span>
            <span className="font-semibold text-slate-800">{report.work_start_time?.substring(0,5) || "07:00"}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Fim Expediente:</span>
            <span className="font-semibold text-slate-800">{report.work_end_time?.substring(0,5) || "17:00"}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-t border-slate-100 pt-3">
          <div>
            <span className="text-slate-500 block mb-1">Ocorrência de Chuva:</span>
            <span className={`font-semibold px-2 py-0.5 rounded ${report.had_rain ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-slate-50 text-slate-600 border border-slate-100"}`}>
              {report.had_rain ? `Sim ${report.rain_start_time ? `(${report.rain_start_time?.substring(0,5)}h às ${report.rain_end_time?.substring(0,5)}h)` : ""}` : "Não"}
            </span>
          </div>
        </div>

        {report.comments && (
          <div className="mt-3 text-xs bg-slate-50 border border-slate-200 rounded p-2.5">
            <span className="text-slate-500 font-bold block mb-1">Resumo do Dia / Comentários Gerais:</span>
            <p className="text-slate-700 whitespace-pre-line leading-relaxed">{report.comments}</p>
          </div>
        )}
      </div>

      {/* ─── SEÇÃO 2: EFETIVO DE MÃO DE OBRA ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          2. Efetivo e Mão de Obra
        </h3>
        {workforce.length === 0 ? (
          <p className="text-xs italic text-slate-500 py-2">Nenhum registro de efetivo cadastrado.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Função / Cargo</th>
                <th className="text-left w-24">Qtd</th>
                <th className="text-left">Empresa</th>
                <th className="text-left w-24">Horas</th>
                <th className="text-left w-28">Setor</th>
                <th className="text-left">Observações</th>
              </tr>
            </thead>
            <tbody>
              {workforce.map((entry) => (
                <tr key={entry.id}>
                  <td>{entry.role}</td>
                  <td>{entry.quantity}</td>
                  <td>{entry.company_name || "Própria"}</td>
                  <td>{entry.hours_worked || "8"}h</td>
                  <td className="capitalize">{entry.sector}</td>
                  <td>{entry.observations || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── SEÇÃO 3: EQUIPAMENTOS ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          3. Equipamentos em Campo
        </h3>
        {equipment.length === 0 ? (
          <p className="text-xs italic text-slate-500 py-2">Nenhum equipamento cadastrado.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Equipamento</th>
                <th className="text-left w-16">Qtd</th>
                <th className="text-left">Proprietário</th>
                <th className="text-left w-20">Uso (h)</th>
                <th className="text-left w-28">Situação</th>
                <th className="text-left w-24">Setor</th>
                <th className="text-left">Observações</th>
              </tr>
            </thead>
            <tbody>
              {equipment.map((entry) => {
                const situationLabel = 
                  entry.status === "operating" ? "Operando" :
                  entry.status === "stopped" ? "Parado" :
                  entry.status === "maintenance" ? "Manutenção" : "Indisponível";
                return (
                  <tr key={entry.id}>
                    <td className="font-medium">{entry.name}</td>
                    <td>{entry.quantity}</td>
                    <td>{entry.owner_company || "-"}</td>
                    <td>{entry.hours_used || "-"}h</td>
                    <td>{situationLabel}</td>
                    <td className="capitalize">{entry.sector}</td>
                    <td>{entry.observations || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── SEÇÃO 4: ATIVIDADES POR SETOR ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          4. Serviços e Atividades por Setor
        </h3>
        <div className="space-y-4">
          {activities.map((secData) => {
            const hasData = secData.executed_activities || secData.next_day_forecast || secData.general_observations;
            return (
              <div key={secData.sector} className="border border-slate-200 rounded p-3 print:break-inside-avoid">
                <div className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-800 uppercase mb-2">
                  Setor: {secData.sector === "civil" ? "Engenharia Civil" : secData.sector === "eletrica" ? "Elétrica" : "Mecânica"}
                </div>
                {!hasData ? (
                  <p className="text-[11px] italic text-slate-400">Nenhum serviço registrado neste setor.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1 mb-1">
                        Atividades Executadas (Hoje):
                      </span>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {secData.executed_activities || "Nenhuma atividade declarada."}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1 mb-1">
                        Previsão (Amanhã):
                      </span>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {secData.next_day_forecast || "Nenhuma previsão declarada."}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1 mb-1">
                        Observações / Interferências:
                      </span>
                      <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                        {secData.general_observations || "Nenhuma observação declarada."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SEÇÃO 5: MATERIAIS ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          5. Recebimento e Consumo de Materiais
        </h3>
        {materials.length === 0 ? (
          <p className="text-xs italic text-slate-500 py-2">Nenhum material movimentado neste dia.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left">Material</th>
                <th className="text-left w-20">Qtd</th>
                <th className="text-left w-20">Unidade</th>
                <th className="text-left w-28">Movimentação</th>
                <th className="text-left">Fornecedor</th>
                <th className="text-left w-24">Nº NF</th>
                <th className="text-left w-28">Setor</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((entry) => (
                <tr key={entry.id}>
                  <td className="font-medium">{entry.material_name}</td>
                  <td>{entry.quantity}</td>
                  <td className="uppercase">{entry.unit || "un"}</td>
                  <td>{movementMap[entry.movement_type] || "Recebido"}</td>
                  <td>{entry.supplier || "-"}</td>
                  <td>{entry.invoice_number || "-"}</td>
                  <td className="capitalize">{entry.sector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── SEÇÃO 6: OCORRÊNCIAS ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          6. Registro de Ocorrências / Imprevistos
        </h3>
        {occurrences.length === 0 ? (
          <p className="text-xs italic text-slate-500 py-2">Nenhuma ocorrência ou interferência relevante registrada.</p>
        ) : (
          <div className="space-y-3">
            {occurrences.map((entry) => {
              const gravityColor = 
                entry.severity === "low" ? "text-green-600 bg-green-50 border-green-200" :
                entry.severity === "medium" ? "text-amber-600 bg-amber-50 border-amber-200" : "text-red-600 bg-red-50 border-red-200";
              return (
                <div key={entry.id} className="border border-slate-200 rounded p-3 text-xs print:break-inside-avoid">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-800 text-sm">{entry.title}</span>
                    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${gravityColor}`}>
                      Gravidade: {severityMap[entry.severity] || "Baixa"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-2 text-slate-500">
                    <div>
                      <span>Categoria: </span>
                      <span className="font-semibold text-slate-700">{categoryMap[entry.category] || "Outros"}</span>
                    </div>
                    <div>
                      <span>Status: </span>
                      <span className="font-semibold text-slate-700">{statusMap[entry.status] || "Aberta"}</span>
                    </div>
                    <div>
                      <span>Responsável: </span>
                      <span className="font-semibold text-slate-700">{entry.responsible || "-"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-2 text-slate-600">
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Descrição:</span>
                      <p className="whitespace-pre-line">{entry.description}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700 block mb-1">Ação Tomada:</span>
                      <p className="whitespace-pre-line">{entry.action_taken || "Aguardando definição/execução de ação."}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── SEÇÃO 7: REGISTRO FOTOGRÁFICO ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          7. Registro Fotográfico / Anexos
        </h3>
        {attachments.filter(att => att.mime_type?.startsWith("image/")).length === 0 ? (
          <p className="text-xs italic text-slate-500 py-2">Nenhum registro fotográfico anexado a este relatório.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {attachments
              .filter(att => att.mime_type?.startsWith("image/"))
              .map((att) => (
                <div key={att.id} className="border border-slate-200 rounded p-2 text-center print:break-inside-avoid">
                  <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden flex items-center justify-center border border-slate-200 rounded mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={att.url || undefined} 
                      alt={att.original_name} 
                      className="object-contain w-full h-full max-h-48"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block w-full">
                    {att.original_name}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* ─── SEÇÃO 8: COMUNICAÇÃO INTERNA E ALERTAS SETORIAIS ─── */}
      <div className="card p-4 mb-6 border border-slate-200 rounded-lg print:break-inside-avoid">
        <h3 className="text-sm font-bold border-b border-slate-200 pb-1.5 mb-3 text-slate-800">
          8. Comunicação Interna e Alertas Setoriais
        </h3>
        {sectorMessages.length === 0 ? (
          <p className="text-xs italic text-slate-500 py-2">Nenhuma comunicação ou alerta registrado para este relatório.</p>
        ) : (
          <table className="w-full text-[10px] border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border border-slate-350">
                <th className="border border-slate-200 p-2 text-left w-1/4">Remetente / Setor</th>
                <th className="border border-slate-200 p-2 text-left w-1/4">Destinatário</th>
                <th className="border border-slate-200 p-2 text-left w-1/2">Mensagem</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {sectorMessages.map((msg: any) => (
                <tr 
                  key={msg.id} 
                  className={`border border-slate-200 ${
                    msg.is_alert ? "bg-red-50/70 font-semibold" : ""
                  }`}
                >
                  <td className="border border-slate-200 p-2">
                    <span className="font-bold block text-slate-900">{msg.sender_name}</span>
                    <span className="text-[8px] text-slate-500 uppercase">Setor: {msg.from_sector}</span>
                  </td>
                  <td className="border border-slate-200 p-2 uppercase font-medium">
                    {msg.to_sector === "geral" ? "Geral (Todos)" : msg.to_sector}
                  </td>
                  <td className="border border-slate-200 p-2 whitespace-pre-wrap">
                    {msg.is_alert && (
                      <span className="text-red-600 font-bold mr-1">[⚠️ ALERTA SETORIAL]</span>
                    )}
                    {msg.message}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── SEÇÃO 9: ASSINATURAS E APROVAÇÃO ─── */}
      <div className="mt-12 print:break-inside-avoid">
        <div className="grid grid-cols-3 gap-6 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="w-full border-t border-slate-400 mt-8 mb-2"></div>
            <span className="font-bold text-slate-700">Elaborador</span>
            <span className="text-slate-400">{report.profiles?.full_name || "Responsável Técnico"}</span>
            <span className="text-slate-400 text-[10px] mt-1">Data: ____/____/________</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-full border-t border-slate-400 mt-8 mb-2"></div>
            <span className="font-bold text-slate-700">Gestor da Obra (Aprovação)</span>
            <span className="text-slate-400">Assinatura</span>
            <span className="text-slate-400 text-[10px] mt-1">Data: ____/____/________</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-full border-t border-slate-400 mt-8 mb-2"></div>
            <span className="font-bold text-slate-700">Administrador (Aprovação)</span>
            <span className="text-slate-400">Cimento Nacional</span>
            <span className="text-slate-400 text-[10px] mt-1">Data: ____/____/________</span>
          </div>
        </div>
      </div>

    </div>
  );
}
