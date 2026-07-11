import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página não encontrada | GESTOBRA",
};

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--color-surface-muted)" }}
    >
      <div className="text-center max-w-md fade-in">
        <div
          className="text-8xl font-black mb-4"
          style={{ color: "var(--color-primary-800)", opacity: 0.15 }}
          aria-hidden="true"
        >
          404
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Página não encontrada
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-secondary)" }}>
          A página que você está procurando não existe ou foi removida.
        </p>
        <Link href="/dashboard" className="btn btn-primary">
          Ir para o início
        </Link>
      </div>
    </div>
  );
}
