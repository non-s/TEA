import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Progresso } from './Progresso'

const mocks = vi.hoisted(() => ({
  atualizarPerfilApoioPerfil: vi.fn(),
  atualizarPlanoIndividualPerfil: vi.fn(),
  createObjectURL: vi.fn(() => 'blob:tea'),
  erroAoOuvirPerfil: false,
  registrarObservacaoSessao: vi.fn(),
  revokeObjectURL: vi.fn(),
  selecionarPerfil: vi.fn(),
  usuario: { uid: 'responsavel-1' },
  perfil: {
    id: 'perfil-1',
    nome: 'Lia',
    avatarId: 'estrela',
    interesseEspecialId: 'neutro',
    perfilApoio: {
      comunicacaoPreferencial: 'figuras',
      acessoPreferencial: 'escolha-mediada',
      regulacaoPreferencial: 'pausa',
      limiteTentativasAntesPausa: 6,
      cartoesComunicacao: [
        {
          id: 'pausa',
          rotulo: 'Pausa',
          fala: 'Preciso de pausa.',
          apoio: 'Abrir pausa antes de insistir.',
        },
        {
          id: 'ajuda',
          rotulo: 'Ajuda',
          fala: 'Preciso de ajuda.',
          apoio: 'Apontar uma opção por vez.',
        },
        {
          id: 'nao-sei',
          rotulo: 'Não sei',
          fala: 'Ainda não sei.',
          apoio: 'Oferecer modelo sem corrigir em tom punitivo.',
        },
        {
          id: 'pronto',
          rotulo: 'Pronto',
          fala: 'Terminei.',
          apoio: 'Confirmar e encerrar com previsibilidade.',
        },
      ],
      planoRegulacao: {
        sinaisPausa: 'olha para a porta',
        estrategiasAjudam: 'fone e luz baixa',
        evitarDuranteSobrecarga: 'muitas perguntas',
      },
      observacoes: 'usa prancha em casa',
    },
    preferenciasSensoriais: {
      som: true,
      animacoes: false,
      altoContraste: false,
      alvosMaiores: true,
      tamanhoFonte: 'grande',
    },
    planoIndividual: {
      metaAtual: 'pedir pausa antes de sair',
      apoioPreferencial: 'pausa',
      observacaoMediador: 'esperar resposta por olhar',
    },
    atividadesDominadas: ['m0-n1-a1'],
  },
  tentativas: [
    {
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp: 1710000000000,
      resultado: 'correto',
      nivelDicaUsado: 2,
      tempoRespostaMs: 1200,
    },
  ],
  observacoesSessao: [
    {
      id: 'obs-1',
      tipo: 'regulacao',
      texto: 'pediu pausa antes de cansar',
      timestamp: 1710000000000,
    },
  ],
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    usuario: mocks.usuario,
  }),
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    perfilAtivo: mocks.perfil,
    selecionarPerfil: mocks.selecionarPerfil,
  }),
}))

vi.mock('../../firebase/perfis', () => ({
  LIMITE_META_ATUAL: 160,
  atualizarPerfilApoioPerfil: mocks.atualizarPerfilApoioPerfil,
  atualizarPlanoIndividualPerfil: mocks.atualizarPlanoIndividualPerfil,
  normalizarPlanoIndividual: (plano: {
    metaAtual?: string
    apoioPreferencial?: string
    observacaoMediador?: string
  }) => ({
    metaAtual: (plano.metaAtual ?? '').trim().slice(0, 160),
    apoioPreferencial: ['visual', 'verbal', 'gestual', 'pausa'].includes(
      plano.apoioPreferencial ?? '',
    )
      ? plano.apoioPreferencial
      : 'visual',
    observacaoMediador: (plano.observacaoMediador ?? '').trim().slice(0, 240),
  }),
  planoIndividualPadrao: {
    metaAtual: '',
    apoioPreferencial: 'visual',
    observacaoMediador: '',
  },
  ouvirPerfil: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (perfil: unknown) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirPerfil) {
      aoErro?.(new Error('permissao-negada'))
    } else {
      aoAtualizar(mocks.perfil)
    }
    return () => {}
  },
}))

vi.mock('../../firebase/progresso', () => ({
  LIMITE_TEXTO_OBSERVACAO_SESSAO: 500,
  textoTipoObservacaoSessao: {
    comunicacao: 'Comunicacao',
    regulacao: 'Regulacao',
    acesso: 'Acesso',
    generalizacao: 'Generalizacao',
    outro: 'Geral',
  },
  ouvirObservacoesSessao: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (observacoes: unknown[]) => void,
  ) => {
    aoAtualizar(mocks.observacoesSessao)
    return () => {}
  },
  ouvirTentativas: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (tentativas: unknown[]) => void,
  ) => {
    aoAtualizar(mocks.tentativas)
    return () => {}
  },
  registrarObservacaoSessao: mocks.registrarObservacaoSessao,
}))

function renderizarProgresso() {
  return render(
    <MemoryRouter initialEntries={['/responsavel/progresso/perfil-1']}>
      <Routes>
        <Route
          path="/responsavel/progresso/:perfilId"
          element={<Progresso />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Progresso', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.erroAoOuvirPerfil = false
    mocks.atualizarPerfilApoioPerfil.mockResolvedValue(undefined)
    mocks.atualizarPlanoIndividualPerfil.mockResolvedValue(undefined)
    mocks.registrarObservacaoSessao.mockResolvedValue(undefined)
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: mocks.createObjectURL,
        revokeObjectURL: mocks.revokeObjectURL,
      }),
    )
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  it('gera exportações locais com aviso acessível', async () => {
    const usuario = userEvent.setup()
    renderizarProgresso()

    expect(
      await screen.findByRole('heading', { name: 'Progresso de Lia' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Guia rapido do mediador' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByText(/Figuras ou CAA em papel/).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByText(/esperar resposta por olhar/).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getByText(/Os nomes dos arquivos não incluem o nome da criança/),
    ).toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', { name: 'Baixar plano fora da tela' }),
    )

    expect(mocks.createObjectURL).toHaveBeenCalledOnce()
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith('blob:tea')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Plano fora da tela gerado localmente.',
    )

    await usuario.click(
      screen.getByRole('button', { name: 'Baixar relatório para equipe' }),
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'Relatório para equipe gerado localmente.',
    )

    await usuario.click(
      screen.getByRole('button', { name: 'Baixar cartões para imprimir' }),
    )

    expect(mocks.createObjectURL).toHaveBeenCalledTimes(3)
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cartões imprimíveis gerados localmente.',
    )
  })

  it('mostra erro de carregamento sem tratar como perfil inexistente', async () => {
    mocks.erroAoOuvirPerfil = true

    renderizarProgresso()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível carregar todos os dados deste perfil agora.',
    )
    expect(
      screen.queryByText('Não encontramos esse perfil.'),
    ).not.toBeInTheDocument()
  })

  it('salva plano e registra observação com retorno anunciado', async () => {
    const usuario = userEvent.setup()
    renderizarProgresso()

    expect(await screen.findByLabelText('Meta atual')).toHaveAttribute(
      'maxlength',
      '160',
    )
    expect(screen.getByLabelText('Observacao do mediador')).toHaveAttribute(
      'maxlength',
      '240',
    )

    await usuario.clear(screen.getByLabelText('Meta atual'))
    await usuario.type(screen.getByLabelText('Meta atual'), 'pedir ajuda')
    await usuario.click(screen.getByRole('button', { name: 'Salvar plano' }))

    await waitFor(() => {
      expect(mocks.atualizarPlanoIndividualPerfil).toHaveBeenCalledWith(
        'responsavel-1',
        'perfil-1',
        expect.objectContaining({ metaAtual: 'pedir ajuda' }),
      )
    })
    expect(mocks.selecionarPerfil).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'perfil-1',
        planoIndividual: expect.objectContaining({ metaAtual: 'pedir ajuda' }),
      }),
    )
    expect(screen.getByRole('status')).toHaveTextContent('Plano salvo.')

    await usuario.selectOptions(
      screen.getByLabelText('Tipo de observacao'),
      'comunicacao',
    )
    await usuario.type(
      screen.getByLabelText('O que observei hoje'),
      'voltou melhor depois da pausa',
    )
    expect(screen.getByLabelText('O que observei hoje')).toHaveAttribute(
      'maxlength',
      '500',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Registrar observacao' }),
    )

    await waitFor(() => {
      expect(mocks.registrarObservacaoSessao).toHaveBeenCalledWith(
        'responsavel-1',
        'perfil-1',
        'voltou melhor depois da pausa',
        'comunicacao',
      )
    })
    expect(
      screen
        .getAllByRole('status')
        .some((status) => status.textContent === 'Observacao registrada.'),
    ).toBe(true)
  })

  it('mantem o perfil ativo sincronizado ao salvar perfil de apoio', async () => {
    const usuario = userEvent.setup()
    renderizarProgresso()

    expect(
      await screen.findByLabelText('Observacao de acesso e comunicacao'),
    ).toHaveAttribute('maxlength', '240')
    expect(screen.getByLabelText('Sinal de pausa')).toHaveAttribute(
      'maxlength',
      '140',
    )
    expect(screen.getByLabelText('Ajuda a regular')).toHaveAttribute(
      'maxlength',
      '140',
    )

    await usuario.selectOptions(
      await screen.findByLabelText('Acesso preferido'),
      'toque-com-ajuda',
    )
    await usuario.clear(screen.getByLabelText('Ajuda a regular'))
    await usuario.type(
      screen.getByLabelText('Ajuda a regular'),
      'luz baixa e fone',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Salvar perfil de apoio' }),
    )

    await waitFor(() => {
      expect(mocks.atualizarPerfilApoioPerfil).toHaveBeenCalledWith(
        'responsavel-1',
        'perfil-1',
        expect.objectContaining({
          acessoPreferencial: 'toque-com-ajuda',
          planoRegulacao: expect.objectContaining({
            estrategiasAjudam: 'luz baixa e fone',
          }),
        }),
      )
    })
    expect(mocks.selecionarPerfil).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'perfil-1',
        perfilApoio: expect.objectContaining({
          acessoPreferencial: 'toque-com-ajuda',
          planoRegulacao: expect.objectContaining({
            estrategiasAjudam: 'luz baixa e fone',
          }),
        }),
      }),
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Perfil de apoio salvo.',
    )
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderizarProgresso()

    await screen.findByRole('heading', { name: 'Progresso de Lia' })

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
