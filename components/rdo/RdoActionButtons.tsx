"use client";

import { useState } from "react";
import { Printer, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateAllSectorsStatusAction } from "@/app/(dashboard)/obras/[id]/relatorios/actions";
import { ReportStatus } from "@/types/database";

interface RdoActionButtonsProps {
  reportId: string;
  projectId: string;
  status: ReportStatus;
  canEdit: boolean;
  canApprove: boolean;
}

export function RdoActionButtons({ reportId, projectId, status, canEdit, canApprove }: RdoActionButtonsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePrint = () => {
    window.open(`/obras/${projectId}/relatorios/${reportId}/imprimir`, '_blank');
  };

  const updateStatus = async (newStatus: ReportStatus, successMessage: string) => {
    setLoading(newStatus);
    try {
      await updateAllSectorsStatusAction(reportId, projectId, newStatus);
      toast.success(successMessage);
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Erro ao atualizar status do relatório.";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-3 print:hidden">
      <button 
        onClick={handlePrint}
        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 shadow-sm"
      >
        <Printer className="w-4 h-4 mr-2" /> Exportar PDF
      </button>
      
      {canEdit && status === 'draft' && (
        <button 
          onClick={() => updateStatus("submitted", "RDO enviado para aprovação!")}
          disabled={loading !== null}
          className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
        >
          {loading === "submitted" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar para Aprovação
        </button>
      )}

      {canApprove && (status === 'submitted' || status === 'under_review') && (
        <>
          <button 
            onClick={() => updateStatus("returned", "RDO devolvido para correções.")}
            disabled={loading !== null}
            className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 shadow-sm"
          >
            {loading === "returned" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
            Devolver
          </button>
          
          <button 
            onClick={() => updateStatus("approved", "RDO aprovado com sucesso!")}
            disabled={loading !== null}
            className="btn btn-primary bg-green-600 hover:bg-green-700 text-white shadow-sm border-none"
          >
            {loading === "approved" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Aprovar RDO
          </button>
        </>
      )}
    </div>
  );
}
