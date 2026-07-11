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
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        {/* Padrão decorativo sutil */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
            <circle cx="400" cy="300" r="300" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="300" r="200" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        {/* Logo centralizado e grande */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div
            className="w-56 h-56 rounded-2xl flex items-center justify-center bg-white shadow-2xl overflow-hidden p-5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Logo Cimento Nacional" className="w-full h-full object-contain" />
          </div>
          <div className="text-center">
            <h1 className="text-white text-3xl font-extrabold tracking-wider">CIMENTO NACIONAL</h1>
            <p className="text-blue-300 font-semibold tracking-widest uppercase mt-2 text-xs">Portal Gestão de Obras</p>
          </div>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: "#f8fafc" }}>
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-8 lg:hidden bg-white shadow-sm p-2.5 rounded-xl border border-gray-100">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center bg-white overflow-hidden p-1 flex-shrink-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Logo Cimento Nacional" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-bold text-base leading-none block text-gray-900">Cimento Nacional</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Gestão de Obras</span>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
