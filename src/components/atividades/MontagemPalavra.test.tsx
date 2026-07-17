import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { MontagemPalavra } from './MontagemPalavra'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-montagem-mala',
  moduloId: 'teste',
  tipo: 'montagem-palavra',
  nivelDificuldade: 1,
  alvo: {
    id: 'montagem-MALA',
    rotulo: 'MALA',
    iconeId: 'letra-MALA',
    audioTexto: 'MA-LA, MALA',
  },
  resposta: {
    id: 'montagem-MALA',
    rotulo: 'MALA',
    iconeId: 'letra-MALA',
    audioTexto: 'MA-LA, MALA',
  },
  distratores: [
    { id: 'montagem-MALA-distrator-PO', rotulo: 'PO', iconeId: 'letra-PO' },
  ],
  pecas: [
    { id: 'montagem-MALA-peca-0', rotulo: 'MA', iconeId: 'letra-MA' },
    { id: 'montagem-MALA-peca-1', rotulo: 'LA', iconeId: 'letra-LA' },
  ],
  dicas: [
    { ordem: 0, tipo: 'modelagem', descricao: '' },
    { ordem: 1, tipo: 'destaque-visual', descricao: '' },
    { ordem: 2, tipo: 'nenhuma', descricao: '' },
  ],
  criteriosDominio: { acertosConsecutivosNecessarios: 1, janelaTentativas: 10 },
}

const tentativasParaNivelIndependente = [
  {
    atividadeId: atividade.id,
    moduloId: atividade.moduloId,
    timestamp: 1,
    resultado: 'correto' as const,
    nivelDicaUsado: 1,
    tempoRespostaMs: 1000,
  },
  {
    atividadeId: atividade.id,
    moduloId: atividade.moduloId,
    timestamp: 2,
    resultado: 'correto' as const,
    nivelDicaUsado: 1,
    tempoRespostaMs: 1000,
  },
]

describe('MontagemPalavra', () => {
  it('mostra a palavra-modelo e as sílabas disponíveis após começar', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <MontagemPalavra
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getAllByText('MALA').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'MA. Toque agora' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PO' })).toBeInTheDocument()
  })

  it('monta a palavra tocando as sílabas em ordem e chama aoDominar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <MontagemPalavra
        atividade={atividade}
        aoDominar={aoDominar}
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'MA' }))
    await usuario.click(screen.getByRole('button', { name: 'LA' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('mostra "tente de novo" e reinicia a sequência ao tocar a sílaba errada', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    renderComProvider(
      <MontagemPalavra
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'PO' }))

    expect(screen.getByText('Tente de novo')).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(1000)

    expect(
      screen.getByRole('button', { name: 'MA. Toque agora' }),
    ).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <MontagemPalavra
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
