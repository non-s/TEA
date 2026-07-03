import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MAX_FALHAS_LOGIN, registrarFalhaLogin } from '../../utils/limiteLogin'
import { Login } from './Login'

const mocks = vi.hoisted(() => ({
  entrar: vi.fn(),
  redefinirSenha: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('../../firebase/auth', () => ({
  LIMITE_EMAIL_RESPONSAVEL: 160,
  entrar: mocks.entrar,
  redefinirSenha: mocks.redefinirSenha,
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  }
})

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  )
}

describe('Login', () => {
  beforeEach(() => {
    mocks.entrar.mockReset()
    mocks.redefinirSenha.mockReset()
    mocks.navigate.mockReset()
    localStorage.clear()
  })

  it('pede email real antes de enviar redefinicao de senha', async () => {
    const usuario = userEvent.setup()
    renderLogin()

    await usuario.type(screen.getByLabelText('E-mail'), '   ')
    await usuario.click(
      screen.getByRole('button', { name: 'Esqueci minha senha' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite seu e-mail acima para receber o link de redefinição.',
    )
    expect(mocks.redefinirSenha).not.toHaveBeenCalled()
  })

  it('limita email ao contrato do documento do responsavel', () => {
    renderLogin()

    expect(screen.getByLabelText('E-mail')).toHaveAttribute('maxlength', '160')
  })

  it('aplica espera local depois de falhas repetidas de login', async () => {
    const usuario = userEvent.setup()
    mocks.entrar.mockRejectedValue(
      Object.assign(new Error('credencial'), {
        code: 'auth/invalid-credential',
      }),
    )
    renderLogin()

    await usuario.type(screen.getByLabelText('E-mail'), 'familia@example.com')
    await usuario.type(screen.getByLabelText('Senha'), 'senha-errada')

    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    }

    expect(await screen.findByRole('alert')).toHaveTextContent('Aguarde')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
    expect(mocks.entrar).toHaveBeenCalledTimes(5)
  })

  it('nao chama Firebase Auth quando ja existe bloqueio local ativo', async () => {
    const usuario = userEvent.setup()
    mocks.entrar.mockRejectedValue(
      Object.assign(new Error('credencial'), {
        code: 'auth/invalid-credential',
      }),
    )
    renderLogin()

    await usuario.type(screen.getByLabelText('E-mail'), 'familia@example.com')
    await usuario.type(screen.getByLabelText('Senha'), 'senha-errada')
    for (let tentativa = 0; tentativa < 5; tentativa += 1) {
      await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    }

    mocks.entrar.mockClear()
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(mocks.entrar).not.toHaveBeenCalled()
  })

  it('explica bloqueio local ja salvo ao digitar o email', async () => {
    const agora = Date.now()
    for (let tentativa = 0; tentativa < MAX_FALHAS_LOGIN; tentativa += 1) {
      registrarFalhaLogin('familia@example.com', agora + tentativa)
    }
    const usuario = userEvent.setup()
    renderLogin()

    await usuario.type(screen.getByLabelText('E-mail'), 'familia@example.com')

    expect(screen.getByRole('alert')).toHaveTextContent('Aguarde')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeDisabled()
  })
})
