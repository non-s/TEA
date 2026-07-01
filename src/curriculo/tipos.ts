export type TipoAtividade =
  | 'emparelhamento-identico'
  | 'emparelhamento-categoria'
  | 'nomeacao-receptiva'
  | 'nomeacao-expressiva'
  | 'formacao-silaba'

export interface NivelDica {
  ordem: number
  tipo: 'modelagem' | 'destaque-visual' | 'dica-verbal' | 'nenhuma'
  descricao: string
}

export interface Estimulo {
  id: string
  rotulo: string
  iconeId: string
  audioTexto?: string
}

export interface Atividade {
  id: string
  moduloId: string
  tipo: TipoAtividade
  nivelDificuldade: number
  /** O estímulo mostrado/falado como amostra ou instrução. */
  alvo: Estimulo
  /**
   * O estímulo que deve ser tocado entre as opções. Igual a `alvo` em
   * emparelhamento idêntico; diferente em emparelhamento por categoria
   * (ex: alvo "A" maiúsculo, resposta "a" minúsculo) e em nomeação
   * receptiva (alvo é só a instrução falada/escrita, sem imagem).
   */
  resposta: Estimulo
  distratores: Estimulo[]
  dicas: NivelDica[]
  criteriosDominio: {
    acertosConsecutivosNecessarios: number
    janelaTentativas: number
  }
}

export interface Modulo {
  id: string
  titulo: string
  descricao: string
  ordem: number
  preRequisitoModuloId?: string
  atividades: Atividade[]
}

export interface Trilha {
  versao: string
  modulos: Modulo[]
}

export type ResultadoTentativa = 'correto' | 'incorreto'

export interface Tentativa {
  atividadeId: string
  moduloId: string
  timestamp: number
  resultado: ResultadoTentativa
  nivelDicaUsado: number
  tempoRespostaMs: number
}
