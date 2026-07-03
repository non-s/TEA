import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ApoioAtual } from './ApoioAtual'

describe('ApoioAtual', () => {
  it('mostra modo independente quando não há dica', () => {
    render(<ApoioAtual dicaAtual={undefined} />)

    expect(screen.getByText('Sozinho')).toBeInTheDocument()
    expect(screen.getByText('Responda no seu tempo.')).toBeInTheDocument()
  })

  it('mostra apoio visual quando a dica é modelagem', () => {
    render(
      <ApoioAtual
        dicaAtual={{ ordem: 0, tipo: 'modelagem', descricao: 'mostrar' }}
      />,
    )

    expect(screen.getByText('Com ajuda visual')).toBeInTheDocument()
    expect(
      screen.getByText('A resposta certa aparece com um aviso visual calmo.'),
    ).toBeInTheDocument()
  })
})
