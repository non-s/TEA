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
  it('explica o que fica salvo, o que nunca e coletado e por que nao ha LGPD a cumprir', () => {
    renderizarPrivacidade()

    expect(
      screen.getByRole('heading', { name: 'Privacidade e dados' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'O que fica salvo neste aparelho' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', {
        name: 'O que nunca é coletado ou enviado',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Diagnóstico, laudo, CID/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Nenhuma conta, e-mail ou senha/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/não substitui avaliação clínica/i),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/nenhum consentimento é solicitado/i),
    ).toBeInTheDocument()
  })

  it('oferece caminhos publicos para voltar ou ver os termos', () => {
    renderizarPrivacidade()

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute(
      'href',
      '/',
    )
    expect(screen.getByRole('link', { name: 'Termos de uso' })).toHaveAttribute(
      'href',
      '/termos',
    )
    expect(
      screen.getByRole('link', { name: 'Voltar para o início' }),
    ).toHaveAttribute('href', '/')
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderizarPrivacidade()

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
