import { describe, expect, it } from 'vitest'
import {
  conteudoAcordoPausa,
  conteudoApoioPreferencial,
  conteudoPausaPreferencial,
  conteudoRoteiroPausa,
} from './apoioPreferencial'

describe('apoioPreferencial', () => {
  it('mantem conteudo de pausa do plano quando nao ha regulacao funcional', () => {
    const apoio = conteudoPausaPreferencial('pausa', undefined)

    expect(apoio.textoPausa).toContain('Esta pausa faz parte da atividade')
    expect(apoio.passosPausa).toEqual(['Pausar', 'Respirar', 'Escolher'])
  })

  it('adapta a pausa para regulacao por movimento', () => {
    const apoio = conteudoPausaPreferencial('visual', 'movimento')

    expect(apoio.textoPausa).toContain('mover o corpo')
    expect(apoio.passosPausa).toEqual(['Mover', 'Respirar', 'Voltar'])
  })

  it('preserva conteudo de preparacao existente', () => {
    const apoio = conteudoApoioPreferencial('visual')

    expect(apoio.passosPreparacao).toEqual(['Ver', 'Tocar', 'Continuar'])
  })

  it('gera rotulo curto de roteiro pela regulacao preferencial', () => {
    expect(conteudoRoteiroPausa('visual', 'ambiente-calmo')).toEqual({
      titulo: 'Pode acalmar',
      detalhe: 'Ambiente calmo',
    })
  })

  it('mantem roteiro de pausa combinada quando nao ha regulacao funcional', () => {
    expect(conteudoRoteiroPausa('pausa', undefined)).toEqual({
      titulo: 'Pode pedir',
      detalhe: 'Combinada',
    })
  })

  it('gera acordo de pausa com retorno previsivel', () => {
    expect(conteudoAcordoPausa('pausa', undefined)).toEqual({
      agora: 'Pausa combinada',
      depois: 'Voltar para uma parte pequena',
      acaoEstender: 'Mais pausa',
      mensagemEstender:
        'Tudo bem. A pausa continua. Volte só quando o corpo estiver pronto.',
    })
  })

  it('adapta acordo de pausa quando o ambiente calmo e prioridade', () => {
    const acordo = conteudoAcordoPausa('visual', 'ambiente-calmo')

    expect(acordo.agora).toBe('Reduzir som, luz ou movimento')
    expect(acordo.depois).toBe('Voltar quando o ambiente estiver calmo')
    expect(acordo.acaoEstender).toBe('Mais calma')
  })
})
