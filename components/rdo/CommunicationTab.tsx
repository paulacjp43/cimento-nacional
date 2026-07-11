"use client";

import { useState, useEffect } from "react";
import { Send, AlertTriangle, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface MessageEntry {
  id: string;
  sender_name: string;
  from_sector: string;
  to_sector: string;
  message: string;
  is_alert: boolean;
  created_at: string;
}

const sectorLabels: Record<string, string> = {
  civil: "Civil",
  eletrica: "Elétrica",
  mecanica: "Mecânica",
  geral: "Geral (Todos)",
};

export function CommunicationTab({ reportId, companyId }: { reportId: string, companyId: string }) {
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userProfile, setUserProfile] = useState<any>(null);

  // Form states
  const [fromSector, setFromSector] = useState("civil");
  const [toSector, setToSector] = useState("geral");
  const [messageText, setMessageText] = useState("");
  const [isAlert, setIsAlert] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  useEffect(() => {
    fetchProfileAndMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  async function fetchProfileAndMessages() {
    try {
      setLoading(true);
      
      // 1. Fetch user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        if (profile) {
          setUserProfile(profile);
          // Set default sector based on role if applicable
          if (profile.role === "civil_responsible") setFromSector("civil");
          if (profile.role === "electrical_responsible") setFromSector("eletrica");
          if (profile.role === "mechanical_responsible") setFromSector("mecanica");
        }
      }

      // 2. Fetch messages
      await fetchMessages();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from("sector_messages")
        .select("*")
        .eq("daily_report_id", reportId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar mensagens internas.");
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!messageText.trim()) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        daily_report_id: reportId,
        company_id: companyId,
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

  if (loading) {
    return <div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-3">
        <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-500" /> Comunicação Interna e Alertas
        </h4>
        <button
          onClick={fetchMessages}
          className="btn btn-ghost btn-sm text-gray-500 hover:text-gray-700"
          title="Atualizar conversas"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Histórico de Mensagens */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto pr-2 border-r border-gray-100 dark:border-gray-800/50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-xs italic text-gray-400 dark:text-gray-500 border border-dashed rounded-xl">
              Nenhuma comunicação ou alerta registrado para este RDO.
              <br />Use o painel ao lado para enviar uma comunicação.
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`p-4 rounded-xl border text-xs transition-shadow shadow-sm hover:shadow-md ${
                  msg.is_alert 
                    ? "bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 animate-pulse-subtle" 
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-850"
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{msg.sender_name}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold tracking-wide text-[9px] uppercase">
                      De: {sectorLabels[msg.from_sector]}
                    </span>
                    <span className="text-gray-400 font-medium">➡️</span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-semibold tracking-wide text-[9px] uppercase">
                      Para: {sectorLabels[msg.to_sector]}
                    </span>
                  </div>
                </div>

                {msg.is_alert && (
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-bold mb-2 text-[10px]">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>ALERTA SETORIAL DE ALTA PRIORIDADE</span>
                  </div>
                )}

                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Formulário de Envio */}
        <div className="bg-gray-50/50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-800 rounded-xl p-4 h-fit">
          <h5 className="font-bold text-xs text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-4">
            Enviar Comunicação
          </h5>
          
          <form onSubmit={handleSendMessage} className="space-y-4">
            
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
                id="is-alert"
                type="checkbox"
                checked={isAlert}
                onChange={(e) => setIsAlert(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500 mt-1"
              />
              <label htmlFor="is-alert" className="text-[11px] font-medium text-gray-600 dark:text-gray-400 select-none cursor-pointer">
                <span className="font-bold text-red-600 dark:text-red-400 block mb-0.5">⚠️ Enviar como Alerta</span>
                Destaca esta mensagem como prioridade crítica para o setor de destino.
              </label>
            </div>

            <button
              type="submit"
              disabled={sending}
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
