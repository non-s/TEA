import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import { ouvirPerfis, type PerfilCrianca } from '../../firebase/perfis'
import { Icone } from '../../curriculo/ativos/Icone'
import type { FormaIconeId } from '../../curriculo/ativos/tipos'
import { corDoAvatar } from '../../components/ui/coresAvatar'
import { Logo } from '../../components/ui/Logo'
import { classesBotao } from '../../components/ui/estilosBotao'
import { sair } from '../../firebase/auth'

export function SelecaoPerfil() {
  const { usuario } = useAuth()
  const { encerrarPerfil, selecionarPerfil } = usePerfilAtivo()
  const { atualizarPreferencias } = usePreferencias()
  const navigate = useNavigate()
  const [perfis, setPerfis] = useState<PerfilCrianca[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) return
    return ouvirPerfis(
      usuario.uid,
      (novosPerfis) => {
        setPerfis(novosPerfis)
        setErroCarregamento(null)
        setCarregando(false)
      },
      () => {
        setErroCarregamento(
          'Não foi possível carregar os perfis agora. Verifique a conexão e tente novamente.',
        )
        setCarregando(false)
      },
    )
  }, [usuario])

  function aoEscolherPerfil(perfil: PerfilCrianca) {
    atualizarPreferencias(perfil.preferenciasSensoriais)
    selecionarPerfil(perfil)
    navigate('/crianca/trilha')
  }

  async function aoSair() {
    encerrarPerfil()
    try {
      await sair()
    } catch {
      setErroCarregamento('Nao foi possivel sair agora. Tente novamente.')
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-10 px-6 py-10 text-center">
      <Logo />

      <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
        Quem vai usar o TEA agora?
      </h1>

      {carregando && (
        <p className="text-[var(--cor-texto-suave)]">Carregando perfis…</p>
      )}

      {erroCarregamento && (
        <p
          role="alert"
          className="max-w-sm rounded-lg bg-[var(--cor-erro)]/10 px-3 py-2 text-sm text-[var(--cor-erro)]"
        >
          {erroCarregamento}
        </p>
      )}

      {!carregando && !erroCarregamento && perfis.length === 0 && (
        <div className="flex max-w-xs flex-col items-center gap-4">
          <p className="text-[var(--cor-texto-suave)]">
            Você ainda não cadastrou nenhum perfil de criança.
          </p>
          <Link
            to="/responsavel/perfis/gerenciar"
            className={classesBotao({ tamanho: 'medio' })}
          >
            Criar primeiro perfil
          </Link>
        </div>
      )}

      <ul className="flex flex-wrap justify-center gap-6">
        {perfis.map((perfil) => {
          const cor = corDoAvatar(perfil.avatarId as FormaIconeId)
          return (
            <li key={perfil.id}>
              <button
                type="button"
                onClick={() => aoEscolherPerfil(perfil)}
                className="group flex flex-col items-center gap-3"
              >
                <span
                  style={{ background: cor.fundo, color: cor.texto }}
                  className="flex min-h-[var(--min-alvo-atividade)] min-w-[var(--min-alvo-atividade)] items-center justify-center rounded-3xl shadow-[var(--sombra-cartao)] transition-transform motion-reduce:transition-none group-hover:scale-105 group-active:scale-95"
                >
                  <Icone
                    iconeId={perfil.avatarId as FormaIconeId}
                    className="h-16 w-16"
                  />
                </span>
                <span className="text-base font-medium text-[var(--cor-texto)]">
                  {perfil.nome}
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-wrap justify-center gap-3">
          {perfis.length > 0 && (
            <Link
              to="/responsavel/perfis/gerenciar"
              className={classesBotao({
                variante: 'secundario',
                tamanho: 'medio',
              })}
            >
              Gerenciar perfis
            </Link>
          )}
          <Link
            to="/responsavel/configuracoes"
            className={classesBotao({
              variante: 'secundario',
              tamanho: 'medio',
            })}
          >
            Configurações
          </Link>
        </div>
        <button
          type="button"
          onClick={() => {
            void aoSair()
          }}
          className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
        >
          Sair da conta
        </button>
      </div>
    </main>
  )
}
