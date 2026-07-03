import { useState } from 'react'
import {
  motivoComunicacaoPorInteresse,
  normalizarCartoesComunicacao,
  simbolosCartaoComunicacao,
  type CartaoComunicacao,
} from '../../curriculo/cartoesComunicacao'
import type { InteresseEspecialId } from '../../curriculo/interesses'
import { useSpeech } from '../../hooks/useSpeech'

interface PainelComunicacaoProps {
  aoComunicar?: (mensagem: CartaoComunicacao) => void
  aoComunicarPronto?: () => void
  aoPedirAjuda?: () => void
  aoPedirPausa?: () => void
  cartoesComunicacao?: CartaoComunicacao[]
  interesseEspecialId?: InteresseEspecialId
}

export function PainelComunicacao({
  aoComunicar,
  aoComunicarPronto,
  aoPedirAjuda,
  aoPedirPausa,
  cartoesComunicacao,
  interesseEspecialId,
}: PainelComunicacaoProps) {
  const { falar } = useSpeech()
  const [mensagemAtiva, setMensagemAtiva] = useState<string | null>(null)
  const mensagens = normalizarCartoesComunicacao(cartoesComunicacao)
  const motivoInteresse = motivoComunicacaoPorInteresse(interesseEspecialId)

  return (
    <aside
      className="w-full rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-3 shadow-[var(--sombra-cartao)]"
      aria-label="Comunicação e regulação"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {mensagens.map((mensagem) => (
          <button
            key={mensagem.id}
            type="button"
            aria-label={`${mensagem.rotulo}. ${mensagem.fala}`}
            onClick={() => {
              setMensagemAtiva(mensagem.apoio)
              falar(mensagem.fala)
              aoComunicar?.(mensagem)
              if (mensagem.id === 'pausa') {
                aoPedirPausa?.()
              }
              if (mensagem.id === 'ajuda' || mensagem.id === 'nao-sei') {
                aoPedirAjuda?.()
              }
              if (mensagem.id === 'pronto') {
                aoComunicarPronto?.()
              }
            }}
            className="flex min-h-[var(--min-alvo-atividade)] flex-col items-center justify-center gap-1 rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-3 py-3 text-center text-[var(--cor-texto)] transition-colors hover:border-[var(--cor-primaria)] hover:bg-[var(--cor-primaria-clara)] motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cor-primaria-clara)] text-lg font-bold text-[var(--cor-primaria-escura)]"
            >
              {simbolosCartaoComunicacao[mensagem.id]}
              {motivoInteresse && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[var(--cor-fundo-alt)] bg-[var(--cor-fundo)] text-[0.7rem] leading-none shadow-sm">
                  {motivoInteresse.simbolo}
                </span>
              )}
            </span>
            <span className="text-base font-semibold">{mensagem.rotulo}</span>
            <span className="text-xs text-[var(--cor-texto-suave)]">
              {mensagem.fala}
            </span>
          </button>
        ))}
      </div>

      <p
        className="mt-3 min-h-6 text-center text-sm text-[var(--cor-texto-suave)]"
        aria-live="polite"
      >
        {mensagemAtiva ??
          'A criança pode comunicar necessidade sem precisar falar.'}
      </p>
    </aside>
  )
}
