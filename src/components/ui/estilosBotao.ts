export type VarianteBotao = 'primario' | 'secundario' | 'acento' | 'fantasma'
export type TamanhoBotao = 'medio' | 'grande'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-transform motion-reduce:transition-none disabled:opacity-60 disabled:pointer-events-none active:scale-[0.97]'

const porVariante: Record<VarianteBotao, string> = {
  primario:
    'bg-[var(--cor-primaria)] text-white hover:bg-[var(--cor-primaria-escura)]',
  secundario:
    'border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] text-[var(--cor-texto)] hover:border-[var(--cor-primaria)]',
  acento:
    'bg-[var(--cor-acento)] text-white hover:bg-[var(--cor-acento-escura)]',
  fantasma:
    'text-[var(--cor-primaria)] underline underline-offset-2 hover:text-[var(--cor-primaria-escura)]',
}

const porTamanho: Record<TamanhoBotao, string> = {
  medio: 'px-5 py-2.5 text-sm',
  grande: 'px-6 py-3 text-base',
}

interface OpcoesBotao {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
  className?: string
}

export function classesBotao({
  variante = 'primario',
  tamanho = 'grande',
  className = '',
}: OpcoesBotao = {}): string {
  if (variante === 'fantasma') {
    return `${base} ${porVariante.fantasma} ${className}`.trim()
  }
  return `${base} ${porVariante[variante]} ${porTamanho[tamanho]} ${className}`.trim()
}
