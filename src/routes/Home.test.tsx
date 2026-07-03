import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Home } from './Home'

const mocks = vi.hoisted(() => ({
  auth: {
    usuario: null as null | { uid: string },
    carregando: false,
  },
  perfil: {
    perfilAtivo: null as null | { id: string },
  },
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mocks.auth,
}))

vi.mock('../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => mocks.perfil,
}))

function renderHome() {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/responsavel/perfis" element={<p>Seleção de perfil</p>} />
        <Route path="/crianca/trilha" element={<p>Trilha da criança</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Home', () => {
  beforeEach(() => {
    mocks.auth.usuario = null
    mocks.auth.carregando = false
    mocks.perfil.perfilAtivo = null
  })

  it('mostra entrada publica quando a familia ainda nao entrou', () => {
    renderHome()

    expect(screen.getByRole('link', { name: 'Experimentar' })).toHaveAttribute(
      'href',
      '/demo',
    )
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Criar conta' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Código aberto e auditável no/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Privacidade' })).toHaveAttribute(
      'href',
      '/privacidade',
    )
    expect(screen.getByText(/CAA e mediação respeitosa/)).toBeInTheDocument()
  })

  it('mostra carregamento enquanto a sessao ainda esta sendo lida', () => {
    mocks.auth.carregando = true

    renderHome()

    expect(screen.getByText('Carregando…')).toBeInTheDocument()
  })

  it('leva responsavel logado para selecao de perfil', async () => {
    mocks.auth.usuario = { uid: 'uid-1' }

    renderHome()

    expect(await screen.findByText('Seleção de perfil')).toBeInTheDocument()
  })

  it('leva sessao com crianca ativa direto para a trilha', async () => {
    mocks.auth.usuario = { uid: 'uid-1' }
    mocks.perfil.perfilAtivo = { id: 'perfil-1' }

    renderHome()

    expect(await screen.findByText('Trilha da criança')).toBeInTheDocument()
  })
})
