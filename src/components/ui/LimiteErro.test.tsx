import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LimiteErro } from './LimiteErro'

function renderizar(children: ReactNode, chaveReset = 'rota') {
  return render(
    <MemoryRouter>
      <LimiteErro chaveReset={chaveReset}>{children}</LimiteErro>
    </MemoryRouter>,
  )
}

describe('LimiteErro', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra uma queda segura quando uma tela quebra', async () => {
    function TelaQuebrada(): never {
      throw new Error('falha inesperada')
    }

    const { container } = renderizar(<TelaQuebrada />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Algo saiu do esperado.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tentar de novo' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Voltar ao início' }),
    ).toHaveAttribute('href', '/')

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })

  it('permite tentar renderizar a tela novamente', async () => {
    const user = userEvent.setup()
    let deveQuebrar = true

    function TelaInstavel() {
      if (deveQuebrar) {
        throw new Error('falha temporaria')
      }
      return <p>Tela recuperada</p>
    }

    renderizar(<TelaInstavel />)

    deveQuebrar = false
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))

    expect(screen.getByText('Tela recuperada')).toBeInTheDocument()
  })

  it('reseta o erro quando a rota muda', async () => {
    function TelaQuebrada(): never {
      throw new Error('falha na rota antiga')
    }

    const { rerender } = renderizar(<TelaQuebrada />, 'rota-antiga')
    expect(screen.getByRole('alert')).toBeInTheDocument()

    rerender(
      <MemoryRouter>
        <LimiteErro chaveReset="rota-nova">
          <p>Nova rota carregada</p>
        </LimiteErro>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Nova rota carregada')).toBeInTheDocument()
  })
})
