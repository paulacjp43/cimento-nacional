"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      const supabase = createClient();
      
      try {
        // O Supabase Client detecta automaticamente os parâmetros no hash (#access_token)
        // e estabelece a sessão na primeira carga via createClient().
        
        // Também verificamos se há PKCE via searchParams (?code=...)
        const code = searchParams.get("code");
        
        if (code) {
          const { error: pkceError } = await supabase.auth.exchangeCodeForSession(code);
          if (pkceError) {
            console.error("Erro no PKCE:", pkceError);
            if (isMounted) setError("Link inválido ou expirado.");
            return;
          }
        } else {
          // Fallback para hash fragment
          // Dá um tempinho pro client processar o hash interno e salvar nos cookies
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { data, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) {
            if (isMounted) setError(sessionError.message);
            return;
          }
          if (!data.session) {
            if (isMounted) setError("Sessão não encontrada. O link pode ter sido usado ou expirado.");
            return;
          }
        }

        // Se deu tudo certo, pega o redirecionamento da query string
        const next = searchParams.get("next") || "/definir-senha";
        
        if (isMounted) {
          if (next.startsWith("/")) {
            router.push(next);
          } else {
            router.push("/dashboard");
          }
        }
      } catch (err) {
        console.error("Callback error:", err);
        if (isMounted) setError("Ocorreu um erro ao validar o convite.");
      }
    }

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md card p-8 text-center space-y-6 fade-in shadow-xl shadow-red-900/5">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Erro no Convite</h2>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <button onClick={() => router.push("/login")} className="btn btn-primary w-full justify-center">
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4 fade-in">
        <Loader2 className="w-10 h-10 animate-spin text-primary-600 mx-auto" />
        <p className="text-gray-500 font-medium animate-pulse">Validando seu convite...</p>
      </div>
    </div>
  );
}
