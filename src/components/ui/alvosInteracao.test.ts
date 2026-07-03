import { describe, expect, it } from 'vitest'
import { classesAlvoToque } from './alvosInteracao'

describe('classesAlvoToque', () => {
  it('usa area minima ampla e movimento discreto', () => {
    const classes = classesAlvoToque({ animacoes: true })

    expect(classes).toContain('min-h-[var(--min-alvo-atividade)]')
    expect(classes).toContain('min-w-[var(--min-alvo-atividade)]')
    expect(classes).toContain('hover:scale-[1.02]')
    expect(classes).not.toContain('hover:scale-105')
  })

  it('usa destaque visual sem anel intenso', () => {
    const classes = classesAlvoToque({ destacado: true })

    expect(classes).toContain('ring-2')
    expect(classes).not.toContain('ring-4')
  })
})
