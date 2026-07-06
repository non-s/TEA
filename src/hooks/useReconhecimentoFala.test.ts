import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  reconhecimentoFalaDisponivel,
  useReconhecimentoFala,
} from './useReconhecimentoFala'

class ReconhecimentoFalaFake {
  lang = ''
  continuous = false
  interimResults = false
  maxAlternatives = 1
  onresult: ((evento: unknown) => void) | null = null
  onerror: ((evento: unknown) => void) | null = null
  onend: (() => void) | null = null
  start = vi.fn()
  stop = vi.fn(() => {
    this.onend?.()
  })
}

let ultimaInstanciaFake: ReconhecimentoFalaFake | null = null

function instalarReconhecimentoFalaFake() {
  ultimaInstanciaFake = null
  vi.stubGlobal(
    'SpeechRecognition',
    vi.fn().mockImplementation(function () {
      ultimaInstanciaFake = new ReconhecimentoFalaFake()
      return ultimaInstanciaFake
    }),
  )
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('reconhecimentoFalaDisponivel', () => {
  it('reflete se o construtor existe no navegador', () => {
    vi.unstubAllGlobals()
    expect(reconhecimentoFalaDisponivel()).toBe(false)

    instalarReconhecimentoFalaFake()
    expect(reconhecimentoFalaDisponivel()).toBe(true)
  })
})

describe('useReconhecimentoFala', () => {
  beforeEach(() => {
    instalarReconhecimentoFalaFake()
  })

  it('inicia a escuta em pt-BR e reporta o resultado transcrito', async () => {
    const { result } = renderHook(() => useReconhecimentoFala())

    act(() => {
      result.current.iniciarEscuta()
    })

    expect(result.current.ouvindo).toBe(true)
    expect(ultimaInstanciaFake?.lang).toBe('pt-BR')
    expect(ultimaInstanciaFake?.continuous).toBe(false)
    expect(ultimaInstanciaFake?.start).toHaveBeenCalledOnce()

    act(() => {
      ultimaInstanciaFake?.onresult?.({
        results: { 0: { 0: { transcript: 'eme' } }, length: 1 },
      })
      ultimaInstanciaFake?.onend?.()
    })

    await waitFor(() => expect(result.current.ouvindo).toBe(false))
    expect(result.current.transcricao).toBe('eme')
  })

  it('reporta erro amigavel quando o microfone e negado', async () => {
    const { result } = renderHook(() => useReconhecimentoFala())

    act(() => {
      result.current.iniciarEscuta()
    })
    act(() => {
      ultimaInstanciaFake?.onerror?.({ error: 'not-allowed' })
    })

    await waitFor(() =>
      expect(result.current.erro).toBe(
        'Permita o uso do microfone para responder por voz.',
      ),
    )
    expect(result.current.ouvindo).toBe(false)
  })

  it('reporta indisponibilidade quando o navegador nao tem a API', () => {
    vi.unstubAllGlobals()
    const { result } = renderHook(() => useReconhecimentoFala())

    expect(result.current.disponivel).toBe(false)

    act(() => {
      result.current.iniciarEscuta()
    })

    expect(result.current.erro).toBe(
      'Reconhecimento de fala não está disponível neste navegador.',
    )
    expect(result.current.ouvindo).toBe(false)
  })

  it('chama aoResultado com o texto transcrito, sem precisar de useEffect', () => {
    const aoResultado = vi.fn()
    const { result } = renderHook(() => useReconhecimentoFala(aoResultado))

    act(() => {
      result.current.iniciarEscuta()
    })
    act(() => {
      ultimaInstanciaFake?.onresult?.({
        results: { 0: { 0: { transcript: 'pe' } }, length: 1 },
      })
    })

    expect(aoResultado).toHaveBeenCalledExactlyOnceWith('pe')
  })

  it('usa sempre o callback mais recente, mesmo sem memoizacao no chamador', () => {
    const primeiroCallback = vi.fn()
    const segundoCallback = vi.fn()
    const { result, rerender } = renderHook(
      ({ callback }) => useReconhecimentoFala(callback),
      { initialProps: { callback: primeiroCallback } },
    )

    rerender({ callback: segundoCallback })

    act(() => {
      result.current.iniciarEscuta()
    })
    act(() => {
      ultimaInstanciaFake?.onresult?.({
        results: { 0: { 0: { transcript: 'te' } }, length: 1 },
      })
    })

    expect(segundoCallback).toHaveBeenCalledExactlyOnceWith('te')
    expect(primeiroCallback).not.toHaveBeenCalled()
  })

  it('para a escuta quando solicitado', () => {
    const { result } = renderHook(() => useReconhecimentoFala())

    act(() => {
      result.current.iniciarEscuta()
    })
    act(() => {
      result.current.pararEscuta()
    })

    expect(ultimaInstanciaFake?.stop).toHaveBeenCalledOnce()
  })
})
