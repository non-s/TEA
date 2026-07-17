import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { encontrarAtividade, trilhaV1 } from '../../curriculo/trilha-v1'
import { personalizarAtividadePorInteresse } from '../../curriculo/interesses'
import type {
  Atividade as AtividadeCurricular,
  Tentativa,
} from '../../curriculo/tipos'
import { encontrarProximaAtividadeAposConclusao } from '../../curriculo/proximoPassoSessao'
import {
  conteudoAcordoPausa,
  conteudoPausaPreferencial,
  type ApoioPreferencial,
} from '../../curriculo/apoioPreferencial'
import {
  itensPlanoRegulacao,
  type PlanoRegulacao,
  type RegulacaoPreferencial,
} from '../../curriculo/perfilApoio'
import { listarTentativas } from '../../local/perfilLocal'
import { useFocoPreso } from '../../hooks/useFocoPreso'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { EmparelhamentoIdentico } from '../../components/atividades/EmparelhamentoIdentico'
import { NomeacaoReceptiva } from '../../components/atividades/NomeacaoReceptiva'
import { NomeacaoExpressiva } from '../../components/atividades/NomeacaoExpressiva'
import { TracadoLetra } from '../../components/atividades/TracadoLetra'
import { FormacaoSilaba } from '../../components/atividades/FormacaoSilaba'
import { FormacaoPalavra } from '../../components/atividades/FormacaoPalavra'
import { MontagemPalavra } from '../../components/atividades/MontagemPalavra'
import { LeituraFrase } from '../../components/atividades/LeituraFrase'
import { CompreensaoFrase } from '../../components/atividades/CompreensaoFrase'
import { CompreensaoTexto } from '../../components/atividades/CompreensaoTexto'
import { PerguntaLiteralTexto } from '../../components/atividades/PerguntaLiteralTexto'
import { PainelComunicacao } from '../../components/ui/PainelComunicacao'
import { Botao } from '../../components/ui/Botao'

interface PausaAtividadeProps {
  aoContinuar: () => void
  apoioPreferencial?: ApoioPreferencial
  regulacaoPreferencial?: RegulacaoPreferencial
  planoRegulacao?: PlanoRegulacao
}

interface AtividadeConcluidaProps {
  rotuloAtividade: string
  proximaAtividade: AtividadeCurricular | null
  aoVoltarTrilha: () => void
  aoAbrirProximaAtividade: (atividadeId: string) => void
}

interface SessaoEncerradaProps {
  rotuloAtividade: string
  aoVoltarTrilha: () => void
  aoContinuarAtividade: () => void
}

interface ConfirmarVoltarTrilhaProps {
  aoContinuar: () => void
  aoVoltarTrilha: () => void
}

function AtividadeConcluida({
  rotuloAtividade,
  proximaAtividade,
  aoVoltarTrilha,
  aoAbrirProximaAtividade,
}: AtividadeConcluidaProps) {
  const botaoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    botaoRef.current?.focus()
  }, [])

  return (
    <section
      aria-labelledby="titulo-conclusao-atividade"
      className="flex w-full max-w-md flex-col items-center gap-8 text-center animacao-zoom"
    >
      <div className="relative overflow-hidden flex w-full flex-col gap-4 rounded-[2rem] border border-[var(--cor-sucesso)] bg-gradient-to-b from-[var(--cor-sucesso-clara)] to-[var(--cor-fundo-alt)] p-8 shadow-[var(--sombra-cartao)] flutuar">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20"></div>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <p className="text-sm font-black uppercase tracking-widest text-[var(--cor-sucesso)] drop-shadow-sm">
            Feito! 🎉
          </p>
          <h1
            id="titulo-conclusao-atividade"
            className="text-4xl font-black text-[var(--cor-texto)]"
          >
            Atividade concluída
          </h1>
          <p className="text-xl font-bold text-[var(--cor-texto-suave)] mt-2">
            {rotuloAtividade}
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-4 z-10">
        {proximaAtividade && (
          <Botao
            type="button"
            variante="primario"
            className="text-xl py-5 shadow-xl transition-all hover:scale-[1.05]"
            aria-label={`Próxima atividade: ${proximaAtividade.alvo.rotulo}`}
            onClick={() => aoAbrirProximaAtividade(proximaAtividade.id)}
          >
            Próxima atividade
          </Botao>
        )}

        <Botao
          ref={botaoRef}
          type="button"
          variante="secundario"
          className="text-lg py-4 vidro hover:bg-white/20 transition-all hover:scale-[1.02]"
          onClick={aoVoltarTrilha}
        >
          Voltar para a trilha
        </Botao>
      </div>
    </section>
  )
}

function SessaoEncerrada({
  rotuloAtividade,
  aoVoltarTrilha,
  aoContinuarAtividade,
}: SessaoEncerradaProps) {
  const voltarRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()

  useEffect(() => {
    voltarRef.current?.focus()
  }, [])

  return (
    <dialog
      ref={dialogoRef}
      open
      aria-modal="true"
      aria-labelledby="titulo-sessao-encerrada"
      onCancel={(evento) => {
        evento.preventDefault()
        aoContinuarAtividade()
      }}
      onKeyDown={aoKeyDownDialogo}
      className="fixed inset-0 z-30 flex items-center justify-center bg-[var(--cor-fundo)]/95 px-6"
    >
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao)]">
        <div className="flex w-full flex-col gap-3 rounded-2xl border-2 border-[var(--cor-primaria-clara)] bg-[var(--cor-fundo)] p-6">
          <p className="text-sm font-semibold uppercase text-[var(--cor-texto-suave)]">
            Por agora
          </p>
          <h1
            id="titulo-sessao-encerrada"
            className="text-2xl font-semibold text-[var(--cor-texto)]"
          >
            Sessão encerrada
          </h1>
          <p className="text-base text-[var(--cor-texto-suave)]">
            {rotuloAtividade}
          </p>
        </div>

        <ol
          aria-label="Roteiro para terminar a sessão"
          className="grid w-full grid-cols-2 gap-3 text-sm text-[var(--cor-texto)]"
        >
          {[
            ['Agora', 'Descansar'],
            ['Depois', 'Voltar quando quiser'],
          ].map(([marcador, texto]) => (
            <li
              key={marcador}
              className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3"
            >
              <span className="text-xs font-semibold uppercase text-[var(--cor-texto-suave)]">
                {marcador}
              </span>
              <span className="font-semibold">{texto}</span>
            </li>
          ))}
        </ol>

        <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
          Nada foi apagado. A atividade fica disponível na trilha.
        </p>

        <div className="flex w-full flex-col gap-3">
          <Botao ref={voltarRef} type="button" onClick={aoVoltarTrilha}>
            Voltar para a trilha
          </Botao>
          <Botao
            type="button"
            variante="secundario"
            onClick={aoContinuarAtividade}
          >
            Continuar atividade
          </Botao>
        </div>
      </section>
    </dialog>
  )
}

function ConfirmarVoltarTrilha({
  aoContinuar,
  aoVoltarTrilha,
}: ConfirmarVoltarTrilhaProps) {
  const continuarRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()

  useEffect(() => {
    continuarRef.current?.focus()
  }, [])

  return (
    <dialog
      ref={dialogoRef}
      open
      aria-modal="true"
      aria-labelledby="titulo-voltar-trilha"
      aria-describedby="texto-voltar-trilha"
      onCancel={(evento) => {
        evento.preventDefault()
        aoContinuar()
      }}
      onKeyDown={aoKeyDownDialogo}
      className="fixed inset-0 z-30 flex items-center justify-center bg-[var(--cor-fundo)]/95 px-6"
    >
      <section className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao-hover)]">
        <div>
          <h2
            id="titulo-voltar-trilha"
            className="text-xl font-semibold text-[var(--cor-texto)]"
          >
            Voltar para a trilha?
          </h2>
          <p
            id="texto-voltar-trilha"
            className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]"
          >
            A atividade pode continuar daqui.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Botao ref={continuarRef} type="button" onClick={aoContinuar}>
            Continuar atividade
          </Botao>
          <Botao type="button" variante="secundario" onClick={aoVoltarTrilha}>
            Voltar para a trilha
          </Botao>
        </div>
      </section>
    </dialog>
  )
}

function PausaAtividade({
  aoContinuar,
  apoioPreferencial,
  regulacaoPreferencial,
  planoRegulacao,
}: PausaAtividadeProps) {
  const apoio = conteudoPausaPreferencial(
    apoioPreferencial,
    regulacaoPreferencial,
  )
  const acordo = conteudoAcordoPausa(apoioPreferencial, regulacaoPreferencial)
  const itensRegulacao = itensPlanoRegulacao(planoRegulacao)
  const [mensagemPausa, setMensagemPausa] = useState<string | null>(null)
  const continuarRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()

  useEffect(() => {
    continuarRef.current?.focus()
  }, [])

  return (
    <dialog
      ref={dialogoRef}
      open
      aria-modal="true"
      aria-labelledby="titulo-pausa"
      aria-describedby="texto-pausa"
      onCancel={(evento) => {
        evento.preventDefault()
        aoContinuar()
      }}
      onKeyDown={aoKeyDownDialogo}
      className="fixed inset-0 z-20 flex items-center justify-center bg-[var(--cor-fundo)]/95 px-6"
    >
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao)]">
        <div>
          <p
            id="titulo-pausa"
            className="text-2xl font-semibold text-[var(--cor-texto)]"
          >
            Pausa
          </p>
          <p
            id="texto-pausa"
            className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]"
          >
            {apoio.textoPausa}
          </p>
        </div>

        <div className="grid w-full grid-cols-3 gap-2 text-sm text-[var(--cor-texto)]">
          {apoio.passosPausa.map((passo) => (
            <span
              key={passo}
              className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3"
            >
              {passo}
            </span>
          ))}
        </div>

        {itensRegulacao.length > 0 && (
          <section
            aria-label="Plano de regulacao combinado"
            className="grid w-full gap-2 text-left text-sm"
          >
            {itensRegulacao.map((item) => (
              <p
                key={item.rotulo}
                className="rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-4 py-3 leading-6 text-[var(--cor-texto)]"
              >
                <span className="block text-xs font-semibold uppercase text-[var(--cor-texto-suave)]">
                  {item.rotulo}
                </span>
                {item.texto}
              </p>
            ))}
          </section>
        )}

        <ol
          aria-label="Acordo visual para voltar da pausa"
          className="grid w-full grid-cols-2 gap-2 text-sm text-[var(--cor-texto)]"
        >
          {[
            ['Primeiro', acordo.agora],
            ['Depois', acordo.depois],
          ].map(([marcador, texto]) => (
            <li
              key={marcador}
              className="flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3"
            >
              <span className="text-xs font-semibold uppercase text-[var(--cor-texto-suave)]">
                {marcador}
              </span>
              <span className="font-semibold">{texto}</span>
            </li>
          ))}
        </ol>

        <p
          className="min-h-6 text-sm leading-6 text-[var(--cor-texto-suave)]"
          aria-live="polite"
        >
          {mensagemPausa ??
            'A pausa não fecha sozinha. A criança escolhe continuar, pedir mais pausa ou voltar para a trilha.'}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Botao ref={continuarRef} type="button" onClick={aoContinuar}>
            Continuar
          </Botao>
          <Botao
            type="button"
            variante="secundario"
            onClick={() => setMensagemPausa(acordo.mensagemEstender)}
          >
            {acordo.acaoEstender}
          </Botao>
          <Link
            to="/crianca/trilha"
            aria-label="Voltar para a trilha"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-5 py-2.5 text-sm font-medium text-[var(--cor-texto)] hover:border-[var(--cor-primaria)]"
          >
            Trilha
          </Link>
        </div>
      </section>
    </dialog>
  )
}

export function Atividade() {
  const { atividadeId } = useParams<{ atividadeId: string }>()
  const navigate = useNavigate()
  const { perfilAtivo, marcarAtividadeDominada } = usePerfilAtivo()
  const [emPausa, setEmPausa] = useState(false)
  const [confirmandoVoltarTrilha, setConfirmandoVoltarTrilha] = useState(false)
  const [atividadeConcluida, setAtividadeConcluida] = useState(false)
  const [sessaoEncerrada, setSessaoEncerrada] = useState(false)
  const [atividadesDominadasNestaSessao, setAtividadesDominadasNestaSessao] =
    useState<string[]>([])
  const [sinalComunicarPronto, setSinalComunicarPronto] = useState(0)
  const [sinalPedirAjuda, setSinalPedirAjuda] = useState(0)
  const [tentativasAnteriores, setTentativasAnteriores] = useState<Tentativa[]>(
    [],
  )
  const atividadeBase = atividadeId
    ? encontrarAtividade(atividadeId)
    : undefined
  const atividade = atividadeBase
    ? personalizarAtividadePorInteresse(
        atividadeBase,
        perfilAtivo?.interesseEspecialId,
      )
    : undefined
  const apoioPreferencial = perfilAtivo?.apoioPreferencial
  const acessoPreferencial = perfilAtivo?.perfilApoio?.acessoPreferencial
  const regulacaoPreferencial = perfilAtivo?.perfilApoio?.regulacaoPreferencial
  const planoRegulacao = perfilAtivo?.perfilApoio?.planoRegulacao
  const limiteTentativasAntesPausa =
    perfilAtivo?.perfilApoio?.limiteTentativasAntesPausa

  useEffect(() => {
    if (!perfilAtivo) return
    setTentativasAnteriores(listarTentativas(perfilAtivo.id))
  }, [perfilAtivo])

  useEffect(() => {
    setAtividadesDominadasNestaSessao([])
  }, [perfilAtivo?.id])

  useEffect(() => {
    setAtividadeConcluida(false)
    setEmPausa(false)
    setConfirmandoVoltarTrilha(false)
    setSessaoEncerrada(false)
    setSinalComunicarPronto(0)
    setSinalPedirAjuda(0)
  }, [atividade?.id])

  if (!atividade) {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center gap-4 px-6 py-10 text-center">
        <p className="text-lg text-[var(--cor-texto)]">
          Não encontramos essa atividade.
        </p>
        <Link
          to="/crianca/trilha"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar para a trilha
        </Link>
      </main>
    )
  }

  function aoDominar() {
    if (!atividade) return

    const atividadeDominadaId = atividade.id
    marcarAtividadeDominada(atividadeDominadaId)
    setAtividadesDominadasNestaSessao((atuais) =>
      atuais.includes(atividadeDominadaId)
        ? atuais
        : [...atuais, atividadeDominadaId],
    )
    setEmPausa(false)
    setAtividadeConcluida(true)
  }

  function encontrarProximoPassoAposConclusao(
    atividadeAtual: AtividadeCurricular,
  ): AtividadeCurricular | null {
    return encontrarProximaAtividadeAposConclusao(
      trilhaV1,
      perfilAtivo?.atividadesDominadas ?? [],
      atividadesDominadasNestaSessao,
      atividadeAtual.id,
    )
  }

  function aoEncerrarSessao() {
    setEmPausa(false)
    setConfirmandoVoltarTrilha(false)
    setSessaoEncerrada(true)
  }

  function aoConfirmarVoltarTrilha() {
    setConfirmandoVoltarTrilha(false)
    navigate('/crianca/trilha')
  }

  if (atividadeConcluida) {
    return (
      <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center px-6 py-10">
        <AtividadeConcluida
          rotuloAtividade={atividade.alvo.rotulo}
          proximaAtividade={encontrarProximoPassoAposConclusao(atividade)}
          aoVoltarTrilha={() => navigate('/crianca/trilha')}
          aoAbrirProximaAtividade={(proximaAtividadeId) =>
            navigate(`/crianca/atividade/${proximaAtividadeId}`)
          }
        />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-6 px-6 py-10">
      <div
        className="flex w-full flex-1 flex-col items-center gap-6"
        aria-hidden={
          emPausa || confirmandoVoltarTrilha || sessaoEncerrada
            ? true
            : undefined
        }
      >
        <button
          type="button"
          onClick={() => setConfirmandoVoltarTrilha(true)}
          className="inline-flex min-h-[var(--min-alvo-controle)] self-start items-center text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
        >
          ← Voltar para a trilha
        </button>

        <div className="flex flex-1 flex-col items-center justify-center">
          {(atividade.tipo === 'emparelhamento-identico' ||
            atividade.tipo === 'emparelhamento-categoria') && (
            <EmparelhamentoIdentico
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'nomeacao-receptiva' && (
            <NomeacaoReceptiva
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'nomeacao-expressiva' && (
            <NomeacaoExpressiva
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'tracado-letra' && (
            <TracadoLetra
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'formacao-silaba' && (
            <FormacaoSilaba
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'formacao-palavra' && (
            <FormacaoPalavra
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'montagem-palavra' && (
            <MontagemPalavra
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'leitura-frase' && (
            <LeituraFrase
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'compreensao-frase' && (
            <CompreensaoFrase
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {atividade.tipo === 'compreensao-texto' && (
            <CompreensaoTexto
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
          {(atividade.tipo === 'pergunta-literal-texto' ||
            atividade.tipo === 'pergunta-presenca-texto' ||
            atividade.tipo === 'pergunta-inferencia-texto') && (
            <PerguntaLiteralTexto
              atividade={atividade}
              aoDominar={aoDominar}
              perfilId={perfilAtivo!.id}
              apoioPreferencial={apoioPreferencial}
              acessoPreferencial={acessoPreferencial}
              regulacaoPreferencial={regulacaoPreferencial}
              limiteTentativasAntesPausa={limiteTentativasAntesPausa}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              tentativasAnteriores={tentativasAnteriores}
              aoEncerrarSessao={aoEncerrarSessao}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}
        </div>

        <PainelComunicacao
          cartoesComunicacao={perfilAtivo?.perfilApoio?.cartoesComunicacao}
          interesseEspecialId={perfilAtivo?.interesseEspecialId}
          aoComunicarPronto={() =>
            setSinalComunicarPronto((sinal) => sinal + 1)
          }
          aoPedirAjuda={() => setSinalPedirAjuda((sinal) => sinal + 1)}
          aoPedirPausa={() => setEmPausa(true)}
        />
      </div>
      {emPausa && (
        <PausaAtividade
          apoioPreferencial={apoioPreferencial}
          regulacaoPreferencial={regulacaoPreferencial}
          planoRegulacao={planoRegulacao}
          aoContinuar={() => setEmPausa(false)}
        />
      )}
      {confirmandoVoltarTrilha && (
        <ConfirmarVoltarTrilha
          aoContinuar={() => setConfirmandoVoltarTrilha(false)}
          aoVoltarTrilha={aoConfirmarVoltarTrilha}
        />
      )}
      {sessaoEncerrada && (
        <SessaoEncerrada
          rotuloAtividade={atividade.alvo.rotulo}
          aoVoltarTrilha={() => navigate('/crianca/trilha')}
          aoContinuarAtividade={() => setSessaoEncerrada(false)}
        />
      )}
    </main>
  )
}
