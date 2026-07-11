"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { deleteProjectAction } from "../delete-actions";

interface DeleteProjectButtonProps {
  projectId: string;
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteProjectAction(projectId);
      toast.success("Obra excluída com sucesso.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao excluir obra");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-red-600 flex items-center gap-1">
          <AlertTriangle className="w-4 h-4" /> Tem certeza? Apagará TUDO!
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

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 dark:bg-transparent dark:border-red-900/50 dark:hover:bg-red-900/20"
      title="Excluir Obra"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Excluir
    </button>
  );
}
