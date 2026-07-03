import { Botao } from '../ui/Botao'
import type { RegulacaoPreferencial } from '../../curriculo/perfilApoio'

interface PausaSugeridaProps {
  tipo?: 'pausa' | 'encerrar'
  regulacaoPreferencial?: RegulacaoPreferencial
  aoEncerrar?: () => void
  aoPausar: () => void
  aoContinuar: () => void
}

const conteudoPorTipo = {
  pausa: {
    titulo: 'Pausa pode ajudar agora',
    texto: 'A atividade fica aqui. Pode pausar ou continuar no mesmo ritmo.',
  },
  encerrar: {
    titulo: 'Pode terminar por agora',
    texto:
      'A prática já foi longa. Pode ir para a trilha, pausar ou continuar.',
  },
}

const conteudoPausaPorRegulacao: Record<
  RegulacaoPreferencial,
  { titulo: string; texto: string; acao: string }
> = {
  pausa: {
    titulo: 'Pausa pode ajudar agora',
    texto: 'A atividade fica aqui. Pode pausar ou continuar no mesmo ritmo.',
    acao: 'Pausar',
  },
  'ambiente-calmo': {
    titulo: 'Ambiente calmo pode ajudar agora',
    texto:
      'A atividade fica aqui. Pode reduzir som, luz ou movimento antes de continuar.',
    acao: 'Acalmar',
  },
  movimento: {
    titulo: 'Movimento pode ajudar agora',
    texto:
      'A atividade fica aqui. Pode mover o corpo com seguranca ou continuar.',
    acao: 'Mover',
  },
  alternar: {
    titulo: 'Alternar pode ajudar agora',
    texto:
      'A atividade fica aqui. Pode fazer uma pausa curta e voltar para uma parte pequena.',
    acao: 'Alternar',
  },
}

export function PausaSugerida({
  tipo = 'pausa',
  regulacaoPreferencial,
  aoEncerrar,
  aoPausar,
  aoContinuar,
}: PausaSugeridaProps) {
  const conteudo =
    tipo === 'pausa' && regulacaoPreferencial
      ? conteudoPausaPorRegulacao[regulacaoPreferencial]
      : {
          ...conteudoPorTipo[tipo],
          acao: regulacaoPreferencial
            ? conteudoPausaPorRegulacao[regulacaoPreferencial].acao
            : 'Pausar',
        }

  return (
    <aside
      className="flex w-full max-w-md flex-col gap-3 rounded-2xl border-2 border-[var(--cor-primaria-clara)] bg-[var(--cor-fundo-alt)] p-4 text-center shadow-[var(--sombra-cartao)]"
      aria-live="polite"
    >
      <div>
        <p className="font-semibold text-[var(--cor-texto)]">
          {conteudo.titulo}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
          {conteudo.texto}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {tipo === 'encerrar' && aoEncerrar && (
          <Botao type="button" onClick={aoEncerrar}>
            Encerrar
          </Botao>
        )}
        <Botao type="button" onClick={aoPausar}>
          {conteudo.acao}
        </Botao>
        <Botao type="button" variante="secundario" onClick={aoContinuar}>
          Continuar
        </Botao>
      </div>
    </aside>
  )
}
