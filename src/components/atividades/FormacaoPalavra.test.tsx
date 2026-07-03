import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { FormacaoPalavra } from './FormacaoPalavra'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-palavra-mala',
  moduloId: 'teste',
  tipo: 'formacao-palavra',
  nivelDificuldade: 1,
  alvo: {
    id: 'palavra-MALA',
    rotulo: 'MALA',
    iconeId: 'letra-MALA',
    audioTexto: 'MA-LA, MALA',
  },
  resposta: {
    id: 'palavra-MALA',
    rotulo: 'MALA',
    iconeId: 'letra-MALA',
    audioTexto: 'MA-LA, MALA',
  },
  distratores: [
    {
      id: 'palavra-PATA',
      rotulo: 'PATA',
      iconeId: 'letra-PATA',
      audioTexto: 'PA-TA, PATA',
    },
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

describe('FormacaoPalavra', () => {
  it('mostra a instrução e as palavras após começar', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <FormacaoPalavra
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(screen.getByText('Toque na palavra MA-LA, MALA')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'MALA. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PATA' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <FormacaoPalavra
        atividade={atividade}
        aoDominar={aoDominar}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'MALA' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <FormacaoPalavra
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
