import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acesso",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo — branding */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        {/* Padrão decorativo */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
            <circle cx="400" cy="300" r="300" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="300" r="200" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="300" r="100" stroke="white" strokeWidth="1" />
            <line x1="0" y1="300" x2="800" y2="300" stroke="white" strokeWidth="0.5" />
            <line x1="400" y1="0" x2="400" y2="600" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
              style={{ background: "#2563eb", color: "white" }}
            >
              G
            </div>
            <span className="text-white text-xl font-bold tracking-tight">GESTOBRA</span>
          </div>
        </div>

        {/* Conteúdo central */}
        <div className="relative z-10 space-y-6">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(255,255,255,0.1)", color: "#93c5fd" }}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              Sistema Online
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Relatório Diário
              <br />
              <span style={{ color: "#60a5fa" }}>de Obras</span>
            </h1>
            <p className="mt-4 text-lg" style={{ color: "#94a3b8" }}>
              Registre, acompanhe e aprove atividades de campo com precisão e agilidade.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: "🏗️", text: "Civil, Elétrica e Mecânica em um único lugar" },
              { icon: "📋", text: "Fluxo de aprovação com histórico completo" },
              { icon: "📄", text: "Geração de PDF profissional com fotos" },
              { icon: "🔒", text: "Isolamento de dados por empresa (multi-tenant)" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm" style={{ color: "#cbd5e1" }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: "#475569" }}>
            © {new Date().getFullYear()} GESTOBRA · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#f8fafc" }}>
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ background: "#1e40af", color: "white" }}
            >
              G
            </div>
            <span className="font-bold text-lg" style={{ color: "#0f172a" }}>GESTOBRA</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
