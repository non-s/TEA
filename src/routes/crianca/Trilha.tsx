import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import {
  encontrarAtividadeParaRevisao,
  encontrarProximaAtividadeDisponivel,
  moduloDesbloqueado,
} from '../../curriculo/progressao'
import { ouvirPerfil } from '../../firebase/perfis'
import { ouvirTentativas } from '../../firebase/progresso'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { acentosPorModulo } from '../../curriculo/coresModulo'
import type { Atividade, Tentativa } from '../../curriculo/tipos'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import { useFocoPreso } from '../../hooks/useFocoPreso'

interface CartaoAtividadeTrilhaProps {
  atividade: Atividade
  dominada: boolean
  emFoco: boolean
}

function CartaoAtividadeTrilha({
  atividade,
  dominada,
  emFoco,
}: CartaoAtividadeTrilhaProps) {
  const ariaLabel = dominada
    ? `${atividade.alvo.rotulo} concluída`
    : emFoco
      ? `${atividade.alvo.rotulo}, próxima atividade`
      : atividade.alvo.rotulo

  return (
    <li className="relative">
      <Link
        to={`/crianca/atividade/${atividade.id}`}
        aria-label={ariaLabel}
        className={`flex min-h-[var(--min-alvo-atividade)] flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 shadow-[var(--sombra-cartao)] transition-transform motion-reduce:transition-none hover:scale-[1.02] hover:shadow-[var(--sombra-cartao-hover)] active:scale-[0.99] ${
          dominada
            ? 'border-[var(--cor-conquista)] bg-[var(--cor-conquista-clara)]'
            : emFoco
              ? 'border-[var(--cor-primaria)] bg-[var(--cor-primaria-clara)]'
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
          {dominada ? 'Concluída' : emFoco ? 'Agora' : atividade.alvo.rotulo}
        </span>
      </Link>
      {dominada && (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--cor-conquista)] text-sm text-white shadow"
        >
          OK
        </span>
      )}
    </li>
  )
}

export function Trilha() {
  const [dominadas, setDominadas] = useState<Set<string>>(new Set())
  const [tentativas, setTentativas] = useState<Tentativa[]>([])
  const [modulosAbertos, setModulosAbertos] = useState<Set<string>>(new Set())
  const [erroPerfil, setErroPerfil] = useState<string | null>(null)
  const [erroTentativas, setErroTentativas] = useState<string | null>(null)
  const [confirmandoAreaResponsavel, setConfirmandoAreaResponsavel] =
    useState(false)
  const [codigoAreaResponsavel, setCodigoAreaResponsavel] = useState('')
  const botaoContinuarTrilhaRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoResponsavelRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()
  const { uidResponsavelPerfilAtivo, perfilAtivo, encerrarPerfil, selecionarPerfil } = usePerfilAtivo()
  const { atualizarPreferencias } = usePreferencias()
  const navigate = useNavigate()
  const perfilId = perfilAtivo?.id

  useEffect(() => {
    if (!uidResponsavelPerfilAtivo || !perfilId) return
    const pararPerfil = ouvirPerfil(
      uidResponsavelPerfilAtivo,
      perfilId,
      (perfil) => {
        if (!perfil) {
          setDominadas(new Set())
          setTentativas([])
          encerrarPerfil()
          navigate('/responsavel/perfis')
          return
        }

        setErroPerfil(null)
        setDominadas(new Set(perfil?.atividadesDominadas ?? []))
        selecionarPerfil(perfil)
        atualizarPreferencias(perfil.preferenciasSensoriais)
      },
      () => {
        setErroPerfil(
          'Não foi possível atualizar a trilha agora. Você pode tentar novamente em instantes.',
        )
      },
    )
    const pararTentativas = ouvirTentativas(
      uidResponsavelPerfilAtivo,
      perfilId,
      (novasTentativas) => {
        setTentativas(novasTentativas)
        setErroTentativas(null)
      },
      () => {
        setErroTentativas(
          'Não foi possível atualizar a trilha agora. Você pode tentar novamente em instantes.',
        )
      },
    )

    return () => {
      pararPerfil()
      pararTentativas()
    }
  }, [
    atualizarPreferencias,
    encerrarPerfil,
    navigate,
    perfilId,
    selecionarPerfil,
    uidResponsavelPerfilAtivo,
  ])

  function fecharConfirmacaoAreaResponsavel() {
    setConfirmandoAreaResponsavel(false)
    setCodigoAreaResponsavel('')
  }

  function aoVoltarParaResponsavel() {
    encerrarPerfil()
    navigate('/responsavel/perfis')
  }

  function alternarModulo(moduloId: string) {
    setModulosAbertos((atuais) => {
      const proximos = new Set(atuais)
      if (proximos.has(moduloId)) {
        proximos.delete(moduloId)
      } else {
        proximos.add(moduloId)
      }
      return proximos
    })
  }

  useEffect(() => {
    if (confirmandoAreaResponsavel) {
      botaoContinuarTrilhaRef.current?.focus()
    }
  }, [confirmandoAreaResponsavel])

  const proximaAtividade = encontrarProximaAtividadeDisponivel(
    trilhaV1,
    dominadas,
  )
  const revisaoEspacada = encontrarAtividadeParaRevisao(
    trilhaV1,
    dominadas,
    tentativas,
  )
  const erroCarregamento = erroPerfil ?? erroTentativas
  const codigoAdultoConfirmado =
    codigoAreaResponsavel.trim().toUpperCase() === 'ADULTO'

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[var(--cor-texto)]">
          Olá, {perfilAtivo?.nome}
        </h1>
        <div className="flex items-center gap-4">
          <Link
            to="/crianca/jardim"
            className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-primaria-escura)] underline underline-offset-2"
          >
            Meu jardim
          </Link>
          <button
            type="button"
            onClick={() => setConfirmandoAreaResponsavel(true)}
            className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
          >
            Área do responsável
          </button>
        </div>
      </div>

      {erroCarregamento && (
        <p
          role="alert"
          className="rounded-2xl bg-[var(--cor-erro)]/10 px-4 py-3 text-sm text-[var(--cor-erro)]"
        >
          {erroCarregamento}
        </p>
      )}

      <section className="rounded-3xl border-2 border-[var(--cor-primaria-clara)] bg-[var(--cor-fundo-alt)] p-5 shadow-[var(--sombra-cartao)]">
        {proximaAtividade ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--cor-primaria-clara)] text-[var(--cor-primaria-escura)]">
                <Icone
                  iconeId={proximaAtividade.alvo.iconeId as IconeId}
                  className="h-10 w-10"
                />
              </span>
              <div>
                <p className="text-sm font-medium uppercase text-[var(--cor-texto-suave)]">
                  Agora
                </p>
                <p className="text-xl font-semibold text-[var(--cor-texto)]">
                  {proximaAtividade.alvo.rotulo}
                </p>
              </div>
            </div>
            <Link
              to={`/crianca/atividade/${proximaAtividade.id}`}
              aria-label={`Continuar com ${proximaAtividade.alvo.rotulo}`}
              className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full bg-[var(--cor-primaria)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--cor-primaria-escura)]"
            >
              Continuar
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2 text-center">
            <p className="text-xl font-semibold text-[var(--cor-texto)]">
              Tudo concluído nesta trilha
            </p>
            <p className="text-sm text-[var(--cor-texto-suave)]">
              Revise atividades já dominadas quando quiser.
            </p>
          </div>
        )}
      </section>

      {revisaoEspacada && (
        <section className="rounded-3xl border-2 border-[var(--cor-conquista-clara)] bg-[var(--cor-fundo-alt)] p-5 shadow-[var(--sombra-cartao)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--cor-conquista-clara)] text-[var(--cor-conquista)]">
                <Icone
                  iconeId={revisaoEspacada.atividade.alvo.iconeId as IconeId}
                  className="h-10 w-10"
                />
              </span>
              <div>
                <p className="text-sm font-medium uppercase text-[var(--cor-texto-suave)]">
                  Revisão leve
                </p>
                <p className="text-xl font-semibold text-[var(--cor-texto)]">
                  {revisaoEspacada.atividade.alvo.rotulo}
                </p>
                <p className="mt-1 text-sm text-[var(--cor-texto-suave)]">
                  {revisaoEspacada.diasDesdeUltimaPratica === null
                    ? 'Pratique de novo quando estiver tranquilo.'
                    : `Praticada há ${revisaoEspacada.diasDesdeUltimaPratica} dias.`}
                </p>
              </div>
            </div>
            <Link
              to={`/crianca/atividade/${revisaoEspacada.atividade.id}`}
              aria-label={`Revisar ${revisaoEspacada.atividade.alvo.rotulo}`}
              className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full border-2 border-[var(--cor-conquista)] bg-[var(--cor-fundo-alt)] px-6 py-3 text-base font-semibold text-[var(--cor-texto)] hover:bg-[var(--cor-conquista-clara)]"
            >
              Revisar
            </Link>
          </div>
        </section>
      )}

      <div className="flex flex-col gap-8">
        {trilhaV1.modulos.map((modulo, indice) => {
          const acento = acentosPorModulo[modulo.id] ?? acentosPorModulo.m0
          const concluidas = modulo.atividades.filter((a) =>
            dominadas.has(a.id),
          ).length
          const restantes = modulo.atividades.length - concluidas
          const percentualConcluido = Math.round(
            (concluidas / modulo.atividades.length) * 100,
          )
          const desbloqueado = moduloDesbloqueado(
            modulo.preRequisitoModuloId,
            dominadas,
          )
          const preRequisito = trilhaV1.modulos.find(
            (m) => m.id === modulo.preRequisitoModuloId,
          )
          const contemProximaAtividade =
            proximaAtividade?.moduloId === modulo.id
          const contemRevisao =
            revisaoEspacada?.atividade.moduloId === modulo.id
          const abertoManualmente = modulosAbertos.has(modulo.id)
          const atividadesVisiveis =
            desbloqueado &&
            (contemProximaAtividade || contemRevisao || abertoManualmente)
          const podeAlternarAtividades =
            desbloqueado && !contemProximaAtividade && !contemRevisao
          const atividadesId = `atividades-${modulo.id}`
          const tituloId = `titulo-${modulo.id}`

          return (
            <section
              key={modulo.id}
              aria-labelledby={tituloId}
              className={`flex flex-col gap-4 border-t border-[var(--cor-borda)] pt-6 ${
                desbloqueado ? '' : 'opacity-60'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span
                    style={{ background: acento.fundo, color: acento.texto }}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                  >
                    {desbloqueado ? indice + 1 : 'Bloq.'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2
                        id={tituloId}
                        className="text-xl font-medium text-[var(--cor-texto)]"
                      >
                        {modulo.titulo}
                      </h2>
                      {contemProximaAtividade && (
                        <span className="rounded-full bg-[var(--cor-primaria-clara)] px-3 py-1 text-xs font-semibold uppercase text-[var(--cor-primaria-escura)]">
                          Agora
                        </span>
                      )}
                      {contemRevisao && !contemProximaAtividade && (
                        <span className="rounded-full bg-[var(--cor-conquista-clara)] px-3 py-1 text-xs font-semibold uppercase text-[var(--cor-conquista)]">
                          Revisão
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[var(--cor-texto-suave)]">
                      {desbloqueado
                        ? `${concluidas} de ${modulo.atividades.length} concluídas`
                        : `Complete "${preRequisito?.titulo}" para desbloquear`}
                    </p>
                    {desbloqueado && (
                      <div className="mt-3 flex items-center gap-3">
                        <div
                          className="h-2 flex-1 rounded-full bg-[var(--cor-borda)]"
                          aria-hidden="true"
                        >
                          <div
                            className="h-2 rounded-full bg-[var(--cor-primaria)]"
                            style={{ width: `${percentualConcluido}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--cor-texto-suave)]">
                          {restantes === 0
                            ? 'Pronto'
                            : `${restantes} restantes`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {podeAlternarAtividades && (
                  <button
                    type="button"
                    aria-expanded={atividadesVisiveis}
                    aria-controls={atividadesId}
                    onClick={() => alternarModulo(modulo.id)}
                    className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center gap-2 rounded-full border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2 text-sm font-semibold text-[var(--cor-texto)] hover:border-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-clara)]"
                  >
                    <span aria-hidden="true">
                      {atividadesVisiveis ? '-' : '+'}
                    </span>
                    {atividadesVisiveis
                      ? 'Ocultar atividades'
                      : 'Ver atividades'}
                  </button>
                )}
              </div>

              {desbloqueado && !atividadesVisiveis && (
                <p className="text-sm text-[var(--cor-texto-suave)]">
                  Atividades guardadas para manter a trilha mais calma. Abra
                  quando quiser revisar este módulo.
                </p>
              )}

              {atividadesVisiveis && (
                <ul
                  id={atividadesId}
                  className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                >
                  {modulo.atividades.map((atividade) => (
                    <CartaoAtividadeTrilha
                      key={atividade.id}
                      atividade={atividade}
                      dominada={dominadas.has(atividade.id)}
                      emFoco={proximaAtividade?.id === atividade.id}
                    />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      {confirmandoAreaResponsavel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
          role="presentation"
        >
          <dialog
            ref={dialogoResponsavelRef}
            open
            aria-modal="true"
            aria-labelledby="titulo-area-responsavel"
            aria-describedby="texto-area-responsavel ajuda-area-responsavel"
            onCancel={(evento) => {
              evento.preventDefault()
              fecharConfirmacaoAreaResponsavel()
            }}
            onKeyDown={(evento) => {
              aoKeyDownDialogo(evento)
              if (evento.key === 'Escape') {
                fecharConfirmacaoAreaResponsavel()
              }
            }}
            className="m-0 flex w-full max-w-sm flex-col gap-4 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao-hover)]"
          >
            <div>
              <h2
                id="titulo-area-responsavel"
                className="text-xl font-semibold text-[var(--cor-texto)]"
              >
                Área do responsável
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]">
                Esta parte é para o adulto. A trilha pode continuar aqui.
              </p>
              <p
                id="texto-area-responsavel"
                className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]"
              >
                Para abrir, o adulto digita ADULTO.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                ref={botaoContinuarTrilhaRef}
                type="button"
                onClick={fecharConfirmacaoAreaResponsavel}
                className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full bg-[var(--cor-primaria)] px-5 py-3 text-base font-semibold text-white hover:bg-[var(--cor-primaria-escura)]"
              >
                Continuar na trilha
              </button>
              <label className="flex flex-col gap-2 text-left text-sm font-medium text-[var(--cor-texto)]">
                Confirmação do adulto
                <input
                  autoComplete="off"
                  inputMode="text"
                  value={codigoAreaResponsavel}
                  onChange={(evento) =>
                    setCodigoAreaResponsavel(evento.target.value)
                  }
                  className="rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-4 py-3 text-base text-[var(--cor-texto)] uppercase"
                  aria-describedby="ajuda-area-responsavel"
                />
              </label>
              <p
                id="ajuda-area-responsavel"
                className="text-left text-xs leading-5 text-[var(--cor-texto-suave)]"
              >
                Isso evita que a criança saia da trilha por toque acidental.
              </p>
              <button
                type="button"
                disabled={!codigoAdultoConfirmado}
                onClick={aoVoltarParaResponsavel}
                className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-5 py-3 text-base font-medium text-[var(--cor-texto)] hover:border-[var(--cor-primaria)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Abrir área do responsável
              </button>
            </div>
          </dialog>
        </div>
      )}
    </main>
  )
}
