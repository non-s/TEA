import { Link } from 'react-router-dom'
import { AjustesSensoriais } from '../components/ui/AjustesSensoriais'

export function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <h1 className="text-4xl font-semibold text-[var(--cor-texto)]">TEA</h1>
      <p className="text-lg text-[var(--cor-texto-suave)]">
        Plataforma open source de alfabetização para crianças com Transtorno do
        Espectro Autista.
      </p>
      <p className="text-base text-[var(--cor-texto-suave)]">
        Em construção — acompanhe o desenvolvimento no{' '}
        <a
          href="https://github.com/non-s/TEA"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          repositório no GitHub
        </a>
        .
      </p>
      <Link
        to="/crianca/trilha"
        className="rounded-full bg-[var(--cor-primaria)] px-6 py-3 text-base font-medium text-white"
      >
        Ver demonstração da primeira atividade
      </Link>
      <p className="text-sm text-[var(--cor-texto-suave)]">
        (Login e perfis por criança ainda não existem — isso é só uma
        demonstração temporária do Módulo 0.)
      </p>

      <AjustesSensoriais />
    </main>
  )
}
