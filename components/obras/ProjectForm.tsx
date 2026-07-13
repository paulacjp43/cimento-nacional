"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ProjectStatus } from "@/types/database";

interface ProjectFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  companyId: string;
}

export function ProjectForm({ initialData, companyId }: ProjectFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      code: formData.get("code") as string || null,
      client: formData.get("client") as string || null,
      contractor: formData.get("contractor") as string || null,
      city: formData.get("city") as string || null,
      state: formData.get("state") as string || null,
      status: formData.get("status") as ProjectStatus,
      completion_pct: formData.get("completion_pct") ? parseInt(formData.get("completion_pct") as string) : 0,
      description: formData.get("description") as string || null,
      company_id: companyId,
    };

    const supabase = createClient();

    try {
      if (isEditing) {
        const { error: updateError } = await supabase
          .from("projects")
          .update(data)
          .eq("id", initialData.id);

        if (updateError) throw updateError;
        toast.success("Obra atualizada com sucesso!");
        router.push(`/obras/${initialData.id}`);
      } else {
        const { data: newProject, error: insertError } = await supabase
          .from("projects")
          .insert(data)
          .select()
          .single();

        if (insertError) throw insertError;
        toast.success("Obra cadastrada com sucesso!");
        router.push(`/obras/${newProject.id}`);
      }
      
      router.refresh();
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Ocorreu um erro ao salvar a obra.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Dados Principais */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800">
          Dados Principais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Obra <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={initialData?.name}
              className="input"
              placeholder="Ex: Ampliação Fabril Setor B"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código / CEI
            </label>
            <input
              name="code"
              type="text"
              defaultValue={initialData?.code}
              className="input"
              placeholder="Ex: OB-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              required
              defaultValue={initialData?.status || "planned"}
              className="input"
            >
              <option value="planned">Planejada</option>
              <option value="in_progress">Em Andamento</option>
              <option value="halted">Paralisada</option>
              <option value="suspended">Suspensa</option>
              <option value="completed">Concluída</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cliente
            </label>
            <input
              name="client"
              type="text"
              defaultValue={initialData?.client}
              className="input"
              placeholder="Nome do cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Progresso Físico (%)
            </label>
            <input
              name="completion_pct"
              type="number"
              min="0"
              max="100"
              defaultValue={initialData?.completion_pct || 0}
              className="input"
              placeholder="Ex: 45"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Construtora / Empreiteira
            </label>
            <input
              name="contractor"
              type="text"
              defaultValue={initialData?.contractor}
              className="input"
              placeholder="Nome da construtora"
            />
          </div>
        </div>
      </div>

      {/* Localização */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800">
          Localização
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cidade
            </label>
            <input
              name="city"
              type="text"
              defaultValue={initialData?.city}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado (UF)
            </label>
            <input
              name="state"
              type="text"
              maxLength={2}
              defaultValue={initialData?.state}
              className="input uppercase"
            />
          </div>
        </div>
      </div>
      
      {/* Detalhes Adicionais */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800">
          Detalhes Adicionais
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição do Escopo
          </label>
          <textarea
            name="description"
            rows={4}
            defaultValue={initialData?.description}
            className="input resize-none"
            placeholder="Descreva o escopo da obra..."
          />
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary min-w-[140px] justify-center"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Salvar Alterações" : "Cadastrar Obra"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
