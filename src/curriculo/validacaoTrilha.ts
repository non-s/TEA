import type { Atividade, Estimulo, Modulo, Trilha } from './tipos'

export interface ProblemaTrilha {
  codigo: string
  mensagem: string
  atividadeId?: string
  moduloId?: string
}

interface RepertorioEnsino {
  letras: Set<string>
  silabas: Set<string>
  palavras: Set<string>
}

const ARTIGOS_CONHECIDOS = new Set(['A', 'O', 'AS', 'OS', 'UM', 'UMA'])

export function validarTrilha(trilha: Trilha): ProblemaTrilha[] {
  const problemas: ProblemaTrilha[] = []
  const modulosPorId = new Map<string, Modulo>()
  const ordens = new Set<number>()
  const atividadesPorId = new Set<string>()

  for (const modulo of trilha.modulos) {
    if (modulosPorId.has(modulo.id)) {
      registrarProblema(problemas, {
        codigo: 'MODULO_DUPLICADO',
        moduloId: modulo.id,
        mensagem: `Modulo duplicado: ${modulo.id}.`,
      })
    }

    if (ordens.has(modulo.ordem)) {
      registrarProblema(problemas, {
        codigo: 'ORDEM_MODULO_DUPLICADA',
        moduloId: modulo.id,
        mensagem: `Mais de um modulo usa a ordem ${modulo.ordem}.`,
      })
    }

    modulosPorId.set(modulo.id, modulo)
    ordens.add(modulo.ordem)
  }

  for (const modulo of trilha.modulos) {
    validarPreRequisito(modulo, modulosPorId, problemas)

    for (const atividade of modulo.atividades) {
      if (atividadesPorId.has(atividade.id)) {
        registrarProblema(problemas, {
          codigo: 'ATIVIDADE_DUPLICADA',
          moduloId: modulo.id,
          atividadeId: atividade.id,
          mensagem: `Atividade duplicada: ${atividade.id}.`,
        })
      }

      atividadesPorId.add(atividade.id)
      validarAtividade(modulo, atividade, problemas)
    }
  }

  validarProgressaoPedagogica(trilha, problemas)

  return problemas
}

function validarPreRequisito(
  modulo: Modulo,
  modulosPorId: Map<string, Modulo>,
  problemas: ProblemaTrilha[],
) {
  if (!modulo.preRequisitoModuloId) return

  const preRequisito = modulosPorId.get(modulo.preRequisitoModuloId)

  if (!preRequisito) {
    registrarProblema(problemas, {
      codigo: 'PRE_REQUISITO_INEXISTENTE',
      moduloId: modulo.id,
      mensagem: `Modulo ${modulo.id} referencia pre-requisito inexistente: ${modulo.preRequisitoModuloId}.`,
    })
    return
  }

  if (preRequisito.ordem >= modulo.ordem) {
    registrarProblema(problemas, {
      codigo: 'PRE_REQUISITO_FORA_DE_ORDEM',
      moduloId: modulo.id,
      mensagem: `Modulo ${modulo.id} referencia um pre-requisito que nao vem antes dele.`,
    })
  }
}

function validarAtividade(
  modulo: Modulo,
  atividade: Atividade,
  problemas: ProblemaTrilha[],
) {
  if (atividade.moduloId !== modulo.id) {
    registrarProblema(problemas, {
      codigo: 'ATIVIDADE_MODULO_INCONSISTENTE',
      moduloId: modulo.id,
      atividadeId: atividade.id,
      mensagem: `Atividade ${atividade.id} declara modulo ${atividade.moduloId}, mas esta em ${modulo.id}.`,
    })
  }

  validarDicas(atividade, problemas)
  validarCriteriosDominio(atividade, problemas)

  // Traçado é um gesto contínuo avaliado por proximidade ao guia, não uma
  // escolha entre opções — não existe "distrator" possível para esse tipo.
  if (
    atividade.tipo !== 'tracado-letra' &&
    atividade.distratores.length === 0
  ) {
    registrarProblema(problemas, {
      codigo: 'ATIVIDADE_SEM_DISTRATOR',
      moduloId: modulo.id,
      atividadeId: atividade.id,
      mensagem: `Atividade ${atividade.id} nao tem distratores.`,
    })
  }

  const idsDistratores = new Set<string>()
  const rotulosDistratores = new Set<string>()
  const rotuloResposta = normalizarToken(atividade.resposta.rotulo)

  for (const distrator of atividade.distratores) {
    const rotuloDistrator = normalizarToken(distrator.rotulo)

    if (
      distrator.id === atividade.resposta.id ||
      (rotuloDistrator.length > 0 && rotuloDistrator === rotuloResposta)
    ) {
      registrarProblema(problemas, {
        codigo: 'DISTRATOR_IGUAL_RESPOSTA',
        moduloId: modulo.id,
        atividadeId: atividade.id,
        mensagem: `Atividade ${atividade.id} tem distrator igual a resposta correta.`,
      })
    }

    if (idsDistratores.has(distrator.id)) {
      registrarProblema(problemas, {
        codigo: 'DISTRATOR_DUPLICADO',
        moduloId: modulo.id,
        atividadeId: atividade.id,
        mensagem: `Atividade ${atividade.id} repete o distrator ${distrator.id}.`,
      })
    }

    if (rotuloDistrator.length > 0 && rotulosDistratores.has(rotuloDistrator)) {
      registrarProblema(problemas, {
        codigo: 'DISTRATOR_DUPLICADO',
        moduloId: modulo.id,
        atividadeId: atividade.id,
        mensagem: `Atividade ${atividade.id} repete o rotulo de distrator ${distrator.rotulo}.`,
      })
    }

    idsDistratores.add(distrator.id)
    rotulosDistratores.add(rotuloDistrator)
  }
}

function validarDicas(atividade: Atividade, problemas: ProblemaTrilha[]) {
  const dicasEsperadas = [
    { ordem: 0, tipo: 'modelagem' },
    { ordem: 1, tipo: 'destaque-visual' },
    { ordem: 2, tipo: 'nenhuma' },
  ] as const
  const ordens = new Set<number>()

  for (const dica of atividade.dicas) {
    if (ordens.has(dica.ordem)) {
      registrarProblema(problemas, {
        codigo: 'DICA_DUPLICADA',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Atividade ${atividade.id} repete dica de ordem ${dica.ordem}.`,
      })
    }
    ordens.add(dica.ordem)
  }

  for (const esperada of dicasEsperadas) {
    const dica = atividade.dicas.find((item) => item.ordem === esperada.ordem)

    if (!dica) {
      registrarProblema(problemas, {
        codigo: 'DICA_OBRIGATORIA_AUSENTE',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Atividade ${atividade.id} nao tem dica obrigatoria de ordem ${esperada.ordem}.`,
      })
      continue
    }

    if (dica.tipo !== esperada.tipo) {
      registrarProblema(problemas, {
        codigo: 'DICA_FORA_DA_ORDEM_PEDAGOGICA',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Atividade ${atividade.id} usa ${dica.tipo} na ordem ${dica.ordem}, mas deveria usar ${esperada.tipo}.`,
      })
    }
  }
}

function validarCriteriosDominio(
  atividade: Atividade,
  problemas: ProblemaTrilha[],
) {
  const { acertosConsecutivosNecessarios, janelaTentativas } =
    atividade.criteriosDominio

  if (
    !Number.isInteger(acertosConsecutivosNecessarios) ||
    acertosConsecutivosNecessarios < 1
  ) {
    registrarProblema(problemas, {
      codigo: 'CRITERIO_DOMINIO_FRACO',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Atividade ${atividade.id} exige poucos acertos consecutivos para dominio.`,
    })
  }

  if (
    !Number.isInteger(janelaTentativas) ||
    janelaTentativas < acertosConsecutivosNecessarios
  ) {
    registrarProblema(problemas, {
      codigo: 'JANELA_DOMINIO_INVALIDA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Atividade ${atividade.id} tem janela de tentativas menor que o criterio de dominio.`,
    })
  }
}

function validarProgressaoPedagogica(
  trilha: Trilha,
  problemas: ProblemaTrilha[],
) {
  const repertorio: RepertorioEnsino = {
    letras: new Set(),
    silabas: new Set(),
    palavras: new Set(),
  }

  const modulosOrdenados = [...trilha.modulos].sort((a, b) => a.ordem - b.ordem)

  for (const modulo of modulosOrdenados) {
    for (const atividade of modulo.atividades) {
      validarAtividadeContraRepertorio(atividade, repertorio, problemas)
    }

    for (const atividade of modulo.atividades) {
      adicionarAoRepertorio(atividade, repertorio)
    }
  }
}

function validarAtividadeContraRepertorio(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  if (atividade.tipo === 'formacao-silaba') {
    validarSilaba(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'formacao-palavra') {
    validarPalavra(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'montagem-palavra') {
    validarMontagemPalavra(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'leitura-frase') {
    validarFrase(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'compreensao-frase') {
    validarCompreensaoFrase(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'compreensao-texto') {
    validarCompreensaoTexto(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'pergunta-literal-texto') {
    validarPerguntaLiteralTexto(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'pergunta-presenca-texto') {
    validarPerguntaPresencaTexto(atividade, repertorio, problemas)
    return
  }

  if (atividade.tipo === 'pergunta-inferencia-texto') {
    validarPerguntaInferenciaTexto(atividade, repertorio, problemas)
  }
}

function validarSilaba(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  const silaba = normalizarToken(atividade.resposta.rotulo)

  if (!silaba) return

  for (const letra of silaba) {
    if (!repertorio.letras.has(letra)) {
      registrarProblema(problemas, {
        codigo: 'SILABA_COM_LETRA_NAO_ENSINADA',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Silaba ${silaba} usa a letra ${letra} antes de ela aparecer na trilha.`,
      })
    }
  }
}

function validarPalavra(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  const palavra = normalizarToken(atividade.resposta.rotulo)
  const silabas = silabasDaAtividade(atividade)

  if (palavra.length > 0 && silabas.length === 0) {
    registrarProblema(problemas, {
      codigo: 'PALAVRA_SEM_SILABAS_VALIDAS',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Palavra ${palavra} nao informa silabas validas.`,
    })
  }

  for (const silaba of silabas) {
    if (!repertorio.silabas.has(silaba)) {
      registrarProblema(problemas, {
        codigo: 'PALAVRA_COM_SILABA_NAO_ENSINADA',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Palavra ${palavra} usa a silaba ${silaba} antes de ela aparecer na trilha.`,
      })
    }
  }
}

function validarMontagemPalavra(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  const palavra = normalizarToken(atividade.resposta.rotulo)
  const pecas = atividade.pecas ?? []

  if (pecas.length < 2) {
    registrarProblema(problemas, {
      codigo: 'MONTAGEM_PALAVRA_SEM_PECAS_SUFICIENTES',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Montagem de palavra ${palavra} precisa de pelo menos 2 pecas.`,
    })
  }

  const palavraMontada = pecas
    .map((peca) => normalizarToken(peca.rotulo))
    .join('')

  if (palavra.length > 0 && palavraMontada !== palavra) {
    registrarProblema(problemas, {
      codigo: 'MONTAGEM_PALAVRA_PECAS_NAO_FORMAM_PALAVRA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `As pecas de ${atividade.id} formam "${palavraMontada}", nao "${palavra}".`,
    })
  }

  for (const peca of pecas) {
    const silaba = normalizarToken(peca.rotulo)
    if (silaba && !repertorio.silabas.has(silaba)) {
      registrarProblema(problemas, {
        codigo: 'MONTAGEM_PALAVRA_COM_SILABA_NAO_ENSINADA',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Montagem de palavra ${palavra} usa a silaba ${silaba} antes de ela aparecer na trilha.`,
      })
    }
  }

  const rotulosPecas = new Set(
    pecas.map((peca) => normalizarToken(peca.rotulo)),
  )
  for (const distrator of atividade.distratores) {
    const silabaDistratora = normalizarToken(distrator.rotulo)
    if (rotulosPecas.has(silabaDistratora)) {
      registrarProblema(problemas, {
        codigo: 'MONTAGEM_PALAVRA_DISTRATOR_IGUAL_PECA',
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `Montagem de palavra ${palavra} tem uma silaba distratora igual a uma das pecas certas.`,
      })
    }
  }
}

function validarFrase(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  validarTextoFrase(atividade, atividade.resposta.rotulo, repertorio, problemas)
}

function validarCompreensaoFrase(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  validarTextoFrase(atividade, atividade.alvo.rotulo, repertorio, problemas)

  const resposta = normalizarToken(atividade.resposta.rotulo)

  if (resposta && !repertorio.palavras.has(resposta)) {
    registrarProblema(problemas, {
      codigo: 'COMPREENSAO_COM_PALAVRA_NAO_ENSINADA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Compreensao de frase usa a palavra-resposta ${resposta} antes de ela aparecer na trilha.`,
    })
  }
}

function validarCompreensaoTexto(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  validarTextoFrase(
    atividade,
    atividade.alvo.rotulo,
    repertorio,
    problemas,
    'TEXTO_COM_PALAVRA_NAO_ENSINADA',
    'Texto',
  )

  const resposta = normalizarToken(atividade.resposta.rotulo)

  if (resposta && !repertorio.palavras.has(resposta)) {
    registrarProblema(problemas, {
      codigo: 'COMPREENSAO_TEXTO_COM_PALAVRA_NAO_ENSINADA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Compreensao de texto usa a palavra-resposta ${resposta} antes de ela aparecer na trilha.`,
    })
  }
}

function validarPerguntaLiteralTexto(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  validarTextoFrase(
    atividade,
    atividade.alvo.rotulo,
    repertorio,
    problemas,
    'PERGUNTA_TEXTO_COM_PALAVRA_NAO_ENSINADA',
    'Texto de pergunta',
  )

  if (!atividade.pergunta?.trim()) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_TEXTO_SEM_PERGUNTA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta literal de texto ${atividade.id} nao informa a pergunta.`,
    })
  }

  const resposta = normalizarToken(atividade.resposta.rotulo)

  if (resposta && !repertorio.palavras.has(resposta)) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_TEXTO_RESPOSTA_NAO_ENSINADA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta literal de texto usa a palavra-resposta ${resposta} antes de ela aparecer na trilha.`,
    })
  }

  if (resposta && !textoContemPalavra(atividade.alvo.rotulo, resposta)) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_TEXTO_RESPOSTA_FORA_DO_TEXTO',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta literal de texto usa a palavra-resposta ${resposta}, mas ela nao aparece no texto.`,
    })
  }
}

function validarPerguntaPresencaTexto(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  validarTextoFrase(
    atividade,
    atividade.alvo.rotulo,
    repertorio,
    problemas,
    'PERGUNTA_PRESENCA_TEXTO_COM_PALAVRA_NAO_ENSINADA',
    'Texto de pergunta de presenca',
  )

  if (!atividade.pergunta?.trim()) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_PRESENCA_TEXTO_SEM_PERGUNTA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de presenca no texto ${atividade.id} nao informa a pergunta.`,
    })
  }

  if (typeof atividade.respostaDeveAparecerNoTexto !== 'boolean') {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_PRESENCA_TEXTO_MODO_INVALIDO',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de presenca no texto ${atividade.id} nao declara se a resposta deve aparecer no texto.`,
    })
  }

  const resposta = normalizarToken(atividade.resposta.rotulo)
  const respostaAparece = textoContemPalavra(atividade.alvo.rotulo, resposta)

  if (resposta && !repertorio.palavras.has(resposta)) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_PRESENCA_TEXTO_RESPOSTA_NAO_ENSINADA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de presenca no texto usa a palavra-resposta ${resposta} antes de ela aparecer na trilha.`,
    })
  }

  if (atividade.respostaDeveAparecerNoTexto === true && !respostaAparece) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_PRESENCA_TEXTO_RESPOSTA_DEVERIA_APARECER',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de presenca esperava resposta presente, mas ${resposta} nao aparece no texto.`,
    })
  }

  if (atividade.respostaDeveAparecerNoTexto === false && respostaAparece) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_PRESENCA_TEXTO_RESPOSTA_DEVERIA_NAO_APARECER',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de ausencia esperava resposta fora do texto, mas ${resposta} aparece no texto.`,
    })
  }
}

function validarPerguntaInferenciaTexto(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
) {
  validarTextoFrase(
    atividade,
    atividade.alvo.rotulo,
    repertorio,
    problemas,
    'PERGUNTA_INFERENCIA_TEXTO_COM_PALAVRA_NAO_ENSINADA',
    'Texto de pergunta de inferencia',
  )

  if (!atividade.pergunta?.trim()) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_INFERENCIA_TEXTO_SEM_PERGUNTA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de inferencia no texto ${atividade.id} nao informa a pergunta.`,
    })
  }

  const resposta = normalizarToken(atividade.resposta.rotulo)

  if (resposta && !repertorio.palavras.has(resposta)) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_INFERENCIA_TEXTO_RESPOSTA_NAO_ENSINADA',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de inferencia usa a palavra-resposta ${resposta} antes de ela aparecer na trilha.`,
    })
  }

  if (resposta && !textoContemPalavra(atividade.alvo.rotulo, resposta)) {
    registrarProblema(problemas, {
      codigo: 'PERGUNTA_INFERENCIA_TEXTO_RESPOSTA_FORA_DO_TEXTO',
      moduloId: atividade.moduloId,
      atividadeId: atividade.id,
      mensagem: `Pergunta de inferencia usa a palavra-resposta ${resposta}, mas ela nao aparece no texto ancora.`,
    })
  }
}

function validarTextoFrase(
  atividade: Atividade,
  frase: string,
  repertorio: RepertorioEnsino,
  problemas: ProblemaTrilha[],
  codigo = 'FRASE_COM_PALAVRA_NAO_ENSINADA',
  rotulo = 'Frase',
) {
  const tokens = tokensDaFrase(frase)

  for (const token of tokens) {
    if (ARTIGOS_CONHECIDOS.has(token)) continue

    if (!repertorio.palavras.has(token)) {
      registrarProblema(problemas, {
        codigo,
        moduloId: atividade.moduloId,
        atividadeId: atividade.id,
        mensagem: `${rotulo} ${frase} usa a palavra ${token} antes de ela aparecer na trilha.`,
      })
    }
  }
}

function adicionarAoRepertorio(
  atividade: Atividade,
  repertorio: RepertorioEnsino,
) {
  if (
    atividade.tipo === 'emparelhamento-categoria' ||
    atividade.tipo === 'nomeacao-receptiva' ||
    atividade.tipo === 'nomeacao-expressiva'
  ) {
    adicionarLetra(atividade.alvo, repertorio)
    adicionarLetra(atividade.resposta, repertorio)
    return
  }

  if (atividade.tipo === 'formacao-silaba') {
    repertorio.silabas.add(normalizarToken(atividade.resposta.rotulo))
    return
  }

  if (
    atividade.tipo === 'formacao-palavra' ||
    atividade.tipo === 'montagem-palavra'
  ) {
    repertorio.palavras.add(normalizarToken(atividade.resposta.rotulo))
  }
}

function adicionarLetra(estimulo: Estimulo, repertorio: RepertorioEnsino) {
  const caractere = normalizarToken(
    estimulo.iconeId.startsWith('letra-')
      ? estimulo.iconeId.slice('letra-'.length)
      : estimulo.rotulo,
  )

  if (caractere.length === 1) {
    repertorio.letras.add(caractere)
  }
}

function silabasDaAtividade(atividade: Atividade): string[] {
  const textoAntesDaVirgula = (atividade.resposta.audioTexto ?? '')
    .split(',')[0]
    .trim()
  const silabasDoAudio = textoAntesDaVirgula
    .split('-')
    .map(normalizarToken)
    .filter(Boolean)
  const palavra = normalizarToken(atividade.resposta.rotulo)

  if (silabasDoAudio.length > 1 && silabasDoAudio.join('') === palavra) {
    return silabasDoAudio
  }

  if (palavra.length > 0 && palavra.length % 2 === 0) {
    return palavra.match(/.{2}/g) ?? []
  }

  return []
}

function tokensDaFrase(frase: string): string[] {
  return normalizarTexto(frase)
    .split(/\s+/)
    .map((token) => token.replace(/[^A-Z]/g, ''))
    .filter(Boolean)
}

function textoContemPalavra(texto: string, palavra: string): boolean {
  if (!palavra) return false
  return tokensDaFrase(texto).includes(palavra)
}

function normalizarToken(texto: string): string {
  return normalizarTexto(texto).replace(/[^A-Z]/g, '')
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toUpperCase()
    .trim()
}

function registrarProblema(
  problemas: ProblemaTrilha[],
  problema: ProblemaTrilha,
) {
  problemas.push(problema)
}
