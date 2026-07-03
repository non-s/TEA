import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import { PainelComunicacao } from './PainelComunicacao'

describe('PainelComunicacao', () => {
  it('mostra simbolos visuais estaveis sem trocar o nome acessivel', () => {
    render(
      <PreferenciasProvider>
        <PainelComunicacao />
      </PreferenciasProvider>,
    )

    const pausa = screen.getByRole('button', {
      name: 'Pausa. Preciso de uma pausa.',
    })
    const ajuda = screen.getByRole('button', {
      name: 'Ajuda. Preciso de ajuda.',
    })
    const naoSei = screen.getByRole('button', {
      name: 'Não sei. Eu não sei ainda.',
    })
    const pronto = screen.getByRole('button', {
      name: 'Pronto. Estou pronto para continuar.',
    })

    expect(within(pausa).getByText('II')).toBeInTheDocument()
    expect(within(ajuda).getByText('+')).toBeInTheDocument()
    expect(within(naoSei).getByText('?')).toBeInTheDocument()
    expect(within(pronto).getByText('OK')).toBeInTheDocument()
  })

  it('adiciona motivo visual por interesse mantendo o nome acessivel do cartao', () => {
    render(
      <PreferenciasProvider>
        <PainelComunicacao interesseEspecialId="natureza" />
      </PreferenciasProvider>,
    )

    const pausa = screen.getByRole('button', {
      name: 'Pausa. Preciso de uma pausa.',
    })

    expect(within(pausa).getByText('II')).toBeInTheDocument()
    expect(within(pausa).getByText('🌿')).toBeInTheDocument()
  })

  it('aciona pausa quando a criança pede pausa', async () => {
    const usuario = userEvent.setup()
    const aoPedirPausa = vi.fn()

    render(
      <PreferenciasProvider>
        <PainelComunicacao aoPedirPausa={aoPedirPausa} />
      </PreferenciasProvider>,
    )

    await usuario.click(
      screen.getByRole('button', { name: 'Pausa. Preciso de uma pausa.' }),
    )

    expect(aoPedirPausa).toHaveBeenCalledOnce()
    expect(
      screen.queryByRole('button', { name: 'PausaPreciso de uma pausa.' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Respirar, levantar ou voltar depois.'),
    ).toBeInTheDocument()
  })

  it('usa cartoes personalizados do perfil', async () => {
    const usuario = userEvent.setup()
    const aoPedirAjuda = vi.fn()
    const aoComunicar = vi.fn()

    render(
      <PreferenciasProvider>
        <PainelComunicacao
          aoComunicar={aoComunicar}
          aoPedirAjuda={aoPedirAjuda}
          cartoesComunicacao={[
            {
              id: 'pausa',
              rotulo: 'Pausa',
              fala: 'Preciso de uma pausa.',
              apoio: 'Respirar, levantar ou voltar depois.',
            },
            {
              id: 'ajuda',
              rotulo: 'Mostra',
              fala: 'Mostra de novo.',
              apoio: 'Apontar uma opcao por vez.',
            },
          ]}
        />
      </PreferenciasProvider>,
    )

    await usuario.click(
      screen.getByRole('button', { name: 'Mostra. Mostra de novo.' }),
    )

    expect(screen.getByText('Apontar uma opcao por vez.')).toBeInTheDocument()
    expect(aoPedirAjuda).toHaveBeenCalledOnce()
    expect(aoComunicar).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'ajuda',
        rotulo: 'Mostra',
        fala: 'Mostra de novo.',
      }),
    )
  })

  it('tambem solicita apoio quando a crianca comunica que nao sabe', async () => {
    const usuario = userEvent.setup()
    const aoPedirAjuda = vi.fn()

    render(
      <PreferenciasProvider>
        <PainelComunicacao aoPedirAjuda={aoPedirAjuda} />
      </PreferenciasProvider>,
    )

    await usuario.click(
      screen.getByRole('button', { name: 'Não sei. Eu não sei ainda.' }),
    )

    expect(aoPedirAjuda).toHaveBeenCalledOnce()
    expect(
      screen.getByText('Tudo bem. A próxima tentativa terá mais apoio.'),
    ).toBeInTheDocument()
  })

  it('comunica prontidao sem pedir pausa nem ajuda', async () => {
    const usuario = userEvent.setup()
    const aoComunicarPronto = vi.fn()
    const aoPedirAjuda = vi.fn()
    const aoPedirPausa = vi.fn()

    render(
      <PreferenciasProvider>
        <PainelComunicacao
          aoComunicarPronto={aoComunicarPronto}
          aoPedirAjuda={aoPedirAjuda}
          aoPedirPausa={aoPedirPausa}
        />
      </PreferenciasProvider>,
    )

    await usuario.click(
      screen.getByRole('button', {
        name: 'Pronto. Estou pronto para continuar.',
      }),
    )

    expect(aoComunicarPronto).toHaveBeenCalledOnce()
    expect(aoPedirAjuda).not.toHaveBeenCalled()
    expect(aoPedirPausa).not.toHaveBeenCalled()
    expect(screen.getByText('Continuar no meu ritmo.')).toBeInTheDocument()
  })
})
