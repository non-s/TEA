import type { Atividade, Estimulo, Modulo, NivelDica, Trilha } from './tipos'
import { nomesIcones, type IconeId } from './ativos/tipos'

function estimulo(iconeId: IconeId): Estimulo {
  return {
    id: iconeId,
    rotulo: nomesIcones[iconeId],
    iconeId,
    audioTexto: nomesIcones[iconeId],
  }
}

const dicasPadrao: NivelDica[] = [
  {
    ordem: 0,
    tipo: 'modelagem',
    descricao: 'Mostrar/apontar o item igual ao alvo para a criança.',
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

function atividade(
  id: string,
  moduloId: string,
  nivelDificuldade: number,
  alvo: IconeId,
  distratores: IconeId[],
): Atividade {
  return {
    id,
    moduloId,
    tipo: 'emparelhamento-identico',
    nivelDificuldade,
    alvo: estimulo(alvo),
    distratores: distratores.map(estimulo),
    dicas: dicasPadrao,
    criteriosDominio: criteriosDominioPadrao,
  }
}

const modulo0: Modulo = {
  id: 'm0',
  titulo: 'Emparelhamento Idêntico',
  descricao:
    'Toque na figura igual à figura mostrada. Habilidade de discriminação visual, pré-requisito para o reconhecimento de letras.',
  ordem: 0,
  atividades: [
    atividade('m0-n1-a1', 'm0', 1, 'circulo', ['quadrado']),
    atividade('m0-n1-a2', 'm0', 1, 'estrela', ['coracao']),
    atividade('m0-n1-a3', 'm0', 1, 'lua', ['triangulo']),
    atividade('m0-n2-a1', 'm0', 2, 'quadrado', ['circulo', 'triangulo']),
    atividade('m0-n2-a2', 'm0', 2, 'coracao', ['estrela', 'lua']),
  ],
}

export const trilhaV1: Trilha = {
  versao: 'v1',
  modulos: [modulo0],
}

export function encontrarAtividade(atividadeId: string): Atividade | undefined {
  for (const modulo of trilhaV1.modulos) {
    const encontrada = modulo.atividades.find((a) => a.id === atividadeId)
    if (encontrada) return encontrada
  }
  return undefined
}
