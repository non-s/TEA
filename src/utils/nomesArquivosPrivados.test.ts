import { describe, expect, it } from 'vitest'
import { nomeArquivoLocalPrivado } from './nomesArquivosPrivados'

describe('nomesArquivosPrivados', () => {
  it('normaliza o tipo tecnico do arquivo', () => {
    expect(
      nomeArquivoLocalPrivado(
        'relatorio equipe',
        new Date('2026-07-02T12:00:00Z'),
        'md',
      ),
    ).toBe('tea-relatorio-equipe-2026-07-02.md')
  })

  it('gera nome local com tipo generico para evitar identificacao no arquivo', () => {
    expect(
      nomeArquivoLocalPrivado(
        'relatorio-equipe',
        new Date('2026-07-02T12:00:00Z'),
        'md',
      ),
    ).toBe('tea-relatorio-equipe-2026-07-02.md')
  })
})
