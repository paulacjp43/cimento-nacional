"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, MinusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { updateSectorStatusAction } from "@/app/(dashboard)/obras/[id]/relatorios/actions";
import { ReportStatus } from "@/types/database";
interface SectorActionButtonsProps {
  reportId: string;
  projectId: string;
  sector: "safety" | "civil" | "eletrica" | "mecanica";
  canApprove: boolean;
}

export function SectorActionButtons({ reportId, projectId, sector, canApprove }: SectorActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<ReportStatus>("draft");
  const [isFetching, setIsFetching] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from("daily_report_sectors")
        .select("status")
        .eq("daily_report_id", reportId)
        .eq("sector", sector)
        .single();
      if (data) {
        setStatus(data.status as ReportStatus);
      }
      setIsFetching(false);
    };
    fetchStatus();
  }, [reportId, sector]);

  if (!canApprove || isFetching) return null;

  // Mostra botões apenas se estiver em revisão, submetido, rascunho ou parcial
  if (status === 'approved' || status === 'cancelled') return null;

  const updateStatus = async (newStatus: ReportStatus, successMessage: string) => {
    setLoading(newStatus);
    try {
      await updateSectorStatusAction(reportId, projectId, sector, newStatus);
      setStatus(newStatus);
      toast.success(successMessage);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro ao atualizar status do setor.";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2 print:hidden items-center">
      <button 
        onClick={() => updateStatus("not_applicable", "Setor marcado como 'Não se Aplica'.")}
        disabled={loading !== null}
        className="btn btn-sm bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-sm"
        title="Dispensar Setor"
      >
        {loading === "not_applicable" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <MinusCircle className="w-3 h-3 mr-1" />}
        Dispensar
      </button>
      
      <button 
        onClick={() => updateStatus("returned", "Setor devolvido.")}
        disabled={loading !== null}
        className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 shadow-sm"
      >
        {loading === "returned" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
        Devolver
      </button>
      
      <button 
        onClick={() => updateStatus("approved", "Setor aprovado!")}
        disabled={loading !== null}
        className="btn btn-sm bg-green-50 text-green-700 hover:bg-green-100 shadow-sm"
      >
        {loading === "approved" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
        Aprovar Setor
      </button>
    </div>
  );
}
