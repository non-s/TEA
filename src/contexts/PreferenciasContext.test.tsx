import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PreferenciasProvider, usePreferencias } from './PreferenciasContext'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-alto-contraste')
  document.documentElement.style.removeProperty('--escala-fonte')
})

describe('PreferenciasContext', () => {
  it('começa com valores padrão sensíveis', () => {
    const { result } = renderHook(() => usePreferencias(), {
      wrapper: PreferenciasProvider,
    })

    expect(result.current.preferencias).toMatchObject({
      som: true,
      altoContraste: false,
      tamanhoFonte: 'normal',
    })
  })

  it('aplica alto contraste no elemento raiz e persiste em localStorage', () => {
    const { result } = renderHook(() => usePreferencias(), {
      wrapper: PreferenciasProvider,
    })

    act(() => {
      result.current.atualizarPreferencias({ altoContraste: true })
    })

    expect(document.documentElement.dataset.altoContraste).toBe('true')
    expect(
      JSON.parse(localStorage.getItem('tea:preferencias') ?? '{}')
        .altoContraste,
    ).toBe(true)
  })

  it('atualiza a escala de fonte no elemento raiz', () => {
    const { result } = renderHook(() => usePreferencias(), {
      wrapper: PreferenciasProvider,
    })

    act(() => {
      result.current.atualizarPreferencias({ tamanhoFonte: 'extra-grande' })
    })

    expect(
      document.documentElement.style.getPropertyValue('--escala-fonte'),
    ).toBe('1.5')
  })
})
