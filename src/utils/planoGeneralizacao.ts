import type { RelatorioProgresso } from '../curriculo/relatorioProgresso'
import { criarGuiaMediador } from '../curriculo/guiaMediador'
import {
  itensPlanoRegulacao,
  textoAcessoPreferencial,
  textoComunicacaoPreferencial,
  textoRegulacaoPreferencial,
} from '../curriculo/perfilApoio'
import type { Atividade } from '../curriculo/tipos'
import type { PerfilCrianca } from '../firebase/perfis'
import { nomeArquivoLocalPrivado } from './nomesArquivosPrivados'

interface CriarPlanoGeneralizacaoParams {
  perfil: PerfilCrianca
  relatorio: RelatorioProgresso
  geradoEm: string
}

function dataCurta(timestampOuIso: number | string): string {
  const data = new Date(timestampOuIso)
  if (Number.isNaN(data.getTime())) return 'data não informada'
  return data.toLocaleDateString('pt-BR')
}

function tituloModulo(
  relatorio: RelatorioProgresso,
  atividade: Atividade | null,
): string {
  if (!atividade) return 'trilha atual'
  return (
    relatorio.resumoPorModulo.find(
      (resumo) => resumo.modulo.id === atividade.moduloId,
    )?.modulo.titulo ?? 'módulo atual'
  )
}

function objetivoForaDaTela(atividade: Atividade | null): string {
  if (!atividade) {
    return 'Manter habilidades já dominadas em situações naturais, com revisão leve e sem pressão por velocidade.'
  }

  switch (atividade.tipo) {
    case 'emparelhamento-identico':
      return 'Encontrar o item igual ao modelo usando objetos, cartões ou figuras reais.'
    case 'emparelhamento-categoria':
      return 'Reconhecer que duas formas da mesma letra pertencem ao mesmo conjunto.'
    case 'nomeacao-receptiva':
      return 'Escolher a letra correta quando outra pessoa nomeia a letra.'
    case 'nomeacao-expressiva':
      return 'Indicar o nome da letra mostrada por fala, gesto, olhar, toque ou CAA.'
    case 'tracado-letra':
      return 'Praticar o traçado da letra em superfícies variadas (areia, espuma, ar, papel), sem exigir preensão de lápis se ainda não for confortável.'
    case 'formacao-silaba':
      return 'Associar a sílaba-alvo a uma palavra familiar, mantendo apoio visual.'
    case 'formacao-palavra':
      return 'Reconhecer uma palavra simples formada por sílabas já praticadas.'
    case 'leitura-frase':
      return 'Ler uma frase curta formada por palavras já praticadas, respondendo por seleção.'
    case 'compreensao-frase':
      return 'Compreender uma frase curta e escolher a palavra que combina, sem exigir resposta oral aberta.'
    case 'compreensao-texto':
      return 'Compreender um texto de duas frases e escolher uma palavra que apareceu nele, sem pergunta aberta.'
    case 'pergunta-literal-texto':
      return 'Responder uma pergunta literal sobre um texto de duas frases por seleção, sem exigir fala oral ou digitação.'
    case 'pergunta-presenca-texto':
      return 'Responder se uma palavra apareceu ou não apareceu em um texto de duas frases por seleção, sem exigir fala oral ou inferência.'
    case 'pergunta-inferencia-texto':
      return 'Responder uma pergunta simples de sentido sobre um texto de duas frases por seleção, sem exigir fala oral, escrita ou justificativa aberta.'
  }
}

function materiaisSimples(atividade: Atividade | null): string[] {
  if (!atividade) {
    return [
      '2 ou 3 cartões de habilidades já dominadas.',
      'Um cartão de pausa ou CAA usado pela criança.',
      'Um lugar calmo para encerrar a prática sem pressa.',
    ]
  }

  switch (atividade.tipo) {
    case 'emparelhamento-identico':
    case 'emparelhamento-categoria':
      return [
        `Cartão-modelo de "${atividade.alvo.rotulo}".`,
        '2 ou 3 opções físicas ou impressas, com uma resposta clara.',
        'Objeto real parecido, se existir na rotina da criança.',
      ]
    case 'nomeacao-receptiva':
    case 'nomeacao-expressiva':
      return [
        `Cartão ou letra móvel de "${atividade.alvo.rotulo}".`,
        '2 ou 3 letras de contraste visual simples.',
        'Prancha, gesto ou apontar para responder sem exigir fala.',
      ]
    case 'tracado-letra':
      return [
        `Letra "${atividade.alvo.rotulo}" grande, para copiar o traçado.`,
        'Bandeja de areia, espuma de barbear ou giz — qualquer superfície tátil disponível.',
        'Papel e lápis apenas se a criança já tiver preensão confortável.',
      ]
    case 'formacao-silaba':
      return [
        `Cartão da sílaba "${atividade.alvo.rotulo}".`,
        'Figura ou objeto da palavra familiar usada como apoio.',
        '2 ou 3 sílabas para escolha, evitando excesso de opções.',
      ]
    case 'formacao-palavra':
      return [
        `Cartão da palavra "${atividade.alvo.rotulo}".`,
        'Sílabas móveis da palavra e uma palavra distratora simples.',
        'Figura ou objeto que ajude a ligar palavra e significado.',
      ]
    case 'leitura-frase':
      return [
        `Cartão da frase "${atividade.alvo.rotulo}".`,
        '2 ou 3 frases curtas com palavras já praticadas.',
        'Objeto ou cena simples para conversar sobre a frase sem exigir fala oral.',
      ]
    case 'compreensao-frase':
      return [
        `Cartão da frase "${atividade.alvo.rotulo}".`,
        'Cartões das palavras possíveis, com uma resposta clara.',
        'Figura, objeto ou situação real ligada à palavra escolhida.',
      ]
    case 'compreensao-texto':
      return [
        `Cartão do texto curto "${atividade.alvo.rotulo}".`,
        'Cartões de palavras conhecidas, mantendo apenas uma opção que aparece no texto.',
        'Dois objetos ou cenas simples para representar as frases, sem exigir resposta oral.',
      ]
    case 'pergunta-literal-texto':
      return [
        `Cartão do texto curto "${atividade.alvo.rotulo}".`,
        `Cartão da pergunta "${atividade.pergunta ?? 'pergunta literal'}".`,
        'Cartões de palavras conhecidas para responder por toque, olhar, gesto ou CAA.',
      ]
    case 'pergunta-presenca-texto':
      return [
        `Cartão do texto curto "${atividade.alvo.rotulo}".`,
        `Cartão da pergunta "${atividade.pergunta ?? 'pergunta de presença'}".`,
        'Cartões de palavras conhecidas, separando as que aparecem das que não aparecem no texto.',
      ]
    case 'pergunta-inferencia-texto':
      return [
        `Cartão do texto curto "${atividade.alvo.rotulo}".`,
        `Cartão da pergunta "${atividade.pergunta ?? 'pergunta de sentido'}".`,
        'Cartões de palavras conhecidas para responder uma inferência simples por toque, olhar, gesto ou CAA.',
      ]
  }
}

function oportunidadesNaturais(atividade: Atividade | null): string[] {
  if (!atividade) {
    return [
      'Casa: revisar um cartão dominado durante uma rotina curta e previsível.',
      'Escola/terapia: observar se a criança reconhece a habilidade com outro adulto.',
      'Rotina diária: encerrar assim que houver sinal de fadiga ou perda de conforto.',
    ]
  }

  switch (atividade.tipo) {
    case 'emparelhamento-identico':
    case 'emparelhamento-categoria':
      return [
        'Casa: procurar um item igual em brinquedos, roupas, livros ou embalagens.',
        'Escola/terapia: usar cartões sobre a mesa com a mesma ordem visual do app.',
        'Rotina diária: pedir uma única escolha e aceitar resposta por toque, olhar ou gesto.',
      ]
    case 'nomeacao-receptiva':
    case 'nomeacao-expressiva':
      return [
        'Casa: encontrar a letra em livro, etiqueta, ímã ou cartão do alfabeto.',
        'Escola/terapia: apresentar a letra em outro tamanho ou fonte, mantendo poucas opções.',
        'Rotina diária: aceitar fala, apontar, olhar, CAA ou seleção mediada como resposta.',
      ]
    case 'tracado-letra':
      return [
        'Casa: traçar a letra no vapor do espelho, na areia do parque ou com o dedo no ar.',
        'Escola/terapia: variar a superfície e o tamanho do traçado, sempre sem cobrar velocidade.',
        'Rotina diária: aceitar qualquer ferramenta de traçado confortável para a criança, inclusive sem lápis.',
      ]
    case 'formacao-silaba':
    case 'formacao-palavra':
      return [
        'Casa: ligar a sílaba ou palavra a uma figura familiar da rotina.',
        'Escola/terapia: montar a sílaba ou palavra com cartões móveis antes de pedir escolha.',
        'Rotina diária: repetir a prática em bloco curto, com pausa disponível desde o início.',
      ]
    case 'leitura-frase':
      return [
        'Casa: escolher a frase que combina com uma rotina curta, como guardar uma mala ou mostrar uma lata.',
        'Escola/terapia: apresentar a frase em cartão grande e manter poucas alternativas.',
        'Rotina diária: aceitar leitura silenciosa, apontar, olhar, CAA ou escolha mediada como resposta.',
      ]
    case 'compreensao-frase':
      return [
        'Casa: ler uma frase curta e escolher o objeto ou palavra que aparece nela.',
        'Escola/terapia: trocar a ordem das palavras mantendo poucas alternativas conhecidas.',
        'Rotina diária: aceitar apontar, olhar, CAA ou escolha mediada para mostrar compreensão.',
      ]
    case 'compreensao-texto':
      return [
        'Casa: ler duas frases curtas e escolher uma palavra que apareceu no texto.',
        'Escola/terapia: separar o texto em dois cartões e depois juntar novamente.',
        'Rotina diária: usar objetos reais para representar cada frase antes da escolha.',
      ]
    case 'pergunta-literal-texto':
      return [
        'Casa: ler duas frases curtas e perguntar o que veio primeiro ou depois, aceitando seleção.',
        'Escola/terapia: usar os mesmos cartões do texto e trocar a pergunta em outro bloco curto.',
        'Rotina diária: representar as duas frases com objetos antes de perguntar, sem exigir fala oral.',
      ]
    case 'pergunta-presenca-texto':
      return [
        'Casa: ler duas frases curtas e perguntar qual palavra apareceu ou não apareceu, mantendo poucas opções.',
        'Escola/terapia: pedir que a criança separe cartões em "estava no texto" e "não estava no texto".',
        'Rotina diária: usar objetos reais para marcar presença/ausência sem transformar a prática em prova oral.',
      ]
    case 'pergunta-inferencia-texto':
      return [
        'Casa: ler duas frases curtas e perguntar qual palavra combina com uma função ou categoria conhecida.',
        'Escola/terapia: representar as duas palavras com objetos ou figuras antes da pergunta de sentido.',
        'Rotina diária: aceitar apontar, olhar, CAA ou escolha mediada sem pedir explicação verbal.',
      ]
  }
}

export function nomeArquivoPlanoGeneralizacao(
  _perfil: PerfilCrianca,
  data: Date,
): string {
  return nomeArquivoLocalPrivado('plano-generalizacao', data, 'md')
}

export function criarPlanoGeneralizacao({
  perfil,
  relatorio,
  geradoEm,
}: CriarPlanoGeneralizacaoParams): string {
  const atividadeFoco =
    relatorio.proximaAtividade ?? relatorio.revisaoEspacada?.atividade ?? null
  const apoio = perfil.perfilApoio
  const plano = perfil.planoIndividual
  const planoRegulacao = itensPlanoRegulacao(apoio.planoRegulacao)
  const cartoes = apoio.cartoesComunicacao.map(
    (cartao) => `- ${cartao.rotulo}: "${cartao.fala}"`,
  )
  const guiaMediador = criarGuiaMediador({
    perfilApoio: apoio,
    planoIndividual: plano,
    proximaAtividade: atividadeFoco?.alvo.rotulo,
  })

  return [
    `# Plano de generalização - ${perfil.nome}`,
    '',
    `Gerado em ${dataCurta(geradoEm)} pela família/responsável no TEA.`,
    '',
    '> Use este plano como ponte entre app, casa, escola e terapia. Ele não substitui avaliação clínica, PEI/PAEE, plano terapêutico ou observação direta.',
    '',
    '## Habilidade-alvo',
    '',
    `- Foco: ${atividadeFoco?.alvo.rotulo ?? 'revisão leve das habilidades dominadas'}.`,
    `- Módulo/contexto: ${tituloModulo(relatorio, atividadeFoco)}.`,
    `- Objetivo fora da tela: ${objetivoForaDaTela(atividadeFoco)}`,
    relatorio.revisaoEspacada
      ? `- Revisão leve sugerida: ${relatorio.revisaoEspacada.atividade.alvo.rotulo}.`
      : '- Revisão leve sugerida: nenhuma no momento.',
    '',
    '## Preparar o ambiente',
    '',
    `- Comunicação preferida: ${
      textoComunicacaoPreferencial[apoio.comunicacaoPreferencial]
    }.`,
    `- Acesso preferido: ${textoAcessoPreferencial[apoio.acessoPreferencial]}.`,
    `- Regulação preferida: ${
      textoRegulacaoPreferencial[apoio.regulacaoPreferencial]
    }.`,
    `- Pausa: oferecer antes de fadiga, por volta de ${apoio.limiteTentativasAntesPausa} respostas ou antes se houver sinal de sobrecarga.`,
    ...(planoRegulacao.length > 0
      ? planoRegulacao.map((item) => `- ${item.rotulo}: ${item.texto}`)
      : [
          '- Plano de regulacao: observar o que ajudou e registrar apos a pratica.',
        ]),
    plano.metaAtual.trim()
      ? `- Meta atual: ${plano.metaAtual.trim()}`
      : '- Meta atual: combinar uma meta pequena para a semana.',
    plano.observacaoMediador.trim()
      ? `- Observação do mediador: ${plano.observacaoMediador.trim()}`
      : '- Observação do mediador: registrar o que ajudou a criança a participar com conforto.',
    '',
    '## Guia rapido do mediador',
    '',
    guiaMediador.resumo,
    '',
    ...guiaMediador.itens.map((item) => `- **${item.titulo}**: ${item.texto}`),
    '',
    '## Materiais simples',
    '',
    ...materiaisSimples(atividadeFoco).map((material) => `- ${material}`),
    '',
    '## Roteiro curto de prática',
    '',
    '1. Agora: mostrar o alvo e esperar a criança orientar atenção do jeito dela.',
    '2. Depois: oferecer poucas opções e aceitar resposta por fala, toque, olhar, gesto, CAA ou escolha mediada.',
    '3. Pausa: manter o cartão de pausa disponível e respeitar a solicitação imediatamente.',
    '4. Fechar: terminar em uma resposta confortável, mesmo que o bloco seja curto.',
    '',
    '## Oportunidades naturais',
    '',
    ...oportunidadesNaturais(atividadeFoco).map(
      (oportunidade) => `- ${oportunidade}`,
    ),
    '',
    '## Cartões de comunicação úteis',
    '',
    ...(cartoes.length > 0
      ? cartoes
      : ['- Usar cartões já combinados com a criança.']),
    '',
    '## Registro rápido após a prática',
    '',
    '- [ ] Aceitou começar sem surpresa sensorial.',
    '- [ ] Usou comunicação espontânea ou com menos ajuda.',
    '- [ ] Pediu pausa ou aceitou pausa sugerida.',
    '- [ ] Generalizou a habilidade com outro material, pessoa ou lugar.',
    '- Observações:',
    '',
  ].join('\n')
}
