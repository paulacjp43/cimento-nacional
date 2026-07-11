"use client";

import { Cloud, Sun, CloudRain, Clock, AlertCircle, Info, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface GeneralTabProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const weatherMap: Record<string, { label: string; icon: any; color: string }> = {
  sunny: { label: "Ensolarado", icon: Sun, color: "text-amber-500" },
  partly_cloudy: { label: "Parcialmente Nublado", icon: Cloud, color: "text-blue-400" },
  cloudy: { label: "Nublado", icon: Cloud, color: "text-gray-500" },
  rainy: { label: "Chuvoso", icon: CloudRain, color: "text-blue-600" },
  heavy_rain: { label: "Chuva Forte", icon: CloudRain, color: "text-indigo-600" },
  other: { label: "Outro", icon: AlertCircle, color: "text-gray-400" },
};

const situationMap: Record<string, string> = {
  normal: "Expediente Normal",
  partial: "Expediente Parcial",
  halted: "Paralisado",
  holiday: "Feriado/Folga",
};

export function GeneralTab({ report }: GeneralTabProps) {
  const morningWeather = weatherMap[report.weather_morning] || weatherMap.other;
  const afternoonWeather = weatherMap[report.weather_afternoon] || weatherMap.other;
  
  // Format the date if valid
  let formattedDate = report.report_date;
  try {
    const parts = report.report_date.split("-");
    if (parts.length === 3) {
      const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      formattedDate = format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  } catch {}

  return (
    <div className="space-y-8">
      {/* Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center">
          <Calendar className="w-8 h-8 text-primary-500 mb-2 opacity-80" />
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Data do RDO</h4>
          <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
            {formattedDate}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center">
          <div className="flex gap-4 mb-2">
            <morningWeather.icon className={`w-8 h-8 ${morningWeather.color} opacity-80`} />
          </div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Clima (Manhã)</h4>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {morningWeather.label}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center">
          <div className="flex gap-4 mb-2">
            <afternoonWeather.icon className={`w-8 h-8 ${afternoonWeather.color} opacity-80`} />
          </div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Clima (Tarde)</h4>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {afternoonWeather.label}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center text-center">
          <Info className="w-8 h-8 text-blue-500 mb-2 opacity-80" />
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Situação da Obra</h4>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {situationMap[report.day_situation] || "Normal"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-gray-400" /> Horário de Trabalho
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Início do Expediente</span>
              <span className="font-medium text-gray-900 dark:text-white">{report.work_start_time?.substring(0,5) || "07:00"}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Término do Expediente</span>
              <span className="font-medium text-gray-900 dark:text-white">{report.work_end_time?.substring(0,5) || "17:00"}</span>
            </div>
          </div>
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-gray-400" /> Observações do Dia
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">Houve ocorrência de chuva?</span>
              <span className={`font-medium px-2.5 py-0.5 rounded-full text-xs ${report.had_rain ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>
                {report.had_rain ? "Sim" : "Não"}
              </span>
            </div>
            {report.had_rain && report.rain_start_time && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Horário da Chuva</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {report.rain_start_time?.substring(0,5)} {report.rain_end_time ? `às ${report.rain_end_time?.substring(0,5)}` : ""}
                </span>
              </div>
            )}
            <div className="pt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Comentários / Resumo:</span>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 min-h-[60px]">
                {report.comments || <span className="italic opacity-50">Nenhum comentário adicional registrado.</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
