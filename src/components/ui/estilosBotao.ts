export type VarianteBotao = 'primario' | 'secundario' | 'acento' | 'fantasma'
export type TamanhoBotao = 'medio' | 'grande'

const base =
  'inline-flex min-h-[var(--min-alvo-controle)] items-center justify-center gap-2 rounded-full font-black tracking-wide transition-all duration-300 hover:scale-[1.05] active:scale-[0.95] disabled:opacity-50 disabled:pointer-events-none'

const porVariante: Record<VarianteBotao, string> = {
  primario:
    'bg-gradient-to-r from-[var(--cor-primaria)] to-[var(--cor-acento)] text-white shadow-lg hover:shadow-[var(--sombra-brilho)] border border-white/20',
  secundario:
    'vidro text-[var(--cor-texto)] hover:bg-white/10 hover:border-[var(--cor-primaria-escura)] hover:text-[var(--cor-primaria-escura)]',
  acento:
    'bg-gradient-to-r from-[var(--cor-acento)] to-[var(--cor-acento-escura)] text-white shadow-lg hover:shadow-[0_0_20px_rgba(255,176,0,0.5)] border border-white/20',
  fantasma:
    'text-[var(--cor-primaria-clara)] font-bold underline underline-offset-4 hover:text-[var(--cor-acento-clara)] hover:bg-white/5',
}

const porTamanho: Record<TamanhoBotao, string> = {
  medio: 'px-6 py-3 text-base',
  grande: 'px-8 py-4 text-lg',
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
