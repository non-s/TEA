import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSpeech } from './useSpeech'
import {
  PreferenciasProvider,
  usePreferencias,
} from '../contexts/PreferenciasContext'

const falarMock = vi.fn()
const cancelarMock = vi.fn()

beforeEach(() => {
  localStorage.clear()
  falarMock.mockClear()
  cancelarMock.mockClear()

  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    vi.fn().mockImplementation(function (this: unknown, texto: string) {
      Object.assign(this as object, { text: texto, lang: '' })
    }),
  )
  vi.stubGlobal('speechSynthesis', { speak: falarMock, cancel: cancelarMock })
})

describe('useSpeech', () => {
  it('fala o texto quando o som está ligado (padrão)', () => {
    const { result } = renderHook(() => useSpeech(), {
      wrapper: PreferenciasProvider,
    })

    act(() => {
      result.current.falar('Olá')
    })

    expect(falarMock).toHaveBeenCalledOnce()
  })

  it('não fala nada quando o som está desligado', () => {
    const { result } = renderHook(
      () => {
        const speech = useSpeech()
        const { atualizarPreferencias } = usePreferencias()
        return { speech, atualizarPreferencias }
      },
      { wrapper: PreferenciasProvider },
    )

    act(() => {
      result.current.atualizarPreferencias({ som: false })
    })
    act(() => {
      result.current.speech.falar('Olá')
    })

    expect(falarMock).not.toHaveBeenCalled()
  })
})
