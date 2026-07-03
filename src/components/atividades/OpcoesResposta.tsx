import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import type { Estimulo, NivelDica } from '../../curriculo/tipos'
import type { AcessoPreferencial } from '../../curriculo/perfilApoio'
import { classesAlvoToque } from '../ui/alvosInteracao'
import { Botao } from '../ui/Botao'

interface OpcoesRespostaProps {
  opcoes: Estimulo[]
  respostaId: string
  legenda: string
  acessoPreferencial?: AcessoPreferencial
  animacoes: boolean
  tipoDicaAtual?: NivelDica['tipo']
  classNameGrade: string
  classNameOpcao?: string
  aoEscolher: (opcao: Estimulo) => void
  renderOpcao: (opcao: Estimulo) => ReactNode
}

const textoModelagem = 'Escolha esta'

function indiceCircular(atual: number, total: number, direcao: -1 | 1) {
  if (total <= 0) return 0
  return (atual + direcao + total) % total
}

function focoEmCampoEditavel(alvo: EventTarget | null) {
  if (!(alvo instanceof HTMLElement)) return false

  return (
    alvo.isContentEditable ||
    alvo instanceof HTMLInputElement ||
    alvo instanceof HTMLTextAreaElement ||
    alvo instanceof HTMLSelectElement
  )
}

function focoEmControleInterativo(alvo: EventTarget | null) {
  if (!(alvo instanceof HTMLElement)) return false

  return !!alvo.closest(
    'a, button, input, select, textarea, [contenteditable="true"]',
  )
}

function SeloModelagem() {
  return (
    <span className="pointer-events-none rounded-full bg-[var(--cor-primaria-clara)] px-3 py-1 text-xs font-semibold text-[var(--cor-primaria-escura)]">
      {textoModelagem}
    </span>
  )
}

export function OpcoesResposta({
  opcoes,
  respostaId,
  legenda,
  acessoPreferencial,
  animacoes,
  tipoDicaAtual,
  classNameGrade,
  classNameOpcao = '',
  aoEscolher,
  renderOpcao,
}: OpcoesRespostaProps) {
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [opcaoPendente, setOpcaoPendente] = useState<Estimulo | null>(null)
  const botaoConfirmarRef = useRef<HTMLButtonElement>(null)
  const idDescricaoOpcaoMediada = useId()
  const idConfirmacaoToque = useId()
  const escolhaMediada = acessoPreferencial === 'escolha-mediada'
  const toqueComConfirmacao = acessoPreferencial === 'toque-com-confirmacao'
  const toqueComAjuda = acessoPreferencial === 'toque-com-ajuda'
  const exigeConfirmacaoResposta = toqueComConfirmacao || toqueComAjuda
  const acessoPorTeclado = acessoPreferencial === 'mouse-teclado'
  const emModelagem = tipoDicaAtual === 'modelagem'
  const emDestaqueVisual = tipoDicaAtual === 'destaque-visual' || emModelagem

  useEffect(() => {
    setIndiceAtual(0)
    setOpcaoPendente(null)
  }, [acessoPreferencial, opcoes])

  useEffect(() => {
    if (exigeConfirmacaoResposta && opcaoPendente) {
      botaoConfirmarRef.current?.focus()
    }
  }, [exigeConfirmacaoResposta, opcaoPendente])

  useEffect(() => {
    if (!acessoPorTeclado || escolhaMediada) return

    function aoTeclar(evento: KeyboardEvent) {
      if (
        evento.ctrlKey ||
        evento.altKey ||
        evento.metaKey ||
        focoEmCampoEditavel(evento.target)
      ) {
        return
      }

      if (!/^[1-9]$/.test(evento.key)) return

      const indice = Number(evento.key) - 1
      const opcao = opcoes[indice]
      if (!opcao) return

      evento.preventDefault()
      aoEscolher(opcao)
    }

    document.addEventListener('keydown', aoTeclar)

    return () => document.removeEventListener('keydown', aoTeclar)
  }, [acessoPorTeclado, escolhaMediada, aoEscolher, opcoes])

  useEffect(() => {
    if (!escolhaMediada) return

    function aoTeclar(evento: KeyboardEvent) {
      if (
        evento.ctrlKey ||
        evento.altKey ||
        evento.metaKey ||
        focoEmControleInterativo(evento.target)
      ) {
        return
      }

      if (evento.key === 'ArrowLeft' || evento.key === 'ArrowUp') {
        evento.preventDefault()
        setIndiceAtual((atual) => indiceCircular(atual, opcoes.length, -1))
        return
      }

      if (evento.key === 'ArrowRight' || evento.key === 'ArrowDown') {
        evento.preventDefault()
        setIndiceAtual((atual) => indiceCircular(atual, opcoes.length, 1))
        return
      }

      if (evento.key === 'Enter' || evento.key === ' ') {
        const opcao = opcoes[indiceAtual] ?? opcoes[0]
        if (!opcao) return

        evento.preventDefault()
        aoEscolher(opcao)
      }
    }

    document.addEventListener('keydown', aoTeclar)

    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aoEscolher, escolhaMediada, indiceAtual, opcoes])

  function aoEscolherDireto(opcao: Estimulo) {
    if (exigeConfirmacaoResposta) {
      setOpcaoPendente(opcao)
      return
    }

    aoEscolher(opcao)
  }

  if (!escolhaMediada) {
    return (
      <div className="flex w-full flex-col items-center gap-4">
        <fieldset className={classNameGrade}>
          <legend className="sr-only">{legenda}</legend>
          {opcoes.map((opcao, indice) => {
            const ehResposta = opcao.id === respostaId
            const selecionada = opcaoPendente?.id === opcao.id
            const mostrarModelo = emModelagem && ehResposta
            return (
              <button
                key={opcao.id}
                type="button"
                onClick={() => aoEscolherDireto(opcao)}
                aria-pressed={
                  exigeConfirmacaoResposta ? selecionada : undefined
                }
                aria-keyshortcuts={
                  acessoPorTeclado ? String(indice + 1) : undefined
                }
                aria-label={
                  mostrarModelo
                    ? `${opcao.rotulo}. ${textoModelagem}`
                    : opcao.rotulo
                }
                className={classesAlvoToque({
                  animacoes,
                  destacado: emDestaqueVisual && ehResposta,
                  className: `${classNameOpcao} ${
                    mostrarModelo ? 'flex-col gap-2 text-center' : ''
                  } ${
                    selecionada
                      ? 'ring-3 ring-[var(--cor-acento)] ring-offset-2'
                      : ''
                  }`,
                })}
              >
                {renderOpcao(opcao)}
                {mostrarModelo && <SeloModelagem />}
              </button>
            )
          })}
        </fieldset>

        {exigeConfirmacaoResposta && opcaoPendente && (
          <fieldset
            aria-live="polite"
            className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border-2 border-[var(--cor-primaria-clara)] bg-[var(--cor-fundo-alt)] p-4 shadow-[var(--sombra-cartao)]"
          >
            <legend
              id={idConfirmacaoToque}
              className="text-center text-base font-medium text-[var(--cor-texto)]"
            >
              {toqueComAjuda ? 'Escolha com apoio' : 'Escolha'}:{' '}
              {opcaoPendente.rotulo}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <Botao
                ref={botaoConfirmarRef}
                type="button"
                tamanho="medio"
                aria-label={`${
                  toqueComAjuda ? 'Confirmar com apoio' : 'Confirmar'
                } ${opcaoPendente.rotulo}`}
                onClick={() => {
                  aoEscolher(opcaoPendente)
                  setOpcaoPendente(null)
                }}
              >
                Confirmar
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                tamanho="medio"
                onClick={() => setOpcaoPendente(null)}
              >
                Trocar
              </Botao>
            </div>
          </fieldset>
        )}
      </div>
    )
  }

  const opcaoAtual = opcoes[indiceAtual] ?? opcoes[0]
  const ehResposta = opcaoAtual?.id === respostaId
  const mostrarModelo = emModelagem && ehResposta
  const descricaoOpcaoAtual = opcaoAtual
    ? `Opção ${indiceAtual + 1} de ${opcoes.length}: ${opcaoAtual.rotulo}${
        mostrarModelo ? `. ${textoModelagem}` : ''
      }`
    : 'Sem opções disponíveis'

  return (
    <fieldset className="flex w-full max-w-sm flex-col items-center gap-4 border-0 p-0">
      <legend className="sr-only">{legenda}</legend>
      <div
        aria-live="polite"
        aria-label={descricaoOpcaoAtual}
        className={classesAlvoToque({
          animacoes: false,
          destacado: emDestaqueVisual && ehResposta,
          className: `min-h-36 w-full px-6 py-6 ${classNameOpcao} ${
            mostrarModelo ? 'flex-col gap-2 text-center' : ''
          }`,
        })}
      >
        {opcaoAtual ? renderOpcao(opcaoAtual) : null}
        {mostrarModelo && <SeloModelagem />}
      </div>
      <span id={idDescricaoOpcaoMediada} className="sr-only">
        {descricaoOpcaoAtual}
      </span>

      <div className="grid w-full grid-cols-3 gap-3">
        <Botao
          type="button"
          variante="secundario"
          tamanho="medio"
          aria-keyshortcuts="ArrowLeft ArrowUp"
          onClick={() =>
            setIndiceAtual((atual) => indiceCircular(atual, opcoes.length, -1))
          }
          disabled={opcoes.length <= 1}
        >
          Anterior
        </Botao>
        <Botao
          type="button"
          tamanho="medio"
          aria-keyshortcuts="Enter Space"
          aria-describedby={opcaoAtual ? idDescricaoOpcaoMediada : undefined}
          onClick={() => {
            if (opcaoAtual) aoEscolher(opcaoAtual)
          }}
          disabled={!opcaoAtual}
        >
          Escolher
        </Botao>
        <Botao
          type="button"
          variante="secundario"
          tamanho="medio"
          aria-keyshortcuts="ArrowRight ArrowDown"
          onClick={() =>
            setIndiceAtual((atual) => indiceCircular(atual, opcoes.length, 1))
          }
          disabled={opcoes.length <= 1}
        >
          Próxima
        </Botao>
      </div>
    </fieldset>
  )
}
