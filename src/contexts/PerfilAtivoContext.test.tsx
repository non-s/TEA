import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PerfilAtivoProvider, usePerfilAtivo } from './PerfilAtivoContext'

function ExemploPerfilAtivo() {
  const { criarPerfil, encerrarPerfil, perfilAtivo, marcarAtividadeDominada } =
    usePerfilAtivo()

  return (
    <div>
      <p>{perfilAtivo ? perfilAtivo.nome : 'sem perfil'}</p>
      <p>{perfilAtivo?.atividadesDominadas.length ?? 0}</p>
      <button type="button" onClick={() => criarPerfil('Lia', 'estrela')}>
        criar
      </button>
      <button type="button" onClick={() => marcarAtividadeDominada('m0-n1-a1')}>
        dominar
      </button>
      <button type="button" onClick={encerrarPerfil}>
        encerrar
      </button>
    </div>
  )
}

function renderizarProvider() {
  render(
    <PerfilAtivoProvider>
      <ExemploPerfilAtivo />
    </PerfilAtivoProvider>,
  )
}

describe('PerfilAtivoProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cria e seleciona um perfil salvo neste aparelho', async () => {
    const usuario = userEvent.setup()
    renderizarProvider()

    await usuario.click(screen.getByRole('button', { name: 'criar' }))

    expect(screen.getByText('Lia')).toBeInTheDocument()
    expect(localStorage.getItem('tea:perfil-ativo-id')).toBeTruthy()
    expect(localStorage.getItem('tea:perfis-locais')).toContain('"Lia"')
  })

  it('encerra o perfil ativo sem apagar o perfil salvo', async () => {
    const usuario = userEvent.setup()
    renderizarProvider()

    await usuario.click(screen.getByRole('button', { name: 'criar' }))
    expect(screen.getByText('Lia')).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'encerrar' }))

    expect(screen.getByText('sem perfil')).toBeInTheDocument()
    expect(localStorage.getItem('tea:perfil-ativo-id')).toBeNull()
    expect(localStorage.getItem('tea:perfis-locais')).toContain('"Lia"')
  })

  it('marca atividade dominada no perfil ativo', async () => {
    const usuario = userEvent.setup()
    renderizarProvider()

    await usuario.click(screen.getByRole('button', { name: 'criar' }))
    await usuario.click(screen.getByRole('button', { name: 'dominar' }))

    expect(screen.getByText('1')).toBeInTheDocument()
  })
})
