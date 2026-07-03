import type { Atividade, Estimulo } from './tipos'

export type InteresseEspecialId =
  | 'neutro'
  | 'animais'
  | 'veiculos'
  | 'casa'
  | 'musica'
  | 'comida'
  | 'brincar'
  | 'natureza'

export interface InteresseEspecial {
  id: InteresseEspecialId
  nome: string
  descricao: string
}

export const interessesEspeciais: InteresseEspecial[] = [
  {
    id: 'neutro',
    nome: 'Neutro',
    descricao: 'Usa as palavras de apoio padrão da trilha.',
  },
  {
    id: 'animais',
    nome: 'Animais',
    descricao: 'Aproxima sílabas de animais conhecidos.',
  },
  {
    id: 'veiculos',
    nome: 'Veículos',
    descricao: 'Aproxima sílabas de transportes e máquinas.',
  },
  {
    id: 'casa',
    nome: 'Casa',
    descricao: 'Aproxima sílabas de objetos e pessoas familiares.',
  },
  {
    id: 'musica',
    nome: 'Música',
    descricao: 'Aproxima sílabas de sons e instrumentos simples.',
  },
  {
    id: 'comida',
    nome: 'Comida',
    descricao: 'Aproxima sílabas de alimentos comuns no dia a dia.',
  },
  {
    id: 'brincar',
    nome: 'Brincar',
    descricao: 'Aproxima sílabas de brinquedos e materiais de brincar.',
  },
  {
    id: 'natureza',
    nome: 'Natureza',
    descricao: 'Aproxima sílabas de elementos naturais conhecidos.',
  },
]

export const interesseEspecialIds = interessesEspeciais.map(
  (interesse) => interesse.id,
) as InteresseEspecialId[]

const palavrasPorInteresse: Record<
  Exclude<InteresseEspecialId, 'neutro'>,
  Record<string, string>
> = {
  animais: {
    MA: 'macaco',
    PA: 'pato',
    TA: 'tatu',
    LA: 'lagarto',
    BA: 'baleia',
    ME: 'medusa',
    MI: 'mico',
    MO: 'morcego',
    MU: 'mula',
    PE: 'peixe',
    PI: 'pinguim',
    PO: 'polvo',
    PU: 'puma',
    TE: 'teiú',
    TI: 'tigre',
    TO: 'touro',
    TU: 'tucano',
    LE: 'leão',
    LI: 'lince',
    LO: 'lobo',
    LU: 'lula',
    BE: 'bezerro',
    BI: 'bicho',
    BO: 'bode',
    BU: 'burro',
  },
  veiculos: {
    MA: 'máquina',
    PA: 'patinete',
    TA: 'táxi',
    LA: 'lancha',
    BA: 'barco',
    ME: 'metrô',
    MI: 'micro-ônibus',
    MO: 'moto',
    PE: 'pedal',
    PI: 'pista',
    PO: 'porto',
    TE: 'teleférico',
    TU: 'tuk-tuk',
    LE: 'leme',
    LI: 'limusine',
    LO: 'locomotiva',
    BE: 'betoneira',
    BI: 'bicicleta',
    BO: 'bote',
    BU: 'bugue',
  },
  casa: {
    MA: 'mamãe',
    PA: 'papai',
    TA: 'tapete',
    LA: 'lata',
    BA: 'bacia',
    ME: 'mesa',
    MI: 'micro-ondas',
    MO: 'móvel',
    MU: 'muro',
    PE: 'pente',
    PI: 'pia',
    PO: 'porta',
    PU: 'puxador',
    TE: 'teto',
    TI: 'tigela',
    TO: 'torneira',
    TU: 'tubo',
    LE: 'lençol',
    LI: 'livro',
    LO: 'louça',
    LU: 'luz',
    BE: 'berço',
    BI: 'bidê',
    BO: 'botão',
    BU: 'bule',
  },
  musica: {
    MA: 'maraca',
    PA: 'pandeiro',
    TA: 'tambor',
    LA: 'lá lá lá',
    BA: 'bateria',
    ME: 'melodia',
    MI: 'microfone',
    MO: 'moda',
    MU: 'música',
    PE: 'percussão',
    PI: 'piano',
    PO: 'poesia',
    PU: 'pulsação',
    TE: 'teclado',
    TI: 'timbal',
    TO: 'tom',
    TU: 'tuba',
    LE: 'letra',
    LI: 'lira',
    LU: 'lundu',
    BE: 'berimbau',
    BO: 'bossa',
    BU: 'bumbo',
  },
  comida: {
    MA: 'maçã',
    PA: 'pastel',
    TA: 'tapioca',
    LA: 'laranja',
    BA: 'banana',
    ME: 'melancia',
    MI: 'milho',
    MO: 'morango',
    MU: 'musse',
    PE: 'pera',
    PI: 'pipoca',
    PO: 'polenta',
    PU: 'pudim',
    TE: 'tempero',
    TI: 'tilápia',
    TO: 'tomate',
    TU: 'tucupi',
    LE: 'leite',
    LI: 'limão',
    LO: 'lombo',
    LU: 'lula',
    BE: 'beterraba',
    BI: 'biscoito',
    BO: 'bolo',
    BU: 'buriti',
  },
  brincar: {
    MA: 'massinha',
    PA: 'patinete',
    TA: 'tabuleiro',
    LA: 'lápis',
    BA: 'balde',
    ME: 'memória',
    MI: 'miniatura',
    MO: 'montar',
    MU: 'música',
    PE: 'pega-pega',
    PI: 'pipa',
    PO: 'pote',
    PU: 'pular',
    TE: 'teatro',
    TI: 'tinta',
    TO: 'torre',
    TU: 'túnel',
    LE: 'leitura',
    LI: 'livro',
    LO: 'lousa',
    LU: 'luz',
    BE: 'bebê',
    BI: 'bicicleta',
    BO: 'bola',
    BU: 'bumerangue',
  },
  natureza: {
    MA: 'mar',
    PA: 'passarinho',
    TA: 'tartaruga',
    LA: 'lago',
    BA: 'baleia',
    ME: 'mel',
    MI: 'mineral',
    MO: 'montanha',
    MU: 'muda',
    PE: 'pedra',
    PI: 'pinha',
    PO: 'pôr do sol',
    PU: 'puma',
    TE: 'terra',
    TI: 'tigre',
    TO: 'toca',
    TU: 'tucano',
    LE: 'lenha',
    LI: 'lírio',
    LO: 'lobo',
    LU: 'lua',
    BE: 'beija-flor',
    BI: 'bicho',
    BO: 'bosque',
    BU: 'buriti',
  },
}

export function obterInteresseEspecial(
  interesseId: InteresseEspecialId,
): InteresseEspecial {
  return (
    interessesEspeciais.find((interesse) => interesse.id === interesseId) ??
    interessesEspeciais[0]
  )
}

export function exemplosInteresseEspecial(
  interesseId: InteresseEspecialId,
): string[] {
  if (interesseId === 'neutro') {
    return ['MA de mamãe', 'PA de papai']
  }

  return Object.entries(palavrasPorInteresse[interesseId])
    .slice(0, 2)
    .map(([silaba, palavra]) => `${silaba} de ${palavra}`)
}

export function palavraDeApoioPorInteresse(
  interesseId: InteresseEspecialId,
  silaba: string,
): string | null {
  if (interesseId === 'neutro') return null
  return palavrasPorInteresse[interesseId][silaba.toUpperCase()] ?? null
}

function personalizarEstimuloSilaba(
  estimulo: Estimulo,
  interesseId: InteresseEspecialId,
): Estimulo {
  if (interesseId === 'neutro') return estimulo

  const palavra = palavraDeApoioPorInteresse(interesseId, estimulo.rotulo)
  if (!palavra) return estimulo

  return {
    ...estimulo,
    audioTexto: `${estimulo.rotulo}, de ${palavra}`,
  }
}

export function personalizarAtividadePorInteresse(
  atividade: Atividade,
  interesseId: InteresseEspecialId = 'neutro',
): Atividade {
  if (atividade.tipo !== 'formacao-silaba' || interesseId === 'neutro') {
    return atividade
  }

  return {
    ...atividade,
    alvo: personalizarEstimuloSilaba(atividade.alvo, interesseId),
    resposta: personalizarEstimuloSilaba(atividade.resposta, interesseId),
    distratores: atividade.distratores.map((estimulo) =>
      personalizarEstimuloSilaba(estimulo, interesseId),
    ),
  }
}
