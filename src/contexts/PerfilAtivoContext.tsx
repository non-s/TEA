import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  atualizarPerfil as atualizarPerfilLocal,
  criarPerfil as criarPerfilLocal,
  definirPerfilAtivoId,
  excluirPerfil as excluirPerfilLocal,
  listarPerfis,
  marcarAtividadeDominada as marcarAtividadeDominadaLocal,
  perfilAtivoId,
  type PerfilLocal,
} from '../local/perfilLocal'

interface PerfilAtivoContextValor {
  perfilAtivo: PerfilLocal | null
  perfis: PerfilLocal[]
  criarPerfil: (
    nome: string,
    avatarId: string,
    opcoes?: Partial<
      Pick<
        PerfilLocal,
        'interesseEspecialId' | 'apoioPreferencial' | 'perfilApoio'
      >
    >,
    tornarAtivo?: boolean,
  ) => PerfilLocal
  selecionarPerfil: (perfilId: string) => void
  atualizarPerfilAtivo: (
    alteracoes: Partial<Omit<PerfilLocal, 'id' | 'criadoEm'>>,
  ) => void
  marcarAtividadeDominada: (atividadeId: string) => void
  excluirPerfil: (perfilId: string) => void
  encerrarPerfil: () => void
}

const PerfilAtivoContext = createContext<PerfilAtivoContextValor | null>(null)

export function PerfilAtivoProvider({ children }: { children: ReactNode }) {
  const [perfis, setPerfis] = useState<PerfilLocal[]>(() => listarPerfis())
  const [perfilAtivoIdEstado, setPerfilAtivoIdEstado] = useState<string | null>(
    () => perfilAtivoId(),
  )

  const perfilAtivo = useMemo(
    () => perfis.find((perfil) => perfil.id === perfilAtivoIdEstado) ?? null,
    [perfis, perfilAtivoIdEstado],
  )

  const selecionarPerfil = useCallback((perfilId: string) => {
    definirPerfilAtivoId(perfilId)
    setPerfilAtivoIdEstado(perfilId)
  }, [])

  const criarPerfil = useCallback(
    (
      nome: string,
      avatarId: string,
      opcoes?: Partial<
        Pick<
          PerfilLocal,
          'interesseEspecialId' | 'apoioPreferencial' | 'perfilApoio'
        >
      >,
      tornarAtivo = true,
    ) => {
      const perfil = criarPerfilLocal(nome, avatarId, opcoes)
      setPerfis((atuais) => [...atuais, perfil])
      if (tornarAtivo) selecionarPerfil(perfil.id)
      return perfil
    },
    [selecionarPerfil],
  )

  const atualizarPerfilAtivo = useCallback(
    (alteracoes: Partial<Omit<PerfilLocal, 'id' | 'criadoEm'>>) => {
      if (!perfilAtivoIdEstado) return
      const atualizado = atualizarPerfilLocal(perfilAtivoIdEstado, alteracoes)
      if (!atualizado) return
      setPerfis((atuais) =>
        atuais.map((perfil) =>
          perfil.id === atualizado.id ? atualizado : perfil,
        ),
      )
    },
    [perfilAtivoIdEstado],
  )

  const marcarAtividadeDominada = useCallback(
    (atividadeId: string) => {
      if (!perfilAtivoIdEstado) return
      const atualizado = marcarAtividadeDominadaLocal(
        perfilAtivoIdEstado,
        atividadeId,
      )
      if (!atualizado) return
      setPerfis((atuais) =>
        atuais.map((perfil) =>
          perfil.id === atualizado.id ? atualizado : perfil,
        ),
      )
    },
    [perfilAtivoIdEstado],
  )

  const excluirPerfil = useCallback(
    (perfilId: string) => {
      excluirPerfilLocal(perfilId)
      setPerfis((atuais) => atuais.filter((perfil) => perfil.id !== perfilId))
      if (perfilId === perfilAtivoIdEstado) setPerfilAtivoIdEstado(null)
    },
    [perfilAtivoIdEstado],
  )

  const encerrarPerfil = useCallback(() => {
    definirPerfilAtivoId(null)
    setPerfilAtivoIdEstado(null)
  }, [])

  const valor = useMemo(
    () => ({
      perfilAtivo,
      perfis,
      criarPerfil,
      selecionarPerfil,
      atualizarPerfilAtivo,
      marcarAtividadeDominada,
      excluirPerfil,
      encerrarPerfil,
    }),
    [
      perfilAtivo,
      perfis,
      criarPerfil,
      selecionarPerfil,
      atualizarPerfilAtivo,
      marcarAtividadeDominada,
      excluirPerfil,
      encerrarPerfil,
    ],
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
