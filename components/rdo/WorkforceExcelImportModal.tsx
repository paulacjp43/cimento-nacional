"use client";

import { useState, useRef, useCallback } from "react";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WorkforceRow {
  role: string;
  quantity: number;
  company_name: string;
  hours_worked: number;
  observations: string;
  _valid: boolean;
  _error?: string;
  _selected: boolean;
}

interface ExcelImportModalProps {
  sector: string;
  onImport: (rows: Omit<WorkforceRow, "_valid" | "_error" | "_selected">[]) => void;
  onClose: () => void;
}

const COLUMN_ALIASES: Record<string, keyof Omit<WorkforceRow, "_valid" | "_error" | "_selected">> = {
  // role
  "função": "role",
  "funcao": "role",
  "cargo": "role",
  "função/cargo": "role",
  "funcao/cargo": "role",
  "função (cargo)": "role",
  "role": "role",
  // quantity
  "qtd": "quantity",
  "quantidade": "quantity",
  "qty": "quantity",
  "quantity": "quantity",
  "nº": "quantity",
  "numero": "quantity",
  // company_name
  "empresa": "company_name",
  "subcontratada": "company_name",
  "prestadora": "company_name",
  "company": "company_name",
  "company_name": "company_name",
  "fornecedor": "company_name",
  // hours_worked
  "horas": "hours_worked",
  "h": "hours_worked",
  "hrs": "hours_worked",
  "hours": "hours_worked",
  "hours_worked": "hours_worked",
  "horas trabalhadas": "hours_worked",
  // observations
  "obs": "observations",
  "observações": "observations",
  "observacoes": "observations",
  "observação": "observations",
  "observations": "observations",
  "notas": "observations",
};

function normalizeHeader(h: string): string {
  return h.toLowerCase().trim().replace(/[^a-záéíóúâêîôûãõçü /]/g, "");
}

export function WorkforceExcelImportModal({ sector, onImport, onClose }: ExcelImportModalProps) {
  const [rows, setRows] = useState<WorkforceRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");
  const [importing, setImporting] = useState(false);
  const [unmappedColumns, setUnmappedColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const processFile = useCallback(async (file: File) => {
    try {
      const { read, utils } = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw: Record<string, string | number>[] = utils.sheet_to_json(sheet, {
        defval: "",
        raw: false,
      });

      if (raw.length === 0) {
        toast.error("Planilha vazia ou sem dados.");
        return;
      }

      // Map headers
      const firstRow = raw[0];
      const headerMap: Record<string, keyof Omit<WorkforceRow, "_valid" | "_error" | "_selected">> = {};
      const unmapped: string[] = [];

      Object.keys(firstRow).forEach((h) => {
        const normalized = normalizeHeader(h);
        if (COLUMN_ALIASES[normalized]) {
          headerMap[h] = COLUMN_ALIASES[normalized];
        } else {
          unmapped.push(h);
        }
      });

      setUnmappedColumns(unmapped);

      // Parse rows
      const parsed: WorkforceRow[] = raw.map((r) => {
        const row: Partial<WorkforceRow> & { _valid: boolean; _selected: boolean } = {
          role: "",
          quantity: 1,
          company_name: "",
          hours_worked: 8,
          observations: "",
          _valid: true,
          _selected: true,
        };

        Object.entries(r).forEach(([col, val]) => {
          const field = headerMap[col];
          if (!field) return;
          if (field === "quantity") {
            row.quantity = parseInt(String(val)) || 1;
          } else if (field === "hours_worked") {
            row.hours_worked = parseFloat(String(val)) || 8;
          } else {
            (row as Record<string, unknown>)[field] = String(val).trim();
          }
        });

        // Validate
        if (!row.role || row.role.trim() === "") {
          row._valid = false;
          row._error = "Função obrigatória";
          row._selected = false;
        } else if (!row.quantity || row.quantity < 1) {
          row._valid = false;
          row._error = "Quantidade inválida";
          row._selected = false;
        }

        return row as WorkforceRow;
      });

      setRows(parsed);
      setFileName(file.name);
      setStep("preview");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao ler o arquivo. Verifique se é um arquivo Excel (.xlsx) ou CSV válido.");
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const toggleRow = (index: number) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], _selected: !updated[index]._selected };
      return updated;
    });
  };

  const toggleAll = () => {
    const validRows = rows.filter((r) => r._valid);
    const allSelected = validRows.every((r) => r._selected);
    setRows((prev) =>
      prev.map((r) => ({ ...r, _selected: r._valid ? !allSelected : false }))
    );
  };

  const handleImport = async () => {
    const selected = rows.filter((r) => r._selected && r._valid);
    if (selected.length === 0) {
      toast.error("Selecione ao menos uma linha para importar.");
      return;
    }
    setImporting(true);
    try {
      onImport(
        selected.map(({ _valid, _error, _selected, ...rest }) => rest)
      );
      toast.success(`${selected.length} registro(s) importado(s) com sucesso!`);
      onClose();
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    const { utils, writeFile } = await import("xlsx");
    const template = [
      {
        "Função (Cargo)": "Pedreiro",
        "Quantidade": 3,
        "Empresa": "Própria",
        "Horas": 8,
        "Observações": "",
      },
      {
        "Função (Cargo)": "Servente",
        "Quantidade": 5,
        "Empresa": "Subempreiteiro ABC",
        "Horas": 8,
        "Observações": "Equipe reforçada",
      },
    ];
    const ws = utils.json_to_sheet(template);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Mão de Obra");
    writeFile(wb, "modelo_mao_de_obra.xlsx");
  };

  const selectedCount = rows.filter((r) => r._selected && r._valid).length;
  const validCount = rows.filter((r) => r._valid).length;
  const invalidCount = rows.filter((r) => !r._valid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Importar Mão de Obra</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Setor: <span className="font-medium capitalize">{sector}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "upload" && (
            <div className="space-y-5">
              {/* Download template */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Baixe o modelo de planilha
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Preencha com os dados e importe aqui
                  </p>
                </div>
                <button
                  onClick={downloadTemplate}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar Modelo
                </button>
              </div>

              {/* Drop zone */}
              <div
                ref={dropRef}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  Arraste o arquivo ou clique para selecionar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Suporta .xlsx, .xls e .csv
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {/* Column guide */}
              <div className="rounded-xl border dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Colunas reconhecidas automaticamente
                  </p>
                </div>
                <div className="p-4 grid grid-cols-2 gap-2">
                  {[
                    { label: "Função (Cargo)", aliases: "Função, Cargo, Role", required: true },
                    { label: "Quantidade", aliases: "Qtd, Qty, Numero", required: true },
                    { label: "Empresa", aliases: "Empresa, Subcontratada, Fornecedor", required: false },
                    { label: "Horas", aliases: "Horas, Hrs, Hours", required: false },
                    { label: "Observações", aliases: "Obs, Observações, Notas", required: false },
                  ].map((col) => (
                    <div key={col.label} className="flex items-start gap-2">
                      <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${col.required ? "bg-red-400" : "bg-gray-300"}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {col.label} {col.required && <span className="text-red-500">*</span>}
                        </p>
                        <p className="text-xs text-gray-500">{col.aliases}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Arquivo: <span className="font-medium text-gray-900 dark:text-white">{fileName}</span>
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  {validCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      {validCount} válido{validCount !== 1 ? "s" : ""}
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" />
                      {invalidCount} inválido{invalidCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {unmappedColumns.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-400">
                  ⚠️ Colunas ignoradas (não reconhecidas): {unmappedColumns.join(", ")}
                </div>
              )}

              {/* Preview table */}
              <div className="overflow-x-auto rounded-xl border dark:border-gray-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500">
                    <tr>
                      <th className="px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={rows.filter((r) => r._valid).every((r) => r._selected)}
                          onChange={toggleAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                      <th className="px-3 py-2.5 font-medium">Função</th>
                      <th className="px-3 py-2.5 font-medium w-16">Qtd</th>
                      <th className="px-3 py-2.5 font-medium">Empresa</th>
                      <th className="px-3 py-2.5 font-medium w-16">Horas</th>
                      <th className="px-3 py-2.5 font-medium">Obs.</th>
                      <th className="px-3 py-2.5 font-medium w-24 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        className={`${
                          !row._valid
                            ? "bg-red-50/50 dark:bg-red-950/20 opacity-60"
                            : row._selected
                            ? "bg-white dark:bg-gray-900"
                            : "bg-gray-50/50 dark:bg-gray-800/30 opacity-60"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={row._selected}
                            disabled={!row._valid}
                            onChange={() => toggleRow(i)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-200">
                          {row.role || <span className="text-red-400 italic">vazio</span>}
                        </td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.quantity}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.company_name || "—"}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{row.hours_worked}h</td>
                        <td className="px-3 py-2 text-gray-500 dark:text-gray-500 max-w-[120px] truncate">
                          {row.observations || "—"}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {row._valid ? (
                            <span className="text-green-600 dark:text-green-400 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> OK
                            </span>
                          ) : (
                            <span
                              className="text-red-500 flex items-center justify-center gap-1"
                              title={row._error}
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> {row._error}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => {
                  setStep("upload");
                  setRows([]);
                  setFileName("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-primary-600 hover:underline"
              >
                ← Trocar arquivo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-5 border-t dark:border-gray-800">
          <button onClick={onClose} className="btn btn-ghost text-sm">
            Cancelar
          </button>
          {step === "preview" && (
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || importing}
              className="btn btn-primary text-sm"
            >
              {importing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Importar {selectedCount > 0 ? `${selectedCount} registro${selectedCount !== 1 ? "s" : ""}` : ""}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
