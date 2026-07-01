import { render, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('mostra o nome da plataforma', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'TEA' })).toBeInTheDocument()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
