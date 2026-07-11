"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Informe um e-mail válido"),
});

type FormData = z.infer<typeof schema>;

export default function EsqueciSenhaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });

    setIsLoading(false);

    if (error) {
      setError("Não foi possível enviar o e-mail de recuperação. Tente novamente.");
      return;
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="fade-in text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "#dcfce7", color: "#16a34a" }}
        >
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          E-mail enviado!
        </h2>
        <p className="text-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>
          Enviamos um link de recuperação para:
        </p>
        <p className="font-semibold mb-6" style={{ color: "var(--color-primary-700)" }}>
          {getValues("email")}
        </p>
        <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
          Verifique sua caixa de entrada (e o spam). O link expira em 1 hora.
        </p>
        <Link href="/login" className="btn btn-primary w-full">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm mb-8"
        style={{ color: "var(--color-text-secondary)" }}
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao login
      </Link>

      <div className="mb-8">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "#eff6ff", color: "var(--color-primary-700)" }}
        >
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          Recuperar senha
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Informe seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-6 text-sm"
          style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="label label-required">
            E-mail cadastrado
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com.br"
            className={`input ${errors.email ? "input-error" : ""}`}
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="field-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          id="btn-recover"
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full"
        >
          {isLoading ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Enviando...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4" aria-hidden="true" />
              Enviar link de recuperação
            </>
          )}
        </button>
      </form>
    </div>
  );
}
