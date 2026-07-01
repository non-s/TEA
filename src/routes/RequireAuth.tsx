import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { usuario, carregando } = useAuth()

  if (carregando) {
    return (
      <p className="p-10 text-center text-[var(--cor-texto-suave)]">
        Carregando…
      </p>
    )
  }

  if (!usuario) {
    return <Navigate to="/entrar" replace />
  }

  return <>{children}</>
}
