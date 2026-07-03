import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PreferenciasProvider } from '../contexts/PreferenciasContext'
import { Demo } from './Demo'

const mocks = vi.hoisted(() => ({
  registrarTentativa: vi.fn(),
}))

vi.mock('../firebase/progresso', () => ({
  registrarTentativa: mocks.registrarTentativa,
}))

function renderizarDemo() {
  return render(
    <PreferenciasProvider>
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    </PreferenciasProvider>,
  )
}

describe('Demo', () => {
  beforeEach(() => {
    mocks.registrarTentativa.mockReset()
  })

  it('mostra uma atividade publica sem pedir conta', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    expect(
      screen.getByRole('heading', { name: 'Demonstração sem conta' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Nenhum dado pessoal/i)).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', {
        name: 'Escolher etapa da demonstração',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Visual' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('navigation', {
        name: 'Escolher forma de resposta',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Toque' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    expect(
      screen.getByRole('region', {
        name: 'Personalizar interesse da demonstração',
      }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Interesse da demonstração')).toHaveValue(
      'neutro',
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByText('Toque na figura igual a esta:'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Escolha esta/i }),
    ).toBeInTheDocument()
  })

  it('respeita respostas sem gravar tentativa no backend', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: /Escolha esta/i }))

    await waitFor(() => {
      expect(mocks.registrarTentativa).not.toHaveBeenCalled()
    })
  })

  it('permite experimentar resposta com confirmacao antes de registrar', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    await usuario.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.getByRole('button', { name: 'Confirmar' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: /Escolha esta/i }))

    expect(
      screen.getByRole('button', { name: /^Confirmar /i }),
    ).toBeInTheDocument()
    expect(mocks.registrarTentativa).not.toHaveBeenCalled()
  })

  it('permite experimentar escolha mediada sem conta', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    await usuario.click(screen.getByRole('button', { name: 'Mediado' }))
    expect(screen.getByRole('button', { name: 'Mediado' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escolher' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeInTheDocument()
    expect(mocks.registrarTentativa).not.toHaveBeenCalled()
  })

  it('permite experimentar silaba e pergunta de texto sem conta', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    await usuario.click(screen.getByRole('button', { name: 'Sílaba' }))
    expect(screen.getByRole('button', { name: 'Sílaba' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByText('Toque na sílaba MA, de mamãe')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Texto' }))
    expect(
      screen.getByText(
        'Leia o texto. Depois responda: O que apareceu primeiro? A mala. A bala.',
      ),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByText('O que apareceu primeiro?')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'MALA. Escolha esta' }),
    ).toBeInTheDocument()
    expect(mocks.registrarTentativa).not.toHaveBeenCalled()
  })

  it('permite experimentar interesse da crianca sem conta', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    await usuario.click(screen.getByRole('button', { name: 'Sílaba' }))
    await usuario.selectOptions(
      screen.getByLabelText('Interesse da demonstração'),
      'musica',
    )

    expect(
      screen.getByText('Exemplos: MA de maraca, PA de pandeiro.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Toque na sílaba MA, de maraca'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Pausa. Preciso de uma pausa.' }),
    ).toHaveTextContent('♪')
    expect(mocks.registrarTentativa).not.toHaveBeenCalled()
  })

  it('abre pausa funcional na demonstracao', async () => {
    const usuario = userEvent.setup()
    renderizarDemo()

    await usuario.click(screen.getByRole('button', { name: /Pausa/i }))

    expect(screen.getByRole('dialog', { name: 'Pausa' })).toBeInTheDocument()
    expect(screen.getByText(/Nada foi salvo/i)).toBeInTheDocument()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderizarDemo()

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
