"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteReportAction } from "../../delete-actions";
import { useRouter } from "next/navigation";

interface DeleteReportButtonProps {
  reportId: string;
  projectId: string;
  variant?: "icon" | "full";
}

export function DeleteReportButton({ reportId, projectId, variant = "full" }: DeleteReportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteReportAction(reportId, projectId, true);
      toast.success("Relatório excluído com sucesso.");
      // The action itself will redirect if shouldRedirect is true, 
      // but just in case we are on the list page, we refresh
      if (variant === "icon") {
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao excluir relatório");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    if (variant === "icon") {
      return (
        <div className="flex flex-col gap-1 items-end absolute right-12 top-0 bg-white dark:bg-gray-900 p-2 border rounded-md shadow-lg z-10">
          <span className="text-xs text-red-600 mb-1">Apagar RDO?</span>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-xs bg-red-600 text-white px-2 py-1 rounded"
            >
              {loading ? "..." : "Sim"}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-200"
            >
              Não
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" /> Tem certeza?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="btn bg-red-600 hover:bg-red-700 text-white border-transparent"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Exclusão"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={(e) => { e.preventDefault(); setShowConfirm(true); }}
        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        title="Excluir RDO"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:bg-transparent dark:border-red-900/50 dark:hover:bg-red-900/20"
      title="Excluir Relatório"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Excluir RDO
    </button>
  );
}
