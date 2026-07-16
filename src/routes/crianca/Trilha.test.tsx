import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { Trilha } from './Trilha'

const mocks = vi.hoisted(() => ({
  atualizarPreferencias: vi.fn(),
  encerrarPerfil: vi.fn(),
  erroAoOuvirPerfil: false,
  navigate: vi.fn(),
  selecionarPerfil: vi.fn(),
  usuario: { uid: 'responsavel-1' },
  perfilAtivo: { id: 'perfil-1', nome: 'Lia' },
  perfilFirestore: {
    id: 'perfil-1',
    nome: 'Lia',
    atividadesDominadas: ['m0-n1-a1'],
    preferenciasSensoriais: {
      som: false,
      animacoes: false,
      altoContraste: false,
      alvosMaiores: true,
      tamanhoFonte: 'grande',
    },
  },
  tentativas: [],
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    usuario: mocks.usuario,
  }),
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    perfilAtivo: mocks.perfilAtivo,
    uidResponsavelPerfilAtivo: mocks.usuario?.uid,
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
  ouvirPerfil: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (perfil: unknown) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirPerfil) {
      aoErro?.(new Error('sem-conexao'))
    } else {
      aoAtualizar(mocks.perfilFirestore)
    }
    return () => {}
  },
}))

vi.mock('../../firebase/progresso', () => ({
  ouvirTentativas: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (tentativas: unknown[]) => void,
  ) => {
    aoAtualizar(mocks.tentativas)
    return () => {}
  },
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
    mocks.erroAoOuvirPerfil = false
    ;(mocks as { perfilFirestore: unknown }).perfilFirestore = {
      id: 'perfil-1',
      nome: 'Lia',
      atividadesDominadas: ['m0-n1-a1'],
      preferenciasSensoriais: {
        som: false,
        animacoes: false,
        altoContraste: false,
        alvosMaiores: true,
        tamanhoFonte: 'grande',
      },
    }
    ;(mocks as { tentativas: unknown[] }).tentativas = []
  })

  it('encerra a sessao infantil quando o perfil ativo nao existe mais', async () => {
    ;(mocks as { perfilFirestore: unknown }).perfilFirestore = null

    renderizarTrilha()

    await waitFor(() => {
      expect(mocks.encerrarPerfil).toHaveBeenCalledOnce()
    })
    expect(mocks.navigate).toHaveBeenCalledWith('/responsavel/perfis')
    expect(mocks.selecionarPerfil).not.toHaveBeenCalled()
    expect(mocks.atualizarPreferencias).not.toHaveBeenCalled()
  })

  it('sincroniza perfil ativo e preferencias quando o perfil muda no banco', async () => {
    renderizarTrilha()

    await screen.findByRole('heading', { name: 'Olá, Lia' })

    expect(mocks.selecionarPerfil).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'perfil-1' }),
    )
    expect(mocks.atualizarPreferencias).toHaveBeenCalledWith(
      expect.objectContaining({ som: false, alvosMaiores: true }),
    )
  })

  it('mostra aviso quando a trilha nao consegue atualizar agora', async () => {
    mocks.erroAoOuvirPerfil = true

    renderizarTrilha()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar a trilha agora.',
    )
    expect(mocks.encerrarPerfil).not.toHaveBeenCalled()
  })

  it('nomeia links concluídos com a habilidade para tecnologia assistiva', async () => {
    renderizarTrilha()

    expect(
      await screen.findByRole('heading', { name: 'Olá, Lia' }),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'círculo concluída' }),
      ).toBeInTheDocument()
    })
    expect(
      screen.getByRole('link', { name: 'Continuar com estrela' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: 'Concluída' }),
    ).not.toBeInTheDocument()
  })

  it('mantem somente o modulo em foco aberto e abre revisoes sob demanda', async () => {
    const usuario = userEvent.setup()
    ;(
      mocks.perfilFirestore as { atividadesDominadas: string[] }
    ).atividadesDominadas = idsDoModulo('m0')
    ;(mocks as { tentativas: unknown[] }).tentativas = idsDoModulo('m0').map(
      (atividadeId) => ({
        atividadeId,
        moduloId: 'm0',
        timestamp: Date.now(),
        resultado: 'correto',
        nivelDicaUsado: 2,
        tempoRespostaMs: 1000,
      }),
    )

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

  it.skip('resume modulos bloqueados sem renderizar cartoes sem acao', async () => {
    renderizarTrilha()

    await screen.findByRole('heading', { name: 'Olá, Lia' })

    expect(
      screen.getByText('Complete "Emparelhamento Idêntico" para desbloquear'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText('Bloqueado', { selector: 'span' }),
    ).not.toBeInTheDocument()
  })

  it('exige confirmacao adulta antes de sair da trilha infantil', async () => {
    const usuario = userEvent.setup()
    renderizarTrilha()

    await usuario.click(
      screen.getByRole('button', { name: 'Área do responsável' }),
    )

    expect(screen.getByRole('dialog', { name: /respons/ })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Continuar na trilha' }),
    ).toHaveFocus()
    expect(screen.getByLabelText(/Confirma/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Abrir/ })).toBeDisabled()

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
    expect(screen.getByRole('button', { name: /Abrir/ })).toBeEnabled()
    await usuario.click(screen.getByRole('button', { name: /Abrir/ }))

    expect(mocks.encerrarPerfil).toHaveBeenCalledOnce()
    expect(mocks.navigate).toHaveBeenCalledWith('/responsavel/perfis')
  })

  it('mantem a crianca na trilha quando o acesso adulto foi aberto por engano', async () => {
    const usuario = userEvent.setup()
    renderizarTrilha()

    await usuario.click(screen.getByRole('button', { name: /respons/ }))
    await usuario.click(
      screen.getByRole('button', { name: 'Continuar na trilha' }),
    )

    expect(
      screen.queryByRole('dialog', { name: /respons/ }),
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
