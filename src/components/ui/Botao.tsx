import type { ButtonHTMLAttributes } from 'react'
import {
  classesBotao,
  type TamanhoBotao,
  type VarianteBotao,
} from './estilosBotao'

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
}

export function Botao({
  variante = 'primario',
  tamanho = 'grande',
  className = '',
  ...props
}: BotaoProps) {
  return (
    <button
      className={classesBotao({ variante, tamanho, className })}
      {...props}
    />
  )
}
