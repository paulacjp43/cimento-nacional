"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle, CheckCircle2, Building2 } from "lucide-react";

function AceitarConviteContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const handleAccept = async () => {
    if (!token_hash || type !== "invite") {
      setError("Link de convite inválido ou incompleto.");
      return;
    }

    setLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: "invite",
      });

      if (verifyError) {
        console.error("Erro na verificação do OTP:", verifyError);
        setError("Este convite já foi aceito, expirou, ou é inválido.");
        setLoading(false);
        return;
      }

      // Sucesso! O usuário agora tem uma sessão ativa.
      // Redireciona para definir a senha.
      router.push("/definir-senha");
    } catch (err: any) {
      console.error(err);
      setError("Erro inesperado ao processar o convite.");
      setLoading(false);
    }
  };

  if (!token_hash || type !== "invite") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md card p-8 text-center space-y-6 fade-in">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Link Inválido
            </h2>
            <p className="text-muted-foreground text-sm">
              O link de convite está ausente ou mal formatado. Por favor, utilize o botão recebido no e-mail.
            </p>
          </div>
          <button onClick={() => router.push("/login")} className="btn btn-primary w-full justify-center">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md card p-8 text-center space-y-6 fade-in shadow-xl shadow-primary-900/5">
        <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
            Convite para GestObra
          </h2>
          <p className="text-muted-foreground text-sm">
            Você foi convidado para acessar o sistema da Cimento Nacional. Clique no botão abaixo para validar seu acesso e criar sua senha.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-3 text-sm text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={loading}
          className="btn btn-primary w-full justify-center text-lg h-12"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Validando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Aceitar Convite
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AceitarConvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    }>
      <AceitarConviteContent />
    </Suspense>
  );
}
