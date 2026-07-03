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
  pergunta?: string,
  respostaDeveAparecerNoTexto?: boolean,
): Atividade {
  return {
    id,
    moduloId,
    tipo,
    nivelDificuldade,
    alvo,
    pergunta,
    ...(respostaDeveAparecerNoTexto === undefined
      ? {}
      : { respostaDeveAparecerNoTexto }),
    resposta,
    distratores,
    dicas: dicasPadrao,
    criteriosDominio: criteriosDominioPadrao,
  }
}

function slugAtividade(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-|-$/g, '')
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

function atividadeNomeacaoExpressiva(
  letra: LetraNomeacao,
  distratores: LetraNomeacao[],
): Atividade {
  const alvo = estimuloLetra(
    `letra-${letra.caractere}-expressiva-alvo`,
    letra.caractere,
    letra.som,
  )
  const resposta = estimuloLetra(
    `letra-${letra.caractere}-expressiva-resposta`,
    letra.caractere,
    letra.som,
  )
  return construirAtividade(
    `m3-${letra.caractere}`,
    'm3',
    'nomeacao-expressiva',
    1,
    alvo,
    resposta,
    distratores.map((d) =>
      estimuloLetra(
        `letra-${d.caractere}-expressiva-distrator-${letra.caractere}`,
        d.caractere,
        d.som,
      ),
    ),
  )
}

const modulo3: Modulo = {
  id: 'm3',
  titulo: 'Nomeação Expressiva de Letras',
  descricao:
    'A letra aparece na tela — toque no nome dela entre as opções. A criança passa a produzir a resposta em vez de só localizar.',
  ordem: 3,
  preRequisitoModuloId: 'm2',
  atividades: letrasModulo2.map((letra, indice) =>
    atividadeNomeacaoExpressiva(letra, [
      letrasModulo2[(indice + 1) % letrasModulo2.length],
      letrasModulo2[(indice + 3) % letrasModulo2.length],
    ]),
  ),
}

interface Silaba {
  caractere: string
  palavraApoio: string
}

const silabasModulo4: Silaba[] = [
  { caractere: 'MA', palavraApoio: 'mamãe' },
  { caractere: 'ME', palavraApoio: 'meia' },
  { caractere: 'MI', palavraApoio: 'milho' },
  { caractere: 'MO', palavraApoio: 'moto' },
  { caractere: 'MU', palavraApoio: 'música' },
  { caractere: 'PA', palavraApoio: 'papai' },
  { caractere: 'PE', palavraApoio: 'pé' },
  { caractere: 'PI', palavraApoio: 'pipa' },
  { caractere: 'PO', palavraApoio: 'pote' },
  { caractere: 'PU', palavraApoio: 'pulo' },
  { caractere: 'TA', palavraApoio: 'tatu' },
  { caractere: 'TE', palavraApoio: 'tela' },
  { caractere: 'TI', palavraApoio: 'tigre' },
  { caractere: 'TO', palavraApoio: 'tomate' },
  { caractere: 'TU', palavraApoio: 'tucano' },
  { caractere: 'LA', palavraApoio: 'lata' },
  { caractere: 'LE', palavraApoio: 'leite' },
  { caractere: 'LI', palavraApoio: 'livro' },
  { caractere: 'LO', palavraApoio: 'lobo' },
  { caractere: 'LU', palavraApoio: 'lua' },
  { caractere: 'BA', palavraApoio: 'bala' },
  { caractere: 'BE', palavraApoio: 'bebê' },
  { caractere: 'BI', palavraApoio: 'bicicleta' },
  { caractere: 'BO', palavraApoio: 'bola' },
  { caractere: 'BU', palavraApoio: 'bule' },
]

function estimuloSilaba(idUnico: string, silaba: Silaba): Estimulo {
  return {
    id: idUnico,
    rotulo: silaba.caractere,
    iconeId: iconeLetra(silaba.caractere),
    audioTexto: `${silaba.caractere}, de ${silaba.palavraApoio}`,
  }
}

function atividadeFormacaoSilaba(
  silaba: Silaba,
  distratores: Silaba[],
): Atividade {
  const estimuloAlvo = estimuloSilaba(`silaba-${silaba.caractere}`, silaba)
  return construirAtividade(
    `m4-${silaba.caractere}`,
    'm4',
    'formacao-silaba',
    1,
    estimuloAlvo,
    estimuloAlvo,
    distratores.map((d) =>
      estimuloSilaba(`silaba-${d.caractere}-distrator-${silaba.caractere}`, d),
    ),
  )
}

const modulo4: Modulo = {
  id: 'm4',
  titulo: 'Formação de Sílabas',
  descricao:
    'Toque na sílaba falada, sempre associada a uma palavra conhecida (ex: "MA, de mamãe"). Consciência fonológica com apoio de vocabulário familiar.',
  ordem: 4,
  preRequisitoModuloId: 'm3',
  atividades: silabasModulo4.map((silaba, indice) =>
    atividadeFormacaoSilaba(silaba, [
      silabasModulo4[(indice + 1) % silabasModulo4.length],
      silabasModulo4[(indice + 2) % silabasModulo4.length],
    ]),
  ),
}

interface Palavra {
  texto: string
  silabas: string
  artigo: 'A' | 'O'
  fala?: string
}

const palavrasModulo5: Palavra[] = [
  { texto: 'MALA', silabas: 'MA-LA', artigo: 'A' },
  { texto: 'PATA', silabas: 'PA-TA', artigo: 'A' },
  { texto: 'BALA', silabas: 'BA-LA', artigo: 'A' },
  { texto: 'LATA', silabas: 'LA-TA', artigo: 'A' },
  { texto: 'PAPA', silabas: 'PA-PA', artigo: 'A' },
  { texto: 'MAPA', silabas: 'MA-PA', artigo: 'O' },
  { texto: 'LAMA', silabas: 'LA-MA', artigo: 'A' },
  { texto: 'BABA', silabas: 'BA-BA', artigo: 'A' },
  { texto: 'MOTO', silabas: 'MO-TO', artigo: 'A' },
  { texto: 'MULA', silabas: 'MU-LA', artigo: 'A' },
  { texto: 'PIPA', silabas: 'PI-PA', artigo: 'A' },
  { texto: 'POTE', silabas: 'PO-TE', artigo: 'O' },
  { texto: 'PATO', silabas: 'PA-TO', artigo: 'O' },
  { texto: 'TETO', silabas: 'TE-TO', artigo: 'O' },
  { texto: 'TATU', silabas: 'TA-TU', artigo: 'O' },
  { texto: 'BOLA', silabas: 'BO-LA', artigo: 'A' },
  { texto: 'BOLO', silabas: 'BO-LO', artigo: 'O' },
  { texto: 'BULE', silabas: 'BU-LE', artigo: 'O' },
  { texto: 'LUPA', silabas: 'LU-PA', artigo: 'A' },
  { texto: 'LOBO', silabas: 'LO-BO', artigo: 'O' },
  { texto: 'BEBE', silabas: 'BE-BE', artigo: 'O', fala: 'bebê' },
  { texto: 'TUBO', silabas: 'TU-BO', artigo: 'O' },
]

function estimuloPalavra(idUnico: string, palavra: Palavra): Estimulo {
  return {
    id: idUnico,
    rotulo: palavra.texto,
    iconeId: iconeLetra(palavra.texto),
    audioTexto: `${palavra.silabas}, ${palavra.texto}`,
  }
}

function atividadeFormacaoPalavra(
  palavra: Palavra,
  distratores: Palavra[],
): Atividade {
  const estimuloAlvo = estimuloPalavra(`palavra-${palavra.texto}`, palavra)
  return construirAtividade(
    `m5-${palavra.texto}`,
    'm5',
    'formacao-palavra',
    1,
    estimuloAlvo,
    estimuloAlvo,
    distratores.map((d) =>
      estimuloPalavra(`palavra-${d.texto}-distrator-${palavra.texto}`, d),
    ),
  )
}

const modulo5: Modulo = {
  id: 'm5',
  titulo: 'Formação de Palavras',
  descricao:
    'Toque na palavra formada por duas sílabas conhecidas. Ponte inicial entre consciência silábica e leitura de palavras simples.',
  ordem: 5,
  preRequisitoModuloId: 'm4',
  atividades: palavrasModulo5.map((palavra, indice) =>
    atividadeFormacaoPalavra(palavra, [
      palavrasModulo5[(indice + 1) % palavrasModulo5.length],
      palavrasModulo5[(indice + 2) % palavrasModulo5.length],
    ]),
  ),
}

interface Frase {
  texto: string
  audioTexto: string
}

function textoFrasePalavra(palavra: Palavra): string {
  return `${palavra.artigo} ${palavra.texto}`
}

function audioFrasePalavra(palavra: Palavra): string {
  return `${palavra.artigo} ${palavra.fala ?? palavra.texto.toLowerCase()}`
}

function fraseParaPalavra(palavra: Palavra): Frase {
  return {
    texto: textoFrasePalavra(palavra),
    audioTexto: audioFrasePalavra(palavra),
  }
}

const frasesModulo6: Frase[] = palavrasModulo5.map(fraseParaPalavra)

function estimuloFrase(idUnico: string, frase: Frase): Estimulo {
  return {
    id: idUnico,
    rotulo: frase.texto,
    iconeId: iconeLetra('A'),
    audioTexto: frase.audioTexto,
  }
}

function atividadeLeituraFrase(frase: Frase, distratores: Frase[]): Atividade {
  const estimuloAlvo = estimuloFrase(`frase-${frase.texto}`, frase)
  return construirAtividade(
    `m6-${frase.texto.replace(/\s+/g, '-')}`,
    'm6',
    'leitura-frase',
    1,
    estimuloAlvo,
    estimuloAlvo,
    distratores.map((d) =>
      estimuloFrase(`frase-${d.texto}-distrator-${frase.texto}`, d),
    ),
  )
}

const modulo6: Modulo = {
  id: 'm6',
  titulo: 'Leitura de Frases Simples',
  descricao:
    'Toque na frase curta falada/lida. Introduz leitura de frase com palavras e sílabas já praticadas, sem exigir fala oral.',
  ordem: 6,
  preRequisitoModuloId: 'm5',
  atividades: frasesModulo6.map((frase, indice) =>
    atividadeLeituraFrase(frase, [
      frasesModulo6[(indice + 1) % frasesModulo6.length],
      frasesModulo6[(indice + 2) % frasesModulo6.length],
    ]),
  ),
}

interface FraseCompreensao extends Frase {
  palavraResposta: Palavra
}

const frasesModulo7: FraseCompreensao[] = palavrasModulo5.map((palavra) => ({
  ...fraseParaPalavra(palavra),
  palavraResposta: palavra,
}))

function atividadeCompreensaoFrase(
  frase: FraseCompreensao,
  distratores: Palavra[],
): Atividade {
  const sufixoId = frase.texto.replace(/\s+/g, '-')
  const estimuloAlvo = estimuloFrase(`compreensao-frase-${sufixoId}`, frase)
  const resposta = estimuloPalavra(
    `compreensao-palavra-${frase.palavraResposta.texto}`,
    frase.palavraResposta,
  )

  return construirAtividade(
    `m7-${sufixoId}`,
    'm7',
    'compreensao-frase',
    1,
    estimuloAlvo,
    resposta,
    distratores.map((d) =>
      estimuloPalavra(
        `compreensao-palavra-${d.texto}-distrator-${sufixoId}`,
        d,
      ),
    ),
  )
}

function distratoresParaPalavra(palavraResposta: Palavra): Palavra[] {
  const indiceResposta = palavrasModulo5.findIndex(
    (palavra) => palavra.texto === palavraResposta.texto,
  )
  const indiceSeguro = indiceResposta >= 0 ? indiceResposta : 0

  return [
    palavrasModulo5[(indiceSeguro + 1) % palavrasModulo5.length],
    palavrasModulo5[(indiceSeguro + 2) % palavrasModulo5.length],
  ]
}

const modulo7: Modulo = {
  id: 'm7',
  titulo: 'Compreensão de Frases',
  descricao:
    'Leia ou escute a frase curta e escolha a palavra que combina. Inicia compreensão literal sem exigir fala oral ou resposta aberta.',
  ordem: 7,
  preRequisitoModuloId: 'm6',
  atividades: frasesModulo7.map((frase) =>
    atividadeCompreensaoFrase(
      frase,
      distratoresParaPalavra(frase.palavraResposta),
    ),
  ),
}

interface TextoCompreensao {
  texto: string
  audioTexto: string
  palavraResposta: Palavra
}

function textoDuasFrases(
  primeiraPalavra: Palavra,
  segundaPalavra: Palavra,
  palavraResposta: Palavra,
): TextoCompreensao {
  return {
    texto: `${textoFrasePalavra(primeiraPalavra)}. ${textoFrasePalavra(
      segundaPalavra,
    )}.`,
    audioTexto: `${audioFrasePalavra(primeiraPalavra)}. ${audioFrasePalavra(
      segundaPalavra,
    )}.`,
    palavraResposta,
  }
}

const textosModulo8: TextoCompreensao[] = [
  {
    texto: 'A MALA. A BALA.',
    audioTexto: 'A mala. A bala.',
    palavraResposta: palavrasModulo5[0],
  },
  {
    texto: 'A LATA. A PATA.',
    audioTexto: 'A lata. A pata.',
    palavraResposta: palavrasModulo5[1],
  },
  {
    texto: 'A PAPA. A MALA.',
    audioTexto: 'A papa. A mala.',
    palavraResposta: palavrasModulo5[4],
  },
  {
    texto: 'A BALA. A LATA.',
    audioTexto: 'A bala. A lata.',
    palavraResposta: palavrasModulo5[3],
  },
  {
    texto: 'A PATA. A PAPA.',
    audioTexto: 'A pata. A papa.',
    palavraResposta: palavrasModulo5[1],
  },
  {
    texto: 'O MAPA. A MALA.',
    audioTexto: 'O mapa. A mala.',
    palavraResposta: palavrasModulo5[5],
  },
  {
    texto: 'A LAMA. A PATA.',
    audioTexto: 'A lama. A pata.',
    palavraResposta: palavrasModulo5[6],
  },
  {
    texto: 'A BABA. A LATA.',
    audioTexto: 'A baba. A lata.',
    palavraResposta: palavrasModulo5[7],
  },
  textoDuasFrases(palavrasModulo5[8], palavrasModulo5[10], palavrasModulo5[8]),
  textoDuasFrases(
    palavrasModulo5[11],
    palavrasModulo5[16],
    palavrasModulo5[16],
  ),
  textoDuasFrases(
    palavrasModulo5[14],
    palavrasModulo5[15],
    palavrasModulo5[14],
  ),
  textoDuasFrases(
    palavrasModulo5[18],
    palavrasModulo5[17],
    palavrasModulo5[18],
  ),
  textoDuasFrases(
    palavrasModulo5[19],
    palavrasModulo5[21],
    palavrasModulo5[19],
  ),
  textoDuasFrases(palavrasModulo5[9], palavrasModulo5[13], palavrasModulo5[13]),
  textoDuasFrases(
    palavrasModulo5[20],
    palavrasModulo5[10],
    palavrasModulo5[20],
  ),
]

function estimuloTexto(idUnico: string, texto: TextoCompreensao): Estimulo {
  return {
    id: idUnico,
    rotulo: texto.texto,
    iconeId: iconeLetra('A'),
    audioTexto: texto.audioTexto,
  }
}

function atividadeCompreensaoTexto(
  texto: TextoCompreensao,
  distratores: Palavra[],
): Atividade {
  const sufixoId = slugAtividade(texto.texto)
  const estimuloAlvo = estimuloTexto(`compreensao-texto-${sufixoId}`, texto)
  const resposta = estimuloPalavra(
    `compreensao-texto-palavra-${texto.palavraResposta.texto}`,
    texto.palavraResposta,
  )

  return construirAtividade(
    `m8-${sufixoId}`,
    'm8',
    'compreensao-texto',
    1,
    estimuloAlvo,
    resposta,
    distratores.map((d) =>
      estimuloPalavra(
        `compreensao-texto-palavra-${d.texto}-distrator-${sufixoId}`,
        d,
      ),
    ),
  )
}

const modulo8: Modulo = {
  id: 'm8',
  titulo: 'Compreensão de Textos Curtos',
  descricao:
    'Leia ou escute duas frases curtas e escolha uma palavra que apareceu no texto. Primeiro passo para compreensão literal de pequenos textos.',
  ordem: 8,
  preRequisitoModuloId: 'm7',
  atividades: textosModulo8.map((texto) =>
    atividadeCompreensaoTexto(texto, distratoresParaTexto(texto)),
  ),
}

interface PerguntaTexto extends TextoCompreensao {
  pergunta: string
}

const perguntasModulo9: PerguntaTexto[] = [
  {
    texto: 'A MALA. A BALA.',
    audioTexto: 'A mala. A bala.',
    pergunta: 'O que apareceu primeiro?',
    palavraResposta: palavrasModulo5[0],
  },
  {
    texto: 'A LATA. A PATA.',
    audioTexto: 'A lata. A pata.',
    pergunta: 'O que apareceu depois?',
    palavraResposta: palavrasModulo5[1],
  },
  {
    texto: 'A PAPA. A MALA.',
    audioTexto: 'A papa. A mala.',
    pergunta: 'O que apareceu primeiro?',
    palavraResposta: palavrasModulo5[4],
  },
  {
    texto: 'A BALA. A LATA.',
    audioTexto: 'A bala. A lata.',
    pergunta: 'O que apareceu depois?',
    palavraResposta: palavrasModulo5[3],
  },
  {
    texto: 'A PATA. A PAPA.',
    audioTexto: 'A pata. A papa.',
    pergunta: 'O que apareceu primeiro?',
    palavraResposta: palavrasModulo5[1],
  },
  {
    texto: 'O MAPA. A MALA.',
    audioTexto: 'O mapa. A mala.',
    pergunta: 'O que apareceu primeiro?',
    palavraResposta: palavrasModulo5[5],
  },
  {
    texto: 'A LAMA. A PATA.',
    audioTexto: 'A lama. A pata.',
    pergunta: 'O que apareceu depois?',
    palavraResposta: palavrasModulo5[1],
  },
  {
    texto: 'A BABA. A LATA.',
    audioTexto: 'A baba. A lata.',
    pergunta: 'O que apareceu primeiro?',
    palavraResposta: palavrasModulo5[7],
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[8],
      palavrasModulo5[10],
      palavrasModulo5[8],
    ),
    pergunta: 'O que apareceu primeiro?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[11],
      palavrasModulo5[16],
      palavrasModulo5[16],
    ),
    pergunta: 'O que apareceu depois?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[14],
      palavrasModulo5[15],
      palavrasModulo5[14],
    ),
    pergunta: 'O que apareceu primeiro?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[18],
      palavrasModulo5[17],
      palavrasModulo5[18],
    ),
    pergunta: 'O que apareceu primeiro?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[19],
      palavrasModulo5[21],
      palavrasModulo5[19],
    ),
    pergunta: 'O que apareceu primeiro?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[9],
      palavrasModulo5[13],
      palavrasModulo5[13],
    ),
    pergunta: 'O que apareceu depois?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[20],
      palavrasModulo5[10],
      palavrasModulo5[20],
    ),
    pergunta: 'O que apareceu primeiro?',
  },
]

function atividadePerguntaLiteralTexto(
  texto: PerguntaTexto,
  distratores: Palavra[],
): Atividade {
  const sufixoId = slugAtividade(`${texto.pergunta} ${texto.texto}`)
  const estimuloAlvo = estimuloTexto(
    `pergunta-literal-texto-${sufixoId}`,
    texto,
  )
  const resposta = estimuloPalavra(
    `pergunta-literal-texto-palavra-${texto.palavraResposta.texto}`,
    texto.palavraResposta,
  )

  return construirAtividade(
    `m9-${sufixoId}`,
    'm9',
    'pergunta-literal-texto',
    1,
    estimuloAlvo,
    resposta,
    distratores.map((d) =>
      estimuloPalavra(
        `pergunta-literal-texto-palavra-${d.texto}-distrator-${sufixoId}`,
        d,
      ),
    ),
    texto.pergunta,
  )
}

const modulo9: Modulo = {
  id: 'm9',
  titulo: 'Perguntas Literais sobre Textos',
  descricao:
    'Leia ou escute duas frases curtas e responda uma pergunta literal por seleção. Avança compreensão sem exigir fala oral, digitação ou inferência.',
  ordem: 9,
  preRequisitoModuloId: 'm8',
  atividades: perguntasModulo9.map((texto) =>
    atividadePerguntaLiteralTexto(
      texto,
      distratoresParaPalavra(texto.palavraResposta),
    ),
  ),
}

interface PerguntaPresencaTexto extends PerguntaTexto {
  respostaDeveAparecerNoTexto: boolean
}

function perguntaPresenca(
  texto: TextoCompreensao,
  palavraResposta: Palavra,
  respostaDeveAparecerNoTexto: boolean,
): PerguntaPresencaTexto {
  return {
    ...texto,
    pergunta: respostaDeveAparecerNoTexto
      ? 'Qual palavra apareceu no texto?'
      : 'Qual palavra não apareceu no texto?',
    palavraResposta,
    respostaDeveAparecerNoTexto,
  }
}

const perguntasPresencaModulo10: PerguntaPresencaTexto[] = [
  {
    texto: 'A MALA. A BALA.',
    audioTexto: 'A mala. A bala.',
    pergunta: 'Qual palavra apareceu no texto?',
    palavraResposta: palavrasModulo5[0],
    respostaDeveAparecerNoTexto: true,
  },
  {
    texto: 'A MALA. A BALA.',
    audioTexto: 'A mala. A bala.',
    pergunta: 'Qual palavra não apareceu no texto?',
    palavraResposta: palavrasModulo5[3],
    respostaDeveAparecerNoTexto: false,
  },
  {
    texto: 'O MAPA. A MALA.',
    audioTexto: 'O mapa. A mala.',
    pergunta: 'Qual palavra apareceu no texto?',
    palavraResposta: palavrasModulo5[5],
    respostaDeveAparecerNoTexto: true,
  },
  {
    texto: 'O MAPA. A MALA.',
    audioTexto: 'O mapa. A mala.',
    pergunta: 'Qual palavra não apareceu no texto?',
    palavraResposta: palavrasModulo5[7],
    respostaDeveAparecerNoTexto: false,
  },
  {
    texto: 'A LAMA. A PATA.',
    audioTexto: 'A lama. A pata.',
    pergunta: 'Qual palavra apareceu no texto?',
    palavraResposta: palavrasModulo5[6],
    respostaDeveAparecerNoTexto: true,
  },
  {
    texto: 'A LAMA. A PATA.',
    audioTexto: 'A lama. A pata.',
    pergunta: 'Qual palavra não apareceu no texto?',
    palavraResposta: palavrasModulo5[4],
    respostaDeveAparecerNoTexto: false,
  },
  {
    texto: 'A BABA. A LATA.',
    audioTexto: 'A baba. A lata.',
    pergunta: 'Qual palavra apareceu no texto?',
    palavraResposta: palavrasModulo5[7],
    respostaDeveAparecerNoTexto: true,
  },
  {
    texto: 'A BABA. A LATA.',
    audioTexto: 'A baba. A lata.',
    pergunta: 'Qual palavra não apareceu no texto?',
    palavraResposta: palavrasModulo5[5],
    respostaDeveAparecerNoTexto: false,
  },
  perguntaPresenca(textosModulo8[8], palavrasModulo5[8], true),
  perguntaPresenca(textosModulo8[8], palavrasModulo5[11], false),
  perguntaPresenca(textosModulo8[9], palavrasModulo5[16], true),
  perguntaPresenca(textosModulo8[9], palavrasModulo5[18], false),
  perguntaPresenca(textosModulo8[10], palavrasModulo5[14], true),
  perguntaPresenca(textosModulo8[10], palavrasModulo5[17], false),
  perguntaPresenca(textosModulo8[11], palavrasModulo5[18], true),
  perguntaPresenca(textosModulo8[11], palavrasModulo5[19], false),
  perguntaPresenca(textosModulo8[12], palavrasModulo5[19], true),
  perguntaPresenca(textosModulo8[12], palavrasModulo5[10], false),
  perguntaPresenca(textosModulo8[13], palavrasModulo5[13], true),
  perguntaPresenca(textosModulo8[13], palavrasModulo5[15], false),
  perguntaPresenca(textosModulo8[14], palavrasModulo5[20], true),
  perguntaPresenca(textosModulo8[14], palavrasModulo5[21], false),
]

function atividadePerguntaPresencaTexto(
  texto: PerguntaPresencaTexto,
  distratores: Palavra[],
): Atividade {
  const sufixoId = slugAtividade(`${texto.pergunta} ${texto.texto}`)
  const estimuloAlvo = estimuloTexto(
    `pergunta-presenca-texto-${sufixoId}`,
    texto,
  )
  const resposta = estimuloPalavra(
    `pergunta-presenca-texto-palavra-${texto.palavraResposta.texto}`,
    texto.palavraResposta,
  )

  return construirAtividade(
    `m10-${sufixoId}`,
    'm10',
    'pergunta-presenca-texto',
    1,
    estimuloAlvo,
    resposta,
    distratores.map((d) =>
      estimuloPalavra(
        `pergunta-presenca-texto-palavra-${d.texto}-distrator-${sufixoId}`,
        d,
      ),
    ),
    texto.pergunta,
    texto.respostaDeveAparecerNoTexto,
  )
}

const modulo10: Modulo = {
  id: 'm10',
  titulo: 'Presença e Ausência no Texto',
  descricao:
    'Leia ou escute duas frases curtas e responda se uma palavra apareceu ou não apareceu no texto. Amplia atenção literal sem exigir inferência ou resposta aberta.',
  ordem: 10,
  preRequisitoModuloId: 'm9',
  atividades: perguntasPresencaModulo10.map((texto) =>
    atividadePerguntaPresencaTexto(
      texto,
      distratoresParaPerguntaPresenca(texto),
    ),
  ),
}

const perguntasInferenciaModulo11: PerguntaTexto[] = [
  {
    ...textoDuasFrases(
      palavrasModulo5[0],
      palavrasModulo5[2],
      palavrasModulo5[0],
    ),
    pergunta: 'Qual palavra é de levar coisas?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[8],
      palavrasModulo5[10],
      palavrasModulo5[8],
    ),
    pergunta: 'Qual palavra anda na rua?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[8],
      palavrasModulo5[10],
      palavrasModulo5[10],
    ),
    pergunta: 'Qual palavra pode ficar no céu?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[16],
      palavrasModulo5[17],
      palavrasModulo5[16],
    ),
    pergunta: 'Qual palavra é de comer?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[18],
      palavrasModulo5[19],
      palavrasModulo5[19],
    ),
    pergunta: 'Qual palavra é animal?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[15],
      palavrasModulo5[10],
      palavrasModulo5[15],
    ),
    pergunta: 'Qual palavra pode ser chutada?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[9],
      palavrasModulo5[19],
      palavrasModulo5[9],
    ),
    pergunta: 'Qual palavra é animal?',
  },
  {
    ...textoDuasFrases(
      palavrasModulo5[20],
      palavrasModulo5[21],
      palavrasModulo5[20],
    ),
    pergunta: 'Qual palavra pode pedir colo?',
  },
]

function atividadePerguntaInferenciaTexto(
  texto: PerguntaTexto,
  distratores: Palavra[],
): Atividade {
  const sufixoId = slugAtividade(`${texto.pergunta} ${texto.texto}`)
  const estimuloAlvo = estimuloTexto(
    `pergunta-inferencia-texto-${sufixoId}`,
    texto,
  )
  const resposta = estimuloPalavra(
    `pergunta-inferencia-texto-palavra-${texto.palavraResposta.texto}`,
    texto.palavraResposta,
  )

  return construirAtividade(
    `m11-${sufixoId}`,
    'm11',
    'pergunta-inferencia-texto',
    1,
    estimuloAlvo,
    resposta,
    distratores.map((d) =>
      estimuloPalavra(
        `pergunta-inferencia-texto-palavra-${d.texto}-distrator-${sufixoId}`,
        d,
      ),
    ),
    texto.pergunta,
  )
}

const modulo11: Modulo = {
  id: 'm11',
  titulo: 'Inferência Guiada em Textos',
  descricao:
    'Leia ou escute duas frases curtas e responda uma pergunta de sentido por seleção. Introduz inferência com apoio visual, sem resposta aberta ou exigência de fala.',
  ordem: 11,
  preRequisitoModuloId: 'm10',
  atividades: perguntasInferenciaModulo11.map((texto) =>
    atividadePerguntaInferenciaTexto(
      texto,
      distratoresParaPerguntaInferencia(texto),
    ),
  ),
}

function distratoresParaTexto(texto: TextoCompreensao): Palavra[] {
  const palavrasDoTexto = new Set(
    palavrasModulo5
      .filter((palavra) => texto.texto.includes(palavra.texto))
      .map((palavra) => palavra.texto),
  )
  return palavrasModulo5
    .filter((palavra) => !palavrasDoTexto.has(palavra.texto))
    .slice(0, 2)
}

function palavrasPresentesNoTexto(texto: string): Palavra[] {
  return palavrasModulo5.filter((palavra) => texto.includes(palavra.texto))
}

function distratoresParaPerguntaPresenca(
  texto: PerguntaPresencaTexto,
): Palavra[] {
  if (texto.respostaDeveAparecerNoTexto) {
    return distratoresParaTexto(texto)
  }

  return palavrasPresentesNoTexto(texto.texto)
    .filter((palavra) => palavra.texto !== texto.palavraResposta.texto)
    .slice(0, 2)
}

function distratoresParaPerguntaInferencia(texto: PerguntaTexto): Palavra[] {
  const palavrasDoTexto = palavrasPresentesNoTexto(texto.texto).filter(
    (palavra) => palavra.texto !== texto.palavraResposta.texto,
  )
  const palavrasForaDoTexto = distratoresParaPalavra(
    texto.palavraResposta,
  ).filter(
    (palavra) =>
      palavra.texto !== texto.palavraResposta.texto &&
      !texto.texto.includes(palavra.texto),
  )

  return [...palavrasDoTexto, ...palavrasForaDoTexto].slice(0, 2)
}

export const trilhaV1: Trilha = {
  versao: 'v1',
  modulos: [
    modulo0,
    modulo1,
    modulo2,
    modulo3,
    modulo4,
    modulo5,
    modulo6,
    modulo7,
    modulo8,
    modulo9,
    modulo10,
    modulo11,
  ],
}

export function encontrarAtividade(atividadeId: string): Atividade | undefined {
  for (const modulo of trilhaV1.modulos) {
    const encontrada = modulo.atividades.find((a) => a.id === atividadeId)
    if (encontrada) return encontrada
  }
  return undefined
}
