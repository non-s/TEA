import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { NaoEncontrada } from './NaoEncontrada'

describe('NaoEncontrada', () => {
  it('oferece caminhos seguros para uma rota inexistente', () => {
    render(
      <MemoryRouter>
        <NaoEncontrada />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', { name: 'Esta página não existe.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ir para o início' }),
    ).toHaveAttribute('href', '/')
    expect(
      screen.getByRole('link', { name: 'Ver demonstração' }),
    ).toHaveAttribute('href', '/demo')
  })

  it('nao tem violacoes de acessibilidade detectaveis automaticamente', async () => {
    const { container } = render(
      <MemoryRouter>
        <NaoEncontrada />
      </MemoryRouter>,
    )

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
