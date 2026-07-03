import type { PlanoIndividual } from '../firebase/perfis'
import type { RegulacaoPreferencial } from './perfilApoio'

export type ApoioPreferencial = PlanoIndividual['apoioPreferencial']

interface ConteudoApoioPreferencial {
  passosPreparacao: [string, string, string]
  lembretePreparacao: string
  textoPausa: string
  passosPausa: [string, string, string]
}

interface ConteudoRoteiroPausa {
  titulo: string
  detalhe: string
}

interface ConteudoAcordoPausa {
  agora: string
  depois: string
  acaoEstender: string
  mensagemEstender: string
}

const conteudos: Record<ApoioPreferencial, ConteudoApoioPreferencial> = {
  visual: {
    passosPreparacao: ['Ver', 'Tocar', 'Continuar'],
    lembretePreparacao: 'Olhe para o modelo. A resposta pode ser tocada.',
    textoPausa: 'Respire, mova o corpo ou espere. A atividade fica aqui.',
    passosPausa: ['Respirar', 'Esperar', 'Voltar'],
  },
  verbal: {
    passosPreparacao: ['Ouvir', 'Tocar', 'Continuar'],
    lembretePreparacao: 'Use uma fala curta. Pode ouvir a instrucao de novo.',
    textoPausa: 'A pausa pode ser combinada com poucas palavras.',
    passosPausa: ['Ouvir', 'Respirar', 'Voltar'],
  },
  gestual: {
    passosPreparacao: ['Ver modelo', 'Tocar', 'Continuar'],
    lembretePreparacao: 'O adulto pode apontar ou mostrar uma vez.',
    textoPausa: 'Use gesto, apontar ou modelo simples para voltar ao corpo.',
    passosPausa: ['Apontar', 'Esperar', 'Voltar'],
  },
  pausa: {
    passosPreparacao: ['Ver', 'Pausar', 'Continuar'],
    lembretePreparacao:
      'A pausa esta combinada. Pode pedir pausa antes de cansar.',
    textoPausa:
      'Esta pausa faz parte da atividade. Volte quando o corpo estiver pronto.',
    passosPausa: ['Pausar', 'Respirar', 'Escolher'],
  },
}

const pausaPorRegulacao: Record<
  RegulacaoPreferencial,
  Pick<ConteudoApoioPreferencial, 'textoPausa' | 'passosPausa'>
> = {
  pausa: {
    textoPausa:
      'Esta pausa faz parte da atividade. Volte quando o corpo estiver pronto.',
    passosPausa: ['Pausar', 'Respirar', 'Escolher'],
  },
  'ambiente-calmo': {
    textoPausa:
      'Deixe o ambiente mais calmo. Reduza som, luz ou movimento antes de voltar.',
    passosPausa: ['Reduzir', 'Respirar', 'Voltar'],
  },
  movimento: {
    textoPausa:
      'Pode mover o corpo com seguranca. Alongar, levantar ou apertar as maos pode ajudar.',
    passosPausa: ['Mover', 'Respirar', 'Voltar'],
  },
  alternar: {
    textoPausa:
      'Pode alternar: uma pausa curta, depois voltar para uma parte pequena da atividade.',
    passosPausa: ['Pausar', 'Escolher', 'Voltar'],
  },
}

const roteiroPausaPorRegulacao: Record<
  RegulacaoPreferencial,
  ConteudoRoteiroPausa
> = {
  pausa: { titulo: 'Pode pedir', detalhe: 'Combinada' },
  'ambiente-calmo': { titulo: 'Pode acalmar', detalhe: 'Ambiente calmo' },
  movimento: { titulo: 'Pode mover', detalhe: 'Movimento' },
  alternar: { titulo: 'Pode alternar', detalhe: 'Tarefa e pausa' },
}

const acordoPausaPadrao: ConteudoAcordoPausa = {
  agora: 'Pausa combinada',
  depois: 'Voltar para uma parte pequena',
  acaoEstender: 'Mais pausa',
  mensagemEstender:
    'Tudo bem. A pausa continua. Volte só quando o corpo estiver pronto.',
}

const acordoPausaPorRegulacao: Record<
  RegulacaoPreferencial,
  ConteudoAcordoPausa
> = {
  pausa: acordoPausaPadrao,
  'ambiente-calmo': {
    agora: 'Reduzir som, luz ou movimento',
    depois: 'Voltar quando o ambiente estiver calmo',
    acaoEstender: 'Mais calma',
    mensagemEstender:
      'Tudo bem. O ambiente pode ficar mais calmo antes de voltar.',
  },
  movimento: {
    agora: 'Mover o corpo com segurança',
    depois: 'Voltar para uma parte pequena',
    acaoEstender: 'Mais movimento',
    mensagemEstender:
      'Tudo bem. Pode mover mais um pouco e voltar quando estiver pronto.',
  },
  alternar: {
    agora: 'Pausa curta',
    depois: 'Voltar para uma parte pequena',
    acaoEstender: 'Mais pausa',
    mensagemEstender: 'Tudo bem. Pode alternar mais uma pausa antes de voltar.',
  },
}

export function conteudoApoioPreferencial(
  apoioPreferencial: ApoioPreferencial | undefined,
): ConteudoApoioPreferencial {
  return conteudos[apoioPreferencial ?? 'visual']
}

export function conteudoPausaPreferencial(
  apoioPreferencial: ApoioPreferencial | undefined,
  regulacaoPreferencial: RegulacaoPreferencial | undefined,
): Pick<ConteudoApoioPreferencial, 'textoPausa' | 'passosPausa'> {
  if (regulacaoPreferencial) return pausaPorRegulacao[regulacaoPreferencial]

  return conteudoApoioPreferencial(apoioPreferencial)
}

export function conteudoRoteiroPausa(
  apoioPreferencial: ApoioPreferencial | undefined,
  regulacaoPreferencial: RegulacaoPreferencial | undefined,
): ConteudoRoteiroPausa {
  if (regulacaoPreferencial) {
    return roteiroPausaPorRegulacao[regulacaoPreferencial]
  }

  return {
    titulo: 'Pode pedir',
    detalhe: apoioPreferencial === 'pausa' ? 'Combinada' : 'Disponível',
  }
}

export function conteudoAcordoPausa(
  apoioPreferencial: ApoioPreferencial | undefined,
  regulacaoPreferencial: RegulacaoPreferencial | undefined,
): ConteudoAcordoPausa {
  if (regulacaoPreferencial) {
    return acordoPausaPorRegulacao[regulacaoPreferencial]
  }

  if (apoioPreferencial === 'pausa') {
    return acordoPausaPadrao
  }

  return {
    ...acordoPausaPadrao,
    agora: 'Pausa disponível',
  }
}
