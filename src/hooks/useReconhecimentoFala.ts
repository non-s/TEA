import { useCallback, useEffect, useRef, useState } from 'react'

// A Web Speech API (SpeechRecognition) não faz parte do lib.dom.d.ts do
// TypeScript — é uma API não padronizada, só com suporte real em
// navegadores baseados em Chromium. Estes tipos cobrem só o que este hook
// usa.
interface EventoResultadoFala extends Event {
  results: {
    [indice: number]: { [indice: number]: { transcript: string } }
    length: number
  }
}

interface EventoErroFala extends Event {
  error: string
}

interface ReconhecimentoFalaLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onresult: ((evento: EventoResultadoFala) => void) | null
  onerror: ((evento: EventoErroFala) => void) | null
  onend: (() => void) | null
}

interface JanelaComReconhecimentoFala {
  SpeechRecognition?: new () => ReconhecimentoFalaLike
  webkitSpeechRecognition?: new () => ReconhecimentoFalaLike
}

function construtorDisponivel(): (new () => ReconhecimentoFalaLike) | null {
  if (typeof window === 'undefined') return null
  const janela = window as unknown as JanelaComReconhecimentoFala
  return janela.SpeechRecognition ?? janela.webkitSpeechRecognition ?? null
}

export function reconhecimentoFalaDisponivel(): boolean {
  return construtorDisponivel() !== null
}

/**
 * Encapsula o reconhecimento de fala em pt-BR para uma única resposta por
 * vez (não fica escutando continuamente). `aoResultado` é chamado uma vez
 * por transcrição — este hook não sabe nada sobre atividades ou respostas
 * certas/erradas, e não exige que quem chama monte um useEffect para
 * observar um valor (o callback mais recente é sempre usado, sem precisar
 * memoizar nada na tela que consome o hook).
 */
export function useReconhecimentoFala(aoResultado?: (texto: string) => void) {
  const [ouvindo, setOuvindo] = useState(false)
  const [transcricao, setTranscricao] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const reconhecimentoRef = useRef<ReconhecimentoFalaLike | null>(null)
  const aoResultadoRef = useRef(aoResultado)
  aoResultadoRef.current = aoResultado

  useEffect(() => {
    return () => {
      reconhecimentoRef.current?.stop()
    }
  }, [])

  const iniciarEscuta = useCallback(() => {
    const Construtor = construtorDisponivel()
    if (!Construtor) {
      setErro('Reconhecimento de fala não está disponível neste navegador.')
      return
    }

    setErro(null)
    setTranscricao(null)

    const reconhecimento = new Construtor()
    reconhecimento.lang = 'pt-BR'
    reconhecimento.continuous = false
    reconhecimento.interimResults = false
    reconhecimento.maxAlternatives = 1

    reconhecimento.onresult = (evento) => {
      const texto = evento.results[0]?.[0]?.transcript ?? ''
      setTranscricao(texto)
      aoResultadoRef.current?.(texto)
    }
    reconhecimento.onerror = (evento) => {
      setErro(
        evento.error === 'not-allowed' || evento.error === 'permission-denied'
          ? 'Permita o uso do microfone para responder por voz.'
          : 'Não foi possível ouvir agora. Pode tentar de novo ou tocar na opção.',
      )
      setOuvindo(false)
    }
    reconhecimento.onend = () => {
      setOuvindo(false)
    }

    reconhecimentoRef.current = reconhecimento
    setOuvindo(true)
    reconhecimento.start()
  }, [])

  const pararEscuta = useCallback(() => {
    reconhecimentoRef.current?.stop()
  }, [])

  return {
    disponivel: construtorDisponivel() !== null,
    ouvindo,
    transcricao,
    erro,
    iniciarEscuta,
    pararEscuta,
  }
}
