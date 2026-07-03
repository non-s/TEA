import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import { CHAVE_CACHE_OFFLINE_FIRESTORE } from '../../firebase/db'
import { Configuracoes } from './Configuracoes'

const mocks = vi.hoisted(() => ({
  atualizarPreferenciasPerfil: vi.fn(),
  encerrarPerfil: vi.fn(),
  excluirContaResponsavel: vi.fn(),
  navigate: vi.fn(),
  perfilAtivo: {
    id: 'perfil-1',
    nome: 'Lia',
    preferenciasSensoriais: {
      som: true,
      animacoes: true,
      altoContraste: false,
      alvosMaiores: false,
      tamanhoFonte: 'normal',
    },
  },
  selecionarPerfil: vi.fn(),
  usuario: { uid: 'responsavel-1', email: 'familia@example.com' },
}))

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ usuario: mocks.usuario }),
}))

vi.mock('../../contexts/PerfilAtivoContext', () => ({
  usePerfilAtivo: () => ({
    encerrarPerfil: mocks.encerrarPerfil,
    perfilAtivo: mocks.perfilAtivo,
    selecionarPerfil: mocks.selecionarPerfil,
  }),
}))

vi.mock('../../firebase/conta', () => ({
  excluirContaResponsavel: mocks.excluirContaResponsavel,
}))

vi.mock('../../firebase/perfis', () => ({
  atualizarPreferenciasPerfil: mocks.atualizarPreferenciasPerfil,
}))

vi.mock('react-router-dom', async () => {
  const atual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')

  return {
    ...atual,
    useNavigate: () => mocks.navigate,
  }
})

function renderizarConfiguracoes() {
  return render(
    <PreferenciasProvider>
      <MemoryRouter>
        <Configuracoes />
      </MemoryRouter>
    </PreferenciasProvider>,
  )
}

describe('Configuracoes', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mocks.excluirContaResponsavel.mockResolvedValue(undefined)
  })

  it('permite ativar cache offline local com aviso de recarregamento', async () => {
    const usuario = userEvent.setup()
    renderizarConfiguracoes()

    await usuario.click(
      screen.getByLabelText('Permitir cache offline neste dispositivo'),
    )

    expect(localStorage.getItem(CHAVE_CACHE_OFFLINE_FIRESTORE)).toBe('true')
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cache offline ativado. Recarregue o app para aplicar.',
    )
    expect(screen.getByText(/para apagar copia ja criada/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'Ver resumo de privacidade e dados',
      }),
    ).toHaveAttribute('href', '/privacidade')
  })

  it('avisa que desativar cache nao apaga copia offline ja criada', async () => {
    localStorage.setItem(CHAVE_CACHE_OFFLINE_FIRESTORE, 'true')
    const usuario = userEvent.setup()
    renderizarConfiguracoes()

    await usuario.click(
      screen.getByLabelText('Permitir cache offline neste dispositivo'),
    )

    expect(localStorage.getItem(CHAVE_CACHE_OFFLINE_FIRESTORE)).toBeNull()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Cache offline desativado para o proximo carregamento.',
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'limpe os dados do site no navegador.',
    )
  })

  it('exige senha e confirmacao textual antes de apagar a conta', async () => {
    const usuario = userEvent.setup()
    renderizarConfiguracoes()

    const botao = screen.getByRole('button', {
      name: 'Apagar conta e dados',
    })
    expect(botao).toBeDisabled()

    await usuario.type(screen.getByLabelText('Senha da conta'), 'senha123')
    expect(botao).toBeDisabled()

    await usuario.type(
      screen.getByLabelText('Digite APAGAR CONTA para confirmar'),
      'APAGAR CONTA',
    )
    expect(botao).toBeEnabled()

    await usuario.click(botao)

    expect(mocks.excluirContaResponsavel).toHaveBeenCalledWith(
      mocks.usuario,
      'senha123',
    )
    expect(mocks.encerrarPerfil).toHaveBeenCalledOnce()
    expect(mocks.navigate).toHaveBeenCalledWith('/')
  })

  it('mostra erro quando a exclusao da conta falha', async () => {
    mocks.excluirContaResponsavel.mockRejectedValueOnce(new Error('senha'))
    const usuario = userEvent.setup()
    renderizarConfiguracoes()

    await usuario.type(screen.getByLabelText('Senha da conta'), 'senha-errada')
    await usuario.type(
      screen.getByLabelText('Digite APAGAR CONTA para confirmar'),
      'APAGAR CONTA',
    )
    await usuario.click(
      screen.getByRole('button', { name: 'Apagar conta e dados' }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível apagar a conta agora.',
    )
    expect(mocks.navigate).not.toHaveBeenCalled()
  })
})
