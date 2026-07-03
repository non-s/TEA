export type FormaIconeId =
  'circulo' | 'quadrado' | 'triangulo' | 'estrela' | 'coracao' | 'lua'

export type LetraIconeId = `letra-${string}`

export type IconeId = FormaIconeId | LetraIconeId

export const formasIcone = [
  'circulo',
  'quadrado',
  'triangulo',
  'estrela',
  'coracao',
  'lua',
] as const satisfies readonly FormaIconeId[]

export const nomesIcones: Record<FormaIconeId, string> = {
  circulo: 'círculo',
  quadrado: 'quadrado',
  triangulo: 'triângulo',
  estrela: 'estrela',
  coracao: 'coração',
  lua: 'lua',
}

export function ehLetra(id: IconeId): id is LetraIconeId {
  return id.startsWith('letra-')
}

export function caractereDaLetra(id: LetraIconeId): string {
  return id.slice('letra-'.length)
}

export function iconeLetra(caractere: string): LetraIconeId {
  return `letra-${caractere}`
}
