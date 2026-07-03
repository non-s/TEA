import { render, screen, waitFor } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  afterEach(() => {
    window.location.hash = ''
    document.title = 'TEA — Alfabetização para crianças autistas'
  })

  it('mostra o nome da plataforma', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'TEA' })).toBeInTheDocument()
  })

  it('oferece atalho para pular ao conteudo principal', () => {
    render(<App />)

    expect(
      screen.getByRole('link', { name: 'Pular para o conteúdo' }),
    ).toHaveAttribute('href', '#conteudo-principal')
    expect(document.getElementById('conteudo-principal')).toHaveAttribute(
      'tabIndex',
      '-1',
    )
  })

  it('atualiza titulo e anuncio acessivel da rota inicial', async () => {
    render(<App />)

    await waitFor(() => {
      expect(document.title).toBe('TEA — Alfabetização para crianças autistas')
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'TEA — Alfabetização para crianças autistas',
    )
  })

  it('mostra uma tela segura quando a rota nao existe', async () => {
    window.location.hash = '#/caminho-quebrado'

    render(<App />)

    expect(
      await screen.findByRole('heading', {
        name: 'Esta página não existe.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ir para o início' }),
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(document.title).toBe('Página não encontrada — TEA')
    })
    expect(screen.getByRole('status')).toHaveTextContent(
      'Página não encontrada',
    )
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = render(<App />)
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
