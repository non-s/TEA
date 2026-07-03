import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { PausaSugerida } from './PausaSugerida'

describe('PausaSugerida', () => {
  it('oferece encerrar, pausar ou continuar quando a pratica ja foi longa', async () => {
    const usuario = userEvent.setup()
    const aoEncerrar = vi.fn()
    const aoPausar = vi.fn()
    const aoContinuar = vi.fn()

    render(
      <PausaSugerida
        tipo="encerrar"
        aoEncerrar={aoEncerrar}
        aoPausar={aoPausar}
        aoContinuar={aoContinuar}
      />,
    )

    expect(screen.getByText('Pode terminar por agora')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Encerrar' }))
    await usuario.click(screen.getByRole('button', { name: 'Pausar' }))
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(aoEncerrar).toHaveBeenCalledOnce()
    expect(aoPausar).toHaveBeenCalledOnce()
    expect(aoContinuar).toHaveBeenCalledOnce()
  })

  it('adapta a sugestao quando movimento ajuda a regular', async () => {
    const usuario = userEvent.setup()
    const aoPausar = vi.fn()

    render(
      <PausaSugerida
        regulacaoPreferencial="movimento"
        aoPausar={aoPausar}
        aoContinuar={vi.fn()}
      />,
    )

    expect(screen.getByText('Movimento pode ajudar agora')).toBeInTheDocument()
    expect(screen.getByText(/mover o corpo com seguranca/i)).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Mover' }))

    expect(aoPausar).toHaveBeenCalledOnce()
  })

  it('adapta a sugestao quando ambiente calmo ajuda a regular', () => {
    render(
      <PausaSugerida
        regulacaoPreferencial="ambiente-calmo"
        aoPausar={vi.fn()}
        aoContinuar={vi.fn()}
      />,
    )

    expect(
      screen.getByText('Ambiente calmo pode ajudar agora'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Acalmar' })).toBeInTheDocument()
  })

  it('nao tem violacoes de acessibilidade detectaveis automaticamente', async () => {
    const { container } = render(
      <PausaSugerida
        tipo="encerrar"
        aoEncerrar={vi.fn()}
        aoPausar={vi.fn()}
        aoContinuar={vi.fn()}
      />,
    )

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
