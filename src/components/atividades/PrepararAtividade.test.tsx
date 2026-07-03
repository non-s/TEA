import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import { PrepararAtividade } from './PrepararAtividade'

function renderizarPreparacao(apoioPreferencial?: 'visual' | 'pausa') {
  render(
    <PreferenciasProvider>
      <PrepararAtividade
        instrucao="Toque na figura igual"
        apoioPreferencial={apoioPreferencial}
        apoioMediador={<p>Aceite olhar, gesto, toque ou CAA.</p>}
      >
        <p>Atividade iniciada</p>
      </PrepararAtividade>
    </PreferenciasProvider>,
  )
}

describe('PrepararAtividade', () => {
  it('mantem os passos visuais como padrao', () => {
    renderizarPreparacao()

    expect(screen.getByText('Ver')).toBeInTheDocument()
    expect(screen.getByText('Tocar')).toBeInTheDocument()
    expect(screen.getByText('Continuar')).toBeInTheDocument()
    expect(
      screen.getByText('Olhe para o modelo. A resposta pode ser tocada.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Aceite olhar, gesto, toque ou CAA.'),
    ).toBeInTheDocument()
  })

  it('adapta os passos quando o plano prioriza pausa', () => {
    renderizarPreparacao('pausa')

    expect(screen.getByText('Pausar')).toBeInTheDocument()
    expect(
      screen.getByText(
        'A pausa esta combinada. Pode pedir pausa antes de cansar.',
      ),
    ).toBeInTheDocument()
  })

  it('mantem foco previsivel antes e depois de iniciar', async () => {
    const usuario = userEvent.setup()
    renderizarPreparacao()

    expect(
      screen.getByText('Toque na figura igual', {
        selector: '#instrucao-preparacao',
      }),
    ).toHaveFocus()

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getByLabelText('Atividade iniciada')).toHaveFocus()
  })
})
