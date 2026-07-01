import type { FormHTMLAttributes, HTMLAttributes } from 'react'

const classesBase =
  'rounded-3xl border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 shadow-[var(--sombra-cartao)] sm:p-8'

type CartaoDivProps = { as?: 'div' } & HTMLAttributes<HTMLDivElement>
type CartaoFormProps = { as: 'form' } & FormHTMLAttributes<HTMLFormElement>

export function Cartao({
  as = 'div',
  className = '',
  ...props
}: CartaoDivProps | CartaoFormProps) {
  const classes = `${classesBase} ${className}`.trim()
  if (as === 'form') {
    return (
      <form
        className={classes}
        {...(props as FormHTMLAttributes<HTMLFormElement>)}
      />
    )
  }
  return (
    <div className={classes} {...(props as HTMLAttributes<HTMLDivElement>)} />
  )
}
