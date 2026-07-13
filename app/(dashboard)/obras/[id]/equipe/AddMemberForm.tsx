"use client";

import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addProjectMemberAction } from "./actions";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface AddMemberFormProps {
  projectId: string;
  availableUsers: Profile[];
}

export function AddMemberForm({ projectId, availableUsers }: AddMemberFormProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;
    let sector = formData.get("sector") as string | null;

    if (!sector || sector === "") {
      sector = null;
    }

    if (!userId || !role) {
      toast.error("Por favor, selecione um usuário e uma função.");
      setLoading(false);
      return;
    }

    try {
      await addProjectMemberAction(projectId, userId, role, sector);
      toast.success("Membro vinculado com sucesso!");
      (e.target as HTMLFormElement).reset();
    } catch (err: Error | unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Erro ao vincular membro.");
    } finally {
      setLoading(false);
    }
  };

  if (availableUsers.length === 0) {
    return (
      <div className="card p-6 text-center text-muted-foreground text-sm">
        Todos os membros da empresa já estão vinculados a esta obra.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-primary-500" />
        Vincular Novo Membro
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="md:col-span-2">
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Usuário
          </label>
          <select 
            name="userId" 
            id="userId" 
            required
            className="input w-full"
            defaultValue=""
          >
            <option value="" disabled>Selecione um membro da empresa</option>
            {availableUsers.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Função no Projeto
          </label>
          <select 
            name="role" 
            id="role" 
            required
            className="input w-full"
            defaultValue="member"
          >
            <option value="manager">Gestor</option>
            <option value="member">Membro / Engenheiro</option>
            <option value="viewer">Visualizador</option>
          </select>
        </div>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Setor (Opcional)
          </label>
          <select 
            name="sector" 
            id="sector" 
            className="input w-full"
            defaultValue=""
          >
            <option value="">Sem Setor Específico</option>
            <option value="civil">Civil</option>
            <option value="eletrica">Elétrica</option>
            <option value="mecanica">Mecânica</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4 mr-2" />
          )}
          Vincular à Obra
        </button>
      </div>
    </form>
  );
}
