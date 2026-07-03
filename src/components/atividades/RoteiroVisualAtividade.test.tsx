import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RoteiroVisualAtividade } from './RoteiroVisualAtividade'

describe('RoteiroVisualAtividade', () => {
  it('mostra preparar como etapa atual antes da atividade iniciar', () => {
    render(
      <RoteiroVisualAtividade
        etapaAtual="preparar"
        rotuloAtividade="circulo"
      />,
    )

    const roteiro = screen.getByRole('list', {
      name: 'Roteiro visual da atividade',
    })
    const etapaAtual = within(roteiro).getByText('Ver').closest('li')

    expect(etapaAtual).toHaveAttribute('aria-current', 'step')
    expect(within(roteiro).getByText('Depois')).toBeInTheDocument()
    expect(within(roteiro).getByText('circulo')).toBeInTheDocument()
    expect(within(roteiro).getByText('Pode pedir')).toBeInTheDocument()
  })

  it('mostra fazer como etapa atual depois de iniciar', () => {
    render(
      <RoteiroVisualAtividade
        etapaAtual="atividade"
        rotuloAtividade="letra A"
      />,
    )

    const roteiro = screen.getByRole('list', {
      name: 'Roteiro visual da atividade',
    })
    const etapaAtual = within(roteiro).getByText('Tocar').closest('li')

    expect(etapaAtual).toHaveAttribute('aria-current', 'step')
    expect(within(roteiro).getByText('letra A')).toBeInTheDocument()
    expect(within(roteiro).getByText('Continuar')).toBeInTheDocument()
  })

  it('marca a pausa como combinada quando o apoio preferencial prioriza pausa', () => {
    render(
      <RoteiroVisualAtividade
        etapaAtual="preparar"
        rotuloAtividade="estrela"
        apoioPreferencial="pausa"
      />,
    )

    const roteiro = screen.getByRole('list', {
      name: 'Roteiro visual da atividade',
    })

    expect(within(roteiro).getByText('Pausar')).toBeInTheDocument()
    expect(within(roteiro).getByText('Combinada')).toBeInTheDocument()
  })

  it('adapta o roteiro de pausa para regulacao por movimento', () => {
    render(
      <RoteiroVisualAtividade
        etapaAtual="preparar"
        rotuloAtividade="estrela"
        regulacaoPreferencial="movimento"
      />,
    )

    const roteiro = screen.getByRole('list', {
      name: 'Roteiro visual da atividade',
    })

    expect(within(roteiro).getByText('Pode mover')).toBeInTheDocument()
    expect(within(roteiro).getByText('Movimento')).toBeInTheDocument()
  })

  it('adapta o roteiro de pausa para ambiente calmo', () => {
    render(
      <RoteiroVisualAtividade
        etapaAtual="preparar"
        rotuloAtividade="estrela"
        regulacaoPreferencial="ambiente-calmo"
      />,
    )

    const roteiro = screen.getByRole('list', {
      name: 'Roteiro visual da atividade',
    })

    expect(within(roteiro).getByText('Pode acalmar')).toBeInTheDocument()
    expect(within(roteiro).getByText('Ambiente calmo')).toBeInTheDocument()
  })
})
