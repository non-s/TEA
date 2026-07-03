export type TamanhoFonte = 'normal' | 'grande' | 'extra-grande'

export interface PreferenciasSensoriais {
  som: boolean
  animacoes: boolean
  altoContraste: boolean
  alvosMaiores: boolean
  tamanhoFonte: TamanhoFonte
}

export const tamanhosFonte = [
  'normal',
  'grande',
  'extra-grande',
] as const satisfies readonly TamanhoFonte[]

export const preferenciasSensoriaisPadrao: PreferenciasSensoriais = {
  som: true,
  animacoes: true,
  altoContraste: false,
  alvosMaiores: false,
  tamanhoFonte: 'normal',
}

function booleanoOuPadrao(valor: unknown, padrao: boolean): boolean {
  return typeof valor === 'boolean' ? valor : padrao
}

function tamanhoFonteValido(valor: unknown): valor is TamanhoFonte {
  return (
    typeof valor === 'string' &&
    (tamanhosFonte as readonly string[]).includes(valor)
  )
}

export function normalizarPreferenciasSensoriais(
  preferencias: Partial<PreferenciasSensoriais> | undefined = {},
  padrao: PreferenciasSensoriais = preferenciasSensoriaisPadrao,
): PreferenciasSensoriais {
  const dados = preferencias as Record<string, unknown>

  return {
    som: booleanoOuPadrao(dados.som, padrao.som),
    animacoes: booleanoOuPadrao(dados.animacoes, padrao.animacoes),
    altoContraste: booleanoOuPadrao(dados.altoContraste, padrao.altoContraste),
    alvosMaiores: booleanoOuPadrao(dados.alvosMaiores, padrao.alvosMaiores),
    tamanhoFonte: tamanhoFonteValido(dados.tamanhoFonte)
      ? dados.tamanhoFonte
      : padrao.tamanhoFonte,
  }
}
