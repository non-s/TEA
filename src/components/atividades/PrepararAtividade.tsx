import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Botao } from '../ui/Botao'
import {
  conteudoApoioPreferencial,
  type ApoioPreferencial,
} from '../../curriculo/apoioPreferencial'
import type { RegulacaoPreferencial } from '../../curriculo/perfilApoio'
import { RoteiroVisualAtividade } from './RoteiroVisualAtividade'

interface PrepararAtividadeProps {
  instrucao: string
  alvo?: ReactNode
  apoioMediador?: ReactNode
  rotuloAtividade?: string
  apoioPreferencial?: ApoioPreferencial
  regulacaoPreferencial?: RegulacaoPreferencial
  children: ReactNode
}

export function PrepararAtividade({
  instrucao,
  alvo,
  apoioMediador,
  rotuloAtividade,
  apoioPreferencial,
  regulacaoPreferencial,
  children,
}: PrepararAtividadeProps) {
  const [iniciada, setIniciada] = useState(false)
  const apoio = conteudoApoioPreferencial(apoioPreferencial)
  const instrucaoRef = useRef<HTMLParagraphElement>(null)
  const atividadeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (iniciada) {
      atividadeRef.current?.focus()
    } else {
      instrucaoRef.current?.focus()
    }
  }, [iniciada])

  if (iniciada) {
    return (
      <section className="flex w-full flex-col items-center gap-6">
        <RoteiroVisualAtividade
          etapaAtual="atividade"
          rotuloAtividade={rotuloAtividade ?? instrucao}
          apoioPreferencial={apoioPreferencial}
          regulacaoPreferencial={regulacaoPreferencial}
        />
        <section
          ref={atividadeRef}
          tabIndex={-1}
          aria-label="Atividade iniciada"
          className="focus:outline-none"
        >
          {children}
        </section>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="instrucao-preparacao"
      className="flex w-full max-w-md flex-col items-center gap-6 text-center"
    >
      <RoteiroVisualAtividade
        etapaAtual="preparar"
        rotuloAtividade={rotuloAtividade ?? instrucao}
        apoioPreferencial={apoioPreferencial}
        regulacaoPreferencial={regulacaoPreferencial}
      />

      <div className="flex w-full flex-col gap-3 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-5 shadow-[var(--sombra-cartao)]">
        <p className="text-sm font-medium uppercase text-[var(--cor-texto-suave)]">
          Agora
        </p>
        <p
          id="instrucao-preparacao"
          ref={instrucaoRef}
          tabIndex={-1}
          className="text-xl font-semibold text-[var(--cor-texto)] focus:outline-none"
        >
          {instrucao}
        </p>
        {alvo ? <div className="flex justify-center">{alvo}</div> : null}
      </div>

      <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
        {apoio.lembretePreparacao}
      </p>

      {apoioMediador}

      <div className="flex flex-wrap justify-center gap-3">
        <Botao type="button" onClick={() => setIniciada(true)}>
          Começar
        </Botao>
      </div>
    </section>
  )
}
