import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { FormacaoSilaba } from './FormacaoSilaba'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-silaba-a1',
  moduloId: 'teste',
  tipo: 'formacao-silaba',
  nivelDificuldade: 1,
  alvo: {
    id: 'silaba-MA',
    rotulo: 'MA',
    iconeId: 'letra-MA',
    audioTexto: 'MA, de mamãe',
  },
  resposta: {
    id: 'silaba-MA',
    rotulo: 'MA',
    iconeId: 'letra-MA',
    audioTexto: 'MA, de mamãe',
  },
  distratores: [
    {
      id: 'silaba-PA-distrator',
      rotulo: 'PA',
      iconeId: 'letra-PA',
      audioTexto: 'PA, de papai',
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

describe('FormacaoSilaba', () => {
  it('mostra a instrução com a palavra de apoio e as opções', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <FormacaoSilaba
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    expect(screen.getByText('Toque na sílaba MA, de mamãe')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'MA. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'PA' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <FormacaoSilaba
        atividade={atividade}
        aoDominar={aoDominar}
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'MA' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <FormacaoSilaba
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
