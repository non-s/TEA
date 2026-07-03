import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { SelecaoPerfil } from './SelecaoPerfil'

const mocks = vi.hoisted(() => ({
  atualizarPreferencias: vi.fn(),
  encerrarPerfil: vi.fn(),
  erroAoOuvirPerfis: false,
  navigate: vi.fn(),
  perfis: [
    {
      id: 'perfil-1',
      nome: 'Lia',
      avatarId: 'estrela',
      preferenciasSensoriais: {
        som: false,
        animacoes: false,
        altoContraste: false,
        alvosMaiores: true,
        tamanhoFonte: 'grande',
      },
    },
  ],
  selecionarPerfil: vi.fn(),
  sair: vi.fn(),
  usuario: { uid: 'responsavel-1' },
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    usuario: mocks.usuario,
  }),
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    encerrarPerfil: mocks.encerrarPerfil,
    selecionarPerfil: mocks.selecionarPerfil,
  }),
}))

vi.mock('../../contexts/PreferenciasContext', () => ({
  usePreferencias: () => ({
    atualizarPreferencias: mocks.atualizarPreferencias,
  }),
}))

vi.mock('../../firebase/perfis', () => ({
  ouvirPerfis: (
    _uidResponsavel: string,
    aoAtualizar: (perfis: unknown[]) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirPerfis) {
      aoErro?.(new Error('permissao-negada'))
    } else {
      aoAtualizar(mocks.perfis)
    }

    return () => {}
  },
}))

vi.mock('../../firebase/auth', () => ({
  sair: mocks.sair,
}))

vi.mock('react-router-dom', async () => {
  const atual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...atual,
    useNavigate: () => mocks.navigate,
  }
})

function renderizarSelecaoPerfil() {
  return render(
    <MemoryRouter>
      <SelecaoPerfil />
    </MemoryRouter>,
  )
}

describe('SelecaoPerfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.erroAoOuvirPerfis = false
    mocks.perfis = [
      {
        id: 'perfil-1',
        nome: 'Lia',
        avatarId: 'estrela',
        preferenciasSensoriais: {
          som: false,
          animacoes: false,
          altoContraste: false,
          alvosMaiores: true,
          tamanhoFonte: 'grande',
        },
      },
    ]
    mocks.sair.mockResolvedValue(undefined)
  })

  it('oferece uma acao direta para criar o primeiro perfil', async () => {
    mocks.perfis = []

    renderizarSelecaoPerfil()

    expect(
      await screen.findByText(
        'Você ainda não cadastrou nenhum perfil de criança.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Criar primeiro perfil' }),
    ).toHaveAttribute('href', '/responsavel/perfis/gerenciar')
    expect(
      screen.queryByRole('link', { name: 'Gerenciar perfis' }),
    ).not.toBeInTheDocument()
  })

  it('nao tem violacoes automatizadas de acessibilidade no primeiro uso', async () => {
    mocks.perfis = []

    const { container } = renderizarSelecaoPerfil()

    await screen.findByRole('link', { name: 'Criar primeiro perfil' })
    const results = await axe(container)

    expect(results.violations).toHaveLength(0)
  })

  it('seleciona perfil aplicando preferencias sensoriais', async () => {
    const usuario = userEvent.setup()
    renderizarSelecaoPerfil()

    await usuario.click(await screen.findByRole('button', { name: 'Lia' }))

    expect(mocks.atualizarPreferencias).toHaveBeenCalledWith(
      expect.objectContaining({ som: false, alvosMaiores: true }),
    )
    expect(mocks.selecionarPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'perfil-1' }),
    )
    expect(mocks.navigate).toHaveBeenCalledWith('/crianca/trilha')
  })

  it('mostra erro claro quando os perfis nao carregam', async () => {
    mocks.erroAoOuvirPerfis = true

    renderizarSelecaoPerfil()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os perfis agora.',
    )
    expect(
      screen.queryByText('Você ainda não cadastrou nenhum perfil de criança.'),
    ).not.toBeInTheDocument()
  })

  it('encerra perfil infantil antes de sair da conta', async () => {
    const usuario = userEvent.setup()
    renderizarSelecaoPerfil()

    await usuario.click(
      await screen.findByRole('button', { name: 'Sair da conta' }),
    )

    expect(mocks.encerrarPerfil).toHaveBeenCalledOnce()
    expect(mocks.sair).toHaveBeenCalledOnce()
  })
})
