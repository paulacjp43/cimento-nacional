"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, AlertCircle, Cloud, Thermometer, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";
import { DaySituation, WeatherCondition } from "@/types/database";

export default function NovoRdoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to today
  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const report_date = formData.get("report_date") as string;
    const weather_morning = formData.get("weather_morning") as WeatherCondition;
    const weather_afternoon = formData.get("weather_afternoon") as WeatherCondition;
    const temperature = formData.get("temperature") ? parseInt(formData.get("temperature") as string, 10) : null;
    const day_situation = formData.get("day_situation") as DaySituation;
    const had_rain = formData.get("had_rain") === "on";

    const supabase = createClient();

    try {
      // 1. Get user profile for company_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) throw new Error("Empresa não encontrada");

      // 2. Check if a report for this date already exists for this project
      const { data: existing } = await supabase
        .from("daily_reports")
        .select("id")
        .eq("project_id", id)
        .eq("report_date", report_date)
        .maybeSingle();

      if (existing) {
        throw new Error("Já existe um relatório criado para esta data.");
      }

      // 3. Create the report
      const { data: newReport, error: insertError } = await supabase
        .from("daily_reports")
        .insert({
          company_id: profile.company_id,
          project_id: id,
          report_date,
          weather_morning,
          weather_afternoon,
          temperature,
          day_situation,
          had_rain,
          created_by: user.id,
          status: "draft"
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      toast.success("Cabeçalho do RDO criado! Agora preencha os detalhes.");
      router.push(`/obras/${id}/relatorios/${newReport.id}`);
      router.refresh();
      
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Ocorreu um erro ao criar o relatório.";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="fade-in space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href={`/obras/${id}/relatorios`}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="page-title flex items-center gap-2">
            Iniciar Novo RDO
          </h1>
          <p className="page-subtitle text-sm">
            Informe as condições climáticas e dados gerais para criar o documento base.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="card p-6 space-y-8">
          
          {/* Data e Situação */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-500" /> Informações do Dia
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data do Relatório <span className="text-red-500">*</span>
                </label>
                <input
                  name="report_date"
                  type="date"
                  required
                  defaultValue={today}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Situação do Dia <span className="text-red-500">*</span>
                </label>
                <select name="day_situation" required defaultValue="normal" className="input">
                  <option value="normal">Trabalho Normal</option>
                  <option value="partial">Trabalho Parcial</option>
                  <option value="no_work">Sem Expediente (Fim de semana/Feriado)</option>
                  <option value="halted">Paralisado (Motivos de força maior)</option>
                  <option value="suspended">Suspenso (Decisão gerencial)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clima */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white border-b pb-2 dark:border-gray-800 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary-500" /> Condições Climáticas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clima (Manhã) <span className="text-red-500">*</span>
                </label>
                <select name="weather_morning" required defaultValue="sunny" className="input">
                  <option value="sunny">Ensolarado</option>
                  <option value="partly_cloudy">Parcialmente Nublado</option>
                  <option value="cloudy">Nublado</option>
                  <option value="rainy">Chuvoso</option>
                  <option value="heavy_rain">Chuva Forte</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Clima (Tarde) <span className="text-red-500">*</span>
                </label>
                <select name="weather_afternoon" required defaultValue="sunny" className="input">
                  <option value="sunny">Ensolarado</option>
                  <option value="partly_cloudy">Parcialmente Nublado</option>
                  <option value="cloudy">Nublado</option>
                  <option value="rainy">Chuvoso</option>
                  <option value="heavy_rain">Chuva Forte</option>
                  <option value="other">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                  Temperatura Média (°C)
                </label>
                <div className="relative">
                  <input
                    name="temperature"
                    type="number"
                    step="1"
                    className="input pl-9"
                    placeholder="Ex: 25"
                  />
                  <Thermometer className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="had_rain"
                name="had_rain"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="had_rain" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Houve chuva no canteiro de obras que impossibilitou ou atrasou os serviços?
              </label>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href={`/obras/${id}/relatorios`}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary min-w-[200px] justify-center"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Criar RDO e Preencher Detalhes
                <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
