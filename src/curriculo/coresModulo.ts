export interface AcentoModulo {
  fundo: string
  texto: string
}

// Paleta por módulo, compartilhada entre a trilha e o jardim de conquistas
// para que o mesmo módulo tenha sempre a mesma identidade visual.
// As 4 combinações semânticas disponíveis no tema (ver :root e
// :root[data-alto-contraste='true'] em src/index.css). Módulos além da 4ª
// repetem essas combinações em ciclo — preferimos repetição de cor a usar
// hex fixos que ignorariam o modo de alto contraste.
const combinacoesSemanticas: AcentoModulo[] = [
  { fundo: 'var(--cor-primaria-clara)', texto: 'var(--cor-primaria-escura)' },
  { fundo: 'var(--cor-acento-clara)', texto: 'var(--cor-acento-escura)' },
  { fundo: 'var(--cor-sucesso-clara)', texto: 'var(--cor-sucesso)' },
  { fundo: 'var(--cor-conquista-clara)', texto: 'var(--cor-conquista)' },
]

const ordemModulos = [
  'm0',
  'm1',
  'm2',
  'm3',
  'm3t',
  'm4',
  'm5',
  'm6',
  'm7',
  'm8',
  'm9',
  'm10',
  'm11',
]

export const acentosPorModulo: Record<string, AcentoModulo> =
  Object.fromEntries(
    ordemModulos.map((moduloId, indice) => [
      moduloId,
      combinacoesSemanticas[indice % combinacoesSemanticas.length],
    ]),
  )

export function acentoDoModulo(moduloId: string): AcentoModulo {
  return acentosPorModulo[moduloId] ?? acentosPorModulo.m0
}
