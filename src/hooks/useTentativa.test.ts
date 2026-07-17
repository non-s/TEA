import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Atividade } from '../curriculo/tipos'
import { useTentativa } from './useTentativa'

const mocks = vi.hoisted(() => ({
  registrarTentativa: vi.fn(),
}))

vi.mock('../local/perfilLocal', () => ({
  registrarTentativa: mocks.registrarTentativa,
}))

const atividade: Atividade = {
  id: 'teste-a1',
  moduloId: 'teste',
  tipo: 'emparelhamento-identico',
  nivelDificuldade: 1,
  alvo: { id: 'alvo', rotulo: 'Alvo', iconeId: 'circulo' },
  resposta: { id: 'alvo', rotulo: 'Alvo', iconeId: 'circulo' },
  distratores: [{ id: 'distrator', rotulo: 'Distrator', iconeId: 'quadrado' }],
  dicas: [
    { ordem: 0, tipo: 'modelagem', descricao: '' },
    { ordem: 1, tipo: 'destaque-visual', descricao: '' },
    { ordem: 2, tipo: 'nenhuma', descricao: '' },
  ],
  criteriosDominio: { acertosConsecutivosNecessarios: 1, janelaTentativas: 1 },
}

describe('useTentativa', () => {
  beforeEach(() => {
    mocks.registrarTentativa.mockReset()
    mocks.registrarTentativa.mockResolvedValue(undefined)
  })

  it('comeca com suporte total e domina na primeira resposta correta', () => {
    const { result } = renderHook(() => useTentativa(atividade, 'perfil-teste'))

    expect(result.current.nivelDicaAtual).toBe(0)

    let resultado
    act(() => {
      resultado = result.current.responder('alvo')
    })

    expect(resultado).toEqual({ correto: true, dominada: true })
  })

  it('mantem o apoio e nao domina apos uma resposta incorreta', () => {
    const { result } = renderHook(() => useTentativa(atividade, 'perfil-teste'))

    let resultado
    act(() => {
      resultado = result.current.responder('distrator')
    })

    expect(resultado).toEqual({ correto: false, dominada: false })
    expect(result.current.nivelDicaAtual).toBe(0)

    act(() => {
      resultado = result.current.responder('alvo')
    })

    expect(resultado).toEqual({ correto: true, dominada: true })
  })

  it('aumenta o apoio apos uma resposta incorreta em nivel mais avancado', () => {
    const { result } = renderHook(() =>
      useTentativa(atividade, 'perfil-teste', {
        tentativasAnteriores: [
          {
            atividadeId: atividade.id,
            moduloId: atividade.moduloId,
            timestamp: 1,
            resultado: 'incorreto',
            nivelDicaUsado: 2,
            tempoRespostaMs: 1000,
          },
        ],
      }),
    )

    expect(result.current.nivelDicaAtual).toBe(1)

    act(() => {
      result.current.responder('distrator')
    })

    expect(result.current.nivelDicaAtual).toBe(0)
  })

  it('aumenta o apoio quando a crianca pede ajuda sem registrar erro', () => {
    const { result, rerender } = renderHook(
      ({ sinalPedirAjuda }: { sinalPedirAjuda: number }) =>
        useTentativa(atividade, 'perfil-teste', {
          sinalPedirAjuda,
          tentativasAnteriores: [
            {
              atividadeId: atividade.id,
              moduloId: atividade.moduloId,
              timestamp: 1,
              resultado: 'incorreto',
              nivelDicaUsado: 2,
              tempoRespostaMs: 1000,
            },
          ],
        }),
      { initialProps: { sinalPedirAjuda: 0 } },
    )

    expect(result.current.nivelDicaAtual).toBe(1)
    expect(result.current.tentativasSessao).toBe(0)

    act(() => {
      rerender({ sinalPedirAjuda: 1 })
    })

    expect(result.current.nivelDicaAtual).toBe(0)
    expect(result.current.tentativasSessao).toBe(0)
  })

  it('reconstroi domínio a partir de uma resposta correta salva no historico', () => {
    const { result } = renderHook(() =>
      useTentativa(atividade, 'perfil-teste', {
        tentativasAnteriores: [
          {
            atividadeId: atividade.id,
            moduloId: atividade.moduloId,
            timestamp: 1,
            resultado: 'correto',
            nivelDicaUsado: 0,
            tempoRespostaMs: 1000,
          },
        ],
      }),
    )

    expect(result.current.dominada).toBe(true)
  })

  it('permite registrar tentativa local sem usar o backend padrao', async () => {
    const registrarTentativaLocal = vi.fn()
    const { result } = renderHook(() =>
      useTentativa(atividade, 'perfil-teste', {
        registrarTentativa: registrarTentativaLocal,
      }),
    )

    act(() => {
      result.current.responder('alvo')
    })

    await waitFor(() => {
      expect(registrarTentativaLocal).toHaveBeenCalledWith(
        expect.objectContaining({
          atividadeId: atividade.id,
          resultado: 'correto',
        }),
      )
    })
    expect(mocks.registrarTentativa).not.toHaveBeenCalled()
  })

  it('sugere pausa em intervalos configurados sem bloquear resposta', () => {
    const { result } = renderHook(() =>
      useTentativa(atividade, 'perfil-teste', {
        limiteTentativasAntesPausa: 2,
      }),
    )

    act(() => {
      result.current.responder('distrator')
    })
    expect(result.current.sugestaoPausa).toBe(false)

    act(() => {
      result.current.responder('distrator')
    })
    expect(result.current.tentativasSessao).toBe(2)
    expect(result.current.sugestaoPausa).toBe(true)

    act(() => {
      result.current.dispensarSugestaoPausa()
    })
    expect(result.current.sugestaoPausa).toBe(false)
  })

  it('dispensa sugestao de pausa quando a crianca comunica prontidao', () => {
    const { result, rerender } = renderHook(
      ({ sinalComunicarPronto }: { sinalComunicarPronto: number }) =>
        useTentativa(atividade, 'perfil-teste', {
          limiteTentativasAntesPausa: 2,
          sinalComunicarPronto,
        }),
      { initialProps: { sinalComunicarPronto: 0 } },
    )

    act(() => {
      result.current.responder('distrator')
    })
    act(() => {
      result.current.responder('distrator')
    })
    expect(result.current.tentativasSessao).toBe(2)
    expect(result.current.sugestaoPausa).toBe(true)

    act(() => {
      rerender({ sinalComunicarPronto: 1 })
    })

    expect(result.current.tentativasSessao).toBe(2)
    expect(result.current.sugestaoPausa).toBe(false)
    expect(result.current.sugestaoEncerrarSessao).toBe(false)
  })

  it('sugere encerrar por agora depois de alguns intervalos de pausa', () => {
    const { result } = renderHook(() =>
      useTentativa(atividade, 'perfil-teste', {
        limiteTentativasAntesPausa: 2,
      }),
    )

    for (let tentativa = 0; tentativa < 6; tentativa += 1) {
      act(() => {
        result.current.responder('distrator')
      })
    }

    expect(result.current.tentativasSessao).toBe(6)
    expect(result.current.sugestaoPausa).toBe(false)
    expect(result.current.sugestaoEncerrarSessao).toBe(true)

    act(() => {
      result.current.dispensarSugestaoEncerrarSessao()
    })
    expect(result.current.sugestaoEncerrarSessao).toBe(false)
  })

  it('avisa quando nao consegue salvar a tentativa sem bloquear a resposta', async () => {
    mocks.registrarTentativa.mockRejectedValueOnce(new Error('offline'))
    const { result } = renderHook(() => useTentativa(atividade, 'perfil-teste'))

    let resposta
    act(() => {
      resposta = result.current.responder('alvo')
    })

    expect(resposta).toEqual({ correto: true, dominada: true })
    expect(result.current.tentativasSessao).toBe(1)
    await waitFor(() => {
      expect(result.current.erroRegistroTentativa).toContain(
        'ainda não foi salva',
      )
    })
  })

  it('limpa aviso de registro quando uma tentativa seguinte salva', async () => {
    mocks.registrarTentativa
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(undefined)
    const { result } = renderHook(() => useTentativa(atividade, 'perfil-teste'))

    act(() => {
      result.current.responder('distrator')
    })
    await waitFor(() => {
      expect(result.current.erroRegistroTentativa).toContain(
        'ainda não foi salva',
      )
    })

    act(() => {
      result.current.responder('alvo')
    })

    await waitFor(() => {
      expect(result.current.erroRegistroTentativa).toBeNull()
    })
  })
})
