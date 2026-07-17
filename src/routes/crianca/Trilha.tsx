import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import {
  encontrarAtividadeParaRevisao,
  encontrarProximaAtividadeDisponivel,
} from '../../curriculo/progressao'
import { listarTentativas } from '../../local/perfilLocal'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'
import { acentosPorModulo } from '../../curriculo/coresModulo'
import type { Atividade } from '../../curriculo/tipos'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
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
    <li className="relative animacao-zoom">
      <Link
        to={`/crianca/atividade/${atividade.id}`}
        aria-label={ariaLabel}
        className={`flex min-h-[var(--min-alvo-atividade)] flex-col items-center justify-center gap-2 rounded-2xl border p-4 shadow-[var(--sombra-cartao)] transition-all duration-300 hover:scale-[1.05] hover:shadow-[var(--sombra-cartao-hover)] hover:border-[var(--cor-primaria)] active:scale-[0.95] ${
          dominada
            ? 'border-[var(--cor-conquista)] bg-[var(--cor-conquista-clara)] text-[var(--cor-conquista)]'
            : emFoco
              ? 'border-[var(--cor-primaria)] bg-[var(--cor-primaria)] brilho-pulsante text-white'
              : 'vidro text-[var(--cor-texto-suave)]'
        }`}
      >
        <Icone
          iconeId={atividade.alvo.iconeId as IconeId}
          className={
            dominada
              ? 'h-12 w-12 text-[var(--cor-conquista)] drop-shadow-sm'
              : emFoco
                ? 'h-12 w-12 text-white drop-shadow-md'
                : 'h-12 w-12 text-[var(--cor-texto-suave)]'
          }
        />
        <span className="text-sm font-semibold tracking-wide">
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
  const [modulosAbertos, setModulosAbertos] = useState<Set<string>>(new Set())
  const [confirmandoTrocaPerfil, setConfirmandoTrocaPerfil] = useState(false)
  const [codigoTrocaPerfil, setCodigoTrocaPerfil] = useState('')
  const botaoContinuarTrilhaRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoTrocaRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()
  const { perfilAtivo, encerrarPerfil } = usePerfilAtivo()
  const navigate = useNavigate()
  const perfilId = perfilAtivo?.id
  const dominadas = new Set(perfilAtivo?.atividadesDominadas ?? [])
  const tentativas = perfilId ? listarTentativas(perfilId) : []

  function fecharConfirmacaoTrocaPerfil() {
    setConfirmandoTrocaPerfil(false)
    setCodigoTrocaPerfil('')
  }

  function aoTrocarPerfil() {
    encerrarPerfil()
    navigate('/')
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
    if (confirmandoTrocaPerfil) {
      botaoContinuarTrilhaRef.current?.focus()
    }
  }, [confirmandoTrocaPerfil])

  const proximaAtividade = encontrarProximaAtividadeDisponivel(
    trilhaV1,
    dominadas,
  )
  const revisaoEspacada = encontrarAtividadeParaRevisao(
    trilhaV1,
    dominadas,
    tentativas,
  )
  const codigoAdultoConfirmado =
    codigoTrocaPerfil.trim().toUpperCase() === 'ADULTO'

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-12 animacao-surgir">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--cor-primaria-escura)] to-[var(--cor-acento-escura)] drop-shadow-sm">
          Olá, {perfilAtivo?.nome}
        </h1>
        <div className="flex items-center gap-6">
          <Link
            to="/crianca/jardim"
            className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-base font-bold text-[var(--cor-primaria-escura)] hover:text-[var(--cor-acento-escura)] transition-colors underline underline-offset-4"
          >
            Meu jardim
          </Link>
          <button
            type="button"
            onClick={() => setConfirmandoTrocaPerfil(true)}
            className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-base font-bold text-[var(--cor-texto-suave)] hover:text-[var(--cor-texto)] transition-colors underline underline-offset-4"
          >
            Trocar de perfil
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[2rem] border border-[var(--cor-borda)] bg-gradient-to-br from-[var(--cor-primaria-escura)] to-[var(--cor-acento-escura)] p-8 sm:p-10 shadow-[var(--sombra-brilho)] flutuar">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
        {proximaAtividade ? (
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/30">
                <Icone
                  iconeId={proximaAtividade.alvo.iconeId as IconeId}
                  className="h-14 w-14 drop-shadow-md"
                />
              </span>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-extrabold uppercase tracking-widest text-[var(--cor-primaria-clara)] drop-shadow-sm mb-1">
                  Continuar Trilha
                </p>
                <p className="text-4xl font-black text-white drop-shadow-md leading-tight">
                  {proximaAtividade.alvo.rotulo}
                </p>
              </div>
            </div>
            <Link
              to={`/crianca/atividade/${proximaAtividade.id}`}
              aria-label={`Continuar com ${proximaAtividade.alvo.rotulo}`}
              className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full bg-white px-10 py-4 text-xl font-black text-[var(--cor-primaria-escura)] shadow-xl transition-all hover:scale-[1.05] hover:bg-transparent hover:text-white hover:border hover:border-white"
            >
              Começar
            </Link>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col gap-3 text-center py-6">
            <p className="text-3xl font-black text-white drop-shadow-md">
              Tudo concluído nesta trilha! 🎉
            </p>
            <p className="text-lg text-[var(--cor-primaria-clara)]">
              Revise atividades já dominadas quando quiser.
            </p>
          </div>
        )}
      </section>

      {revisaoEspacada && (
        <section className="relative overflow-hidden rounded-[2rem] border border-[var(--cor-conquista)] bg-gradient-to-br from-[var(--cor-fundo-vidro)] to-transparent p-8 sm:p-10 shadow-[var(--sombra-cartao)] backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--cor-conquista-clara)] to-transparent opacity-20"></div>
          <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-[var(--cor-conquista-clara)] text-[var(--cor-conquista)] shadow-lg border border-[var(--cor-conquista)]">
                <Icone
                  iconeId={revisaoEspacada.atividade.alvo.iconeId as IconeId}
                  className="h-10 w-10 drop-shadow-md"
                />
              </span>
              <div className="flex flex-col justify-center">
                <p className="text-sm font-extrabold uppercase tracking-widest text-[var(--cor-conquista)] drop-shadow-sm mb-1">
                  Revisão Leve
                </p>
                <p className="text-3xl font-black text-white drop-shadow-md leading-tight">
                  {revisaoEspacada.atividade.alvo.rotulo}
                </p>
                <p className="mt-1 text-sm text-[var(--cor-texto-suave)] font-medium">
                  {revisaoEspacada.diasDesdeUltimaPratica === null
                    ? 'Pratique de novo quando estiver tranquilo.'
                    : `Praticada há ${revisaoEspacada.diasDesdeUltimaPratica} dias.`}
                </p>
              </div>
            </div>
            <Link
              to={`/crianca/atividade/${revisaoEspacada.atividade.id}`}
              aria-label={`Revisar ${revisaoEspacada.atividade.alvo.rotulo}`}
              className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full bg-[var(--cor-conquista)] px-10 py-4 text-xl font-black text-white shadow-xl transition-all hover:scale-[1.05] hover:bg-[#c9862a] hover:text-white"
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
          const contemProximaAtividade =
            proximaAtividade?.moduloId === modulo.id
          const contemRevisao =
            revisaoEspacada?.atividade.moduloId === modulo.id
          const abertoManualmente = modulosAbertos.has(modulo.id)
          const atividadesVisiveis =
            contemProximaAtividade || contemRevisao || abertoManualmente
          const podeAlternarAtividades =
            !contemProximaAtividade && !contemRevisao
          const atividadesId = `atividades-${modulo.id}`
          const tituloId = `titulo-${modulo.id}`

          return (
            <section
              key={modulo.id}
              aria-labelledby={tituloId}
              className="flex flex-col gap-6 vidro rounded-3xl p-6"
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <span
                    style={{ background: acento.fundo, color: acento.texto }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-black shadow-md border border-white/20"
                  >
                    {indice + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2
                        id={tituloId}
                        className="text-2xl font-black text-[var(--cor-texto)]"
                      >
                        {modulo.titulo}
                      </h2>
                      {contemProximaAtividade && (
                        <span className="rounded-full bg-[var(--cor-primaria-clara)] px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--cor-primaria-escura)] shadow-sm">
                          Agora
                        </span>
                      )}
                      {contemRevisao && !contemProximaAtividade && (
                        <span className="rounded-full bg-[var(--cor-conquista-clara)] px-3 py-1 text-xs font-black uppercase tracking-wider text-[var(--cor-conquista)] shadow-sm">
                          Revisão
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-base font-medium text-[var(--cor-texto-suave)]">
                      {`${concluidas} de ${modulo.atividades.length} concluídas`}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div
                        className="h-3 flex-1 rounded-full bg-black/40 overflow-hidden shadow-inner border border-white/10"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[var(--cor-primaria-escura)] to-[var(--cor-primaria-clara)] transition-all duration-500"
                          style={{ width: `${percentualConcluido}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[var(--cor-texto-suave)]">
                        {restantes === 0 ? 'Pronto!' : `${restantes} restantes`}
                      </span>
                    </div>
                  </div>
                </div>
                {podeAlternarAtividades && (
                  <button
                    type="button"
                    aria-expanded={atividadesVisiveis}
                    aria-controls={atividadesId}
                    onClick={() => alternarModulo(modulo.id)}
                    className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center gap-2 rounded-full border border-[var(--cor-borda)] vidro px-6 py-3 text-base font-bold text-[var(--cor-texto)] hover:border-[var(--cor-primaria)] transition-colors shadow-sm"
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

              {!atividadesVisiveis && (
                <p className="text-sm text-[var(--cor-texto-suave)]">
                  Atividades guardadas para manter a trilha mais calma. Abra
                  quando quiser ver ou praticar este módulo.
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

      {confirmandoTrocaPerfil && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6"
          role="presentation"
        >
          <dialog
            ref={dialogoTrocaRef}
            open
            aria-modal="true"
            aria-labelledby="titulo-troca-perfil"
            aria-describedby="texto-troca-perfil ajuda-troca-perfil"
            onCancel={(evento) => {
              evento.preventDefault()
              fecharConfirmacaoTrocaPerfil()
            }}
            onKeyDown={(evento) => {
              aoKeyDownDialogo(evento)
              if (evento.key === 'Escape') {
                fecharConfirmacaoTrocaPerfil()
              }
            }}
            className="m-0 flex w-full max-w-sm flex-col gap-4 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao-hover)]"
          >
            <div>
              <h2
                id="titulo-troca-perfil"
                className="text-xl font-semibold text-[var(--cor-texto)]"
              >
                Trocar de perfil
              </h2>
              <p
                id="texto-troca-perfil"
                className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]"
              >
                Para trocar, o adulto digita ADULTO.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                ref={botaoContinuarTrilhaRef}
                type="button"
                onClick={fecharConfirmacaoTrocaPerfil}
                className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full bg-[var(--cor-primaria)] px-5 py-3 text-base font-semibold text-white hover:bg-[var(--cor-primaria-escura)]"
              >
                Continuar na trilha
              </button>
              <label className="flex flex-col gap-2 text-left text-sm font-medium text-[var(--cor-texto)]">
                Confirmação do adulto
                <input
                  autoComplete="off"
                  inputMode="text"
                  value={codigoTrocaPerfil}
                  onChange={(evento) =>
                    setCodigoTrocaPerfil(evento.target.value)
                  }
                  className="rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-4 py-3 text-base text-[var(--cor-texto)] uppercase"
                  aria-describedby="ajuda-troca-perfil"
                />
              </label>
              <p
                id="ajuda-troca-perfil"
                className="text-left text-xs leading-5 text-[var(--cor-texto-suave)]"
              >
                Isso evita que a criança saia da trilha por toque acidental.
              </p>
              <button
                type="button"
                disabled={!codigoAdultoConfirmado}
                onClick={aoTrocarPerfil}
                className="inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center rounded-full border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-5 py-3 text-base font-medium text-[var(--cor-texto)] hover:border-[var(--cor-primaria)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar troca de perfil
              </button>
            </div>
          </dialog>
        </div>
      )}
    </main>
  )
}
