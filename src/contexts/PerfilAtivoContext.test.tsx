import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PerfilCrianca } from '../firebase/perfis'
import { PerfilAtivoProvider, usePerfilAtivo } from './PerfilAtivoContext'

const perfil: PerfilCrianca = {
  id: 'perfil-1',
  nome: 'Lia',
  avatarId: 'estrela',
  interesseEspecialId: 'neutro',
  perfilApoio: {
    comunicacaoPreferencial: 'figuras',
    acessoPreferencial: 'escolha-mediada',
    regulacaoPreferencial: 'pausa',
    limiteTentativasAntesPausa: 6,
    cartoesComunicacao: [],
    planoRegulacao: {
      sinaisPausa: '',
      estrategiasAjudam: '',
      evitarDuranteSobrecarga: '',
    },
    observacoes: '',
  },
  preferenciasSensoriais: {
    som: true,
    animacoes: false,
    altoContraste: false,
    alvosMaiores: true,
    tamanhoFonte: 'grande',
  },
  planoIndividual: {
    metaAtual: '',
    apoioPreferencial: 'visual',
    observacaoMediador: '',
  },
  atividadesDominadas: [],
}

const mocks = vi.hoisted(() => ({
  auth: {
    carregando: false,
    usuario: { uid: 'responsavel-1' } as { uid: string } | null,
  },
}))

vi.mock('./AuthContext', () => ({
  useAuth: () => mocks.auth,
}))

function ExemploPerfilAtivo() {
  const { encerrarPerfil, perfilAtivo, selecionarPerfil } = usePerfilAtivo()

  return (
    <div>
      <p>{perfilAtivo ? perfilAtivo.nome : 'sem perfil'}</p>
      <button type="button" onClick={() => selecionarPerfil(perfil)}>
        selecionar
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
    sessionStorage.clear()
    mocks.auth.carregando = false
    mocks.auth.usuario = { uid: 'responsavel-1' }
  })

  it('salva e encerra o perfil ativo na sessao do navegador', async () => {
    const usuario = userEvent.setup()
    renderizarProvider()

    await usuario.click(screen.getByRole('button', { name: 'selecionar' }))

    expect(screen.getByText('Lia')).toBeInTheDocument()
    expect(sessionStorage.getItem('tea:perfilAtivo')).toContain('"id"')
    expect(sessionStorage.getItem('tea:perfilAtivo')).toContain(
      '"uidResponsavel":"responsavel-1"',
    )

    await usuario.click(screen.getByRole('button', { name: 'encerrar' }))

    expect(screen.getByText('sem perfil')).toBeInTheDocument()
    expect(sessionStorage.getItem('tea:perfilAtivo')).toBeNull()
  })

  it('remove perfil salvo quando ele pertence a outro responsavel', async () => {
    sessionStorage.setItem(
      'tea:perfilAtivo',
      JSON.stringify({
        uidResponsavel: 'responsavel-antigo',
        perfil,
      }),
    )

    renderizarProvider()

    await waitFor(() => {
      expect(screen.getByText('sem perfil')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('tea:perfilAtivo')).toBeNull()
  })

  it('remove formato legado sem responsavel verificavel', async () => {
    sessionStorage.setItem('tea:perfilAtivo', JSON.stringify(perfil))

    renderizarProvider()

    await waitFor(() => {
      expect(screen.getByText('sem perfil')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('tea:perfilAtivo')).toBeNull()
  })

  it('remove perfil salvo quando nao ha usuario autenticado', async () => {
    sessionStorage.setItem(
      'tea:perfilAtivo',
      JSON.stringify({
        uidResponsavel: 'responsavel-1',
        perfil,
      }),
    )
    mocks.auth.usuario = null

    renderizarProvider()

    await waitFor(() => {
      expect(screen.getByText('sem perfil')).toBeInTheDocument()
    })
    expect(sessionStorage.getItem('tea:perfilAtivo')).toBeNull()
  })
})
