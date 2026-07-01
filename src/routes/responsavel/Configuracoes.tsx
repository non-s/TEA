import { Link } from 'react-router-dom'
import { AjustesSensoriais } from '../../components/ui/AjustesSensoriais'

export function Configuracoes() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center gap-8 px-6 py-10">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
          Configurações
        </h1>
        <Link
          to="/responsavel/perfis"
          className="text-sm text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
      </div>
      <p className="text-sm text-[var(--cor-texto-suave)]">
        Estas preferências valem para este navegador. No futuro cada perfil de
        criança poderá ter as suas próprias.
      </p>
      <AjustesSensoriais />
    </main>
  )
}
