export interface AcentoModulo {
  fundo: string
  texto: string
}

// Paleta por módulo, compartilhada entre a trilha e o jardim de conquistas
// para que o mesmo módulo tenha sempre a mesma identidade visual.
export const acentosPorModulo: Record<string, AcentoModulo> = {
  m0: {
    fundo: 'var(--cor-primaria-clara)',
    texto: 'var(--cor-primaria-escura)',
  },
  m1: { fundo: 'var(--cor-acento-clara)', texto: 'var(--cor-acento-escura)' },
  m2: { fundo: 'var(--cor-sucesso-clara)', texto: 'var(--cor-sucesso)' },
  m3: { fundo: 'var(--cor-conquista-clara)', texto: 'var(--cor-conquista)' },
  m4: { fundo: '#e3ddf0', texto: '#5f4e96' },
  m5: { fundo: '#d8ece9', texto: '#2f6f68' },
  m6: { fundo: '#f0e4d6', texto: '#7a5737' },
  m7: { fundo: '#e1e9d5', texto: '#566f2d' },
  m8: { fundo: '#dbe4f4', texto: '#3d5f9c' },
  m9: { fundo: '#f2dede', texto: '#8a4a4a' },
  m10: { fundo: '#e6def0', texto: '#654b83' },
}

export function acentoDoModulo(moduloId: string): AcentoModulo {
  return acentosPorModulo[moduloId] ?? acentosPorModulo.m0
}
