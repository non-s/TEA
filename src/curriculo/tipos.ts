export type TipoAtividade =
  | 'emparelhamento-identico'
  | 'emparelhamento-categoria'
  | 'nomeacao-receptiva'
  | 'nomeacao-expressiva'
  | 'tracado-letra'
  | 'formacao-silaba'
  | 'formacao-palavra'
  | 'montagem-palavra'
  | 'leitura-frase'
  | 'compreensao-frase'
  | 'compreensao-texto'
  | 'pergunta-literal-texto'
  | 'pergunta-presenca-texto'
  | 'pergunta-inferencia-texto'

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
  pergunta?: string
  respostaDeveAparecerNoTexto?: boolean
  /**
   * O estímulo que deve ser tocado entre as opções. Igual a `alvo` em
   * emparelhamento idêntico; diferente em emparelhamento por categoria
   * (ex: alvo "A" maiúsculo, resposta "a" minúsculo) e em nomeação
   * receptiva (alvo é só a instrução falada/escrita, sem imagem).
   */
  resposta: Estimulo
  distratores: Estimulo[]
  /**
   * Só usada em `montagem-palavra`: as sílabas certas, na ordem certa, que
   * a criança precisa tocar em sequência pra reconstruir a palavra em
   * `resposta`. `distratores` nessa atividade são sílabas erradas
   * misturadas no mesmo grupo de peças, não uma palavra inteira errada.
   */
  pecas?: Estimulo[]
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
