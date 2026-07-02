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

describe('EmparelhamentoIdentico', () => {
  it('mostra as opções de resposta e o alvo', () => {
    renderComProvider(
      <EmparelhamentoIdentico
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.getByText('Toque na figura igual a esta:'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'círculo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'quadrado' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <EmparelhamentoIdentico
        atividade={atividade}
        aoDominar={aoDominar}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

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
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
