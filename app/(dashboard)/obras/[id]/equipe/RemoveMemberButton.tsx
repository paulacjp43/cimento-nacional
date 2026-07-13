"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeProjectMemberAction } from "./actions";

interface RemoveMemberButtonProps {
  projectId: string;
  memberId: string;
  memberName: string;
}

export function RemoveMemberButton({ projectId, memberId, memberName }: RemoveMemberButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeProjectMemberAction(projectId, memberId);
      toast.success(`${memberName} foi desvinculado da obra.`);
    } catch (err: Error | unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao desvincular membro.");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-red-600 font-medium">Desvincular?</span>
        <button
          onClick={handleRemove}
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
      title="Desvincular da Obra"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
