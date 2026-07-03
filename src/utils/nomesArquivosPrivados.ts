export type ExtensaoArquivoLocal = 'html' | 'json' | 'md'

function normalizarSegmentoArquivo(segmento: string): string {
  return (
    segmento
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'arquivo'
  )
}

export function nomeArquivoLocalPrivado(
  tipo: string,
  data: Date,
  extensao: ExtensaoArquivoLocal,
): string {
  return `tea-${normalizarSegmentoArquivo(tipo)}-${data
    .toISOString()
    .slice(0, 10)}.${extensao}`
}
