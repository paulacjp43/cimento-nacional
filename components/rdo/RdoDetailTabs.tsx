"use client";

import { useState, useEffect } from "react";
import { FileText, Users, HardHat, Package, CheckSquare, Image as ImageIcon, AlertTriangle, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
// Import sub-components for tabs (we'll build these next)
import { WorkforceTab } from "./WorkforceTab";
import { ActivitiesTab } from "./ActivitiesTab";
import { EquipmentTab } from "./EquipmentTab";
import { MaterialsTab } from "./MaterialsTab";
import { AttachmentsTab } from "./AttachmentsTab";
import { OccurrencesTab } from "./OccurrencesTab";
import { GeneralTab } from "./GeneralTab";
import { CommunicationTab } from "./CommunicationTab";

import { useSearchParams } from "next/navigation";

interface RdoDetailTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any; // Using any for rapid dev, ideally use Database types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
}

export function RdoDetailTabs({ report, project }: RdoDetailTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState("geral");

  useEffect(() => {
    if (tabParam) {
      setTimeout(() => setActiveTab(tabParam), 0);
    }
  }, [tabParam]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [alerts, setAlerts] = useState<any[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any;

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const { data } = await supabase
          .from("sector_messages")
          .select("*")
          .eq("daily_report_id", report.id)
          .eq("is_alert", true);
        setTimeout(() => setAlerts(data || []), 0);
      } catch (err) {
        console.error(err);
      }
    }
    fetchAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.id]);

  const tabs = [
    { id: "geral", label: "Dados Gerais", icon: FileText },
    { id: "efetivo", label: "Efetivo", icon: Users },
    { id: "equipamentos", label: "Equipamentos", icon: HardHat },
    { id: "atividades", label: "Atividades", icon: CheckSquare },
    { id: "materiais", label: "Materiais", icon: Package },
    { id: "ocorrencias", label: "Ocorrências", icon: AlertTriangle },
    { id: "comunicacao", label: "Comunicação", icon: MessageSquare },
    { id: "fotos", label: "Fotos / Anexos", icon: ImageIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Alertas de Comunicação Interna */}
      {alerts.length > 0 && activeTab !== "comunicacao" && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300 text-xs shadow-sm">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <div>
              <span className="font-bold">Há {alerts.length} alerta{alerts.length > 1 ? "s" : ""} setorial{alerts.length > 1 ? "ais" : ""} ativo{alerts.length > 1 ? "s" : ""}!</span>
              <span className="opacity-80 block sm:inline sm:ml-2">
                Último alerta do setor <strong className="uppercase">{alerts[alerts.length - 1].from_sector}</strong> para <strong className="uppercase">{alerts[alerts.length - 1].to_sector}</strong>: &quot;{alerts[alerts.length - 1].message.substring(0, 80)}{alerts[alerts.length - 1].message.length > 80 ? "..." : ""}&quot;
              </span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab("comunicacao")}
            className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-800 font-semibold border-none ml-4 flex-shrink-0"
          >
            Ver Comunicação
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasAlerts = tab.id === "comunicacao" && alerts.length > 0;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                  ${isActive 
                    ? "border-primary-500 text-primary-600 dark:text-primary-400" 
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"}
                `}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? "text-primary-500" : "text-gray-400 group-hover:text-gray-500"}`} />
                {tab.label}
                {hasAlerts && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" title="Alertas setoriais ativos" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Area */}
      <div className="min-h-[400px]">
        {activeTab === "geral" && (
          <div className="card p-6 fade-in">
            <h3 className="text-lg font-medium mb-4 border-b pb-2 dark:border-gray-800">Visão Geral do Dia</h3>
            <GeneralTab report={report} project={project} />
          </div>
        )}

        {activeTab === "efetivo" && (
          <div className="card p-6 fade-in">
            <WorkforceTab reportId={report.id} companyId={report.company_id} />
          </div>
        )}

        {activeTab === "equipamentos" && (
          <div className="card p-6 fade-in">
            <EquipmentTab reportId={report.id} companyId={report.company_id} />
          </div>
        )}

        {activeTab === "atividades" && (
          <div className="card p-6 fade-in">
            <ActivitiesTab reportId={report.id} companyId={report.company_id} />
          </div>
        )}

        {activeTab === "materiais" && (
          <div className="card p-6 fade-in">
            <MaterialsTab reportId={report.id} companyId={report.company_id} />
          </div>
        )}

        {activeTab === "ocorrencias" && (
          <div className="card p-6 fade-in">
            <OccurrencesTab reportId={report.id} companyId={report.company_id} projectId={project.id} />
          </div>
        )}

        {activeTab === "comunicacao" && (
          <div className="card p-6 fade-in">
            <CommunicationTab reportId={report.id} companyId={report.company_id} />
          </div>
        )}

        {activeTab === "fotos" && (
          <div className="card p-6 fade-in">
            <AttachmentsTab reportId={report.id} companyId={report.company_id} projectId={project.id} />
          </div>
        )}
      </div>
    </div>
  );
}
