import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { TracadoLetra } from './TracadoLetra'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-tracado-i',
  moduloId: 'teste',
  tipo: 'tracado-letra',
  nivelDificuldade: 1,
  alvo: { id: 'letra-I-tracado-alvo', rotulo: 'i', iconeId: 'letra-I' },
  resposta: { id: 'letra-I-tracado-resposta', rotulo: 'i', iconeId: 'letra-I' },
  distratores: [],
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

function tracarNaArea(area: Element, pontos: Array<[number, number]>) {
  const [primeiro, ...resto] = pontos
  fireEvent.pointerDown(area, { clientX: primeiro[0], clientY: primeiro[1] })
  for (const [x, y] of resto) {
    fireEvent.pointerMove(area, { clientX: x, clientY: y })
  }
  fireEvent.pointerUp(area)
}

describe('TracadoLetra', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra a letra e a área de traçado', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <TracadoLetra
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.getByText(/Trace a letra I com o dedo ou o mouse/),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(
      screen.getByRole('img', { name: 'Área para traçar a letra I' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Verificar traçado' }),
    ).toBeDisabled()
  })

  it('nao quebra ao desenhar antes do SVG ter layout (retangulo com tamanho zero)', async () => {
    // jsdom nao calcula layout real: getBoundingClientRect() sem mock
    // retorna width/height zero, o mesmo cenario de um pointerdown disparado
    // antes do primeiro paint no navegador real.
    const usuario = userEvent.setup()
    renderComProvider(
      <TracadoLetra
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    const area = screen.getByRole('img', {
      name: 'Área para traçar a letra I',
    })
    tracarNaArea(area, [
      [50, 10],
      [50, 90],
    ])

    expect(
      screen.getByRole('button', { name: 'Verificar traçado' }),
    ).toBeEnabled()
  })

  it('aprova um traçado fiel ao guia e chama aoDominar', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    } as DOMRect)
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <TracadoLetra
        atividade={atividade}
        aoDominar={aoDominar}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    const area = screen.getByRole('img', {
      name: 'Área para traçar a letra I',
    })
    tracarNaArea(
      area,
      Array.from(
        { length: 11 },
        (_, i) => [50, 10 + i * 8] as [number, number],
      ),
    )

    await usuario.click(
      screen.getByRole('button', { name: 'Verificar traçado' }),
    )
    expect(screen.getByText('Isso!')).toBeInTheDocument()

    await vi.advanceTimersByTimeAsync(1000)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('reprova um traçado bem distante do guia', async () => {
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    } as DOMRect)
    const usuario = userEvent.setup()
    renderComProvider(
      <TracadoLetra
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    const area = screen.getByRole('img', {
      name: 'Área para traçar a letra I',
    })
    tracarNaArea(area, [
      [95, 95],
      [96, 96],
    ])

    await usuario.click(
      screen.getByRole('button', { name: 'Verificar traçado' }),
    )
    expect(screen.getByText('Tente de novo')).toBeInTheDocument()
  })

  it('permite limpar o traçado antes de verificar', async () => {
    vi.spyOn(SVGSVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
    } as DOMRect)
    const usuario = userEvent.setup()
    renderComProvider(
      <TracadoLetra
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    const area = screen.getByRole('img', {
      name: 'Área para traçar a letra I',
    })
    tracarNaArea(area, [
      [50, 10],
      [50, 50],
    ])

    expect(screen.getByRole('button', { name: 'Limpar' })).toBeEnabled()
    await usuario.click(screen.getByRole('button', { name: 'Limpar' }))
    expect(screen.getByRole('button', { name: 'Limpar' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Verificar traçado' }),
    ).toBeDisabled()
  })

  it('não tem violações de acessibilidade detectáveis automaticamente', async () => {
    const { container } = renderComProvider(
      <TracadoLetra
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
