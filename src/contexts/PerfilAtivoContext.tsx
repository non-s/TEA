import { createContext, useContext, useState, type ReactNode } from 'react'
import type { PerfilCrianca } from '../firebase/perfis'

const CHAVE_SESSAO = 'tea:perfilAtivoId'

interface PerfilAtivoContextValor {
  perfilAtivo: PerfilCrianca | null
  selecionarPerfil: (perfil: PerfilCrianca) => void
  encerrarPerfil: () => void
}

const PerfilAtivoContext = createContext<PerfilAtivoContextValor | null>(null)

export function PerfilAtivoProvider({ children }: { children: ReactNode }) {
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilCrianca | null>(null)

  function selecionarPerfil(perfil: PerfilCrianca) {
    setPerfilAtivo(perfil)
    sessionStorage.setItem(CHAVE_SESSAO, perfil.id)
  }

  function encerrarPerfil() {
    setPerfilAtivo(null)
    sessionStorage.removeItem(CHAVE_SESSAO)
  }

  return (
    <PerfilAtivoContext.Provider
      value={{ perfilAtivo, selecionarPerfil, encerrarPerfil }}
    >
      {children}
    </PerfilAtivoContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- padrão usual de contexto React (Provider + hook no mesmo arquivo)
export function usePerfilAtivo(): PerfilAtivoContextValor {
  const contexto = useContext(PerfilAtivoContext)
  if (!contexto) {
    throw new Error(
      'usePerfilAtivo precisa ser usado dentro de um PerfilAtivoProvider',
    )
  }
  return contexto
}
