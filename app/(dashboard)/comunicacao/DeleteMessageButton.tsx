"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface DeleteMessageButtonProps {
  messageId: string;
  onDeleted: (id: string) => void;
}

export function DeleteMessageButton({ messageId, onDeleted }: DeleteMessageButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("sector_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;
      
      toast.success("Comunicação excluída com sucesso.");
      onDeleted(messageId);
    } catch (err: Error | unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao excluir comunicação");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-red-600 mr-1">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-[10px] bg-red-600 text-white px-1.5 py-0.5 rounded hover:bg-red-700"
        >
          {loading ? "..." : "Sim"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300"
        >
          Não
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20 transition-colors"
      title="Excluir Comunicação"
    >
      <Trash2 className="w-3 h-3" />
    </button>
  );
}
