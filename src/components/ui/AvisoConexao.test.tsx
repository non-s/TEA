import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { axe } from 'vitest-axe'
import { definirAtualizacaoDisponivel } from '../../pwa/estadoAtualizacaoPWA'
import { AvisoConexao } from './AvisoConexao'

function definirOnline(valor: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: valor,
  })
}

describe('AvisoConexao', () => {
  afterEach(() => {
    definirOnline(true)
    definirAtualizacaoDisponivel(null)
  })

  it('nao renderiza nada quando online e sem atualizacao pendente', () => {
    definirOnline(true)
    const { container } = render(<AvisoConexao />)
    expect(container).toBeEmptyDOMElement()
  })

  it('avisa quando offline, sem tom alarmista', async () => {
    definirOnline(false)
    const { container } = render(<AvisoConexao />)

    expect(screen.getByRole('status')).toHaveTextContent(
      'Sem conexão agora. O app continua funcionando',
    )

    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })

  it('oferece atualizar quando o service worker anuncia nova versao', async () => {
    const user = userEvent.setup()
    definirOnline(true)
    const aplicar = () => {
      aplicado = true
    }
    let aplicado = false
    definirAtualizacaoDisponivel(aplicar)

    render(<AvisoConexao />)
    await user.click(screen.getByRole('button', { name: 'Atualizar agora' }))

    expect(aplicado).toBe(true)
  })
})
