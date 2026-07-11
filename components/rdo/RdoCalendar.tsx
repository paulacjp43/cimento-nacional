"use client";

import { useState } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { ReportStatus } from "@/types/database";

interface Rdo {
  id: string;
  report_date: string;
  status: ReportStatus;
}

interface RdoCalendarProps {
  projectId: string;
  rdos: Rdo[];
}

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700" },
  submitted: { label: "Enviado", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  under_review: { label: "Em Revisão", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  approved: { label: "Aprovado", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800" },
  returned: { label: "Devolvido", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" },
  cancelled: { label: "Cancelado", color: "bg-gray-50 text-gray-500 dark:bg-gray-900/10 dark:text-gray-500 border-gray-200 dark:border-gray-800" },
};

export function RdoCalendar({ projectId, rdos }: RdoCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Para exibir sempre as semanas completas, pegamos o início da primeira semana e o fim da última
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const dateFormat = "MMMM yyyy";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // Mapear RDOs por data para busca rápida
  const rdosByDate = rdos.reduce((acc, rdo) => {
    // report_date costuma vir como YYYY-MM-DD
    acc[rdo.report_date] = rdo;
    return acc;
  }, {} as Record<string, Rdo>);

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
        <h2 className="text-xl font-semibold capitalize text-gray-900 dark:text-white">
          {format(currentDate, dateFormat, { locale: ptBR })}
        </h2>
        
        <div className="flex items-center space-x-2">
          <button onClick={today} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 px-3 py-1.5 text-sm">
            Hoje
          </button>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center font-medium text-sm text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const rdo = rdosByDate[dateString];
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isToday(day);

          return (
            <div 
              key={day.toString()} 
              className={`
                min-h-[80px] sm:min-h-[100px] border rounded-lg p-1 sm:p-2 flex flex-col transition-colors
                ${isCurrentMonth ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800" : "bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800/50 opacity-60"}
                ${isTodayDate ? "ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900 border-transparent" : ""}
                ${rdo ? "hover:border-primary-300 dark:hover:border-primary-700" : ""}
              `}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm font-medium ${isTodayDate ? "text-primary-600 dark:text-primary-400" : "text-gray-700 dark:text-gray-300"}`}>
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="mt-auto pt-2">
                {rdo ? (
                  <Link 
                    href={`/obras/${projectId}/relatorios/${rdo.id}`}
                    className={`block p-1.5 sm:p-2 rounded-md border text-xs sm:text-sm font-medium transition-transform hover:scale-[1.02] active:scale-[0.98] ${statusMap[rdo.status]?.color || statusMap['draft'].color}`}
                    title="Ver Relatório"
                  >
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate hidden sm:inline">RDO {format(day, 'dd/MM')}</span>
                      <span className="truncate sm:hidden">RDO</span>
                    </div>
                  </Link>
                ) : (
                  <div className="h-7 sm:h-8"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
