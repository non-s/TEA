import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { NomeacaoExpressiva } from './NomeacaoExpressiva'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import { definirRespostaPorVoz } from '../../preferenciasDispositivo'
import type { Atividade } from '../../curriculo/tipos'

class ReconhecimentoFalaFake {
  lang = ''
  continuous = false
  interimResults = false
  maxAlternatives = 1
  onresult: ((evento: unknown) => void) | null = null
  onerror: ((evento: unknown) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn()
  stop = vi.fn(() => {
    this.onend?.()
  })
}

let ultimaInstanciaFake: ReconhecimentoFalaFake | null = null

function instalarReconhecimentoFalaFake() {
  ultimaInstanciaFake = null
  vi.stubGlobal(
    'SpeechRecognition',
    vi.fn().mockImplementation(function () {
      ultimaInstanciaFake = new ReconhecimentoFalaFake()
      return ultimaInstanciaFake
    }),
  )
}

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-expressiva-a1',
  moduloId: 'teste',
  tipo: 'nomeacao-expressiva',
  nivelDificuldade: 1,
  alvo: { id: 'letra-M-alvo', rotulo: 'eme', iconeId: 'letra-M' },
  resposta: { id: 'letra-M-resposta', rotulo: 'eme', iconeId: 'letra-M' },
  distratores: [{ id: 'letra-P-distrator', rotulo: 'pê', iconeId: 'letra-P' }],
  dicas: [
    { ordem: 0, tipo: 'modelagem', descricao: '' },
    { ordem: 1, tipo: 'destaque-visual', descricao: '' },
    { ordem: 2, tipo: 'nenhuma', descricao: '' },
  ],
  criteriosDominio: { acertosConsecutivosNecessarios: 1, janelaTentativas: 10 },
}

const tentativasParaNivelIndependente = [
  {
    atividadeId: atividade.id,
    moduloId: atividade.moduloId,
    timestamp: 1,
    resultado: 'correto' as const,
    nivelDicaUsado: 1,
    tempoRespostaMs: 1000,
  },
  {
    atividadeId: atividade.id,
    moduloId: atividade.moduloId,
    timestamp: 2,
    resultado: 'correto' as const,
    nivelDicaUsado: 1,
    tempoRespostaMs: 1000,
  },
]

describe('NomeacaoExpressiva', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('nao mostra o botao de falar quando a preferencia do dispositivo esta desligada', () => {
    instalarReconhecimentoFalaFake()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Falar a resposta' }),
    ).not.toBeInTheDocument()
  })

  it('nao mostra o botao de falar quando o navegador nao suporta, mesmo com a preferencia ligada', () => {
    definirRespostaPorVoz(true)
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.queryByRole('button', { name: 'Falar a resposta' }),
    ).not.toBeInTheDocument()
  })

  it('aceita a resposta falada quando corresponde ao som da letra', async () => {
    instalarReconhecimentoFalaFake()
    definirRespostaPorVoz(true)
    const usuario = userEvent.setup()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'Falar a resposta' }),
    )
    expect(
      screen.getByRole('button', { name: 'Ouvindo... toque para parar' }),
    ).toBeInTheDocument()

    act(() => {
      ultimaInstanciaFake?.onresult?.({
        results: { 0: { 0: { transcript: 'eme' } }, length: 1 },
      })
    })

    expect(screen.getByText('Isso!')).toBeInTheDocument()
  })

  it('mostra "tente de novo" quando a fala nao corresponde a letra', async () => {
    instalarReconhecimentoFalaFake()
    definirRespostaPorVoz(true)
    const usuario = userEvent.setup()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'Falar a resposta' }),
    )

    act(() => {
      ultimaInstanciaFake?.onresult?.({
        results: { 0: { 0: { transcript: 'pe' } }, length: 1 },
      })
    })

    expect(screen.getByText('Tente de novo')).toBeInTheDocument()
  })

  it('mostra erro amigavel quando o microfone e negado', async () => {
    instalarReconhecimentoFalaFake()
    definirRespostaPorVoz(true)
    const usuario = userEvent.setup()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(
      screen.getByRole('button', { name: 'Falar a resposta' }),
    )

    act(() => {
      ultimaInstanciaFake?.onerror?.({ error: 'not-allowed' })
    })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Permita o uso do microfone para responder por voz.',
    )
  })

  it('mostra a letra e as opções de nome', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(screen.getByText('Qual é o nome desta letra?')).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('button', { name: 'eme. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'pê' })).toBeInTheDocument()
  })

  it('chama aoDominar após atingir o critério de domínio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={aoDominar}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'eme' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <NomeacaoExpressiva
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
