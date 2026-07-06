import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  definirAtualizacaoDisponivel,
  obterAtualizacaoDisponivel,
} from '../pwa/estadoAtualizacaoPWA'
import { useAtualizacaoPWADisponivel, useEstaOffline } from './useConexao'

function definirOnline(valor: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: valor,
  })
}

describe('useEstaOffline', () => {
  afterEach(() => {
    definirOnline(true)
  })

  it('reflete navigator.onLine inicial', () => {
    definirOnline(false)
    const { result } = renderHook(() => useEstaOffline())
    expect(result.current).toBe(true)
  })

  it('atualiza quando o evento offline/online dispara', () => {
    definirOnline(true)
    const { result } = renderHook(() => useEstaOffline())
    expect(result.current).toBe(false)

    act(() => {
      definirOnline(false)
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(true)

    act(() => {
      definirOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(false)
  })
})

describe('useAtualizacaoPWADisponivel', () => {
  afterEach(() => {
    definirAtualizacaoDisponivel(null)
  })

  it('comeca nulo quando nenhuma atualizacao foi anunciada', () => {
    const { result } = renderHook(() => useAtualizacaoPWADisponivel())
    expect(result.current).toBeNull()
  })

  it('reflete a funcao de atualizacao publicada pelo service worker', () => {
    const { result } = renderHook(() => useAtualizacaoPWADisponivel())
    const aplicar = () => {}

    act(() => {
      definirAtualizacaoDisponivel(aplicar)
    })

    expect(result.current).toBe(aplicar)
    expect(obterAtualizacaoDisponivel()).toBe(aplicar)
  })
})
