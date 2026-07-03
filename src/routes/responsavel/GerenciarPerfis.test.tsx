import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { normalizarCartoesComunicacao } from '../../curriculo/cartoesComunicacao'
import { GerenciarPerfis } from './GerenciarPerfis'

const mocks = vi.hoisted(() => ({
  atualizarInteressePerfil: vi.fn(),
  atualizarPreferencias: vi.fn(),
  criarPerfil: vi.fn(),
  encerrarPerfil: vi.fn(),
  erroAoOuvirPerfis: false,
  navigate: vi.fn(),
  perfilAtivo: { id: 'perfil-1' },
  removerPerfil: vi.fn(),
  selecionarPerfil: vi.fn(),
  semPerfis: false,
  usuario: { uid: 'responsavel-1' },
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    usuario: mocks.usuario,
  }),
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    perfilAtivo: mocks.perfilAtivo,
    selecionarPerfil: mocks.selecionarPerfil,
    encerrarPerfil: mocks.encerrarPerfil,
  }),
}))

vi.mock('../../contexts/PreferenciasContext', () => ({
  usePreferencias: () => ({
    atualizarPreferencias: mocks.atualizarPreferencias,
  }),
}))

vi.mock('../../firebase/perfis', () => ({
  atualizarInteressePerfil: mocks.atualizarInteressePerfil,
  criarPerfil: mocks.criarPerfil,
  LIMITE_NOME_PERFIL: 40,
  planoIndividualPadrao: {
    metaAtual: '',
    apoioPreferencial: 'visual',
    observacaoMediador: '',
  },
  preferenciasSensoriaisPadrao: {
    som: true,
    animacoes: true,
    altoContraste: false,
    alvosMaiores: false,
    tamanhoFonte: 'normal',
  },
  ouvirPerfis: (
    _uidResponsavel: string,
    aoAtualizar: (perfis: unknown[]) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirPerfis) {
      aoErro?.(new Error('sem-conexao'))
      return () => {}
    }

    if (mocks.semPerfis) {
      aoAtualizar([])
      return () => {}
    }

    aoAtualizar([
      {
        id: 'perfil-1',
        nome: 'Lia',
        avatarId: 'circulo',
        interesseEspecialId: 'neutro',
        perfilApoio: {
          comunicacaoPreferencial: 'emergente',
          acessoPreferencial: 'toque-direto',
          regulacaoPreferencial: 'pausa',
          limiteTentativasAntesPausa: 6,
          cartoesComunicacao: normalizarCartoesComunicacao(),
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
      },
    ])

    return () => {}
  },
  removerPerfil: mocks.removerPerfil,
}))

vi.mock('react-router-dom', async () => {
  const atual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...atual,
    useNavigate: () => mocks.navigate,
  }
})

describe('GerenciarPerfis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.erroAoOuvirPerfis = false
    mocks.semPerfis = false
    mocks.criarPerfil.mockResolvedValue({ id: 'perfil-criado' })
    mocks.removerPerfil.mockResolvedValue(undefined)
  })

  it('exige confirmacao textual antes de apagar perfil e historico', async () => {
    const usuario = userEvent.setup()

    render(
      <MemoryRouter>
        <GerenciarPerfis />
      </MemoryRouter>,
    )

    await usuario.click(screen.getByRole('button', { name: 'Remover' }))

    expect(
      screen.getByRole('dialog', { name: 'Apagar perfil' }),
    ).toBeInTheDocument()
    const botaoCancelar = screen.getByRole('button', { name: 'Cancelar' })
    const campoConfirmacao = screen.getByLabelText('Digite Lia para confirmar')
    await waitFor(() => {
      expect(botaoCancelar).toHaveFocus()
    })
    await usuario.tab()
    expect(campoConfirmacao).toHaveFocus()
    await usuario.tab({ shift: true })
    expect(botaoCancelar).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Apagar dados' })).toBeDisabled()

    await usuario.type(campoConfirmacao, 'Lia')
    await usuario.click(screen.getByRole('button', { name: 'Apagar dados' }))

    await waitFor(() => {
      expect(mocks.removerPerfil).toHaveBeenCalledWith(
        'responsavel-1',
        'perfil-1',
      )
    })
    expect(mocks.encerrarPerfil).toHaveBeenCalled()
  })

  it('mostra erro quando os perfis nao carregam', async () => {
    mocks.erroAoOuvirPerfis = true

    render(
      <MemoryRouter>
        <GerenciarPerfis />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar os perfis agora.',
    )
  })

  it('nao cria perfil quando o nome tem apenas espacos', async () => {
    const usuario = userEvent.setup()

    render(
      <MemoryRouter>
        <GerenciarPerfis />
      </MemoryRouter>,
    )

    await usuario.type(
      screen.getByLabelText('Nome ou apelido da criança'),
      '   ',
    )
    expect(screen.getByLabelText('Nome ou apelido da criança')).toHaveAttribute(
      'maxlength',
      '40',
    )
    await usuario.click(screen.getByRole('button', { name: 'Criar perfil' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Digite um nome ou apelido para criar o perfil.',
    )
    expect(mocks.criarPerfil).not.toHaveBeenCalled()
  })

  it('nomeia avatares e nao tem violacoes automatizadas de acessibilidade', async () => {
    mocks.semPerfis = true

    const { container } = render(
      <MemoryRouter>
        <GerenciarPerfis />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('button', { name: 'Escolher avatar círculo' }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Escolher avatar estrela' }),
    ).toHaveAttribute('aria-pressed', 'false')

    const results = await axe(container)

    expect(results.violations).toHaveLength(0)
  })

  it('ativa o primeiro perfil criado e abre a trilha infantil', async () => {
    mocks.semPerfis = true
    const usuario = userEvent.setup()

    render(
      <MemoryRouter>
        <GerenciarPerfis />
      </MemoryRouter>,
    )

    await usuario.type(
      screen.getByLabelText('Nome ou apelido da criança'),
      '  Mia  ',
    )
    await usuario.selectOptions(
      screen.getByLabelText('Como ela seleciona melhor'),
      'escolha-mediada',
    )
    await usuario.click(screen.getByRole('button', { name: 'Criar perfil' }))

    await waitFor(() => {
      expect(mocks.selecionarPerfil).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'perfil-criado',
          nome: 'Mia',
          avatarId: 'circulo',
          atividadesDominadas: [],
        }),
      )
    })
    expect(mocks.atualizarPreferencias).toHaveBeenCalledWith(
      expect.objectContaining({ alvosMaiores: true }),
    )
    expect(mocks.navigate).toHaveBeenCalledWith('/crianca/trilha')
  })

  it('cria perfil com apoio funcional e ajustes iniciais', async () => {
    const usuario = userEvent.setup()

    render(
      <MemoryRouter>
        <GerenciarPerfis />
      </MemoryRouter>,
    )

    await usuario.type(
      screen.getByLabelText('Nome ou apelido da criança'),
      'Mia',
    )
    await usuario.selectOptions(
      screen.getByLabelText('Interesse inicial'),
      'musica',
    )
    expect(screen.getByText(/MA de maraca/)).toBeInTheDocument()
    await usuario.selectOptions(
      screen.getByLabelText('Comunicação que a criança já usa melhor'),
      'figuras',
    )
    await usuario.selectOptions(
      screen.getByLabelText('Como ela seleciona melhor'),
      'escolha-mediada',
    )
    await usuario.selectOptions(
      screen.getByLabelText('Para regular, costuma ajudar'),
      'ambiente-calmo',
    )
    expect(screen.getByLabelText('Observação curta de acesso')).toHaveAttribute(
      'maxlength',
      '240',
    )
    await usuario.type(
      screen.getByLabelText('Observação curta de acesso'),
      'usa prancha em casa',
    )
    await usuario.click(screen.getByRole('button', { name: 'Criar perfil' }))

    await waitFor(() => {
      expect(mocks.criarPerfil).toHaveBeenCalledWith(
        'responsavel-1',
        'Mia',
        'circulo',
        expect.objectContaining({
          interesseEspecialId: 'musica',
          perfilApoio: expect.objectContaining({
            comunicacaoPreferencial: 'figuras',
            acessoPreferencial: 'escolha-mediada',
            regulacaoPreferencial: 'ambiente-calmo',
            observacoes: 'usa prancha em casa',
          }),
          preferenciasSensoriais: expect.objectContaining({
            som: false,
            animacoes: false,
            alvosMaiores: true,
          }),
          planoIndividual: expect.objectContaining({
            apoioPreferencial: 'visual',
          }),
        }),
      )
    })
  })
})
