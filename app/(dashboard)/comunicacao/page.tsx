"use client";

import { useState, useEffect } from "react";
import { MessageSquare, AlertTriangle, ArrowRight, Search, HardHat, Calendar, RefreshCw, SlidersHorizontal, Loader2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";

interface SectorMessage {
  id: string;
  sender_name: string;
  from_sector: string;
  to_sector: string;
  message: string;
  is_alert: boolean;
  created_at: string;
  daily_report_id: string;
  daily_reports: {
    report_date: string;
    project_id: string;
    projects: {
      name: string;
    };
  } | null;
}

interface ProjectOption {
  id: string;
  name: string;
  company_id: string;
}

interface ReportOption {
  id: string;
  report_date: string;
  report_number: number | null;
}

const sectorLabels: Record<string, string> = {
  civil: "Civil",
  eletrica: "Elétrica",
  mecanica: "Mecânica",
  geral: "Geral (Todos)",
};

export default function ComunicacaoPage() {
  const [messages, setMessages] = useState<SectorMessage[]>([]);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [reports, setReports] = useState<ReportOption[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userProfile, setUserProfile] = useState<any>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedReportId, setSelectedReportId] = useState("");
  const [fromSector, setFromSector] = useState("civil");
  const [toSector, setToSector] = useState("geral");
  const [messageText, setMessageText] = useState("");
  const [isAlert, setIsAlert] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  useEffect(() => {
    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchReportsForProject(selectedProjectId);
    } else {
      setTimeout(() => {
        setReports([]);
        setSelectedReportId("");
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  async function initPage() {
    try {
      setLoading(true);
      
      // 1. Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role, company_id")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserProfile(profile);
          if (profile.role === "civil_responsible") setFromSector("civil");
          if (profile.role === "electrical_responsible") setFromSector("eletrica");
          if (profile.role === "mechanical_responsible") setFromSector("mecanica");
        }
      }

      // 2. Fetch projects
      const { data: projectsData } = await supabase
        .from("projects")
        .select("id, name, company_id")
        .eq("status", "in_progress");
      setProjects(projectsData || []);
      if (projectsData && projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }

      // 3. Fetch messages
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReportsForProject(projId: string) {
    try {
      const { data } = await supabase
        .from("daily_reports")
        .select("id, report_date, report_number")
        .eq("project_id", projId)
        .order("report_date", { ascending: false });
      setReports(data || []);
      if (data && data.length > 0) {
        setSelectedReportId(data[0].id);
      } else {
        setSelectedReportId("");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("sector_messages")
        .select(`
          id,
          sender_name,
          from_sector,
          to_sector,
          message,
          is_alert,
          created_at,
          daily_report_id,
          daily_reports (
            report_date,
            project_id,
            projects (
              name
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar mensagens.");
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReportId) {
      toast.error("Por favor, selecione um RDO válido.");
      return;
    }
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        daily_report_id: selectedReportId,
        company_id: userProfile?.company_id || "",
        sender_id: user?.id || null,
        sender_name: userProfile?.full_name || "Colaborador",
        from_sector: fromSector,
        to_sector: toSector,
        message: messageText.trim(),
        is_alert: isAlert,
      };

      const { error } = await supabase
        .from("sector_messages")
        .insert([payload]);

      if (error) throw error;

      toast.success("Mensagem enviada!");
      setMessageText("");
      setIsAlert(false);
      await fetchMessages();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  }

  // Filter logic
  const filteredMessages = messages.filter((msg) => {
    const matchesSearch = 
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSector = 
      selectedSector === "all" ||
      msg.from_sector === selectedSector ||
      msg.to_sector === selectedSector;

    const matchesAlert = !onlyAlerts || msg.is_alert;

    return matchesSearch && matchesSector && matchesAlert;
  });

  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  return (
    <div className="fade-in space-y-6">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary-500" /> Central de Comunicação e Alertas
          </h1>
          <p className="page-subtitle">
            Mensagens internas e avisos críticos de campo compartilhados entre os setores da obra.
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="btn btn-secondary text-xs flex items-center gap-1.5 self-stretch md:self-auto justify-center"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Atualizar Central
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LADO ESQUERDO: Feed de mensagens e Filtros */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Barra de Filtros */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              
              {/* Busca por Texto */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar mensagem ou remetente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-9 text-xs"
                />
              </div>

              {/* Setor */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="input text-xs"
                >
                  <option value="all">Todos os setores</option>
                  <option value="civil">Setor Civil</option>
                  <option value="eletrica">Setor Elétrico</option>
                  <option value="mecanica">Setor Mecânico</option>
                </select>
              </div>

              {/* Somente Alertas */}
              <div className="flex items-center gap-2">
                <label className="relative flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={onlyAlerts}
                    onChange={(e) => setOnlyAlerts(e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Apenas Alertas Críticos
                  </span>
                </label>
              </div>

            </div>
          </div>

          {/* Lista de Mensagens */}
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-500">Nenhuma mensagem setorial encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-5 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                    msg.is_alert
                      ? "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 shadow-sm hover:shadow-md"
                      : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-855 shadow-sm hover:shadow-md"
                  }`}
                >
                  <div>
                    
                    {/* Metadados da Mensagem */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div>
                        <span className="font-bold text-xs text-gray-800 dark:text-gray-200 block">{msg.sender_name}</span>
                        <span className="text-[10px] text-gray-400 block mt-0.5">
                          {new Date(msg.created_at).toLocaleDateString()} às {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider">
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100/50">
                            {sectorLabels[msg.from_sector]}
                          </span>
                          <span className="text-gray-400 text-[8px]">➡️</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50">
                            {sectorLabels[msg.to_sector]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tag de Alerta Crítico */}
                    {msg.is_alert && (
                      <div className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold mb-3 text-[10px] bg-red-100/60 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        <span>ALERTA SETORIAL DE ALTA PRIORIDADE</span>
                      </div>
                    )}

                    {/* Conteúdo */}
                    <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed mb-4">
                      {msg.message}
                    </p>
                  </div>

                  {/* Informações da Obra Associada */}
                  {msg.daily_reports && (
                    <div className="border-t border-gray-100 dark:border-gray-800 pt-3 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <HardHat className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-600 dark:text-gray-400">Obra:</span>
                          <span className="truncate max-w-[150px]">{msg.daily_reports.projects?.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-semibold text-gray-600 dark:text-gray-400">RDO:</span>
                          <span>{formatDate(msg.daily_reports.report_date)}</span>
                        </div>
                      </div>

                      <Link
                        href={`/obras/${msg.daily_reports.project_id}/relatorios/${msg.daily_report_id}?tab=comunicacao`}
                        className="btn btn-ghost btn-sm text-[10px] text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/20 font-bold flex items-center gap-1 self-end sm:self-auto mt-1 sm:mt-0"
                      >
                        Ver RDO <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>

        {/* LADO DIREITO: Criar nova comunicação */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl p-5 h-fit shadow-sm space-y-4">
          <div>
            <h5 className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-primary-500" /> Criar Comunicação
            </h5>
            <p className="text-[11px] text-gray-400 mt-0.5">Envie uma nota ou alerta diretamente para qualquer RDO ativo.</p>
          </div>
          
          <form onSubmit={handleSendMessage} className="space-y-4">
            
            {/* Selecionar Obra */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Selecionar Obra</label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="input text-xs"
                required
              >
                {projects.length === 0 ? (
                  <option value="">Nenhuma obra ativa encontrada</option>
                ) : (
                  projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Selecionar RDO */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Selecionar RDO</label>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="input text-xs"
                required
                disabled={reports.length === 0}
              >
                {reports.length === 0 ? (
                  <option value="">Nenhum RDO encontrado para esta obra</option>
                ) : (
                  reports.map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      RDO #{rep.report_number || "?"} - {formatDate(rep.report_date)}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* De: Setor */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Seu Setor (Remetente)</label>
              <select
                value={fromSector}
                onChange={(e) => setFromSector(e.target.value)}
                className="input text-xs"
              >
                <option value="civil">Civil</option>
                <option value="eletrica">Elétrica</option>
                <option value="mecanica">Mecânica</option>
              </select>
            </div>

            {/* Para: Destinatário */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Destinatário (Setor Alvo)</label>
              <select
                value={toSector}
                onChange={(e) => setToSector(e.target.value)}
                className="input text-xs"
              >
                <option value="geral">Geral (Todos os setores)</option>
                <option value="civil">Civil</option>
                <option value="eletrica">Elétrica</option>
                <option value="mecanica">Mecânica</option>
              </select>
            </div>

            {/* Mensagem */}
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Mensagem / Nota Interna</label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={4}
                className="input text-xs resize-none"
                placeholder="Descreva o alinhamento setorial, pendência ou aviso..."
                required
              />
            </div>

            {/* Alerta? */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="is-alert-central"
                type="checkbox"
                checked={isAlert}
                onChange={(e) => setIsAlert(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"
              />
              <label htmlFor="is-alert-central" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                <span className="font-bold text-red-600 dark:text-red-400 block mb-0.5">⚠️ Enviar como Alerta</span>
                Destaca esta mensagem como prioridade crítica para o setor de destino.
              </label>
            </div>

            <button
              type="submit"
              disabled={sending || !selectedReportId}
              className="btn btn-primary w-full text-xs justify-center"
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><Send className="w-3.5 h-3.5 mr-1.5" /> Enviar Mensagem</>
              )}
            </button>

          </form>
        </div>

      </div>

    </div>
  );
}
