"use client";

import { useState, useRef, useCallback } from "react";
import {
  X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  ChevronDown, ChevronUp, Loader2, Users, Building2
} from "lucide-react";
import { toast } from "sonner";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface WorkerEntry {
  credential: string;
  name: string;
  company: string;
  entryTime?: string;
}

interface CompanyGroup {
  company: string;
  workers: WorkerEntry[];
  role: string;
  hours: number;
  selected: boolean;
  expanded: boolean;
}

interface WorkforceRow {
  role: string;
  quantity: number;
  company_name: string;
  hours_worked: number;
  observations: string;
}

interface Props {
  sector: string;
  onImport: (rows: WorkforceRow[]) => void;
  onClose: () => void;
}

// ─── Aliases de colunas ───────────────────────────────────────────────────────

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
}

const HEADER_MARKERS = [
  "numero da credencial",
  "numero credencial",
  "credencial",
  "nome",
];

const COL_MAP: Record<string, string> = {
  "numero da credencial": "credential",
  "numero credencial": "credential",
  "credencial": "credential",
  "nome": "name",
  "estrutura organizacional": "company",
  "empresa": "company",
  "organization": "company",
  "data do evento": "eventTime",
  "data evento": "eventTime",
  "datetime": "eventTime",
  "direcao do evento": "direction",
  "direcao evento": "direction",
  "direction": "direction",
  "sentido": "direction",
  "evento": "event",
  "event": "event",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isEntryDirection(val: string): boolean {
  const v = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return v.includes("entrada") || v.includes("entry") || v.includes("in");
}

function findHeaderRow(
  rows: Record<string, string | number>[]
): { headerIndex: number; colMap: Record<string, string> } | null {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i];
    const keys = Object.values(row).map((v) => normalizeKey(String(v)));
    const hasMarker = HEADER_MARKERS.some((m) => keys.includes(m));
    if (!hasMarker) continue;

    // Build column index → field mapping using the CELL VALUES of this row
    const colMap: Record<string, string> = {};
    Object.entries(row).forEach(([col, val]) => {
      const normalized = normalizeKey(String(val));
      if (COL_MAP[normalized]) {
        colMap[col] = COL_MAP[normalized];
      }
    });

    if (colMap && Object.values(colMap).includes("name")) {
      return { headerIndex: i, colMap };
    }
  }
  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function WorkforceExcelImportModal({ sector, onImport, onClose }: Props) {
  const [groups, setGroups] = useState<CompanyGroup[]>([]);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState({ total: 0, entries: 0, duplicate: 0 });
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Processa o arquivo Excel ───────────────────────────────────────────────
  const processFile = useCallback(async (file: File) => {
    try {
      const { read, utils } = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: "array", cellText: true, cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];

      // Lê como array de arrays para poder detectar a linha de cabeçalho
      const rawMatrix: string[][] = utils.sheet_to_json(ws, {
        header: 1,
        defval: "",
        raw: false,
      });

      // Converte para array de objetos com chaves = col0, col1 …
      const rawRows = rawMatrix.map((r) => {
        const obj: Record<string, string> = {};
        r.forEach((cell, i) => { obj[`col${i}`] = String(cell ?? ""); });
        return obj;
      });

      const found = findHeaderRow(rawRows);

      if (!found) {
        // Fallback: tenta ler como planilha genérica (primeira linha = header)
        await processGeneric(file);
        return;
      }

      const { headerIndex, colMap } = found;
      const dataRows = rawRows.slice(headerIndex + 1);

      // Mapeia cada linha para um WorkerEntry
      const allWorkers: WorkerEntry[] = [];
      let totalRows = 0;
      let entryRows = 0;

      dataRows.forEach((row) => {
        const mapped: Record<string, string> = {};
        Object.entries(colMap).forEach(([col, field]) => {
          mapped[field] = row[col] ?? "";
        });

        if (!mapped.name && !mapped.credential) return; // linha vazia
        totalRows++;

        // Filtra apenas "Entrada"
        if (mapped.direction && !isEntryDirection(mapped.direction)) return;
        entryRows++;

        allWorkers.push({
          credential: mapped.credential || mapped.name,
          name: mapped.name || mapped.credential,
          company: mapped.company || "Não informado",
          entryTime: mapped.eventTime,
        });
      });

      // Deduplica por credential dentro da mesma empresa
      const seen = new Set<string>();
      const unique: WorkerEntry[] = [];
      allWorkers.forEach((w) => {
        const key = `${w.company}||${w.credential || w.name}`;
        if (!seen.has(key)) { seen.add(key); unique.push(w); }
      });

      const duplicateCount = allWorkers.length - unique.length;

      // Agrupa por empresa
      const companyMap = new Map<string, WorkerEntry[]>();
      unique.forEach((w) => {
        const list = companyMap.get(w.company) ?? [];
        list.push(w);
        companyMap.set(w.company, list);
      });

      const grouped: CompanyGroup[] = Array.from(companyMap.entries()).map(
        ([company, workers]) => ({
          company,
          workers,
          role: "",
          hours: 8,
          selected: true,
          expanded: false,
        })
      );

      setGroups(grouped);
      setStats({ total: totalRows, entries: entryRows, duplicate: duplicateCount });
      setFileName(file.name);
      setStep("preview");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao ler o arquivo. Verifique se é um .xlsx ou .csv válido.");
    }
  }, []);

  // Fallback: planilha genérica simples (Função, Quantidade, Empresa …)
  const processGeneric = useCallback(async (file: File) => {
    try {
      const { read, utils } = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = read(buffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: Record<string, string | number>[] = utils.sheet_to_json(ws, {
        defval: "", raw: false,
      });

      if (raw.length === 0) { toast.error("Planilha vazia."); return; }

      // Tenta detectar coluna de função / cargo
      const firstRow = raw[0];
      const funcaoKey = Object.keys(firstRow).find((k) =>
        ["função", "funcao", "cargo", "role", "função (cargo)"].includes(
          normalizeKey(k)
        )
      );
      const qtdKey = Object.keys(firstRow).find((k) =>
        ["qtd", "quantidade", "quantity", "qty"].includes(normalizeKey(k))
      );
      const empKey = Object.keys(firstRow).find((k) =>
        ["empresa", "company", "subcontratada"].includes(normalizeKey(k))
      );

      if (!funcaoKey) {
        toast.error(
          "Formato não reconhecido. Esperado: planilha com colunas 'Função' e 'Quantidade', ou Relatório de Acessos do sistema de controle."
        );
        return;
      }

      const grouped: CompanyGroup[] = raw
        .filter((r) => r[funcaoKey!])
        .map((r, i) => ({
          company: empKey ? String(r[empKey] || "") : "",
          workers: Array.from({ length: parseInt(String(r[qtdKey!] ?? 1)) || 1 }, (_, j) => ({
            credential: `gen-${i}-${j}`,
            name: `${r[funcaoKey!]}`,
            company: empKey ? String(r[empKey] || "") : "",
          })),
          role: String(r[funcaoKey!]),
          hours: 8,
          selected: true,
          expanded: false,
        }));

      setGroups(grouped);
      setStats({ total: raw.length, entries: raw.length, duplicate: 0 });
      setFileName(file.name + " (formato genérico)");
      setStep("preview");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao ler arquivo genérico.");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const updateGroup = (index: number, field: keyof CompanyGroup, value: unknown) => {
    setGroups((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleImport = async () => {
    const selected = groups.filter((g) => g.selected);
    if (selected.length === 0) {
      toast.error("Selecione ao menos uma empresa para importar.");
      return;
    }
    const missing = selected.filter((g) => !g.role.trim());
    if (missing.length > 0) {
      toast.error(
        `Preencha a Função para: ${missing.map((g) => g.company).join(", ")}`
      );
      return;
    }
    setImporting(true);
    try {
      const rows: WorkforceRow[] = selected.map((g) => ({
        role: g.role.trim(),
        quantity: g.workers.length,
        company_name: g.company,
        hours_worked: g.hours,
        observations: `Importado via Rel. Acessos — ${g.workers.length} trabalhador${g.workers.length !== 1 ? "es" : ""}`,
      }));
      onImport(rows);
      toast.success(`${rows.length} grupo${rows.length !== 1 ? "s" : ""} importado${rows.length !== 1 ? "s" : ""} com sucesso!`);
      onClose();
    } finally {
      setImporting(false);
    }
  };

  const selectedCount = groups.filter((g) => g.selected).length;
  const totalWorkers = groups.filter((g) => g.selected).reduce((s, g) => s + g.workers.length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Importar Mão de Obra via Planilha
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Relatório de Acessos · Setor:{" "}
                <span className="font-medium capitalize">{sector}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* ── STEP 1: Upload ── */}
          {step === "upload" && (
            <>
              {/* Info box */}
              <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/20 p-4 text-xs text-blue-800 dark:text-blue-300 space-y-1.5">
                <p className="font-semibold text-sm">Formato reconhecido automaticamente:</p>
                <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                  <li>
                    <strong>Relatório de Acessos</strong> — com colunas <em>Número da Credencial, Nome, Estrutura Organizacional, Direção do Evento</em>
                  </li>
                  <li>
                    <strong>Planilha genérica</strong> — com colunas <em>Função, Quantidade, Empresa</em>
                  </li>
                </ul>
                <p className="text-blue-600 dark:text-blue-500 pt-1">
                  O sistema irá agrupar os trabalhadores por empresa e contar quantos entraram no dia.
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragging
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10"
                }`}
              >
                <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragging ? "text-primary-500" : "text-gray-400"}`} />
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Suporta <strong>.xlsx</strong>, <strong>.xls</strong> e <strong>.csv</strong>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            </>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === "preview" && (
            <>
              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Linhas lidas", value: stats.total, color: "gray" },
                  { label: "Entradas únicas", value: stats.entries - stats.duplicate, color: "green" },
                  { label: "Duplicatas removidas", value: stats.duplicate, color: "amber" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl p-3 text-center bg-${s.color}-50 dark:bg-${s.color}-950/20 border border-${s.color}-200 dark:border-${s.color}-900/30`}
                  >
                    <p className={`text-xl font-bold text-${s.color}-700 dark:text-${s.color}-400`}>{s.value}</p>
                    <p className={`text-xs text-${s.color}-600 dark:text-${s.color}-500`}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Instrução */}
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg px-3 py-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  Preencha a <strong>Função/Cargo</strong> para cada empresa antes de importar. 
                  O campo é obrigatório no RDO.
                </span>
              </div>

              {/* Grupos por empresa */}
              <div className="space-y-2">
                {groups.map((group, gi) => (
                  <div
                    key={gi}
                    className={`rounded-xl border transition-all ${
                      group.selected
                        ? "border-primary-300 dark:border-primary-700 bg-primary-50/30 dark:bg-primary-900/10"
                        : "border-gray-200 dark:border-gray-800 opacity-60"
                    }`}
                  >
                    {/* Cabeçalho do grupo */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={group.selected}
                        onChange={() => updateGroup(gi, "selected", !group.selected)}
                        className="rounded border-gray-300 w-4 h-4 flex-shrink-0"
                      />

                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-500" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                          {group.company}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {group.workers.length} trabalhador{group.workers.length !== 1 ? "es" : ""}
                        </p>
                      </div>

                      {/* Função */}
                      <input
                        type="text"
                        placeholder="Função / Cargo *"
                        value={group.role}
                        onChange={(e) => updateGroup(gi, "role", e.target.value)}
                        disabled={!group.selected}
                        className={`w-36 text-xs rounded-lg border px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50 ${
                          group.selected && !group.role
                            ? "border-red-400 bg-red-50 dark:bg-red-950/20"
                            : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        }`}
                      />

                      {/* Horas */}
                      <input
                        type="number"
                        min={1}
                        max={24}
                        step={0.5}
                        value={group.hours}
                        onChange={(e) => updateGroup(gi, "hours", parseFloat(e.target.value) || 8)}
                        disabled={!group.selected}
                        className="w-16 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-400 disabled:opacity-50"
                        title="Horas trabalhadas"
                      />
                      <span className="text-xs text-gray-400">h</span>

                      {/* Expandir */}
                      <button
                        onClick={() => updateGroup(gi, "expanded", !group.expanded)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                        title="Ver trabalhadores"
                      >
                        {group.expanded
                          ? <ChevronUp className="w-4 h-4 text-gray-500" />
                          : <ChevronDown className="w-4 h-4 text-gray-500" />}
                      </button>
                    </div>

                    {/* Lista de trabalhadores expandida */}
                    {group.expanded && (
                      <div className="border-t dark:border-gray-800 px-4 py-3 max-h-40 overflow-y-auto">
                        <ul className="space-y-1">
                          {group.workers.map((w, wi) => (
                            <li key={wi} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span className="font-medium">{w.name}</span>
                              {w.credential && w.credential !== w.name && (
                                <span className="text-gray-400">· Cred. {w.credential}</span>
                              )}
                              {w.entryTime && (
                                <span className="text-gray-400 ml-auto">{w.entryTime}</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => { setStep("upload"); setGroups([]); setFileName(""); }}
                className="text-xs text-primary-600 hover:underline"
              >
                ← Trocar arquivo
              </button>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t dark:border-gray-800">
          <div className="text-xs text-gray-500">
            {step === "preview" && fileName && (
              <span className="truncate max-w-[200px] inline-block align-middle" title={fileName}>
                📄 {fileName}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="btn btn-ghost text-sm">
              Cancelar
            </button>
            {step === "preview" && (
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || importing}
                className="btn btn-primary text-sm"
              >
                {importing
                  ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  : <CheckCircle2 className="w-4 h-4 mr-2" />}
                Importar{totalWorkers > 0 ? ` ${totalWorkers} trabalhador${totalWorkers !== 1 ? "es" : ""}` : ""}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
