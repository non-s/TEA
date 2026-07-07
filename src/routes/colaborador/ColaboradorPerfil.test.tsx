import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ColaboradorPerfil } from './ColaboradorPerfil'
import { trilhaV1 } from '../../curriculo/trilha-v1'

const mocks = vi.hoisted(() => ({
  erroAoOuvirPerfil: false,
  perfilFirestore: {
    id: 'perfil-1',
    nome: 'Lia',
    atividadesDominadas: [] as string[],
  } as unknown,
  registrarObservacaoSessao: vi.fn(),
  observacoes: [] as Array<{ id: string; texto: string; tipo?: string }>,
}))

vi.mock('../../firebase/perfis', () => ({
  ouvirPerfil: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (perfil: unknown) => void,
    aoErro?: (erro: unknown) => void,
  ) => {
    if (mocks.erroAoOuvirPerfil) {
      aoErro?.(new Error('sem-acesso'))
    } else {
      aoAtualizar(mocks.perfilFirestore)
    }
    return () => {}
  },
}))

vi.mock('../../firebase/progresso', () => ({
  LIMITE_TEXTO_OBSERVACAO_SESSAO: 500,
  textoTipoObservacaoSessao: {
    comunicacao: 'Comunicacao',
    regulacao: 'Regulacao',
    acesso: 'Acesso',
    generalizacao: 'Generalizacao',
    outro: 'Geral',
  },
  registrarObservacaoSessao: mocks.registrarObservacaoSessao,
  ouvirObservacoesSessao: (
    _uidResponsavel: string,
    _perfilId: string,
    aoAtualizar: (observacoes: unknown[]) => void,
  ) => {
    aoAtualizar(mocks.observacoes)
    return () => {}
  },
}))

function renderizar() {
  return render(
    <MemoryRouter initialEntries={['/colaborador/responsavel-1/perfil-1']}>
      <Routes>
        <Route
          path="/colaborador/:uidResponsavel/:perfilId"
          element={<ColaboradorPerfil />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ColaboradorPerfil', () => {
  afterEach(() => {
    mocks.erroAoOuvirPerfil = false
    mocks.perfilFirestore = {
      id: 'perfil-1',
      nome: 'Lia',
      atividadesDominadas: [],
    }
    mocks.observacoes = []
    mocks.registrarObservacaoSessao.mockReset()
  })

  it('mostra o progresso em modo leitura', async () => {
    const { container } = renderizar()

    expect(
      screen.getByRole('heading', { name: 'Progresso de Lia' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`0 de ${trilhaV1.modulos.length} módulos concluídos`),
    ).toBeInTheDocument()

    const resultados = await axe(container)
    expect(resultados.violations).toHaveLength(0)
  })

  it('mostra mensagem de acesso negado quando a leitura falha', () => {
    mocks.erroAoOuvirPerfil = true
    renderizar()

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não foi possível abrir este perfil',
    )
  })

  it('permite registrar uma observacao de sessao', async () => {
    mocks.registrarObservacaoSessao.mockResolvedValue(undefined)
    const usuario = userEvent.setup()
    renderizar()

    await usuario.type(
      screen.getByLabelText('Registrar uma observação'),
      'Sessão tranquila hoje',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Salvar observação' }),
    )

    expect(mocks.registrarObservacaoSessao).toHaveBeenCalledWith(
      'responsavel-1',
      'perfil-1',
      'Sessão tranquila hoje',
    )
  })

  it('lista observacoes de sessao existentes', () => {
    mocks.observacoes = [
      { id: 'obs-1', texto: 'Gostou da atividade de traçado', tipo: 'outro' },
    ]
    renderizar()

    expect(
      screen.getByText('Gostou da atividade de traçado'),
    ).toBeInTheDocument()
  })
})
