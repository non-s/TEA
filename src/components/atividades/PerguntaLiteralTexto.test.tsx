import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { PreferenciasProvider } from '../../contexts/PreferenciasContext'
import type { Atividade } from '../../curriculo/tipos'
import { PerguntaLiteralTexto } from './PerguntaLiteralTexto'

function renderComProvider(elemento: ReactElement) {
  return render(<PreferenciasProvider>{elemento}</PreferenciasProvider>)
}

const atividade: Atividade = {
  id: 'teste-pergunta-texto',
  moduloId: 'teste',
  tipo: 'pergunta-literal-texto',
  nivelDificuldade: 1,
  alvo: {
    id: 'texto-A-MALA-A-BALA',
    rotulo: 'A MALA. A BALA.',
    iconeId: 'letra-A',
    audioTexto: 'A mala. A bala.',
  },
  pergunta: 'O que apareceu primeiro?',
  resposta: {
    id: 'palavra-MALA',
    rotulo: 'MALA',
    iconeId: 'letra-MALA',
    audioTexto: 'MA-LA, MALA',
  },
  distratores: [
    {
      id: 'palavra-BALA',
      rotulo: 'BALA',
      iconeId: 'letra-BALA',
      audioTexto: 'BA-LA, BALA',
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

describe('PerguntaLiteralTexto', () => {
  it('mostra texto, pergunta e opcoes apos comecar', async () => {
    const usuario = userEvent.setup()
    renderComProvider(
      <PerguntaLiteralTexto
        atividade={atividade}
        aoDominar={vi.fn()}
        uidResponsavel="uid-teste"
        perfilId="perfil-teste"
      />,
    )

    expect(
      screen.getByText(
        'Leia o texto. Depois responda: O que apareceu primeiro? A mala. A bala.',
      ),
    ).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: 'Começar' }))

    expect(screen.getAllByText('A MALA. A BALA.').length).toBeGreaterThan(0)
    expect(screen.getByText('O que apareceu primeiro?')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'MALA. Escolha esta' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'BALA' })).toBeInTheDocument()
  })

  it('chama aoDominar apos responder com independencia', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const usuario = userEvent.setup({ delay: null })
    const aoDominar = vi.fn()
    renderComProvider(
      <PerguntaLiteralTexto
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
      <PerguntaLiteralTexto
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
