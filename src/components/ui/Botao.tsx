import { forwardRef, type ButtonHTMLAttributes } from 'react'
import {
  classesBotao,
  type TamanhoBotao,
  type VarianteBotao,
} from './estilosBotao'

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao
  tamanho?: TamanhoBotao
}

export const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante = 'primario', tamanho = 'grande', className = '', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={classesBotao({ variante, tamanho, className })}
      {...props}
    />
  )
})
