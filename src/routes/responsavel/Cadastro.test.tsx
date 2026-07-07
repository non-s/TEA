import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Cadastro } from './Cadastro'

const mocks = vi.hoisted(() => ({
  cadastrar: vi.fn(),
  navigate: vi.fn(),
}))

vi.mock('../../firebase/auth', () => ({
  LIMITE_EMAIL_RESPONSAVEL: 160,
  LIMITE_NOME_RESPONSAVEL: 80,
  LIMITE_SENHA_MINIMO: 8,
  cadastrar: mocks.cadastrar,
  senhaFraca: (senha: string) =>
    senha.length < 8 || !/[a-zA-Z]/.test(senha) || !/[0-9]/.test(senha),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  }
})

function renderCadastro() {
  render(
    <MemoryRouter>
      <Cadastro />
    </MemoryRouter>,
  )
}

describe('Cadastro', () => {
  beforeEach(() => {
    mocks.cadastrar.mockReset()
    mocks.cadastrar.mockResolvedValue({ uid: 'uid-1' })
    mocks.navigate.mockReset()
  })

  it('nao cria conta quando o nome tem apenas espacos', async () => {
    const usuario = userEvent.setup()
    renderCadastro()

    await usuario.type(screen.getByLabelText('Seu nome'), '   ')
    await usuario.type(screen.getByLabelText('E-mail'), 'familia@example.com')
    await usuario.type(screen.getByLabelText('Senha'), 'senha123')
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite seu nome para criar a conta.',
    )
    expect(mocks.cadastrar).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('exige consentimento destacado antes de criar a conta', async () => {
    const usuario = userEvent.setup()
    renderCadastro()

    await usuario.type(screen.getByLabelText('Seu nome'), 'Ana')
    await usuario.type(screen.getByLabelText('E-mail'), 'familia@example.com')
    await usuario.type(screen.getByLabelText('Senha'), 'senha123')
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Confirme o uso dos dados antes de criar a conta.',
    )
    expect(mocks.cadastrar).not.toHaveBeenCalled()

    await usuario.click(
      screen.getByRole('checkbox', {
        name: /Sou responsável pela criança e autorizo o TEA/i,
      }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(mocks.cadastrar).toHaveBeenCalledWith(
      'familia@example.com',
      'senha123',
      'Ana',
      true,
    )
    expect(mocks.navigate).toHaveBeenCalledWith('/responsavel/perfis')
  })

  it('limita campos ao mesmo contrato usado no documento do responsavel', () => {
    renderCadastro()

    expect(screen.getByLabelText('Seu nome')).toHaveAttribute('maxlength', '80')
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('maxlength', '160')
  })

  it('mostra o resumo de privacidade antes do envio', () => {
    renderCadastro()

    expect(
      screen.getByRole('link', { name: 'resumo de privacidade' }),
    ).toHaveAttribute('href', '/privacidade')
  })

  it('mostra o link para os termos de uso antes do envio', () => {
    renderCadastro()

    expect(screen.getByRole('link', { name: 'termos de uso' })).toHaveAttribute(
      'href',
      '/termos',
    )
  })

  it('rejeita senha fraca antes de chamar cadastrar', async () => {
    const usuario = userEvent.setup()
    renderCadastro()

    await usuario.type(screen.getByLabelText('Seu nome'), 'Ana')
    await usuario.type(screen.getByLabelText('E-mail'), 'familia@example.com')
    await usuario.type(screen.getByLabelText('Senha'), 'somente-letras')
    await usuario.click(
      screen.getByRole('checkbox', {
        name: /Sou responsável pela criança e autorizo o TEA/i,
      }),
    )
    await usuario.click(screen.getByRole('button', { name: 'Criar conta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'letras e números',
    )
    expect(mocks.cadastrar).not.toHaveBeenCalled()
  })
})
