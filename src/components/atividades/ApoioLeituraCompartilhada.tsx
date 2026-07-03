interface ApoioLeituraCompartilhadaProps {
  convite: string
}

export function ApoioLeituraCompartilhada({
  convite,
}: ApoioLeituraCompartilhadaProps) {
  return (
    <section aria-label="Leitura compartilhada" className="w-full text-left">
      <p className="text-xs font-semibold uppercase text-[var(--cor-texto-suave)]">
        Leitura compartilhada
      </p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-3">
        <li className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3">
          <strong className="block text-sm text-[var(--cor-texto)]">
            Espere
          </strong>
          <span className="mt-1 block text-sm leading-5 text-[var(--cor-texto-suave)]">
            Olhar, gesto, toque, vocalizacao ou CAA contam.
          </span>
        </li>
        <li className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3">
          <strong className="block text-sm text-[var(--cor-texto)]">
            Comente
          </strong>
          <span className="mt-1 block text-sm leading-5 text-[var(--cor-texto-suave)]">
            Repita uma palavra e ligue com rotina ou interesse.
          </span>
        </li>
        <li className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-3">
          <strong className="block text-sm text-[var(--cor-texto)]">
            Convide
          </strong>
          <span className="mt-1 block text-sm leading-5 text-[var(--cor-texto-suave)]">
            {convite}
          </span>
        </li>
      </ul>
    </section>
  )
}
