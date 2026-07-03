import type { InteresseEspecialId } from './interesses'

export type CartaoComunicacaoId = 'pausa' | 'ajuda' | 'nao-sei' | 'pronto'

export interface CartaoComunicacao {
  id: CartaoComunicacaoId
  rotulo: string
  fala: string
  apoio: string
}

export interface MotivoInteresseComunicacao {
  simbolo: string
  rotulo: string
}

export const simbolosCartaoComunicacao: Record<CartaoComunicacaoId, string> = {
  pausa: 'II',
  ajuda: '+',
  'nao-sei': '?',
  pronto: 'OK',
}

export const motivosInteresseComunicacao: Partial<
  Record<InteresseEspecialId, MotivoInteresseComunicacao>
> = {
  animais: { simbolo: '🐾', rotulo: 'animais' },
  veiculos: { simbolo: '🚗', rotulo: 'veículos' },
  casa: { simbolo: '🏠', rotulo: 'casa' },
  musica: { simbolo: '♪', rotulo: 'música' },
  comida: { simbolo: '🍎', rotulo: 'comida' },
  brincar: { simbolo: '★', rotulo: 'brincar' },
  natureza: { simbolo: '🌿', rotulo: 'natureza' },
}

export function motivoComunicacaoPorInteresse(
  interesseId: InteresseEspecialId | undefined = 'neutro',
): MotivoInteresseComunicacao | null {
  return motivosInteresseComunicacao[interesseId] ?? null
}

export const cartoesComunicacaoPadrao: CartaoComunicacao[] = [
  {
    id: 'pausa',
    rotulo: 'Pausa',
    fala: 'Preciso de uma pausa.',
    apoio: 'Respirar, levantar ou voltar depois.',
  },
  {
    id: 'ajuda',
    rotulo: 'Ajuda',
    fala: 'Preciso de ajuda.',
    apoio: 'A próxima resposta terá ajuda visual.',
  },
  {
    id: 'nao-sei',
    rotulo: 'Não sei',
    fala: 'Eu não sei ainda.',
    apoio: 'Tudo bem. A próxima tentativa terá mais apoio.',
  },
  {
    id: 'pronto',
    rotulo: 'Pronto',
    fala: 'Estou pronto para continuar.',
    apoio: 'Continuar no meu ritmo.',
  },
]

const limites = {
  rotulo: 24,
  fala: 90,
  apoio: 140,
} satisfies Record<keyof Omit<CartaoComunicacao, 'id'>, number>

function limitarTexto(valor: unknown, limite: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, limite) : ''
}

export function normalizarCartoesComunicacao(
  cartoes: Partial<CartaoComunicacao>[] | undefined = [],
): CartaoComunicacao[] {
  return cartoesComunicacaoPadrao.map((padrao) => {
    const recebido = cartoes.find((cartao) => cartao.id === padrao.id)
    const rotulo = limitarTexto(recebido?.rotulo, limites.rotulo)
    const fala = limitarTexto(recebido?.fala, limites.fala)
    const apoio = limitarTexto(recebido?.apoio, limites.apoio)

    return {
      id: padrao.id,
      rotulo: rotulo || padrao.rotulo,
      fala: fala || padrao.fala,
      apoio: apoio || padrao.apoio,
    }
  })
}

export function atualizarCartaoComunicacao(
  cartoes: Partial<CartaoComunicacao>[] | undefined,
  id: CartaoComunicacaoId,
  campo: keyof Omit<CartaoComunicacao, 'id'>,
  valor: string,
): CartaoComunicacao[] {
  return normalizarCartoesComunicacao(cartoes).map((cartao) =>
    cartao.id === id
      ? {
          ...cartao,
          [campo]: valor,
        }
      : cartao,
  )
}
