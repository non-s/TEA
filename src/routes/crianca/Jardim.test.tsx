import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { Jardim } from './Jardim'

const mocks = vi.hoisted(() => ({
  encerrarPerfil: vi.fn(),
  navigate: vi.fn(),
  usuario: { uid: 'responsavel-1' },
  perfilAtivo: { id: 'perfil-1', nome: 'Lia' },
  erroAoOuvirPerfil: false,
  perfilFirestore: {
    id: 'perfil-1',
    nome: 'Lia',
    atividadesDominadas: [] as string[],
  },
}))

vi.mock('react-router-dom', async () => {
  const real =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...real, useNavigate: () => mocks.navigate }
})

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ usuario: mocks.usuario }),
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    perfilAtivo: mocks.perfilAtivo,
    encerrarPerfil: mocks.encerrarPerfil,
  }),
}))

vi.mock('../../firebase/perfis', () => ({
  ouvirPerfil: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (perfil: unknown) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirPerfil) {
      aoErro?.(new Error('sem-conexao'))
    } else {
      aoAtualizar(mocks.perfilFirestore)
    }
    return () => {}
  },
}))

function renderizar() {
  return render(
    <MemoryRouter>
      <Jardim />
    </MemoryRouter>,
  )
}

describe('Jardim', () => {
  beforeEach(() => {
    mocks.encerrarPerfil.mockReset()
    mocks.navigate.mockReset()
    mocks.erroAoOuvirPerfil = false
    mocks.perfilFirestore = {
      id: 'perfil-1',
      nome: 'Lia',
      atividadesDominadas: [],
    }
  })

  it('mostra um canteiro por módulo, todos como semente sem nada dominado', async () => {
    const { container } = renderizar()

    expect(screen.getByRole('heading', { name: 'Meu jardim' })).toBeVisible()
    expect(
      screen.getByText(
        'Cada módulo que você completa faz um canteiro florescer aqui.',
      ),
    ).toBeVisible()

    const canteiros = screen.getAllByRole('listitem')
    expect(canteiros).toHaveLength(trilhaV1.modulos.length)
    expect(
      screen.getByLabelText(`${trilhaV1.modulos[0].titulo}: Ainda uma semente`),
    ).toBeInTheDocument()

    const resultados = await axe(container)
    expect(resultados.violations).toHaveLength(0)
  })

  it('floresce o canteiro do módulo totalmente dominado', () => {
    const modulo0 = trilhaV1.modulos[0]
    mocks.perfilFirestore = {
      id: 'perfil-1',
      nome: 'Lia',
      atividadesDominadas: modulo0.atividades.map((a) => a.id),
    }

    renderizar()

    expect(
      screen.getByLabelText(`${modulo0.titulo}: Floresceu!`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        `1 de ${trilhaV1.modulos.length} canteiros já floresceram.`,
      ),
    ).toBeVisible()
  })

  it('mostra erro e mantém o jardim quando a leitura do perfil falha', () => {
    mocks.erroAoOuvirPerfil = true
    renderizar()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível atualizar o jardim agora',
    )
  })

  it('encerra o perfil e volta para a seleção quando o perfil é removido', () => {
    mocks.perfilFirestore = null as never
    renderizar()

    expect(mocks.encerrarPerfil).toHaveBeenCalled()
    expect(mocks.navigate).toHaveBeenCalledWith('/responsavel/perfis')
  })
})
