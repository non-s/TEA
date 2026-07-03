interface AvisoRegistroTentativaProps {
  mensagem: string | null
}

export function AvisoRegistroTentativa({
  mensagem,
}: AvisoRegistroTentativaProps) {
  if (!mensagem) return null

  return (
    <p
      role="alert"
      className="max-w-md rounded-2xl bg-[var(--cor-erro)]/10 px-4 py-3 text-center text-sm text-[var(--cor-erro)]"
    >
      {mensagem}
    </p>
  )
}
