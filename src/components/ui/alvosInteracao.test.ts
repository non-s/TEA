import { describe, expect, it } from 'vitest'
import { classesAlvoToque } from './alvosInteracao'

describe('classesAlvoToque', () => {
  it('usa area minima ampla e movimento discreto', () => {
    const classes = classesAlvoToque({ animacoes: true })

    expect(classes).toContain('min-h-[var(--min-alvo-atividade)]')
    expect(classes).toContain('min-w-[var(--min-alvo-atividade)]')
    expect(classes).toContain('hover:scale-[1.05]')
    expect(classes).not.toContain('hover:scale-110')
  })

  it('usa destaque visual com anel de brilho', () => {
    const classes = classesAlvoToque({ destacado: true })

    expect(classes).toContain('ring-4')
    expect(classes).not.toContain('ring-8')
  })
})
