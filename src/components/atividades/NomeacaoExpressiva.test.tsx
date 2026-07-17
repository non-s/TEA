import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { NomeacaoExpressiva } from './NomeacaoExpressiva'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-expressiva-a1',
  moduloId: 'teste',
  tipo: 'nomeacao-expressiva',
  nivelDificuldade: 1,
  alvo: { id: 'letra-M-alvo', rotulo: 'eme', iconeId: 'letra-M' },
  resposta: { id: 'letra-M-resposta', rotulo: 'eme', iconeId: 'letra-M' },
  distratores: [{ id: 'letra-P-distrator', rotulo: 'pê', iconeId: 'letra-P' }],
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

describe('NomeacaoExpressiva', () => {
  it('mostra a letra e as opções de nome', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    expect(screen.getByText('Qual é o nome desta letra?')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'eme. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pê' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={aoDominar}
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'eme' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
