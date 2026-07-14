"use client";

import { useState } from "react";
import { User, Loader2, CheckCircle2, Edit2 } from "lucide-react";
import { updateProfileNameAction } from "./actions";

export function ChangeNameForm({ initialName }: { initialName: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [name, setName] = useState(initialName);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfileNameAction(name);
      setSuccess(true);
      setIsEditing(false);
      
      // Ocultar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: Error | unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Erro ao atualizar nome.");
    } finally {
      setLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mb-4 relative group">
          {name.substring(0, 2).toUpperCase()}
          <button 
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1.5 rounded-full shadow-md border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary-600 transition-colors"
            title="Editar nome"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {name}
          </h2>
          <button 
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-primary-600"
            title="Editar nome"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        
        {success && (
          <div className="mt-2 text-xs font-medium text-green-600 flex items-center justify-center gap-1 bg-green-50 px-2 py-1 rounded">
            <CheckCircle2 className="w-3 h-3" /> Nome atualizado
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-2xl font-bold mb-4 opacity-70">
        {name.substring(0, 2).toUpperCase()}
      </div>
      
      <form onSubmit={handleSubmit} className="w-full max-w-[200px] space-y-3">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            className="input pl-9 text-sm text-center font-bold"
            autoFocus
          />
        </div>
        
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setName(initialName);
              setError(null);
            }}
            disabled={loading}
            className="btn btn-ghost text-xs py-1 h-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || name === initialName}
            className="btn btn-primary text-xs py-1 h-auto"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
