import type { Atividade, Estimulo, Modulo, NivelDica, Trilha } from './tipos'
import { iconeLetra, nomesIcones, type FormaIconeId } from './ativos/tipos'

function estimuloForma(iconeId: FormaIconeId): Estimulo {
  return {
    id: iconeId,
    rotulo: nomesIcones[iconeId],
    iconeId,
    audioTexto: nomesIcones[iconeId],
  }
}

function estimuloLetra(
  idUnico: string,
  caractere: string,
  rotulo: string,
): Estimulo {
  return {
    id: idUnico,
    rotulo,
    iconeId: iconeLetra(caractere),
    audioTexto: rotulo,
  }
}

const dicasPadrao: NivelDica[] = [
  {
    ordem: 0,
    tipo: 'modelagem',
    descricao: 'Mostrar/apontar o item correto para a criança.',
  },
  {
    ordem: 1,
    tipo: 'destaque-visual',
    descricao: 'Destacar levemente a opção correta (leve brilho na borda).',
  },
  {
    ordem: 2,
    tipo: 'nenhuma',
    descricao: 'Sem dica — resposta de forma independente.',
  },
]

const criteriosDominioPadrao = {
  acertosConsecutivosNecessarios: 8,
  janelaTentativas: 10,
}

function construirAtividade(
  id: string,
  moduloId: string,
  tipo: Atividade['tipo'],
  nivelDificuldade: number,
  alvo: Estimulo,
  resposta: Estimulo,
  distratores: Estimulo[],
): Atividade {
  return {
    id,
    moduloId,
    tipo,
    nivelDificuldade,
    alvo,
    resposta,
    distratores,
    dicas: dicasPadrao,
    criteriosDominio: criteriosDominioPadrao,
  }
}

function atividadeEmparelhamentoIdentico(
  id: string,
  moduloId: string,
  nivelDificuldade: number,
  alvo: FormaIconeId,
  distratores: FormaIconeId[],
): Atividade {
  const estimuloAlvo = estimuloForma(alvo)
  return construirAtividade(
    id,
    moduloId,
    'emparelhamento-identico',
    nivelDificuldade,
    estimuloAlvo,
    estimuloAlvo,
    distratores.map(estimuloForma),
  )
}

const modulo0: Modulo = {
  id: 'm0',
  titulo: 'Emparelhamento Idêntico',
  descricao:
    'Toque na figura igual à figura mostrada. Habilidade de discriminação visual, pré-requisito para o reconhecimento de letras.',
  ordem: 0,
  atividades: [
    atividadeEmparelhamentoIdentico('m0-n1-a1', 'm0', 1, 'circulo', [
      'quadrado',
    ]),
    atividadeEmparelhamentoIdentico('m0-n1-a2', 'm0', 1, 'estrela', [
      'coracao',
    ]),
    atividadeEmparelhamentoIdentico('m0-n1-a3', 'm0', 1, 'lua', ['triangulo']),
    atividadeEmparelhamentoIdentico('m0-n2-a1', 'm0', 2, 'quadrado', [
      'circulo',
      'triangulo',
    ]),
    atividadeEmparelhamentoIdentico('m0-n2-a2', 'm0', 2, 'coracao', [
      'estrela',
      'lua',
    ]),
  ],
}

interface Vogal {
  maiuscula: string
  minuscula: string
  som: string
}

const vogais: Vogal[] = [
  { maiuscula: 'A', minuscula: 'a', som: 'á' },
  { maiuscula: 'E', minuscula: 'e', som: 'é' },
  { maiuscula: 'I', minuscula: 'i', som: 'i' },
  { maiuscula: 'O', minuscula: 'o', som: 'ó' },
  { maiuscula: 'U', minuscula: 'u', som: 'u' },
]

function atividadeCategoriaVogal(
  vogal: Vogal,
  distratores: Vogal[],
): Atividade {
  const alvo = estimuloLetra(
    `letra-${vogal.maiuscula}-maiuscula`,
    vogal.maiuscula,
    `letra maiúscula ${vogal.som}`,
  )
  const resposta = estimuloLetra(
    `letra-${vogal.minuscula}-minuscula`,
    vogal.minuscula,
    `letra minúscula ${vogal.som}`,
  )
  return construirAtividade(
    `m1-${vogal.maiuscula}`,
    'm1',
    'emparelhamento-categoria',
    1,
    alvo,
    resposta,
    distratores.map((d) =>
      estimuloLetra(
        `letra-${d.minuscula}-minuscula-distrator-${vogal.maiuscula}`,
        d.minuscula,
        `letra minúscula ${d.som}`,
      ),
    ),
  )
}

const modulo1: Modulo = {
  id: 'm1',
  titulo: 'Maiúscula e Minúscula',
  descricao:
    'Toque na letra minúscula que corresponde à letra maiúscula mostrada. Generalização de identidade, base para o reconhecimento de letras em qualquer formato.',
  ordem: 1,
  preRequisitoModuloId: 'm0',
  atividades: vogais.map((vogal, indice) =>
    atividadeCategoriaVogal(vogal, [
      vogais[(indice + 1) % vogais.length],
      vogais[(indice + 2) % vogais.length],
    ]),
  ),
}

interface LetraNomeacao {
  caractere: string
  som: string
}

const letrasModulo2: LetraNomeacao[] = [
  { caractere: 'A', som: 'á' },
  { caractere: 'E', som: 'é' },
  { caractere: 'I', som: 'i' },
  { caractere: 'O', som: 'ó' },
  { caractere: 'U', som: 'u' },
  { caractere: 'M', som: 'eme' },
  { caractere: 'P', som: 'pê' },
  { caractere: 'T', som: 'tê' },
  { caractere: 'L', som: 'ele' },
  { caractere: 'B', som: 'bê' },
]

function atividadeNomeacaoReceptiva(
  letra: LetraNomeacao,
  distratores: LetraNomeacao[],
): Atividade {
  const estimuloAlvo = estimuloLetra(
    `letra-${letra.caractere}-nomeacao`,
    letra.caractere,
    letra.som,
  )
  return construirAtividade(
    `m2-${letra.caractere}`,
    'm2',
    'nomeacao-receptiva',
    1,
    estimuloAlvo,
    estimuloAlvo,
    distratores.map((d) =>
      estimuloLetra(
        `letra-${d.caractere}-distrator-${letra.caractere}`,
        d.caractere,
        d.som,
      ),
    ),
  )
}

const modulo2: Modulo = {
  id: 'm2',
  titulo: 'Nomeação Receptiva de Letras',
  descricao:
    'Toque na letra que tem o nome/som falado. Vogais primeiro, depois consoantes de alta frequência (M, P, T, L, B).',
  ordem: 2,
  preRequisitoModuloId: 'm1',
  atividades: letrasModulo2.map((letra, indice) =>
    atividadeNomeacaoReceptiva(letra, [
      letrasModulo2[(indice + 1) % letrasModulo2.length],
      letrasModulo2[(indice + 3) % letrasModulo2.length],
    ]),
  ),
}

export const trilhaV1: Trilha = {
  versao: 'v1',
  modulos: [modulo0, modulo1, modulo2],
}

export function encontrarAtividade(atividadeId: string): Atividade | undefined {
  for (const modulo of trilhaV1.modulos) {
    const encontrada = modulo.atividades.find((a) => a.id === atividadeId)
    if (encontrada) return encontrada
  }
  return undefined
}
