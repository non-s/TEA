import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { ouvirPerfis, type PerfilCrianca } from '../../firebase/perfis'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
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
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-8 px-6 py-10 text-center">
      <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
        Quem vai usar o TEA agora?
      </h1>

      {carregando && (
        <p className="text-[var(--cor-texto-suave)]">Carregando perfis…</p>
      )}

      {!carregando && perfis.length === 0 && (
        <p className="text-[var(--cor-texto-suave)]">
          Você ainda não cadastrou nenhum perfil de criança.
        </p>
      )}

      <ul className="flex flex-wrap justify-center gap-6">
        {perfis.map((perfil) => (
          <li key={perfil.id}>
            <button
              type="button"
              onClick={() => aoEscolherPerfil(perfil)}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] text-[var(--cor-primaria-escura)]">
                <Icone
                  iconeId={perfil.avatarId as IconeId}
                  className="h-14 w-14"
                />
              </span>
              <span className="text-base font-medium text-[var(--cor-texto)]">
                {perfil.nome}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-3">
          <Link
            to="/responsavel/perfis/gerenciar"
            className="rounded-full border-2 border-[var(--cor-borda)] px-6 py-3 text-base font-medium text-[var(--cor-texto)]"
          >
            Gerenciar perfis
          </Link>
          <Link
            to="/responsavel/configuracoes"
            className="rounded-full border-2 border-[var(--cor-borda)] px-6 py-3 text-base font-medium text-[var(--cor-texto)]"
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
