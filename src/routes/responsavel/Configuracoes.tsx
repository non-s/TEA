import { Link } from 'react-router-dom'
import { AjustesSensoriais } from '../../components/ui/AjustesSensoriais'
import { Cartao } from '../../components/ui/Cartao'

export function Configuracoes() {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
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

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="font-medium text-[var(--cor-texto)]">
            Ajustes sensoriais
          </h2>
          <p className="mt-1 text-sm text-[var(--cor-texto-suave)]">
            Estas preferências valem para este navegador. No futuro cada perfil
            de criança poderá ter as suas próprias.
          </p>
        </div>
        <AjustesSensoriais />
      </Cartao>
    </main>
  )
}
