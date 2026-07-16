export type VarianteBotao = 'primario' | 'secundario' | 'acento' | 'fantasma'
export type TamanhoBotao = 'medio' | 'grande'

const base =
  'inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center gap-2 rounded-full font-medium transition-transform motion-reduce:transition-none disabled:opacity-60 disabled:pointer-events-none active:scale-[0.99]'

const porVariante: Record<VarianteBotao, string> = {
  primario:
    'bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--cor-primaria-escura)] text-white shadow-[0_8px_0_var(--cor-primaria-escura)] hover:shadow-[0_10px_0_var(--cor-primaria-escura)] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0px_0_var(--cor-primaria-escura)] font-bold',
  secundario:
    'border-2 border-[var(--cor-borda)] bg-white/80 backdrop-blur-sm text-[var(--cor-texto)] shadow-[0_6px_0_var(--cor-borda)] hover:shadow-[0_8px_0_var(--cor-primaria)] hover:border-[var(--cor-primaria)] hover:bg-white hover:-translate-y-1 active:translate-y-1 active:shadow-[0_0px_0_var(--cor-borda)] font-bold',
  acento:
    'bg-gradient-to-r from-[var(--cor-acento)] to-[var(--cor-acento-escura)] text-white shadow-[0_8px_0_var(--cor-acento-escura)] hover:shadow-[0_10px_0_var(--cor-acento-escura)] hover:-translate-y-1 active:translate-y-2 active:shadow-[0_0px_0_var(--cor-acento-escura)] font-bold',
  fantasma:
    'text-[var(--cor-primaria)] font-bold underline underline-offset-4 hover:text-[var(--cor-primaria-escura)] hover:bg-black/5 hover:scale-105 active:scale-95 transition-all',
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
