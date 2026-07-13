"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, ArrowLeft, Check, Shield, AlertCircle } from "lucide-react";
import { createInvitation } from "./actions";

export default function NovoMembroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createInvitation(formData);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fade-in space-y-6 max-w-xl mx-auto mt-8">
        <div className="card p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Convite Enviado com Sucesso!</h2>
            <p className="text-muted-foreground text-sm">
              Um e-mail foi enviado diretamente para o funcionário pelo sistema. Quando ele acessar e definir sua senha, já estará vinculado à sua empresa.
            </p>
          </div>

          <button
            onClick={() => router.push("/equipe")}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Voltar para Equipe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.push("/equipe")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="page-title">Convidar Membro</h1>
          <p className="page-subtitle text-sm">
            Envie um convite seguro por e-mail para o novo membro.
          </p>
        </div>
      </div>

      <div className="card p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-mail do Funcionário
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="exemplo@empresa.com.br"
                className="input"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Perfil de Acesso
              </label>
              <select
                id="role"
                name="role"
                required
                defaultValue="viewer"
                className="input"
              >
                <option value="company_admin">Administrador (Acesso total)</option>
                <option value="project_manager">Gestor de Obras (Revisão e Aprovação)</option>
                <option value="civil_responsible">Responsável Civil (Edição de RDO Civil)</option>
                <option value="electrical_responsible">Responsável Elétrica (Edição de RDO Elétrica)</option>
                <option value="mechanical_responsible">Responsável Mecânica (Edição de RDO Mecânica)</option>
                <option value="viewer">Visualizador (Apenas Leitura)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1.5">
                <Shield className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                Dica: Você poderá vincular o funcionário a obras específicas na aba &quot;Obras&quot;.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/equipe")}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Enviando Convite..." : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Enviar Convite por E-mail
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
