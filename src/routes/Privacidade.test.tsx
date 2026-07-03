import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { Privacidade } from './Privacidade'

function renderizarPrivacidade() {
  return render(
    <MemoryRouter>
      <Privacidade />
    </MemoryRouter>,
  )
}

describe('Privacidade', () => {
  it('explica coleta, limites e controle familiar em linguagem direta', () => {
    renderizarPrivacidade()

    expect(
      screen.getByRole('heading', { name: 'Privacidade e dados' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'O que guardamos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'O que não pedimos' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Diagnóstico, laudo, CID/i)).toBeInTheDocument()
    expect(
      screen.getByText(/cache offline persistente fica desligado por padrão/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/não substitui avaliação clínica/i),
    ).toBeInTheDocument()
  })

  it('oferece caminhos publicos para voltar, entrar ou criar conta', () => {
    renderizarPrivacidade()

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(
      screen.getByRole('link', { name: 'Experimentar sem conta' }),
    ).toHaveAttribute('href', '/demo')
    expect(screen.getByRole('link', { name: 'Criar conta' })).toHaveAttribute(
      'href',
      '/cadastro',
    )
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute(
      'href',
      '/entrar',
    )
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderizarPrivacidade()

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
