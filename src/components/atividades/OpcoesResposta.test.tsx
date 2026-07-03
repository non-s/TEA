import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { Estimulo, NivelDica } from '../../curriculo/tipos'
import type { AcessoPreferencial } from '../../curriculo/perfilApoio'
import { OpcoesResposta } from './OpcoesResposta'

const opcoes: Estimulo[] = [
  { id: 'a', rotulo: 'A', iconeId: 'letra-A' },
  { id: 'b', rotulo: 'B', iconeId: 'letra-B' },
]

function renderizarOpcoes(
  acessoPreferencial?: AcessoPreferencial,
  tipoDicaAtual: NivelDica['tipo'] = 'destaque-visual',
) {
  const aoEscolher = vi.fn()
  const resultado = render(
    <OpcoesResposta
      opcoes={opcoes}
      respostaId="b"
      legenda="Opcoes de resposta"
      acessoPreferencial={acessoPreferencial}
      animacoes
      tipoDicaAtual={tipoDicaAtual}
      classNameGrade="grid gap-4 border-0 p-0"
      aoEscolher={aoEscolher}
      renderOpcao={(opcao) => opcao.rotulo}
    />,
  )

  return { ...resultado, aoEscolher }
}

describe('OpcoesResposta', () => {
  it('mantem todas as opcoes disponiveis no modo direto', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('toque-direto')

    await usuario.click(screen.getByRole('button', { name: 'B' }))

    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument()
    expect(aoEscolher).toHaveBeenCalledWith(opcoes[1])
  })

  it('mostra modelagem explicita apenas na resposta correta', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('toque-direto', 'modelagem')

    expect(screen.getByText('Escolha esta')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'B. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'B. Escolha esta' }))

    expect(aoEscolher).toHaveBeenCalledWith(opcoes[1])
  })

  it('mantem destaque visual sem selo de modelagem', () => {
    renderizarOpcoes('toque-direto', 'destaque-visual')

    expect(screen.queryByText('Escolha esta')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'B' })).toBeInTheDocument()
  })

  it('permite responder por teclas numericas no modo mouse ou teclado', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('mouse-teclado')

    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute(
      'aria-keyshortcuts',
      '1',
    )
    expect(screen.getByRole('button', { name: 'B' })).toHaveAttribute(
      'aria-keyshortcuts',
      '2',
    )
    expect(
      screen.getByRole('button', { name: 'A' }).querySelector('[aria-hidden]'),
    ).toHaveTextContent('1')
    expect(
      screen.getByRole('button', { name: 'B' }).querySelector('[aria-hidden]'),
    ).toHaveTextContent('2')

    await usuario.keyboard('2')

    expect(aoEscolher).toHaveBeenCalledWith(opcoes[1])
  })

  it('mantem teclas numericas inativas no modo de toque direto', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('toque-direto')

    await usuario.keyboard('2')

    expect(aoEscolher).not.toHaveBeenCalled()
  })

  it('nao usa atalho numerico quando o foco esta em campo editavel', async () => {
    const usuario = userEvent.setup()
    const aoEscolher = vi.fn()

    render(
      <>
        <input aria-label="Campo livre" />
        <OpcoesResposta
          opcoes={opcoes}
          respostaId="b"
          legenda="Opcoes de resposta"
          acessoPreferencial="mouse-teclado"
          animacoes
          tipoDicaAtual="destaque-visual"
          classNameGrade="grid gap-4 border-0 p-0"
          aoEscolher={aoEscolher}
          renderOpcao={(opcao) => opcao.rotulo}
        />
      </>,
    )

    await usuario.click(screen.getByLabelText('Campo livre'))
    await usuario.keyboard('2')

    expect(screen.getByLabelText('Campo livre')).toHaveValue('2')
    expect(aoEscolher).not.toHaveBeenCalled()
  })

  it('confirma o toque antes de registrar a resposta quando configurado', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('toque-com-confirmacao')

    await usuario.click(screen.getByRole('button', { name: 'A' }))

    expect(aoEscolher).not.toHaveBeenCalled()
    expect(screen.getByText('Escolha: A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Confirmar A' })).toHaveFocus()

    await usuario.click(screen.getByRole('button', { name: 'Confirmar A' }))

    expect(aoEscolher).toHaveBeenCalledWith(opcoes[0])
  })

  it('mantem escolha pendente para confirmacao do mediador no toque com ajuda', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('toque-com-ajuda')

    await usuario.click(screen.getByRole('button', { name: 'A' }))

    expect(aoEscolher).not.toHaveBeenCalled()
    expect(screen.getByText('Escolha com apoio: A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'A' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('button', { name: 'Confirmar com apoio A' }),
    ).toHaveFocus()

    await usuario.click(
      screen.getByRole('button', { name: 'Confirmar com apoio A' }),
    )

    expect(aoEscolher).toHaveBeenCalledWith(opcoes[0])
  })

  it('permite trocar a escolha pendente antes de registrar', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('toque-com-confirmacao')

    await usuario.click(screen.getByRole('button', { name: 'A' }))
    await usuario.click(screen.getByRole('button', { name: 'Trocar' }))

    expect(screen.queryByText('Escolha: A')).not.toBeInTheDocument()
    expect(aoEscolher).not.toHaveBeenCalled()

    await usuario.click(screen.getByRole('button', { name: 'B' }))
    await usuario.click(screen.getByRole('button', { name: 'Confirmar B' }))

    expect(aoEscolher).toHaveBeenCalledWith(opcoes[1])
  })

  it('oferece escolha mediada com uma opcao por vez', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('escolha-mediada')

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByText('B')).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Escolher' }),
    ).toHaveAccessibleDescription('Opção 2 de 2: B')

    await usuario.click(screen.getByRole('button', { name: 'Escolher' }))
    expect(aoEscolher).toHaveBeenCalledWith(opcoes[1])
  })

  it('permite varredura manual por setas na escolha mediada', async () => {
    const usuario = userEvent.setup()
    renderizarOpcoes('escolha-mediada')

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Próxima' })).toHaveAttribute(
      'aria-keyshortcuts',
      'ArrowRight ArrowDown',
    )

    await usuario.keyboard('{ArrowRight}')

    expect(screen.getByText('B')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Escolher' }),
    ).toHaveAccessibleDescription('Opção 2 de 2: B')

    await usuario.keyboard('{ArrowLeft}')

    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('permite escolher com enter na escolha mediada quando nenhum controle esta focado', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('escolha-mediada')

    await usuario.keyboard('{ArrowRight}')
    await usuario.keyboard('{Enter}')

    expect(aoEscolher).toHaveBeenCalledWith(opcoes[1])
  })

  it('nao intercepta enter quando o foco esta em botao da escolha mediada', async () => {
    const usuario = userEvent.setup()
    const { aoEscolher } = renderizarOpcoes('escolha-mediada')

    screen.getByRole('button', { name: 'Próxima' }).focus()
    await usuario.keyboard('{Enter}')

    expect(screen.getByText('B')).toBeInTheDocument()
    expect(aoEscolher).not.toHaveBeenCalled()
  })

  it('aplica modelagem na escolha mediada quando a resposta correta aparece', async () => {
    const usuario = userEvent.setup()
    renderizarOpcoes('escolha-mediada', 'modelagem')

    expect(screen.queryByText('Escolha esta')).not.toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Próxima' }))

    expect(screen.getByText('Escolha esta')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Opção 2 de 2: B. Escolha esta'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Escolher' }),
    ).toHaveAccessibleDescription('Opção 2 de 2: B. Escolha esta')
  })

  it('nao tem violacoes de acessibilidade detectaveis automaticamente', async () => {
    const { container } = renderizarOpcoes('escolha-mediada')
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
