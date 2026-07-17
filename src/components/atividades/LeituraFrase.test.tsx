import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'
import { LeituraFrase } from './LeituraFrase'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-frase-a-mala',
  moduloId: 'teste',
  tipo: 'leitura-frase',
  nivelDificuldade: 1,
  alvo: {
    id: 'frase-A-MALA',
    rotulo: 'A MALA',
    iconeId: 'letra-A',
    audioTexto: 'A mala',
  },
  resposta: {
    id: 'frase-A-MALA',
    rotulo: 'A MALA',
    iconeId: 'letra-A',
    audioTexto: 'A mala',
  },
  distratores: [
    {
      id: 'frase-A-BALA',
      rotulo: 'A BALA',
      iconeId: 'letra-A',
      audioTexto: 'A bala',
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

describe('LeituraFrase', () => {
  it('mostra a instrução e as frases após começar', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <LeituraFrase
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    expect(screen.getByText('Toque na frase: A mala')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'A MALA. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A BALA' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <LeituraFrase
        atividade={atividade}
        aoDominar={aoDominar}
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'A MALA' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <LeituraFrase
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
