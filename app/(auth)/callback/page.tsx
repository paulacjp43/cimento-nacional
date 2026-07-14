'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient()
        // Pega params do hash (#) e da query (?)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const queryParams = new URLSearchParams(window.location.search)

        // 1. Verifica se há erro no hash (Supabase retorna erros via #)
        const hashError = hashParams.get('error')
        if (hashError) {
          const errorDesc = hashParams.get('error_description') || hashError
          setError(decodeURIComponent(errorDesc.replace(/\+/g, ' ')))
          setLoading(false)
          return
        }

        // 2. Tenta PKCE flow (se houver code na URL)
        const code = queryParams.get('code') || hashParams.get('code')
        if (code) {
          try {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (!exchangeError) {
              router.push('/definir-senha')
              return
            }
            console.warn('PKCE exchange falhou, tentando getSession...', exchangeError.message)
          } catch (e) {
            console.warn('PKCE não disponível, pulando...', e)
          }
        }

        // 3. Fallback: verifica se já existe sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session?.user) {
          // Verifica se é um convite pendente
          if (session.user.invited_at || !session.user.email_confirmed_at) {
            router.push('/definir-senha')
          } else {
            router.push('/dashboard')
          }
          return
        }

        // 4. Tenta getUser() como último recurso
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (user) {
          router.push('/definir-senha')
          return
        }

        setError('Link inválido ou expirado. Solicite um novo convite.')
      } catch (err: any) {
        console.error('Erro no callback:', err)
        setError(err.message || 'Erro ao processar convite.')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Processando convite...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <p className="text-red-600 mb-4 font-medium">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
          >
            Ir para o login
          </button>
        </div>
      </div>
    )
  }

  return null
}
