interface InterruptorProps {
  rotulo: string
  marcado: boolean
  aoAlterar: (marcado: boolean) => void
}

export function Interruptor({ rotulo, marcado, aoAlterar }: InterruptorProps) {
  return (
    <label className="flex min-h-[var(--min-alvo-controle)] cursor-pointer items-center justify-between gap-3 py-1">
      <span className="text-[var(--cor-texto)]">{rotulo}</span>
      <span className="relative inline-flex">
        <input
          type="checkbox"
          checked={marcado}
          onChange={(evento) => aoAlterar(evento.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={`block h-8 w-14 rounded-full border-2 transition-colors motion-reduce:transition-none ${
            marcado
              ? 'border-[var(--cor-primaria)] bg-[var(--cor-primaria)]'
              : 'border-[var(--cor-borda)] bg-[var(--cor-fundo)]'
          } peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--cor-anel-foco)]`}
        >
          <span
            className={`block h-6 w-6 translate-y-[1px] rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${
              marcado ? 'translate-x-[26px]' : 'translate-x-[2px]'
            }`}
          />
        </span>
      </span>
    </label>
  )
}
