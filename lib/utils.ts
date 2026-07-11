import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatar CNPJ: 00.000.000/0000-00 */
export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  return digits.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    "$1.$2.$3/$4-$5"
  );
}

/** Validar CNPJ */
export function validateCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, "");
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (arr: number[], weights: number[]) => {
    const sum = arr.reduce((acc, val, i) => acc + val * weights[i], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const nums = digits.split("").map(Number);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(nums.slice(0, 12), w1);
  const d2 = calcDigit(nums.slice(0, 13), w2);

  return nums[12] === d1 && nums[13] === d2;
}

/** Formatar CEP: 00000-000 */
export function formatCEP(cep: string): string {
  return cep.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2");
}

/** Formatar telefone: (00) 00000-0000 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
}

/** Formatar data para pt-BR */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  return d.toLocaleDateString("pt-BR");
}

/** Formatar data e hora para pt-BR */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR");
}

/** Formatar valor em BRL */
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Retornar iniciais do nome */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

/** Truncar texto com reticências */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/** Gerar path de storage organizado */
export function buildStoragePath(
  companyId: string,
  projectId: string,
  date: string,
  sector: string,
  fileName: string
): string {
  const [year, month, day] = date.split("-");
  return `${companyId}/${projectId}/${year}/${month}/${day}/${sector}/${fileName}`;
}

/** Formatar tamanho de arquivo */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
