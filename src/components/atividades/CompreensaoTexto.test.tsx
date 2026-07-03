import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'
import { CompreensaoTexto } from './CompreensaoTexto'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-compreensao-texto',
  moduloId: 'teste',
  tipo: 'compreensao-texto',
  nivelDificuldade: 1,
  alvo: {
    id: 'texto-A-MALA-A-BALA',
    rotulo: 'A MALA. A BALA.',
    iconeId: 'letra-A',
    audioTexto: 'A mala. A bala.',
  },
  resposta: {
    id: 'palavra-MALA',
    rotulo: 'MALA',
    iconeId: 'letra-MALA',
    audioTexto: 'MA-LA, MALA',
  },
  distratores: [
    {
      id: 'palavra-LATA',
      rotulo: 'LATA',
      iconeId: 'letra-LATA',
      audioTexto: 'LA-TA, LATA',
    },
  ],
  dicas: [
    { ordem: 0, tipo: 'modelagem', descricao: '' },
    { ordem: 1, tipo: 'destaque-visual', descricao: '' },
    { ordem: 2, tipo: 'nenhuma', descricao: '' },
  ],
  criteriosDominio: { acertosConsecutivosNecessarios: 1, janelaTentativas: 10 },
}

const tentativasParaNivelIndependente = [
  {
    atividadeId: atividade.id,
    moduloId: atividade.moduloId,
    timestamp: 1,
    resultado: 'correto' as const,
    nivelDicaUsado: 1,
    tempoRespostaMs: 1000,
  },
  {
    atividadeId: atividade.id,
    moduloId: atividade.moduloId,
    timestamp: 2,
    resultado: 'correto' as const,
    nivelDicaUsado: 1,
    tempoRespostaMs: 1000,
  },
]

describe('CompreensaoTexto', () => {
  it('mostra o texto curto e palavras apos comecar', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <CompreensaoTexto
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.getByText(
        'Leia o texto e escolha uma palavra que aparece nele: A mala. A bala.',
      ),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getAllByText('A MALA. A BALA.').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: 'MALA. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'LATA' })).toBeInTheDocument()
  })

  it('chama aoDominar apos atingir o criterio de dominio', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <CompreensaoTexto
        atividade={atividade}
        aoDominar={aoDominar}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
        tentativasAnteriores={tentativasParaNivelIndependente}
      />,
    )

    await usuario.click(screen.getByRole('button', { name: 'Começar' }))
    await usuario.click(screen.getByRole('button', { name: 'MALA' }))
    await vi.advanceTimersByTimeAsync(800)

    expect(aoDominar).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('nao tem violacoes de acessibilidade detectaveis automaticamente', async () => {
    const { container } = renderComProvider(
      <CompreensaoTexto
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )
    const results = await axe(container)
    expect(results.violations).toHaveLength(0)
  })
})
