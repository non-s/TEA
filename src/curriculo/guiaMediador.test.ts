import { describe, expect, it } from 'vitest'
import type { PlanoIndividual } from '../firebase/perfis'
import { perfilApoioPadrao, type PerfilApoio } from './perfilApoio'
import { criarGuiaMediador } from './guiaMediador'

const planoBase: PlanoIndividual = {
  metaAtual: 'pedir ajuda antes de abandonar a atividade',
  apoioPreferencial: 'visual',
  observacaoMediador: 'esperar resposta por olhar',
}

describe('criarGuiaMediador', () => {
  it('combina comunicacao, acesso mediado, regulacao e meta atual', () => {
    const perfilApoio: PerfilApoio = {
      ...perfilApoioPadrao,
      comunicacaoPreferencial: 'figuras',
      acessoPreferencial: 'escolha-mediada',
      regulacaoPreferencial: 'ambiente-calmo',
      planoRegulacao: {
        sinaisPausa: 'olha para a porta',
        estrategiasAjudam: 'fone e luz baixa',
        evitarDuranteSobrecarga: '',
      },
    }

    const guia = criarGuiaMediador({
      perfilApoio,
      planoIndividual: planoBase,
      proximaAtividade: 'MA, de mala',
    })

    expect(guia.resumo).toBe(
      'Meta: pedir ajuda antes de abandonar a atividade. Agora: MA, de mala.',
    )
    expect(guia.contexto).toContain('Figuras ou CAA em papel')
    expect(guia.itens.map((item) => item.titulo)).toEqual([
      'Antes',
      'Durante',
      'Se precisar de apoio',
      'Depois',
    ])
    expect(guia.itens[0].texto).toContain('cartoes visuais')
    expect(guia.itens[1].texto).toContain('uma opcao por vez')
    expect(guia.itens[2].texto).toContain('Reduza som, luz ou movimento')
    expect(guia.itens[2].texto).toContain('fone e luz baixa')
    expect(guia.itens[3].texto).toContain('esperar resposta por olhar')
  })

  it('usa meta e observacao padrao quando o plano ainda esta vazio', () => {
    const guia = criarGuiaMediador({
      perfilApoio: {
        ...perfilApoioPadrao,
        observacoes: '',
      },
      planoIndividual: {
        metaAtual: '',
        apoioPreferencial: 'visual',
        observacaoMediador: '',
      },
    })

    expect(guia.resumo).toBe(
      'Meta: participar com conforto e comunicacao funcional. Agora: proxima atividade.',
    )
    expect(guia.itens[3].texto).toBe(
      'Registre uma observacao curta sobre comunicacao, acesso ou regulacao.',
    )
  })
})
