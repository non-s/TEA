import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { EmparelhamentoIdentico } from './EmparelhamentoIdentico'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-a1',
  moduloId: 'teste',
  tipo: 'emparelhamento-identico',
  nivelDificuldade: 1,
  alvo: { id: 'alvo', rotulo: 'círculo', iconeId: 'circulo' },
  resposta: { id: 'alvo', rotulo: 'círculo', iconeId: 'circulo' },
  distratores: [{ id: 'distrator', rotulo: 'quadrado', iconeId: 'quadrado' }],
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

describe('EmparelhamentoIdentico', () => {
  it('mostra as opções de resposta e o alvo', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <EmparelhamentoIdentico
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.getByText('Toque na figura igual a esta: círculo'),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByText('Toque na figura igual a esta:'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'círculo. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'quadrado' })).toBeInTheDocument()
  })

  it('usa instrução diferente para emparelhamento por categoria (maiúscula/minúscula)', async () => {
    const usuario = userEvent.setup()
    const atividadeCategoria: Atividade = {
      ...atividade,
      tipo: 'emparelhamento-categoria',
      alvo: {
        id: 'alvo-maiusculo',
        rotulo: 'A',
        iconeId: 'letra-a-maiuscula',
        audioTexto: 'letra maiúscula á',
      },
      resposta: {
        id: 'resposta-minusculo',
        rotulo: 'a',
        iconeId: 'letra-a-minuscula',
      },
      distratores: [
        { id: 'distrator-b', rotulo: 'b', iconeId: 'letra-b-minuscula' },
      ],
    }
    renderComProvider(
      <EmparelhamentoIdentico
        atividade={atividadeCategoria}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.getByText(
        'Toque na mesma letra, escrita diferente: letra maiúscula á',
      ),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByText('Toque na mesma letra, escrita diferente:'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Toque na figura igual a esta:'),
    ).not.toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <EmparelhamentoIdentico
        atividade={atividade}
        aoDominar={aoDominar}
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'círculo' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <EmparelhamentoIdentico
        atividade={atividade}
        aoDominar={vi.fn()}
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
