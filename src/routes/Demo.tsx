import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Botao } from '../components/ui/Botao'
import { classesBotao } from '../components/ui/estilosBotao'
import { PainelComunicacao } from '../components/ui/PainelComunicacao'
import { EmparelhamentoIdentico } from '../components/atividades/EmparelhamentoIdentico'
import { FormacaoSilaba } from '../components/atividades/FormacaoSilaba'
import { PerguntaLiteralTexto } from '../components/atividades/PerguntaLiteralTexto'
import {
  exemplosInteresseEspecial,
  interessesEspeciais,
  personalizarAtividadePorInteresse,
  type InteresseEspecialId,
} from '../curriculo/interesses'
import { encontrarAtividade } from '../curriculo/trilha-v1'
import type { Atividade } from '../curriculo/tipos'
import type { AcessoPreferencial } from '../curriculo/perfilApoio'
import { useFocoPreso } from '../hooks/useFocoPreso'

const demos = [
  {
    id: 'visual',
    rotulo: 'Visual',
    atividadeId: 'm0-n1-a1',
  },
  {
    id: 'silaba',
    rotulo: 'Sílaba',
    atividadeId: 'm4-MA',
  },
  {
    id: 'texto',
    rotulo: 'Texto',
    atividadeId: 'm9-O-que-apareceu-primeiro-A-MALA-A-BALA',
  },
] as const

type DemoId = (typeof demos)[number]['id']

const modosAcessoDemo = [
  {
    id: 'toque-direto',
    rotulo: 'Toque',
  },
  {
    id: 'toque-com-confirmacao',
    rotulo: 'Confirmar',
  },
  {
    id: 'escolha-mediada',
    rotulo: 'Mediado',
  },
] as const satisfies ReadonlyArray<{
  id: AcessoPreferencial
  rotulo: string
}>

type ModoAcessoDemo = (typeof modosAcessoDemo)[number]['id']

function atividadeParaDemo(atividadeId: string): Atividade | null {
  const atividade = encontrarAtividade(atividadeId)
  if (!atividade) return null

  return {
    ...atividade,
    criteriosDominio: {
      ...atividade.criteriosDominio,
      acertosConsecutivosNecessarios: 1,
    },
  }
}

function registrarTentativaDemo() {
  return undefined
}

function PausaDemo({ aoContinuar }: { aoContinuar: () => void }) {
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
      aria-labelledby="titulo-pausa-demo"
      aria-describedby="texto-pausa-demo"
      onCancel={(evento) => {
        evento.preventDefault()
        aoContinuar()
      }}
      onKeyDown={aoKeyDownDialogo}
      className="fixed inset-0 z-20 flex items-center justify-center bg-[var(--cor-fundo)]/95 px-6"
    >
      <section className="flex w-full max-w-sm flex-col items-center gap-5 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao)]">
        <div>
          <h2
            id="titulo-pausa-demo"
            className="text-2xl font-semibold text-[var(--cor-texto)]"
          >
            Pausa
          </h2>
          <p
            id="texto-pausa-demo"
            className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]"
          >
            A demonstração também respeita pausa. Nada foi salvo.
          </p>
        </div>

        <ol className="grid w-full grid-cols-2 gap-2 text-sm text-[var(--cor-texto)]">
          <li className="rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3">
            Primeiro: respirar
          </li>
          <li className="rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3">
            Depois: escolher
          </li>
        </ol>

        <Botao ref={continuarRef} type="button" onClick={aoContinuar}>
          Continuar
        </Botao>
      </section>
    </dialog>
  )
}

export function Demo() {
  const [demoSelecionadaId, setDemoSelecionadaId] = useState<DemoId>('visual')
  const [acessoDemo, setAcessoDemo] = useState<ModoAcessoDemo>('toque-direto')
  const [interesseDemo, setInteresseDemo] =
    useState<InteresseEspecialId>('neutro')
  const demoSelecionada =
    demos.find((demo) => demo.id === demoSelecionadaId) ?? demos[0]
  const atividadeBase = useMemo(
    () => atividadeParaDemo(demoSelecionada.atividadeId),
    [demoSelecionada.atividadeId],
  )
  const atividade = useMemo(
    () =>
      atividadeBase
        ? personalizarAtividadePorInteresse(atividadeBase, interesseDemo)
        : null,
    [atividadeBase, interesseDemo],
  )
  const exemplosInteresseDemo =
    exemplosInteresseEspecial(interesseDemo).join(', ')
  const [concluida, setConcluida] = useState(false)
  const [emPausa, setEmPausa] = useState(false)
  const [reinicio, setReinicio] = useState(0)
  const [sinalComunicarPronto, setSinalComunicarPronto] = useState(0)
  const [sinalPedirAjuda, setSinalPedirAjuda] = useState(0)

  function reiniciarInteracaoDemo() {
    setConcluida(false)
    setEmPausa(false)
    setReinicio((valor) => valor + 1)
    setSinalComunicarPronto(0)
    setSinalPedirAjuda(0)
  }

  function reiniciarDemo() {
    reiniciarInteracaoDemo()
  }

  function selecionarDemo(demoId: DemoId) {
    setDemoSelecionadaId(demoId)
    reiniciarInteracaoDemo()
  }

  function selecionarAcesso(acesso: ModoAcessoDemo) {
    setAcessoDemo(acesso)
    reiniciarInteracaoDemo()
  }

  function selecionarInteresse(interesse: InteresseEspecialId) {
    setInteresseDemo(interesse)
    reiniciarInteracaoDemo()
  }

  if (!atividade) {
    return (
      <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center gap-4 px-6 py-10 text-center">
        <p className="text-lg text-[var(--cor-texto)]">
          Não encontramos a atividade de demonstração.
        </p>
        <Link
          to="/"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-6 px-6 py-10">
      <header className="flex w-full flex-col gap-2 text-center">
        <Link
          to="/"
          className="w-fit text-sm font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
        <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
          Demonstração sem conta
        </h1>
        <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
          Experimente uma etapa curta da trilha. Nenhum dado pessoal ou
          tentativa é salvo nesta tela.
        </p>
      </header>

      <nav
        aria-label="Escolher etapa da demonstração"
        className="grid w-full grid-cols-3 gap-2 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-2"
      >
        {demos.map((demo) => {
          const selecionada = demo.id === demoSelecionadaId

          return (
            <button
              key={demo.id}
              type="button"
              aria-pressed={selecionada}
              onClick={() => selecionarDemo(demo.id)}
              className={`min-h-[var(--min-alvo-controle)] rounded-2xl px-3 py-2 text-sm font-semibold ${
                selecionada
                  ? 'bg-[var(--cor-primaria)] text-white'
                  : 'text-[var(--cor-texto)] hover:bg-[var(--cor-fundo)]'
              }`}
            >
              {demo.rotulo}
            </button>
          )
        })}
      </nav>

      <nav
        aria-label="Escolher forma de resposta"
        className="grid w-full grid-cols-3 gap-2 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-2"
      >
        {modosAcessoDemo.map((modo) => {
          const selecionado = modo.id === acessoDemo

          return (
            <button
              key={modo.id}
              type="button"
              aria-pressed={selecionado}
              onClick={() => selecionarAcesso(modo.id)}
              className={`min-h-[var(--min-alvo-controle)] rounded-2xl px-3 py-2 text-sm font-semibold ${
                selecionado
                  ? 'bg-[var(--cor-primaria)] text-white'
                  : 'text-[var(--cor-texto)] hover:bg-[var(--cor-fundo)]'
              }`}
            >
              {modo.rotulo}
            </button>
          )
        })}
      </nav>

      <section
        aria-label="Personalizar interesse da demonstração"
        className="grid w-full gap-2 rounded-3xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-3"
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--cor-texto)]">
            Interesse da demonstração
          </span>
          <select
            value={interesseDemo}
            onChange={(evento) =>
              selecionarInteresse(evento.target.value as InteresseEspecialId)
            }
            aria-describedby="exemplos-interesse-demo"
            className="min-h-[var(--min-alvo-controle)] rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-3 py-2 text-sm font-medium text-[var(--cor-texto)]"
          >
            {interessesEspeciais.map((interesse) => (
              <option key={interesse.id} value={interesse.id}>
                {interesse.nome}
              </option>
            ))}
          </select>
        </label>
        <p
          id="exemplos-interesse-demo"
          className="text-xs leading-5 text-[var(--cor-texto-suave)]"
        >
          Exemplos: {exemplosInteresseDemo}.
        </p>
      </section>

      {concluida ? (
        <section
          aria-labelledby="titulo-demo-concluida"
          className="flex w-full flex-col items-center gap-5 rounded-3xl border-2 border-[var(--cor-sucesso-clara)] bg-[var(--cor-fundo-alt)] p-6 text-center shadow-[var(--sombra-cartao)]"
        >
          <p className="text-sm font-semibold uppercase text-[var(--cor-texto-suave)]">
            Feito
          </p>
          <h2
            id="titulo-demo-concluida"
            className="text-2xl font-semibold text-[var(--cor-texto)]"
          >
            Atividade concluída
          </h2>
          <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
            Para salvar preferências, progresso e apoios da criança, crie uma
            conta do responsável.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/cadastro" className={classesBotao()}>
              Criar conta
            </Link>
            <Botao type="button" variante="secundario" onClick={reiniciarDemo}>
              Repetir etapa
            </Botao>
          </div>
        </section>
      ) : (
        <>
          {atividade.tipo === 'emparelhamento-identico' && (
            <EmparelhamentoIdentico
              key={`${atividade.id}-${acessoDemo}-${reinicio}`}
              atividade={atividade}
              aoDominar={() => setConcluida(true)}
              uidResponsavel="demo"
              perfilId="demo"
              apoioPreferencial="visual"
              acessoPreferencial={acessoDemo}
              regulacaoPreferencial="pausa"
              limiteTentativasAntesPausa={4}
              registrarTentativa={registrarTentativaDemo}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}

          {atividade.tipo === 'formacao-silaba' && (
            <FormacaoSilaba
              key={`${atividade.id}-${acessoDemo}-${reinicio}`}
              atividade={atividade}
              aoDominar={() => setConcluida(true)}
              uidResponsavel="demo"
              perfilId="demo"
              apoioPreferencial="visual"
              acessoPreferencial={acessoDemo}
              regulacaoPreferencial="pausa"
              limiteTentativasAntesPausa={4}
              registrarTentativa={registrarTentativaDemo}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}

          {atividade.tipo === 'pergunta-literal-texto' && (
            <PerguntaLiteralTexto
              key={`${atividade.id}-${acessoDemo}-${reinicio}`}
              atividade={atividade}
              aoDominar={() => setConcluida(true)}
              uidResponsavel="demo"
              perfilId="demo"
              apoioPreferencial="visual"
              acessoPreferencial={acessoDemo}
              regulacaoPreferencial="pausa"
              limiteTentativasAntesPausa={4}
              registrarTentativa={registrarTentativaDemo}
              sinalComunicarPronto={sinalComunicarPronto}
              sinalPedirAjuda={sinalPedirAjuda}
              aoPedirPausa={() => setEmPausa(true)}
            />
          )}

          <PainelComunicacao
            interesseEspecialId={interesseDemo}
            aoComunicarPronto={() =>
              setSinalComunicarPronto((valor) => valor + 1)
            }
            aoPedirAjuda={() => setSinalPedirAjuda((valor) => valor + 1)}
            aoPedirPausa={() => setEmPausa(true)}
          />
        </>
      )}

      {emPausa && <PausaDemo aoContinuar={() => setEmPausa(false)} />}
    </main>
  )
}
