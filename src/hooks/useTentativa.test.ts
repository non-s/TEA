import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useTentativa } from './useTentativa'
import type { Atividade } from '../curriculo/tipos'

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
  criteriosDominio: { acertosConsecutivosNecessarios: 3, janelaTentativas: 10 },
}

beforeEach(() => {
  localStorage.clear()
})

describe('useTentativa', () => {
  it('marca a atividade como dominada após acertos consecutivos suficientes no nível independente', () => {
    const { result } = renderHook(() => useTentativa(atividade))

    expect(result.current.nivelDicaAtual).toBe(2)

    act(() => {
      result.current.responder('alvo')
    })
    act(() => {
      result.current.responder('alvo')
    })
    let ultimoResultado
    act(() => {
      ultimoResultado = result.current.responder('alvo')
    })

    expect(ultimoResultado).toEqual({ correto: true, dominada: true })
  })

  it('reduz o nível de dica (mais suporte) após uma resposta incorreta', () => {
    const { result } = renderHook(() => useTentativa(atividade))

    act(() => {
      result.current.responder('distrator')
    })

    expect(result.current.nivelDicaAtual).toBe(1)
  })

  it('não marca como dominada enquanto ainda está recebendo dica', () => {
    const { result } = renderHook(() => useTentativa(atividade))

    act(() => {
      result.current.responder('distrator')
    })
    let resultado
    act(() => {
      resultado = result.current.responder('alvo')
    })

    expect(resultado).toEqual({ correto: true, dominada: false })
  })
})
