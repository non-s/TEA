import type { RelatorioProgresso } from '../curriculo/relatorioProgresso'
import { criarGuiaMediador } from '../curriculo/guiaMediador'
import {
  itensPlanoRegulacao,
  textoAcessoPreferencial,
  textoComunicacaoPreferencial,
  textoRegulacaoPreferencial,
} from '../curriculo/perfilApoio'
import type { PerfilCrianca } from '../firebase/perfis'
import {
  textoTipoObservacaoSessao,
  type ObservacaoSessao,
} from '../firebase/progresso'
import { nomeArquivoLocalPrivado } from './nomesArquivosPrivados'

interface CriarRelatorioEquipeParams {
  perfil: PerfilCrianca
  relatorio: RelatorioProgresso
  observacoesSessao: ObservacaoSessao[]
  geradoEm: string
}

function escaparTabela(texto: string): string {
  return texto.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

function dataCurta(timestampOuIso: number | string): string {
  const data = new Date(timestampOuIso)
  if (Number.isNaN(data.getTime())) return 'data nao informada'
  return data.toLocaleDateString('pt-BR')
}

function statusLegivel(status: string): string {
  const textos: Record<string, string> = {
    bloqueado: 'Bloqueado',
    'nao-iniciado': 'Nao iniciado',
    'em-pratica': 'Em pratica',
    dominado: 'Dominado',
  }
  return textos[status] ?? status
}

function tipoObservacaoLegivel(observacao: ObservacaoSessao): string {
  return textoTipoObservacaoSessao[observacao.tipo ?? 'outro']
}

export function nomeArquivoRelatorioEquipe(
  _perfil: PerfilCrianca,
  data: Date,
): string {
  return nomeArquivoLocalPrivado('relatorio-equipe', data, 'md')
}

export function criarRelatorioEquipe({
  perfil,
  relatorio,
  observacoesSessao,
  geradoEm,
}: CriarRelatorioEquipeParams): string {
  const apoio = perfil.perfilApoio
  const plano = perfil.planoIndividual
  const linhasModulo = relatorio.resumoPorModulo.map((resumo) =>
    [
      escaparTabela(resumo.modulo.titulo),
      statusLegivel(resumo.status),
      `${resumo.dominadasNoModulo}/${resumo.totalAtividades}`,
      resumo.totalTentativas,
      resumo.percentualAcerto === null ? '-' : `${resumo.percentualAcerto}%`,
      resumo.mediaNivelDica === null ? '-' : resumo.mediaNivelDica.toFixed(1),
    ].join(' | '),
  )
  const observacoes = observacoesSessao.slice(0, 5)
  const planoRegulacao = itensPlanoRegulacao(apoio.planoRegulacao)
  const cartoes = apoio.cartoesComunicacao.map(
    (cartao) => `- ${cartao.rotulo}: "${cartao.fala}" (${cartao.apoio})`,
  )
  const guiaMediador = criarGuiaMediador({
    perfilApoio: apoio,
    planoIndividual: plano,
    proximaAtividade: relatorio.proximaAtividade?.alvo.rotulo,
  })

  return [
    `# Relatorio para equipe - ${perfil.nome}`,
    '',
    `Gerado em ${dataCurta(geradoEm)} pela familia/responsavel no TEA.`,
    '',
    '> Este arquivo e um resumo local para conversa com terapeutas, professores ou cuidadores. Ele nao substitui avaliacao clinica, plano educacional individualizado ou observacao direta.',
    '',
    '## Resumo atual',
    '',
    `- Progresso geral: ${relatorio.totalDominadas}/${relatorio.totalAtividades} atividades (${relatorio.percentualGeral}%).`,
    `- Proximo passo sugerido: ${
      relatorio.proximaAtividade?.alvo.rotulo ?? 'revisar e manter habilidades'
    }.`,
    `- Orientacao: ${relatorio.orientacao}`,
    `- Mediacao: ${relatorio.recomendacaoMediacao}`,
    `- Apoio graduado: ${relatorio.recomendacaoApoioGraduado}`,
    relatorio.revisaoEspacada
      ? `- Revisao leve sugerida: ${relatorio.revisaoEspacada.atividade.alvo.rotulo}.`
      : '- Revisao leve sugerida: nenhuma no momento.',
    '',
    '## Perfil funcional de apoio',
    '',
    `- Comunicacao preferida: ${
      textoComunicacaoPreferencial[apoio.comunicacaoPreferencial]
    }.`,
    `- Acesso preferido: ${textoAcessoPreferencial[apoio.acessoPreferencial]}.`,
    `- Regulacao preferida: ${
      textoRegulacaoPreferencial[apoio.regulacaoPreferencial]
    }.`,
    `- Pausa sugerida: a cada ${apoio.limiteTentativasAntesPausa} respostas na atividade.`,
    apoio.observacoes.trim()
      ? `- Observacao de acesso/comunicacao: ${apoio.observacoes.trim()}`
      : '- Observacao de acesso/comunicacao: nao registrada.',
    ...(planoRegulacao.length > 0
      ? planoRegulacao.map((item) => `- ${item.rotulo}: ${item.texto}`)
      : ['- Plano de regulacao: nao registrado.']),
    '',
    '## Cartoes de comunicacao usados na atividade',
    '',
    ...cartoes,
    '',
    '## Plano individual',
    '',
    plano.metaAtual.trim()
      ? `- Meta atual: ${plano.metaAtual.trim()}`
      : '- Meta atual: nao registrada.',
    `- Apoio preferencial: ${plano.apoioPreferencial}.`,
    plano.observacaoMediador.trim()
      ? `- Observacao do mediador: ${plano.observacaoMediador.trim()}`
      : '- Observacao do mediador: nao registrada.',
    '',
    '## Guia rapido do mediador',
    '',
    guiaMediador.resumo,
    '',
    ...guiaMediador.itens.map((item) => `- **${item.titulo}**: ${item.texto}`),
    '',
    '## Progresso por modulo',
    '',
    'Modulo | Status | Dominadas | Tentativas | Acerto | Apoio medio',
    '--- | --- | --- | ---: | ---: | ---:',
    ...linhasModulo,
    '',
    '## Observacoes recentes da familia',
    '',
    ...(observacoes.length > 0
      ? observacoes.map(
          (observacao) =>
            `- ${dataCurta(observacao.timestamp)} [${tipoObservacaoLegivel(
              observacao,
            )}]: ${observacao.texto}`,
        )
      : ['- Nenhuma observacao registrada.']),
    '',
    '## Como usar este resumo',
    '',
    '- Conferir se os apoios descritos batem com o que a crianca mostra fora da plataforma.',
    '- Escolher uma meta pequena para generalizar em casa, escola ou terapia.',
    '- Registrar quais apoios podem ser retirados aos poucos sem gerar sobrecarga.',
    '',
  ].join('\n')
}
