import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { Trilha } from './Trilha'

const mocks = vi.hoisted(() => ({
  encerrarPerfil: vi.fn(),
  navigate: vi.fn(),
  perfilAtivo: {
    id: 'perfil-1',
    nome: 'Lia',
    atividadesDominadas: ['m0-n1-a1'],
  },
  tentativas: [] as unknown[],
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    perfilAtivo: mocks.perfilAtivo,
    encerrarPerfil: mocks.encerrarPerfil,
  }),
}))

vi.mock('../../local/perfilLocal', () => ({
  listarTentativas: () => mocks.tentativas,
}))

vi.mock('react-router-dom', async () => {
  const atual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...atual,
    useNavigate: () => mocks.navigate,
  }
})

function renderizarTrilha() {
  return render(
    <MemoryRouter>
      <Trilha />
    </MemoryRouter>,
  )
}

function idsDoModulo(moduloId: string): string[] {
  const modulo = trilhaV1.modulos.find((item) => item.id === moduloId)
  if (!modulo) throw new Error(`Módulo ${moduloId} não encontrado`)
  return modulo.atividades.map((atividade) => atividade.id)
}

describe('Trilha', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.perfilAtivo = {
      id: 'perfil-1',
      nome: 'Lia',
      atividadesDominadas: ['m0-n1-a1'],
    }
    mocks.tentativas = []
  })

  it('nomeia links concluídos com a habilidade para tecnologia assistiva', async () => {
    renderizarTrilha()

    expect(
      await screen.findByRole('heading', { name: 'Olá, Lia' }),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('link', { name: 'círculo concluída' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Continuar com estrela' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Concluída' }),
    ).not.toBeInTheDocument()
  })

  it('mantem somente o modulo em foco aberto e abre revisoes sob demanda', async () => {
    const usuario = userEvent.setup()
    mocks.perfilAtivo = {
      ...mocks.perfilAtivo,
      atividadesDominadas: idsDoModulo('m0'),
    }
    mocks.tentativas = idsDoModulo('m0').map((atividadeId) => ({
      atividadeId,
      moduloId: 'm0',
      timestamp: Date.now(),
      resultado: 'correto',
      nivelDicaUsado: 2,
      tempoRespostaMs: 1000,
    }))

    renderizarTrilha()

    expect(
      await screen.findByRole('link', {
        name: 'Continuar com letra maiúscula á',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'círculo concluída' }),
    ).not.toBeInTheDocument()

    const botaoModuloConcluido = screen.getAllByRole('button', {
      name: 'Ver atividades',
    })[0]
    expect(botaoModuloConcluido).toHaveAttribute('aria-expanded', 'false')

    await usuario.click(botaoModuloConcluido)

    expect(botaoModuloConcluido).toHaveAttribute('aria-expanded', 'true')
    expect(
      screen.getByRole('link', { name: 'círculo concluída' }),
    ).toBeInTheDocument()
  })

  it('deixa todos os módulos acessíveis, sem cadeado nem texto de bloqueio', async () => {
    const usuario = userEvent.setup()
    renderizarTrilha()

    await screen.findByRole('heading', { name: 'Olá, Lia' })

    expect(screen.queryByText('🔒')).not.toBeInTheDocument()
    expect(screen.queryByText(/para desbloquear/)).not.toBeInTheDocument()

    const botaoModuloSeguinte = screen.getAllByRole('button', {
      name: 'Ver atividades',
    })[0]
    await usuario.click(botaoModuloSeguinte)

    expect(botaoModuloSeguinte).toHaveAttribute('aria-expanded', 'true')
  })

  it('exige confirmacao adulta antes de trocar de perfil', async () => {
    const usuario = userEvent.setup()
    renderizarTrilha()

    await usuario.click(
      screen.getByRole('button', { name: 'Trocar de perfil' }),
    )

    expect(screen.getByRole('dialog', { name: /troca/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Continuar na trilha' }),
    ).toHaveFocus()
    expect(screen.getByLabelText(/Confirma/)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Confirmar troca de perfil' }),
    ).toBeDisabled()

    await usuario.tab()
    expect(screen.getByLabelText(/Confirma/)).toHaveFocus()
    await usuario.tab()
    expect(
      screen.getByRole('button', { name: 'Continuar na trilha' }),
    ).toHaveFocus()
    await usuario.tab({ shift: true })
    expect(screen.getByLabelText(/Confirma/)).toHaveFocus()
    expect(mocks.encerrarPerfil).not.toHaveBeenCalled()

    await usuario.clear(screen.getByLabelText(/Confirma/))
    await usuario.type(screen.getByLabelText(/Confirma/), 'adulto')
    const botaoConfirmar = screen.getByRole('button', {
      name: 'Confirmar troca de perfil',
    })
    expect(botaoConfirmar).toBeEnabled()
    await usuario.click(botaoConfirmar)

    expect(mocks.encerrarPerfil).toHaveBeenCalledOnce()
    expect(mocks.navigate).toHaveBeenCalledWith('/')
  })

  it('mantem a crianca na trilha quando a troca de perfil foi aberta por engano', async () => {
    const usuario = userEvent.setup()
    renderizarTrilha()

    await usuario.click(
      screen.getByRole('button', { name: 'Trocar de perfil' }),
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Continuar na trilha' }),
    )

    expect(
      screen.queryByRole('dialog', { name: /troca/i }),
    ).not.toBeInTheDocument()
    expect(mocks.encerrarPerfil).not.toHaveBeenCalled()
    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderizarTrilha()

    await screen.findByRole('link', { name: 'círculo concluída' })

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  }, 20_000)
})
