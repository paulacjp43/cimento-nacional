"use client";

import { WorkforceTab } from "./WorkforceTab";
import { ActivitiesTab } from "./ActivitiesTab";
import { EquipmentTab } from "./EquipmentTab";
import { MaterialsTab } from "./MaterialsTab";
import { ConcreteControlTab } from "./ConcreteControlTab";
import { OccurrencesTab } from "./OccurrencesTab";
import { AttachmentsTab } from "./AttachmentsTab";
import { SafetyMetricsTab } from "./SafetyMetricsTab";

interface SectorTabProps {
  reportId: string;
  companyId: string;
  projectId: string;
  sector: "civil" | "eletrica" | "mecanica" | "safety";
  canEdit: boolean;
}

export function SectorTab({ reportId, companyId, projectId, sector, canEdit }: SectorTabProps) {
  // We can use a stacked card layout for each section within the sector
  return (
    <div className="space-y-6">
      <div className="card p-6 fade-in border-t-4 border-t-primary-500">
        <ActivitiesTab reportId={reportId} companyId={companyId} sector={sector} canEdit={canEdit} />
      </div>

      {sector === "safety" && (
        <div className="card p-6 fade-in">
          <SafetyMetricsTab reportId={reportId} canEdit={canEdit} />
        </div>
      )}

      <div className="card p-6 fade-in">
        <WorkforceTab reportId={reportId} companyId={companyId} sector={sector} canEdit={canEdit} />
      </div>

      <div className="card p-6 fade-in">
        <EquipmentTab reportId={reportId} companyId={companyId} sector={sector} canEdit={canEdit} />
      </div>

      <div className="card p-6 fade-in">
        <MaterialsTab reportId={reportId} companyId={companyId} sector={sector} canEdit={canEdit} />
      </div>

      {sector === "civil" && (
        <div className="card p-6 fade-in">
          <ConcreteControlTab reportId={reportId} companyId={companyId} projectId={projectId} canEdit={canEdit} />
        </div>
      )}

      <div className="card p-6 fade-in">
        <OccurrencesTab reportId={reportId} companyId={companyId} projectId={projectId} sector={sector} canEdit={canEdit} />
      </div>

      <div className="card p-6 fade-in">
        <AttachmentsTab reportId={reportId} companyId={companyId} projectId={projectId} sector={sector} canEdit={canEdit} />
      </div>
    </div>
  );
}
