import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { Jardim } from './Jardim'

const mocks = vi.hoisted(() => ({
  perfilAtivo: {
    id: 'perfil-1',
    nome: 'Lia',
    atividadesDominadas: [] as string[],
  },
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    perfilAtivo: mocks.perfilAtivo,
  }),
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
    mocks.perfilAtivo = { id: 'perfil-1', nome: 'Lia', atividadesDominadas: [] }
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
    mocks.perfilAtivo = {
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

  it('mostra o canteiro brotando quando só parte do módulo foi dominada', () => {
    const modulo0 = trilhaV1.modulos[0]
    mocks.perfilAtivo = {
      id: 'perfil-1',
      nome: 'Lia',
      atividadesDominadas: [modulo0.atividades[0].id],
    }

    renderizar()

    expect(
      screen.getByLabelText(`${modulo0.titulo}: Crescendo`),
    ).toBeInTheDocument()
  })
})
