"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cancelInvitationAction } from "./actions";

export function CancelInvitationButton({ invitationId }: { invitationId: string }) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const result = await cancelInvitationAction(invitationId);
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success("Convite cancelado com sucesso.");
    } catch (err: Error | unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao cancelar convite");
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-red-600 font-medium">Cancelar?</span>
        <button
          onClick={handleCancel}
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
      className="text-red-500 hover:text-red-600 text-sm font-medium"
      title="Cancelar Convite"
    >
      Cancelar
    </button>
  );
}
