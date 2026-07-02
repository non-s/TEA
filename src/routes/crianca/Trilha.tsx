import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { moduloDesbloqueado } from '../../curriculo/progressao'
import { ouvirPerfil } from '../../firebase/perfis'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'

const acentosPorModulo: Record<string, { fundo: string; texto: string }> = {
  m0: {
    fundo: 'var(--cor-primaria-clara)',
    texto: 'var(--cor-primaria-escura)',
  },
  m1: { fundo: 'var(--cor-acento-clara)', texto: 'var(--cor-acento-escura)' },
  m2: { fundo: 'var(--cor-sucesso-clara)', texto: 'var(--cor-sucesso)' },
  m3: { fundo: 'var(--cor-conquista-clara)', texto: 'var(--cor-conquista)' },
  m4: { fundo: '#e3ddf0', texto: '#5f4e96' },
}

export function Trilha() {
  const [dominadas, setDominadas] = useState<Set<string>>(new Set())
  const { usuario } = useAuth()
  const { perfilAtivo, encerrarPerfil } = usePerfilAtivo()
  const navigate = useNavigate()

  useEffect(() => {
    if (!usuario || !perfilAtivo) return
    return ouvirPerfil(usuario.uid, perfilAtivo.id, (perfil) => {
      setDominadas(new Set(perfil?.atividadesDominadas ?? []))
    })
  }, [usuario, perfilAtivo])

  function aoVoltarParaResponsavel() {
    encerrarPerfil()
    navigate('/responsavel/perfis')
  }

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[var(--cor-texto)]">
          Olá, {perfilAtivo?.nome}! 👋
        </h1>
        <button
          type="button"
          onClick={aoVoltarParaResponsavel}
          className="text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
        >
          Área do responsável
        </button>
      </div>

      {trilhaV1.modulos.map((modulo, indice) => {
        const acento = acentosPorModulo[modulo.id] ?? acentosPorModulo.m0
        const concluidas = modulo.atividades.filter((a) =>
          dominadas.has(a.id),
        ).length
        const desbloqueado = moduloDesbloqueado(
          modulo.preRequisitoModuloId,
          dominadas,
        )
        const preRequisito = trilhaV1.modulos.find(
          (m) => m.id === modulo.preRequisitoModuloId,
        )

        return (
          <section
            key={modulo.id}
            className={`flex flex-col gap-4 ${desbloqueado ? '' : 'opacity-60'}`}
          >
            <div className="flex items-center gap-3">
              <span
                style={{ background: acento.fundo, color: acento.texto }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              >
                {desbloqueado ? indice + 1 : '🔒'}
              </span>
              <div>
                <h2 className="text-xl font-medium text-[var(--cor-texto)]">
                  {modulo.titulo}
                </h2>
                <p className="text-sm text-[var(--cor-texto-suave)]">
                  {desbloqueado
                    ? `${concluidas} de ${modulo.atividades.length} concluídas`
                    : `Complete "${preRequisito?.titulo}" para desbloquear`}
                </p>
              </div>
            </div>

            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {modulo.atividades.map((atividade) => {
                const dominada = dominadas.has(atividade.id)

                if (!desbloqueado) {
                  return (
                    <li key={atividade.id}>
                      <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-4">
                        <Icone
                          iconeId={atividade.alvo.iconeId as IconeId}
                          className="h-12 w-12 text-[var(--cor-texto-suave)]"
                        />
                        <span className="text-sm text-[var(--cor-texto-suave)]">
                          🔒
                        </span>
                      </div>
                    </li>
                  )
                }

                return (
                  <li key={atividade.id} className="relative">
                    <Link
                      to={`/crianca/atividade/${atividade.id}`}
                      className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 shadow-[var(--sombra-cartao)] transition-transform motion-reduce:transition-none hover:scale-105 hover:shadow-[var(--sombra-cartao-hover)] active:scale-95 ${
                        dominada
                          ? 'border-[var(--cor-conquista)] bg-[var(--cor-conquista-clara)]'
                          : 'border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)]'
                      }`}
                    >
                      <Icone
                        iconeId={atividade.alvo.iconeId as IconeId}
                        className={
                          dominada
                            ? 'h-12 w-12 text-[var(--cor-conquista)]'
                            : 'h-12 w-12 text-[var(--cor-primaria-escura)]'
                        }
                      />
                      <span className="text-sm text-[var(--cor-texto-suave)]">
                        {dominada ? 'Concluída' : atividade.alvo.rotulo}
                      </span>
                    </Link>
                    {dominada && (
                      <span
                        aria-hidden="true"
                        className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cor-conquista)] text-sm text-white shadow"
                      >
                        ★
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
