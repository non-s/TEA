import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { NomeacaoReceptiva } from './NomeacaoReceptiva'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-nomeacao-a1',
  moduloId: 'teste',
  tipo: 'nomeacao-receptiva',
  nivelDificuldade: 1,
  alvo: { id: 'letra-A', rotulo: 'A', iconeId: 'letra-A', audioTexto: 'á' },
  resposta: { id: 'letra-A', rotulo: 'A', iconeId: 'letra-A', audioTexto: 'á' },
  distratores: [
    { id: 'letra-E', rotulo: 'E', iconeId: 'letra-E', audioTexto: 'é' },
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

describe('NomeacaoReceptiva', () => {
  it('mostra a instrução falada/escrita e as opções', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <NomeacaoReceptiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(screen.getByText('Toque na letra á')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'A. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'E' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <NomeacaoReceptiva
        atividade={atividade}
        aoDominar={aoDominar}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'A' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <NomeacaoReceptiva
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
