import Link from "next/link";
import { TimerOff } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sessão Expirada | GESTOBRA",
};

export default function SessaoExpiradaPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--color-surface-muted)" }}
    >
      <div className="text-center max-w-md fade-in">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "#fffbeb", color: "#d97706" }}
        >
          <TimerOff className="w-10 h-10" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Sessão expirada
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          Sua sessão expirou por inatividade. Faça login novamente para continuar.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg">
          Fazer login novamente
        </Link>
      </div>
    </div>
  );
}
