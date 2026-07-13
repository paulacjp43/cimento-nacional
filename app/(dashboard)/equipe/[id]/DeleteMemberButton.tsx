"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTeamMemberAction } from "../actions";

export function DeleteMemberButton({ userId, memberName }: { userId: string; memberName: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTeamMemberAction(userId);
      toast.success(`${memberName} foi removido da equipe.`);
    } catch (err: Error | unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao excluir membro");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-red-600 font-medium">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Sim"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-200"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      title="Excluir Membro"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
