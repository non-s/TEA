import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { AvisoEmailNaoVerificado } from './AvisoEmailNaoVerificado'

const mocks = vi.hoisted(() => ({
  usuario: null as { emailVerified: boolean } | null,
  reenviarVerificacaoEmail: vi.fn(),
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ usuario: mocks.usuario, carregando: false }),
}))

vi.mock('../../firebase/auth', () => ({
  reenviarVerificacaoEmail: mocks.reenviarVerificacaoEmail,
}))

function renderizar(rota = '/responsavel/perfis') {
  return render(
    <MemoryRouter initialEntries={[rota]}>
      <AvisoEmailNaoVerificado />
    </MemoryRouter>,
  )
}

describe('AvisoEmailNaoVerificado', () => {
  afterEach(() => {
    mocks.usuario = null
    mocks.reenviarVerificacaoEmail.mockReset()
  })

  it('nao renderiza nada sem usuario autenticado', () => {
    const { container } = renderizar()
    expect(container).toBeEmptyDOMElement()
  })

  it('nao renderiza nada quando o e-mail ja foi verificado', () => {
    mocks.usuario = { emailVerified: true }
    const { container } = renderizar()
    expect(container).toBeEmptyDOMElement()
  })

  it('nao renderiza nada fora das rotas do responsavel', () => {
    mocks.usuario = { emailVerified: false }
    const { container } = renderizar('/crianca/trilha')
    expect(container).toBeEmptyDOMElement()
  })

  it('avisa e permite reenviar quando o e-mail nao foi verificado', async () => {
    mocks.usuario = { emailVerified: false }
    mocks.reenviarVerificacaoEmail.mockResolvedValue(undefined)
    const usuario = userEvent.setup()
    const { container } = renderizar()

    expect(
      screen.getByText(/Confirme seu e-mail para proteger sua conta/),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Reenviar e-mail' }))

    expect(mocks.reenviarVerificacaoEmail).toHaveBeenCalledWith(mocks.usuario)
    expect(
      screen.getByText(/E-mail de verificação reenviado/),
    ).toBeInTheDocument()

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
