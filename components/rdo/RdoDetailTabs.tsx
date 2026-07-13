"use client";

import { useState, useEffect } from "react";
import { FileText, Users, HardHat, Package, CheckSquare, Image as ImageIcon, AlertTriangle, MessageSquare, ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GeneralTab } from "./GeneralTab";
import { CommunicationTab } from "./CommunicationTab";
import { SectorTab } from "./SectorTab";
import { SectorActionButtons } from "./SectorActionButtons";
import { AttachmentsTab } from "./AttachmentsTab";

import { useSearchParams } from "next/navigation";

interface RdoDetailTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  report: any; // Using any for rapid dev, ideally use Database types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  userRole?: string;
  canEditGlobal?: boolean;
}

export function RdoDetailTabs({ report, project, userRole, canEditGlobal = true }: RdoDetailTabsProps) {
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
    { id: "geral", label: "Dados Gerais", icon: FileText, show: true },
    { id: "civil", label: "Civil", icon: HardHat, show: userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'civil' || userRole === 'manager' || userRole === 'viewer' },
    { id: "eletrica", label: "Elétrica", icon: CheckSquare, show: userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'electrical' || userRole === 'manager' || userRole === 'viewer' },
    { id: "mecanica", label: "Mecânica", icon: Package, show: userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'mechanical' || userRole === 'manager' || userRole === 'viewer' },
    { id: "safety", label: "Segurança", icon: ShieldAlert, show: userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'safety' || userRole === 'manager' || userRole === 'viewer' },
    { id: "comunicacao", label: "Comunicação", icon: MessageSquare, show: true },
  ].filter(t => t.show);

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

        {activeTab === "civil" && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-800">
              <h3 className="text-lg font-medium">Setor Civil</h3>
              <SectorActionButtons reportId={report.id} projectId={project.id} sector="civil" canApprove={userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'civil'} />
            </div>
            <SectorTab reportId={report.id} companyId={report.company_id} projectId={project.id} sector="civil" canEdit={canEditGlobal && (userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'civil')} />
          </div>
        )}

        {activeTab === "eletrica" && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-800">
              <h3 className="text-lg font-medium">Setor Elétrica</h3>
              <SectorActionButtons reportId={report.id} projectId={project.id} sector="eletrica" canApprove={userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'electrical'} />
            </div>
            <SectorTab reportId={report.id} companyId={report.company_id} projectId={project.id} sector="eletrica" canEdit={canEditGlobal && (userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'electrical')} />
          </div>
        )}

        {activeTab === "mecanica" && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-800">
              <h3 className="text-lg font-medium">Setor Mecânica</h3>
              <SectorActionButtons reportId={report.id} projectId={project.id} sector="mecanica" canApprove={userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'mechanical'} />
            </div>
            <SectorTab reportId={report.id} companyId={report.company_id} projectId={project.id} sector="mecanica" canEdit={canEditGlobal && (userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'mechanical')} />
          </div>
        )}

        {activeTab === "safety" && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-4 pb-2 border-b dark:border-gray-800">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                Segurança do Trabalho
              </h3>
              <SectorActionButtons reportId={report.id} projectId={project.id} sector="safety" canApprove={userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'safety'} />
            </div>
            <SectorTab reportId={report.id} companyId={report.company_id} projectId={project.id} sector="safety" canEdit={canEditGlobal && (userRole === 'superadmin' || userRole === 'company_admin' || userRole === 'safety')} />
          </div>
        )}

        {activeTab === "comunicacao" && (
          <div className="card p-6 fade-in">
            <CommunicationTab reportId={report.id} companyId={report.company_id} />
          </div>
        )}

      </div>
    </div>
  );
}
