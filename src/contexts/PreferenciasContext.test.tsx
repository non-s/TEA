import { renderHook, act } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PreferenciasProvider, usePreferencias } from './PreferenciasContext'

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-alto-contraste')
  document.documentElement.removeAttribute('data-alvos-maiores')
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
      alvosMaiores: false,
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

  it('aplica alvos maiores no elemento raiz', () => {
    const { result } = renderHook(() => usePreferencias(), {
      wrapper: PreferenciasProvider,
    })

    act(() => {
      result.current.atualizarPreferencias({ alvosMaiores: true })
    })

    expect(document.documentElement.dataset.alvosMaiores).toBe('true')
  })

  it('normaliza preferencias locais corrompidas antes de aplicar no app', () => {
    localStorage.setItem(
      'tea:preferencias',
      JSON.stringify({
        som: 'nao',
        animacoes: false,
        altoContraste: 'sim',
        alvosMaiores: true,
        tamanhoFonte: 'gigante',
      }),
    )

    const { result } = renderHook(() => usePreferencias(), {
      wrapper: PreferenciasProvider,
    })

    expect(result.current.preferencias).toEqual({
      som: true,
      animacoes: false,
      altoContraste: false,
      alvosMaiores: true,
      tamanhoFonte: 'normal',
    })
    expect(document.documentElement.dataset.altoContraste).toBe('false')
    expect(
      document.documentElement.style.getPropertyValue('--escala-fonte'),
    ).toBe('1')
  })

  it('ignora atualizacoes invalidas de preferencias em runtime', () => {
    const { result } = renderHook(() => usePreferencias(), {
      wrapper: PreferenciasProvider,
    })

    act(() => {
      result.current.atualizarPreferencias({
        altoContraste: 'sim',
        tamanhoFonte: 'gigante',
      } as never)
    })

    expect(result.current.preferencias.altoContraste).toBe(false)
    expect(result.current.preferencias.tamanhoFonte).toBe('normal')
  })
})
