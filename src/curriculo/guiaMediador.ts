import type { PlanoIndividual } from '../firebase/perfis'
import {
  itensPlanoRegulacao,
  textoAcessoPreferencial,
  textoComunicacaoPreferencial,
  textoRegulacaoPreferencial,
  type AcessoPreferencial,
  type ComunicacaoPreferencial,
  type PerfilApoio,
  type RegulacaoPreferencial,
} from './perfilApoio'

export interface ItemGuiaMediador {
  id: 'antes' | 'durante' | 'apoio' | 'depois'
  titulo: string
  texto: string
}

export interface GuiaMediador {
  contexto: string
  resumo: string
  itens: ItemGuiaMediador[]
}

interface CriarGuiaMediadorParams {
  perfilApoio: PerfilApoio
  planoIndividual: PlanoIndividual
  proximaAtividade?: string
}

const orientacaoComunicacao: Record<ComunicacaoPreferencial, string> = {
  fala: 'Use frases curtas e aceite tocar ou apontar como resposta.',
  gestos: 'Combine olhar, gesto ou apontar antes de iniciar.',
  figuras: 'Deixe os cartoes visuais e a pausa ao alcance.',
  dispositivo: 'Deixe o dispositivo de CAA pronto antes da tentativa.',
  emergente: 'Ofereca escolhas pequenas e espere uma resposta consistente.',
}

const orientacaoAcesso: Record<AcessoPreferencial, string> = {
  'toque-direto': 'Mantenha a tela estavel e espere o toque sem apressar.',
  'toque-com-confirmacao':
    'Espere a primeira escolha e confirme antes de registrar.',
  'toque-com-ajuda':
    'Confirme com a crianca antes de transformar apoio motor em resposta.',
  'mouse-teclado':
    'Deixe teclado, mouse ou acionador posicionado antes da instrucao.',
  'escolha-mediada':
    'Mostre uma opcao por vez e toque somente depois do sinal combinado.',
}

const orientacaoRegulacao: Record<RegulacaoPreferencial, string> = {
  pausa: 'Ofereca pausa antes de sinais claros de cansaco.',
  'ambiente-calmo': 'Reduza som, luz ou movimento antes de repetir a demanda.',
  movimento: 'Inclua movimento seguro antes de insistir em nova tentativa.',
  alternar: 'Alterne uma parte pequena da tarefa com pausa curta.',
}

function textoOuPadrao(texto: string, padrao: string) {
  const limpo = texto.trim()
  return limpo || padrao
}

export function criarGuiaMediador({
  perfilApoio,
  planoIndividual,
  proximaAtividade,
}: CriarGuiaMediadorParams): GuiaMediador {
  const atividade = proximaAtividade ?? 'proxima atividade'
  const meta = textoOuPadrao(
    planoIndividual.metaAtual,
    'participar com conforto e comunicacao funcional',
  )
  const observacao = textoOuPadrao(
    planoIndividual.observacaoMediador,
    perfilApoio.observacoes,
  )
  const comunicacao = orientacaoComunicacao[perfilApoio.comunicacaoPreferencial]
  const acesso = orientacaoAcesso[perfilApoio.acessoPreferencial]
  const regulacao = orientacaoRegulacao[perfilApoio.regulacaoPreferencial]
  const planoRegulacao = itensPlanoRegulacao(perfilApoio.planoRegulacao)
  const regulacaoCombinada =
    planoRegulacao.length > 0
      ? `${regulacao} ${planoRegulacao
          .map((item) => `${item.rotulo}: ${item.texto}.`)
          .join(' ')}`
      : regulacao

  return {
    contexto: `${textoComunicacaoPreferencial[perfilApoio.comunicacaoPreferencial]} · ${textoAcessoPreferencial[perfilApoio.acessoPreferencial]} · ${textoRegulacaoPreferencial[perfilApoio.regulacaoPreferencial]}`,
    resumo: `Meta: ${meta}. Agora: ${atividade}.`,
    itens: [
      {
        id: 'antes',
        titulo: 'Antes',
        texto: `${comunicacao} Mostre o que vem agora e o que encerra a tentativa.`,
      },
      {
        id: 'durante',
        titulo: 'Durante',
        texto: `${acesso} Use uma instrucao por vez e preserve tempo de resposta.`,
      },
      {
        id: 'apoio',
        titulo: 'Se precisar de apoio',
        texto: `${regulacaoCombinada} Modele a resposta sem transformar pedido de ajuda em erro.`,
      },
      {
        id: 'depois',
        titulo: 'Depois',
        texto: observacao
          ? `Registre se "${observacao}" ajudou hoje.`
          : 'Registre uma observacao curta sobre comunicacao, acesso ou regulacao.',
      },
    ],
  }
}
