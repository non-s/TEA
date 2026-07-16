import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PerfilCrianca } from '../firebase/perfis'
import { useAuth } from './AuthContext'

const CHAVE_SESSAO = 'tea:perfilAtivo'

interface PerfilAtivoSalvo {
  uidResponsavel: string | null
  perfil: PerfilCrianca
}

function lerPerfilSalvo(): PerfilAtivoSalvo | null {
  const bruto = sessionStorage.getItem(CHAVE_SESSAO)
  if (!bruto) return null
  try {
    const dados = JSON.parse(bruto) as Partial<PerfilAtivoSalvo>
    if (dados.perfil && 'id' in dados.perfil) {
      return {
        uidResponsavel:
          typeof dados.uidResponsavel === 'string'
            ? dados.uidResponsavel
            : null,
        perfil: dados.perfil as PerfilCrianca,
      }
    }
    sessionStorage.removeItem(CHAVE_SESSAO)
    return null
  } catch {
    sessionStorage.removeItem(CHAVE_SESSAO)
    return null
  }
}

interface PerfilAtivoContextValor {
  perfilAtivo: PerfilCrianca | null
  uidResponsavelPerfilAtivo: string | null
  selecionarPerfil: (perfil: PerfilCrianca) => void
  encerrarPerfil: () => void
}

const PerfilAtivoContext = createContext<PerfilAtivoContextValor | null>(null)

export function PerfilAtivoProvider({ children }: { children: ReactNode }) {
  const { carregando, usuario } = useAuth()
  const perfilSalvo = useMemo(() => lerPerfilSalvo(), [])
  const [perfilAtivo, setPerfilAtivo] = useState<PerfilCrianca | null>(
    () => perfilSalvo?.perfil ?? null,
  )
  const [uidResponsavelPerfilAtivo, setUidResponsavelPerfilAtivo] = useState<
    string | null
  >(() => perfilSalvo?.uidResponsavel ?? null)

  const encerrarPerfil = useCallback(() => {
    setPerfilAtivo(null)
    setUidResponsavelPerfilAtivo(null)
    sessionStorage.removeItem(CHAVE_SESSAO)
  }, [])

  const selecionarPerfil = useCallback(
    (perfil: PerfilCrianca) => {
      const uidResponsavel = usuario?.uid ?? null
      setPerfilAtivo(perfil)
      setUidResponsavelPerfilAtivo(uidResponsavel)
      sessionStorage.setItem(
        CHAVE_SESSAO,
        JSON.stringify({ uidResponsavel, perfil }),
      )
    },
    [usuario],
  )

  useEffect(() => {
    if (!carregando && !usuario) {
      encerrarPerfil()
      return
    }

    if (
      !carregando &&
      usuario &&
      perfilAtivo &&
      uidResponsavelPerfilAtivo !== usuario.uid
    ) {
      encerrarPerfil()
    }
  }, [
    carregando,
    encerrarPerfil,
    perfilAtivo,
    uidResponsavelPerfilAtivo,
    usuario,
  ])

  const valor = useMemo(
    () => ({
      perfilAtivo,
      uidResponsavelPerfilAtivo: uidResponsavelPerfilAtivo ?? usuario?.uid ?? null,
      selecionarPerfil,
      encerrarPerfil,
    }),
    [encerrarPerfil, perfilAtivo, selecionarPerfil, uidResponsavelPerfilAtivo, usuario],
  )

  return (
    <PerfilAtivoContext.Provider value={valor}>
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
