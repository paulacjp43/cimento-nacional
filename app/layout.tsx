import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | GESTOBRA",
    default: "GESTOBRA — Sistema de Relatório Diário de Obras",
  },
  description:
    "Plataforma digital para elaboração, armazenamento, consulta e emissão de Relatórios Diários de Obra. Setores Civil, Elétrica e Mecânica.",
  keywords: [
    "relatório diário de obra",
    "RDO",
    "gestão de obras",
    "construção civil",
    "engenharia",
  ],
  authors: [{ name: "GESTOBRA" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GESTOBRA",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
