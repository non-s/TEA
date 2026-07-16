import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Tentativa } from '../../curriculo/tipos'
import { Atividade } from './Atividade'

const mocks = vi.hoisted(() => ({
  marcarAtividadeDominada: vi.fn(),
  erroAoOuvirTentativas: false,
  navigate: vi.fn(),
  registrarObservacaoSessao: vi.fn(),
  registrarTentativa: vi.fn(),
  tentativas: [] as Tentativa[],
  usuario: { uid: 'responsavel-1' },
  perfilAtivo: {
    id: 'perfil-1',
    nome: 'Lia',
    interesseEspecialId: 'neutro',
    planoIndividual: {
      metaAtual: '',
      apoioPreferencial: 'pausa',
      observacaoMediador: '',
    },
    perfilApoio: {
      acessoPreferencial: 'toque-direto',
      regulacaoPreferencial: 'pausa',
      limiteTentativasAntesPausa: 6,
      planoRegulacao: {
        sinaisPausa: 'olha para a porta',
        estrategiasAjudam: 'fone e luz baixa',
        evitarDuranteSobrecarga: '',
      },
    },
    atividadesDominadas: [] as string[],
  },
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
  }),
}))

vi.mock('../../firebase/perfis', () => ({
  marcarAtividadeDominada: mocks.marcarAtividadeDominada,
}))

vi.mock('../../firebase/progresso', () => ({
  ouvirTentativas: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (tentativas: unknown[]) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirTentativas) {
      aoErro?.(new Error('sem-conexao'))
    } else {
      aoAtualizar(mocks.tentativas)
    }
    return () => {}
  },
  registrarObservacaoSessao: mocks.registrarObservacaoSessao,
  registrarTentativa: mocks.registrarTentativa,
}))

vi.mock('react-router-dom', async () => {
  const atual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...atual,
    useNavigate: () => mocks.navigate,
  }
})

function renderizarAtividade(atividadeId = 'm0-n1-a1') {
  return render(
    <PreferenciasProvider>
      <MemoryRouter initialEntries={[`/crianca/atividade/${atividadeId}`]}>
        <Routes>
          <Route
            path="/crianca/atividade/:atividadeId"
            element={<Atividade />}
          />
        </Routes>
      </MemoryRouter>
    </PreferenciasProvider>,
  )
}

describe('Atividade', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mocks.tentativas = []
    mocks.erroAoOuvirTentativas = false
    mocks.perfilAtivo.interesseEspecialId = 'neutro'
    mocks.perfilAtivo.perfilApoio.acessoPreferencial = 'toque-direto'
    mocks.perfilAtivo.perfilApoio.regulacaoPreferencial = 'pausa'
    mocks.perfilAtivo.perfilApoio.limiteTentativasAntesPausa = 6
    mocks.perfilAtivo.atividadesDominadas = []
    mocks.perfilAtivo.perfilApoio.planoRegulacao = {
      sinaisPausa: 'olha para a porta',
      estrategiasAjudam: 'fone e luz baixa',
      evitarDuranteSobrecarga: '',
    }
    mocks.registrarObservacaoSessao.mockResolvedValue(undefined)
  })

  it('abre pausa como dialogo nomeado e retorna foco para continuar', async () => {
    const usuario = userEvent.setup()
    const { container } = renderizarAtividade()

    await usuario.click(
      screen.getByRole('button', { name: 'Pausa. Preciso de uma pausa.' }),
    )

    const dialogo = screen.getByRole('dialog', { name: 'Pausa' })
    expect(dialogo).toHaveAccessibleDescription(
      'Esta pausa faz parte da atividade. Volte quando o corpo estiver pronto.',
    )
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveFocus()
    expect(
      screen.queryByRole('button', { name: 'Pausa. Preciso de uma pausa.' }),
    ).not.toBeInTheDocument()
    const botaoMaisPausa = screen.getByRole('button', { name: 'Mais pausa' })
    const linkTrilha = screen.getByRole('link', {
      name: 'Voltar para a trilha',
    })
    expect(linkTrilha).toBeInTheDocument()
    await usuario.tab()
    expect(botaoMaisPausa).toHaveFocus()
    await usuario.tab()
    expect(linkTrilha).toHaveFocus()
    await usuario.tab()
    expect(screen.getByRole('button', { name: 'Continuar' })).toHaveFocus()
    await usuario.tab({ shift: true })
    expect(linkTrilha).toHaveFocus()
    const acordoVisual = screen.getByRole('list', {
      name: 'Acordo visual para voltar da pausa',
    })
    expect(acordoVisual).toBeInTheDocument()
    expect(within(acordoVisual).getByText('Primeiro')).toBeInTheDocument()
    expect(
      within(acordoVisual).getByText('Pausa combinada'),
    ).toBeInTheDocument()
    expect(within(acordoVisual).getByText('Depois')).toBeInTheDocument()
    expect(
      within(acordoVisual).getByText('Voltar para uma parte pequena'),
    ).toBeInTheDocument()
    const planoRegulacao = screen.getByRole('region', {
      name: 'Plano de regulacao combinado',
    })
    expect(
      within(planoRegulacao).getByText('Sinal de pausa'),
    ).toBeInTheDocument()
    expect(
      within(planoRegulacao).getByText('olha para a porta'),
    ).toBeInTheDocument()
    expect(
      within(planoRegulacao).getByText('Ajuda a regular'),
    ).toBeInTheDocument()
    expect(
      within(planoRegulacao).getByText('fone e luz baixa'),
    ).toBeInTheDocument()
    expect(mocks.registrarObservacaoSessao).toHaveBeenCalledWith(
      'responsavel-1',
      'perfil-1',
      'Comunicou "Pausa": Preciso de uma pausa.',
      'regulacao',
    )

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)

    await usuario.click(botaoMaisPausa)
    expect(
      screen.getByText(
        'Tudo bem. A pausa continua. Volte só quando o corpo estiver pronto.',
      ),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(
      screen.queryByRole('dialog', { name: 'Pausa' }),
    ).not.toBeInTheDocument()
  })

  it('confirma antes de sair da atividade para a trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade()

    await usuario.click(
      screen.getByRole('button', { name: /Voltar para a trilha/ }),
    )

    const dialogo = screen.getByRole('dialog', {
      name: 'Voltar para a trilha?',
    })
    expect(dialogo).toHaveAccessibleDescription(
      'A atividade pode continuar daqui.',
    )
    expect(
      within(dialogo).getByRole('button', { name: 'Continuar atividade' }),
    ).toHaveFocus()
    await usuario.tab()
    expect(
      within(dialogo).getByRole('button', { name: 'Voltar para a trilha' }),
    ).toHaveFocus()
    await usuario.tab()
    expect(
      within(dialogo).getByRole('button', { name: 'Continuar atividade' }),
    ).toHaveFocus()
    await usuario.tab({ shift: true })
    expect(
      within(dialogo).getByRole('button', { name: 'Voltar para a trilha' }),
    ).toHaveFocus()
    expect(mocks.navigate).not.toHaveBeenCalled()

    await usuario.click(
      within(dialogo).getByRole('button', { name: 'Continuar atividade' }),
    )

    expect(
      screen.queryByRole('dialog', { name: 'Voltar para a trilha?' }),
    ).not.toBeInTheDocument()
    expect(mocks.navigate).not.toHaveBeenCalled()

    await usuario.click(
      screen.getByRole('button', { name: /Voltar para a trilha/ }),
    )
    await usuario.click(
      within(
        screen.getByRole('dialog', { name: 'Voltar para a trilha?' }),
      ).getByRole('button', { name: 'Voltar para a trilha' }),
    )

    expect(mocks.navigate).toHaveBeenCalledWith('/crianca/trilha')
  })

  it('adapta a pausa quando o perfil regula melhor com movimento', async () => {
    mocks.perfilAtivo.perfilApoio.regulacaoPreferencial = 'movimento'
    const usuario = userEvent.setup()
    renderizarAtividade()

    expect(screen.getByText('Pode mover')).toBeInTheDocument()
    expect(screen.getByText('Movimento')).toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', { name: 'Pausa. Preciso de uma pausa.' }),
    )

    expect(
      screen.getByText(
        'Pode mover o corpo com seguranca. Alongar, levantar ou apertar as maos pode ajudar.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Mover')).toBeInTheDocument()
    expect(screen.getByText('Mover o corpo com segurança')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mais movimento' }),
    ).toBeInTheDocument()
  })

  it('mostra motivo visual do interesse no painel de comunicacao da atividade', () => {
    mocks.perfilAtivo.interesseEspecialId = 'animais'
    renderizarAtividade()

    const pausa = screen.getByRole('button', {
      name: 'Pausa. Preciso de uma pausa.',
    })

    expect(within(pausa).getByText('II')).toBeInTheDocument()
    expect(within(pausa).getByText('🐾')).toBeInTheDocument()
  })

  it('renderiza leitura de frase pelo tipo de atividade da trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade('m6-A-MALA')

    expect(screen.getByText('Toque na frase: A mala')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'A MALA. Escolha esta' }),
    ).toBeInTheDocument()
  })

  it('renderiza compreensao de frase pelo tipo de atividade da trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade('m7-A-MALA')

    expect(
      screen.getByText('Leia a frase e escolha a palavra: A mala'),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'MALA. Escolha esta' }),
    ).toBeInTheDocument()
  })

  it('renderiza compreensao de texto pelo tipo de atividade da trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade('m8-A-MALA-A-BALA')

    expect(
      screen.getByText(
        'Leia o texto e escolha uma palavra que aparece nele: A mala. A bala.',
      ),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'MALA. Escolha esta' }),
    ).toBeInTheDocument()
  })

  it('renderiza pergunta literal de texto pelo tipo de atividade da trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade('m9-O-que-apareceu-primeiro-A-MALA-A-BALA')

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
  })

  it('renderiza pergunta de presenca no texto pelo tipo de atividade da trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade(
      'm9-presenca-Qual-palavra-nao-apareceu-no-texto-A-MALA-A-BALA',
    )

    expect(
      screen.getByText(
        'Leia o texto. Depois responda: Qual palavra não apareceu no texto? A mala. A bala.',
      ),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByText('Qual palavra não apareceu no texto?'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'LATA. Escolha esta' }),
    ).toBeInTheDocument()
  })

  it('renderiza pergunta de inferencia guiada pelo tipo de atividade da trilha', async () => {
    const usuario = userEvent.setup()
    renderizarAtividade('m9-inferencia-Qual-palavra-anda-na-rua-A-MOTO-A-PIPA')

    expect(
      screen.getByText(
        'Leia o texto. Depois responda: Qual palavra anda na rua? A moto. A pipa.',
      ),
    ).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByText('Qual palavra anda na rua?')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'MOTO. Escolha esta' }),
    ).toBeInTheDocument()
  })

  it('continua com apoio visual quando o historico nao carrega', async () => {
    mocks.erroAoOuvirTentativas = true
    renderizarAtividade('m0-n1-a1')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'O histórico não carregou agora.',
    )
    expect(
      screen.getByText('Toque na figura igual a esta: círculo'),
    ).toBeInTheDocument()
  })

  it('avisa quando a resposta ainda nao foi salva sem bloquear a atividade', async () => {
    mocks.registrarTentativa.mockRejectedValueOnce(new Error('offline'))
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'círculo. Escolha esta' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A resposta foi respeitada, mas ainda não foi salva.',
    )
    expect(screen.getByText('Isso!')).toBeInTheDocument()
  })

  it('aumenta a ajuda visual quando a crianca pede ajuda', async () => {
    mocks.tentativas = [
      {
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 1,
        resultado: 'correto',
        nivelDicaUsado: 1,
        tempoRespostaMs: 1000,
      },
      {
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 2,
        resultado: 'correto',
        nivelDicaUsado: 1,
        tempoRespostaMs: 1000,
      },
    ]
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    expect(screen.getByRole('button', { name: 'círculo' })).toBeInTheDocument()
    expect(screen.queryByText('Escolha esta')).not.toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', { name: 'Ajuda. Preciso de ajuda.' }),
    )

    expect(
      await screen.findByRole('button', { name: 'círculo. Escolha esta' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('A próxima resposta terá ajuda visual.'),
    ).toBeInTheDocument()
    expect(mocks.registrarObservacaoSessao).toHaveBeenCalledWith(
      'responsavel-1',
      'perfil-1',
      'Comunicou "Ajuda": Preciso de ajuda.',
      'comunicacao',
    )
  })

  it('avisa quando a comunicacao foi respeitada mas nao registrada', async () => {
    mocks.registrarObservacaoSessao.mockRejectedValueOnce(new Error('offline'))
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'Ajuda. Preciso de ajuda.' }),
    )

    expect(
      await screen.findByText(
        'A comunicacao foi respeitada, mas o registro nao salvou agora.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'círculo. Escolha esta' }),
    ).toBeInTheDocument()
  })

  it('aumenta a ajuda visual quando a crianca comunica que nao sabe', async () => {
    mocks.tentativas = [
      {
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 1,
        resultado: 'correto',
        nivelDicaUsado: 1,
        tempoRespostaMs: 1000,
      },
      {
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 2,
        resultado: 'correto',
        nivelDicaUsado: 1,
        tempoRespostaMs: 1000,
      },
    ]
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    expect(screen.getByRole('button', { name: 'círculo' })).toBeInTheDocument()
    expect(screen.queryByText('Escolha esta')).not.toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', { name: 'Não sei. Eu não sei ainda.' }),
    )

    expect(
      await screen.findByRole('button', { name: 'círculo. Escolha esta' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Tudo bem. A próxima tentativa terá mais apoio.'),
    ).toBeInTheDocument()
  })

  it('dispensa sugestao de pausa quando a crianca comunica que esta pronta', async () => {
    mocks.perfilAtivo.perfilApoio.limiteTentativasAntesPausa = 1
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'círculo. Escolha esta' }),
    )

    expect(screen.getByText('Pausa pode ajudar agora')).toBeInTheDocument()

    await usuario.click(
      screen.getByRole('button', {
        name: 'Pronto. Estou pronto para continuar.',
      }),
    )

    expect(
      screen.queryByText('Pausa pode ajudar agora'),
    ).not.toBeInTheDocument()
    expect(mocks.registrarTentativa).toHaveBeenCalledOnce()
  })

  it('adapta a sugestao de pausa quando movimento ajuda a regular', async () => {
    mocks.perfilAtivo.perfilApoio.limiteTentativasAntesPausa = 1
    mocks.perfilAtivo.perfilApoio.regulacaoPreferencial = 'movimento'
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'círculo. Escolha esta' }),
    )

    expect(screen.getByText('Movimento pode ajudar agora')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mover' })).toBeInTheDocument()
  })

  it('encerra a sessao em uma tela previsivel antes de voltar para a trilha', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    mocks.perfilAtivo.perfilApoio.limiteTentativasAntesPausa = 1
    const usuario = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      delay: null,
    })
    renderizarAtividade('m0-n1-a1')

    async function responderIncorreto() {
      await usuario.click(screen.getByRole('button', { name: /quadrado/i }))
      await act(async () => {
        await vi.advanceTimersByTimeAsync(800)
      })
    }

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await responderIncorreto()
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))
    await responderIncorreto()
    await usuario.click(screen.getByRole('button', { name: 'Continuar' }))
    await responderIncorreto()

    expect(screen.getByText('Pode terminar por agora')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Encerrar' }))

    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(
      screen.getByRole('heading', { name: 'Sessão encerrada' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: 'Roteiro para terminar a sessão' }),
    ).toHaveTextContent('AgoraDescansarDepoisVoltar quando quiser')
    expect(
      screen.getByRole('button', { name: 'Voltar para a trilha' }),
    ).toHaveFocus()

    await usuario.click(
      screen.getByRole('button', { name: 'Continuar atividade' }),
    )

    expect(
      screen.queryByRole('heading', { name: 'Sessão encerrada' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /círculo/i })).toBeInTheDocument()

    expect(mocks.navigate).not.toHaveBeenCalled()
  })

  it('mostra conclusao previsivel antes de voltar para a trilha', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      delay: null,
    })
    mocks.tentativas = Array.from({ length: 7 }, (_, indice) => ({
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp: indice + 1,
      resultado: 'correto' as const,
      nivelDicaUsado: 2,
      tempoRespostaMs: 1000,
    }))
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'círculo' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800)
    })

    expect(mocks.marcarAtividadeDominada).toHaveBeenCalledWith(
      'responsavel-1',
      'perfil-1',
      'm0-n1-a1',
    )
    expect(mocks.navigate).not.toHaveBeenCalled()
    expect(
      screen.getByRole('heading', { name: 'Atividade concluída' }),
    ).toBeInTheDocument()
    expect(screen.getByText('círculo')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Voltar para a trilha' }),
    ).toHaveFocus()
    const botaoProxima = await screen.findByRole('button', {
      name: 'Próxima atividade: estrela',
    })

    await usuario.click(
      screen.getByRole('button', { name: 'Voltar para a trilha' }),
    )

    expect(mocks.navigate).toHaveBeenCalledWith('/crianca/trilha')

    await usuario.click(botaoProxima)

    expect(mocks.navigate).toHaveBeenCalledWith('/crianca/atividade/m0-n1-a2')
    vi.useRealTimers()
  })

  it('avisa quando o dominio foi concluido mas ainda nao salvo', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
      delay: null,
    })
    mocks.marcarAtividadeDominada.mockRejectedValue(new Error('offline'))
    mocks.tentativas = Array.from({ length: 7 }, (_, indice) => ({
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp: indice + 1,
      resultado: 'correto' as const,
      nivelDicaUsado: 2,
      tempoRespostaMs: 1000,
    }))
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'círculo' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(800)
    })

    expect(
      screen.getByRole('heading', { name: 'Atividade concluída' }),
    ).toBeInTheDocument()

    vi.useRealTimers() // findByRole needs real timers to poll DOM

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Falha ao salvar (Erro do Firebase): offline',
    )
    expect(
      screen.queryByRole('button', { name: /Próxima atividade/i }),
    ).not.toBeInTheDocument()
  })

  it('usa escolha mediada quando o perfil indica olhar ou gesto', async () => {
    mocks.perfilAtivo.perfilApoio.acessoPreferencial = 'escolha-mediada'
    const usuario = userEvent.setup()
    renderizarAtividade('m0-n1-a1')

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByRole('button', { name: 'Anterior' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Escolher' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próxima' })).toBeInTheDocument()
  })
})
