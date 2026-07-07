import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ColaboradoresPerfil } from './ColaboradoresPerfil'
import type { PerfilCrianca } from '../../firebase/perfis'

const mocks = vi.hoisted(() => ({
  adicionarColaborador: vi.fn(),
  removerColaborador: vi.fn(),
}))

vi.mock('../../firebase/perfis', () => ({
  LIMITE_COLABORADORES: 3,
  emailColaboradorValido: (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase()),
  adicionarColaborador: mocks.adicionarColaborador,
  removerColaborador: mocks.removerColaborador,
}))

const perfilBase: PerfilCrianca = {
  id: 'perfil-1',
  nome: 'Lia',
  avatarId: 'circulo',
  interesseEspecialId: 'neutro',
  perfilApoio: {
    comunicacaoPreferencial: 'figuras',
    acessoPreferencial: 'escolha-mediada',
    regulacaoPreferencial: 'pausa',
    limiteTentativasAntesPausa: 6,
    cartoesComunicacao: [],
    planoRegulacao: {
      sinaisPausa: '',
      estrategiasAjudam: '',
      evitarDuranteSobrecarga: '',
    },
    observacoes: '',
  },
  preferenciasSensoriais: {
    som: true,
    animacoes: true,
    altoContraste: false,
    alvosMaiores: false,
    tamanhoFonte: 'normal',
  },
  planoIndividual: {
    metaAtual: '',
    apoioPreferencial: 'visual',
    observacaoMediador: '',
  },
  atividadesDominadas: [],
  colaboradoresEmail: [],
}

describe('ColaboradoresPerfil', () => {
  afterEach(() => {
    mocks.adicionarColaborador.mockReset()
    mocks.removerColaborador.mockReset()
  })

  it('adiciona um colaborador com e-mail valido', async () => {
    mocks.adicionarColaborador.mockResolvedValue(undefined)
    const usuario = userEvent.setup()
    render(
      <ColaboradoresPerfil
        uidResponsavel="responsavel-1"
        perfil={perfilBase}
      />,
    )

    await usuario.type(
      screen.getByLabelText('E-mail de quem vai acompanhar'),
      'terapeuta@exemplo.com',
    )
    await usuario.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(mocks.adicionarColaborador).toHaveBeenCalledWith(
      'responsavel-1',
      'perfil-1',
      'terapeuta@exemplo.com',
    )
  })

  it('rejeita e-mail invalido antes de chamar adicionarColaborador', async () => {
    const usuario = userEvent.setup()
    render(
      <ColaboradoresPerfil
        uidResponsavel="responsavel-1"
        perfil={perfilBase}
      />,
    )

    await usuario.type(
      screen.getByLabelText('E-mail de quem vai acompanhar'),
      'nao-e-email',
    )
    await usuario.click(screen.getByRole('button', { name: 'Adicionar' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um e-mail válido.',
    )
    expect(mocks.adicionarColaborador).not.toHaveBeenCalled()
  })

  it('impede adicionar quando o limite de colaboradores foi atingido', async () => {
    const perfilCheio: PerfilCrianca = {
      ...perfilBase,
      colaboradoresEmail: ['a@x.com', 'b@x.com', 'c@x.com'],
    }
    render(
      <ColaboradoresPerfil
        uidResponsavel="responsavel-1"
        perfil={perfilCheio}
      />,
    )

    expect(
      screen.getByLabelText('E-mail de quem vai acompanhar'),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled()
  })

  it('remove um colaborador existente', async () => {
    mocks.removerColaborador.mockResolvedValue(undefined)
    const perfilComColaborador: PerfilCrianca = {
      ...perfilBase,
      colaboradoresEmail: ['terapeuta@exemplo.com'],
    }
    const usuario = userEvent.setup()
    render(
      <ColaboradoresPerfil
        uidResponsavel="responsavel-1"
        perfil={perfilComColaborador}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Remover' }))

    expect(mocks.removerColaborador).toHaveBeenCalledWith(
      'responsavel-1',
      'perfil-1',
      'terapeuta@exemplo.com',
    )
  })

  it('nao tem violacoes de acessibilidade detectaveis automaticamente', async () => {
    const perfilComColaborador: PerfilCrianca = {
      ...perfilBase,
      colaboradoresEmail: ['terapeuta@exemplo.com'],
    }
    const { container } = render(
      <ColaboradoresPerfil
        uidResponsavel="responsavel-1"
        perfil={perfilComColaborador}
      />,
    )

    const resultados = await axe(container)
    expect(resultados.violations).toHaveLength(0)
  })
})
