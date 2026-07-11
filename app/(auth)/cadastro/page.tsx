"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { HardHat, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

function CadastroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If no token is provided, we still allow signup but they won't belong to a company yet.
  // In a real B2B app, you might block signup without a token.
  
  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!fullName || !email || !password) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    
    // Supabase Auth SignUp
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          invitation_token: token || undefined,
        },
      },
    });

    if (signUpError) {
      console.error(signUpError);
      setError(
        signUpError.message.includes("already registered")
          ? "Este e-mail já está cadastrado. Faça login em vez disso."
          : "Erro ao criar conta. Tente novamente."
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      // Auto-login successful
      router.push("/dashboard");
    } else {
      // Email confirmation required
      setSuccess(true);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md card p-8 text-center space-y-6 fade-in">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Conta Criada com Sucesso!
            </h2>
            <p className="text-muted-foreground text-sm">
              Verifique sua caixa de entrada para confirmar seu e-mail. Se você usou um link de convite, seu perfil será vinculado à empresa automaticamente após o login.
            </p>
          </div>
          <Link href="/login" className="btn btn-primary w-full justify-center">
            Ir para Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-primary-600 mb-2">
            <HardHat className="w-10 h-10" />
            <span className="text-3xl font-bold tracking-tight">GESTOBRA</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
            Crie sua conta
          </h1>
          <p className="text-muted-foreground mt-2">
            {token 
              ? "Você foi convidado! Preencha os dados para aceitar." 
              : "Preencha seus dados para começar a usar o sistema."}
          </p>
        </div>

        <div className="card p-8 fade-in shadow-xl shadow-primary-900/5">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg flex gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome Completo
              </label>
              <input
                name="fullName"
                type="text"
                required
                className="input"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                className="input"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Mínimo de 6 caracteres.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Criando conta...</>
              ) : (
                "Criar Conta"
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium hover:underline">
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>}>
      <CadastroForm />
    </Suspense>
  );
}
