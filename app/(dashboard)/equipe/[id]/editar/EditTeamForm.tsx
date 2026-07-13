"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { editTeamMemberAction } from "../../actions";
import { UserRole } from "@/types/database";

interface EditTeamFormProps {
  userId: string;
  initialRole: UserRole;
  initialStatus: string;
}

export function EditTeamForm({ userId, initialRole, initialStatus }: EditTeamFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await editTeamMemberAction(userId, formData);
      toast.success("Membro atualizado com sucesso!");
      router.push("/equipe");
    } catch (err: Error | unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Perfil de Acesso
          </label>
          <select 
            name="role" 
            defaultValue={initialRole}
            className="input w-full"
            required
          >
            <option value="superadmin">Super Admin</option>
            <option value="company_admin">Administrador</option>
            <option value="project_manager">Gestor de Obras</option>
            <option value="civil_responsible">Responsável Civil</option>
            <option value="electrical_responsible">Responsável Elétrica</option>
            <option value="mechanical_responsible">Responsável Mecânica</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select 
            name="status" 
            defaultValue={initialStatus || "active"}
            className="input w-full"
            required
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => router.push("/equipe")}
          className="btn btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            "Salvar Alterações"
          )}
        </button>
      </div>
    </form>
  );
}
