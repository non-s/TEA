import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import {
  normalizarPreferenciasSensoriais,
  preferenciasSensoriaisPadrao,
  type PreferenciasSensoriais,
  type TamanhoFonte,
} from '../curriculo/preferenciasSensoriais'

export type Preferencias = PreferenciasSensoriais
export type { TamanhoFonte }

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
    const padraoInicial = {
      ...preferenciasSensoriaisPadrao,
      animacoes: !prefereMovimentoReduzido,
    }
    return normalizarPreferenciasSensoriais(salvas ?? {}, padraoInicial)
  })

  useEffect(() => {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(preferencias))

    const raiz = document.documentElement
    raiz.dataset.altoContraste = String(preferencias.altoContraste)
    raiz.dataset.alvosMaiores = String(preferencias.alvosMaiores)
    raiz.style.setProperty(
      '--escala-fonte',
      String(escalasFonte[preferencias.tamanhoFonte]),
    )
  }, [preferencias])

  const atualizarPreferencias = useCallback(
    (alteracoes: Partial<Preferencias>) => {
      setPreferencias((atual) =>
        normalizarPreferenciasSensoriais({ ...atual, ...alteracoes }, atual),
      )
    },
    [],
  )

  const valor = useMemo(
    () => ({ preferencias, atualizarPreferencias }),
    [atualizarPreferencias, preferencias],
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
