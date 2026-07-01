import type { FormaIconeId } from '../../curriculo/ativos/tipos'

interface CorAvatar {
  fundo: string
  texto: string
}

// Paleta pastel variada para diferenciar visualmente os perfis de criança
// numa mesma conta, sem depender de cores vibrantes/neon.
const cores: Record<FormaIconeId, CorAvatar> = {
  circulo: { fundo: '#dce8f0', texto: '#3f5c76' },
  quadrado: { fundo: '#f3e0d3', texto: '#a35f3b' },
  triangulo: { fundo: '#dcece3', texto: '#3d6e55' },
  estrela: { fundo: '#f3e8cd', texto: '#8a6a1f' },
  coracao: { fundo: '#f1dbe3', texto: '#9c4e69' },
  lua: { fundo: '#e3ddf0', texto: '#5f4e96' },
}

export function corDoAvatar(avatarId: FormaIconeId): CorAvatar {
  return cores[avatarId]
}
