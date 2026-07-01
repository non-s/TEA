import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { ouvirPerfis, type PerfilCrianca } from '../../firebase/perfis'
import { Icone } from '../../curriculo/ativos/Icone'
import type { FormaIconeId } from '../../curriculo/ativos/tipos'
import { corDoAvatar } from '../../components/ui/coresAvatar'
import { Logo } from '../../components/ui/Logo'
import { classesBotao } from '../../components/ui/estilosBotao'
import { sair } from '../../firebase/auth'

export function SelecaoPerfil() {
  const { usuario } = useAuth()
  const { selecionarPerfil } = usePerfilAtivo()
  const navigate = useNavigate()
  const [perfis, setPerfis] = useState<PerfilCrianca[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario) return
    return ouvirPerfis(usuario.uid, (novosPerfis) => {
      setPerfis(novosPerfis)
      setCarregando(false)
    })
  }, [usuario])

  function aoEscolherPerfil(perfil: PerfilCrianca) {
    selecionarPerfil(perfil)
    navigate('/crianca/trilha')
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

      {!carregando && perfis.length === 0 && (
        <p className="max-w-xs text-[var(--cor-texto-suave)]">
          Você ainda não cadastrou nenhum perfil de criança.
        </p>
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
                  className="flex h-28 w-28 items-center justify-center rounded-3xl shadow-[var(--sombra-cartao)] transition-transform motion-reduce:transition-none group-hover:scale-105 group-active:scale-95"
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
          <Link
            to="/responsavel/perfis/gerenciar"
            className={classesBotao({
              variante: 'secundario',
              tamanho: 'medio',
            })}
          >
            Gerenciar perfis
          </Link>
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
          onClick={() => sair()}
          className="text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
        >
          Sair da conta
        </button>
      </div>
    </main>
  )
}
