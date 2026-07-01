import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { usePerfilAtivo } from '../contexts/PerfilAtivoContext'

export function RequirePerfilAtivo({ children }: { children: ReactNode }) {
  const { perfilAtivo } = usePerfilAtivo()

  if (!perfilAtivo) {
    return <Navigate to="/responsavel/perfis" replace />
  }

  return <>{children}</>
}
