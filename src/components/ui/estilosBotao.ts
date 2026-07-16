export type VarianteBotao = 'primario' | 'secundario' | 'acento' | 'fantasma'
export type TamanhoBotao = 'medio' | 'grande'

const base =
  'inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center gap-2 rounded-full font-medium transition-transform motion-reduce:transition-none disabled:opacity-60 disabled:pointer-events-none active:scale-[0.99]'

const porVariante: Record<VarianteBotao, string> = {
  primario:
    'bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--cor-primaria-escura)] text-white shadow-md hover:shadow-lg hover:brightness-110',
  secundario:
    'border-2 border-[var(--cor-borda)] bg-white/80 backdrop-blur-sm text-[var(--cor-texto)] shadow-sm hover:shadow-md hover:border-[var(--cor-primaria)] hover:bg-white',
  acento:
    'bg-gradient-to-r from-[var(--cor-acento)] to-[var(--cor-acento-escura)] text-white shadow-md hover:shadow-lg hover:brightness-110',
  fantasma:
    'text-[var(--cor-primaria)] underline underline-offset-2 hover:text-[var(--cor-primaria-escura)] hover:bg-black/5',
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
