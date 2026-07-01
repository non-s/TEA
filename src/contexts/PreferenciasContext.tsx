import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export type TamanhoFonte = 'normal' | 'grande' | 'extra-grande'

export interface Preferencias {
  som: boolean
  animacoes: boolean
  altoContraste: boolean
  tamanhoFonte: TamanhoFonte
}

const CHAVE_LOCAL = 'tea:preferencias'

const escalasFonte: Record<TamanhoFonte, number> = {
  normal: 1,
  grande: 1.25,
  'extra-grande': 1.5,
}

function lerPreferenciasSalvas(): Partial<Preferencias> | null {
  const bruto = localStorage.getItem(CHAVE_LOCAL)
  if (!bruto) return null
  try {
    return JSON.parse(bruto) as Partial<Preferencias>
  } catch {
    return null
  }
}

interface PreferenciasContextValor {
  preferencias: Preferencias
  atualizarPreferencias: (alteracoes: Partial<Preferencias>) => void
}

const PreferenciasContext = createContext<PreferenciasContextValor | null>(null)

export function PreferenciasProvider({ children }: { children: ReactNode }) {
  const prefereMovimentoReduzido = usePrefersReducedMotion()

  const [preferencias, setPreferencias] = useState<Preferencias>(() => {
    const salvas = lerPreferenciasSalvas()
    return {
      som: true,
      animacoes: !prefereMovimentoReduzido,
      altoContraste: false,
      tamanhoFonte: 'normal',
      ...salvas,
    }
  })

  useEffect(() => {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(preferencias))

    const raiz = document.documentElement
    raiz.dataset.altoContraste = String(preferencias.altoContraste)
    raiz.style.setProperty(
      '--escala-fonte',
      String(escalasFonte[preferencias.tamanhoFonte]),
    )
  }, [preferencias])

  function atualizarPreferencias(alteracoes: Partial<Preferencias>) {
    setPreferencias((atual) => ({ ...atual, ...alteracoes }))
  }

  const valor = useMemo(
    () => ({ preferencias, atualizarPreferencias }),
    [preferencias],
  )

  return (
    <PreferenciasContext.Provider value={valor}>
      {children}
    </PreferenciasContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components -- padrão usual de contexto React (Provider + hook no mesmo arquivo)
export function usePreferencias(): PreferenciasContextValor {
  const contexto = useContext(PreferenciasContext)
  if (!contexto) {
    throw new Error(
      'usePreferencias precisa ser usado dentro de um PreferenciasProvider',
    )
  }
  return contexto
}
