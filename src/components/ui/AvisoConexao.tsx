import {
  useAtualizacaoPWADisponivel,
  useEstaOffline,
} from '../../hooks/useConexao'
import { Botao } from './Botao'

// Banner calmo e informativo (nunca alarmista): o app já funciona offline
// via cache do Firestore + service worker, então "sem internet" não é um
// erro para a criança — só um aviso discreto para quem acompanha.
export function AvisoConexao() {
  const offline = useEstaOffline()
  const aplicarAtualizacao = useAtualizacaoPWADisponivel()

  if (!offline && !aplicarAtualizacao) return null

  return (
    <output
      aria-live="polite"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4"
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-3 text-sm text-[var(--cor-texto)] shadow-[var(--sombra-cartao)]">
        {offline ? (
          <span>
            Sem conexão agora. O app continua funcionando e as respostas serão
            salvas quando a internet voltar.
          </span>
        ) : (
          <>
            <span>Uma nova versão do TEA está disponível.</span>
            <Botao
              type="button"
              variante="secundario"
              tamanho="medio"
              onClick={aplicarAtualizacao ?? undefined}
            >
              Atualizar agora
            </Botao>
          </>
        )}
      </div>
    </output>
  )
}
