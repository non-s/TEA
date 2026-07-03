import {
  normalizarCartoesComunicacao,
  type CartaoComunicacao,
} from './cartoesComunicacao'

export const comunicacoesPreferenciais = [
  'fala',
  'gestos',
  'figuras',
  'dispositivo',
  'emergente',
] as const

export const acessosPreferenciais = [
  'toque-direto',
  'toque-com-confirmacao',
  'toque-com-ajuda',
  'mouse-teclado',
  'escolha-mediada',
] as const

export const regulacoesPreferenciais = [
  'pausa',
  'ambiente-calmo',
  'movimento',
  'alternar',
] as const

export type ComunicacaoPreferencial = (typeof comunicacoesPreferenciais)[number]

export type AcessoPreferencial = (typeof acessosPreferenciais)[number]

export type RegulacaoPreferencial = (typeof regulacoesPreferenciais)[number]

export const LIMITE_OBSERVACOES_PERFIL_APOIO = 240
export const LIMITE_OBSERVACAO_MEDIADOR = 240
export const LIMITE_TEXTO_PLANO_REGULACAO = 140

export interface PlanoRegulacao {
  sinaisPausa: string
  estrategiasAjudam: string
  evitarDuranteSobrecarga: string
}

export interface PerfilApoio {
  comunicacaoPreferencial: ComunicacaoPreferencial
  acessoPreferencial: AcessoPreferencial
  regulacaoPreferencial: RegulacaoPreferencial
  limiteTentativasAntesPausa: number
  cartoesComunicacao: CartaoComunicacao[]
  planoRegulacao: PlanoRegulacao
  observacoes: string
}

export const planoRegulacaoPadrao: PlanoRegulacao = {
  sinaisPausa: '',
  estrategiasAjudam: '',
  evitarDuranteSobrecarga: '',
}

export const perfilApoioPadrao: PerfilApoio = {
  comunicacaoPreferencial: 'emergente',
  acessoPreferencial: 'toque-direto',
  regulacaoPreferencial: 'pausa',
  limiteTentativasAntesPausa: 6,
  cartoesComunicacao: normalizarCartoesComunicacao(),
  planoRegulacao: planoRegulacaoPadrao,
  observacoes: '',
}

function estaNaLista<T extends string>(
  valor: unknown,
  lista: readonly T[],
): valor is T {
  return (
    typeof valor === 'string' && (lista as readonly string[]).includes(valor)
  )
}

function limitarTexto(valor: unknown, limite: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, limite) : ''
}

function normalizarCartoesEntrada(
  valor: unknown,
): Partial<CartaoComunicacao>[] {
  if (!Array.isArray(valor)) return []

  return valor.filter(
    (cartao): cartao is Partial<CartaoComunicacao> =>
      !!cartao && typeof cartao === 'object',
  )
}

export function normalizarPlanoRegulacao(
  planoRegulacao: Partial<PlanoRegulacao> | undefined = {},
): PlanoRegulacao {
  const dados = planoRegulacao as Record<string, unknown>

  return {
    sinaisPausa: limitarTexto(dados.sinaisPausa, LIMITE_TEXTO_PLANO_REGULACAO),
    estrategiasAjudam: limitarTexto(
      dados.estrategiasAjudam,
      LIMITE_TEXTO_PLANO_REGULACAO,
    ),
    evitarDuranteSobrecarga: limitarTexto(
      dados.evitarDuranteSobrecarga,
      LIMITE_TEXTO_PLANO_REGULACAO,
    ),
  }
}

export function itensPlanoRegulacao(
  planoRegulacao: Partial<PlanoRegulacao> | undefined,
): Array<{ rotulo: string; texto: string }> {
  const plano = normalizarPlanoRegulacao(planoRegulacao)

  return [
    { rotulo: 'Sinal de pausa', texto: plano.sinaisPausa },
    { rotulo: 'Ajuda a regular', texto: plano.estrategiasAjudam },
    {
      rotulo: 'Evitar durante sobrecarga',
      texto: plano.evitarDuranteSobrecarga,
    },
  ].filter((item) => item.texto.trim())
}

export function normalizarPerfilApoio(
  perfilApoio: Partial<PerfilApoio> | undefined = {},
): PerfilApoio {
  const dados = perfilApoio as Record<string, unknown>
  const limiteRecebido = dados.limiteTentativasAntesPausa
  const limiteTentativasAntesPausa =
    typeof limiteRecebido === 'number' &&
    Number.isFinite(limiteRecebido) &&
    limiteRecebido >= 2
      ? Math.min(20, Math.round(limiteRecebido))
      : perfilApoioPadrao.limiteTentativasAntesPausa

  return {
    comunicacaoPreferencial: estaNaLista(
      dados.comunicacaoPreferencial,
      comunicacoesPreferenciais,
    )
      ? dados.comunicacaoPreferencial
      : perfilApoioPadrao.comunicacaoPreferencial,
    acessoPreferencial: estaNaLista(
      dados.acessoPreferencial,
      acessosPreferenciais,
    )
      ? dados.acessoPreferencial
      : perfilApoioPadrao.acessoPreferencial,
    regulacaoPreferencial: estaNaLista(
      dados.regulacaoPreferencial,
      regulacoesPreferenciais,
    )
      ? dados.regulacaoPreferencial
      : perfilApoioPadrao.regulacaoPreferencial,
    limiteTentativasAntesPausa,
    cartoesComunicacao: normalizarCartoesComunicacao(
      normalizarCartoesEntrada(dados.cartoesComunicacao),
    ),
    planoRegulacao: normalizarPlanoRegulacao(
      dados.planoRegulacao as Partial<PlanoRegulacao> | undefined,
    ),
    observacoes: limitarTexto(
      dados.observacoes,
      LIMITE_OBSERVACOES_PERFIL_APOIO,
    ),
  }
}

export const textoComunicacaoPreferencial: Record<
  ComunicacaoPreferencial,
  string
> = {
  fala: 'Fala oral',
  gestos: 'Gestos, olhar ou apontar',
  figuras: 'Figuras ou CAA em papel',
  dispositivo: 'CAA em tablet/dispositivo',
  emergente: 'Ainda emergente ou varia muito',
}

export const textoAcessoPreferencial: Record<AcessoPreferencial, string> = {
  'toque-direto': 'Toque direto na tela',
  'toque-com-confirmacao': 'Toque com confirmação antes de responder',
  'toque-com-ajuda': 'Toque com apoio do mediador',
  'mouse-teclado': 'Mouse ou teclado',
  'escolha-mediada': 'Escolha por olhar/gesto e mediador toca',
}

export const textoRegulacaoPreferencial: Record<RegulacaoPreferencial, string> =
  {
    pausa: 'Pausas combinadas',
    'ambiente-calmo': 'Ambiente mais calmo',
    movimento: 'Movimento antes/depois',
    alternar: 'Alternar tarefa e pausa',
  }

type ApoioPreferencial = 'visual' | 'verbal' | 'gestual' | 'pausa'

interface AjustesIniciaisPerfilApoio {
  preferenciasSensoriais: {
    som?: boolean
    animacoes?: boolean
    alvosMaiores?: boolean
  }
  planoIndividual: {
    apoioPreferencial: ApoioPreferencial
    observacaoMediador: string
  }
}

export function criarAjustesIniciaisPerfilApoio(
  perfilApoio: PerfilApoio,
): AjustesIniciaisPerfilApoio {
  const perfilNormalizado = normalizarPerfilApoio(perfilApoio)
  const alvosMaiores =
    perfilNormalizado.acessoPreferencial === 'toque-com-confirmacao' ||
    perfilNormalizado.acessoPreferencial === 'toque-com-ajuda' ||
    perfilNormalizado.acessoPreferencial === 'escolha-mediada'
  const ambienteCalmo =
    perfilNormalizado.regulacaoPreferencial === 'ambiente-calmo'

  return {
    preferenciasSensoriais: {
      alvosMaiores,
      ...(ambienteCalmo ? { som: false, animacoes: false } : {}),
    },
    planoIndividual: {
      apoioPreferencial: apoioParaPerfil(perfilNormalizado),
      observacaoMediador: descreverPerfilApoio(perfilNormalizado),
    },
  }
}

function apoioParaPerfil(perfilApoio: PerfilApoio): ApoioPreferencial {
  if (perfilApoio.regulacaoPreferencial === 'pausa') return 'pausa'

  if (perfilApoio.comunicacaoPreferencial === 'fala') return 'verbal'
  if (perfilApoio.comunicacaoPreferencial === 'gestos') return 'gestual'

  return 'visual'
}

export function descreverPerfilApoio(perfilApoio: PerfilApoio): string {
  const perfilNormalizado = normalizarPerfilApoio(perfilApoio)
  const observacoes = perfilNormalizado.observacoes.trim()

  return [
    `Comunicação: ${
      textoComunicacaoPreferencial[perfilNormalizado.comunicacaoPreferencial]
    }.`,
    `Acesso: ${textoAcessoPreferencial[perfilNormalizado.acessoPreferencial]}.`,
    `Regulação: ${
      textoRegulacaoPreferencial[perfilNormalizado.regulacaoPreferencial]
    }.`,
    `Pausa sugerida a cada ${perfilNormalizado.limiteTentativasAntesPausa} respostas.`,
    ...itensPlanoRegulacao(perfilNormalizado.planoRegulacao).map(
      (item) => `${item.rotulo}: ${item.texto}.`,
    ),
    observacoes ? `Observações: ${observacoes}` : '',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, LIMITE_OBSERVACAO_MEDIADOR)
}
