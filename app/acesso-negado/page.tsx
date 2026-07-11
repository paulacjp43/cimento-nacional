import Link from "next/link";
import { ShieldOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso Negado | GESTOBRA",
};

export default function AcessoNegadoPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--color-surface-muted)" }}
    >
      <div className="text-center max-w-md fade-in">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "#fef2f2", color: "#dc2626" }}
        >
          <ShieldOff className="w-10 h-10" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Acesso negado
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Você não tem permissão para acessar esta página. Se acredita que isso é um erro, entre em contato com o administrador.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="btn btn-primary">
            Ir para o início
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Trocar conta
          </Link>
        </div>
      </div>
    </div>
  );
}
