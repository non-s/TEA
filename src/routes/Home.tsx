import { Link } from 'react-router-dom'
import { Logo } from '../components/ui/Logo'
import { classesBotao } from '../components/ui/estilosBotao'

const destaques = [
  {
    titulo: 'Baseado em ciência',
    descricao:
      'Trilha construída sobre práticas com evidência para TEA: ABA, TEACCH e comunicação alternativa.',
  },
  {
    titulo: 'Pensado para o sensorial',
    descricao:
      'Som, animação, contraste e tamanho de letra ajustáveis — nunca nada automático ou inesperado.',
  },
  {
    titulo: 'Gratuito e aberto',
    descricao:
      'Código aberto, hospedagem e banco de dados gratuitos, para sempre acessível às famílias.',
  },
]

export function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-3xl flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <Logo comTexto={false} className="h-14 w-28" />

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--cor-texto)] sm:text-5xl">
          TEA
        </h1>
        <p className="mx-auto max-w-xl text-lg text-[var(--cor-texto-suave)]">
          Plataforma open source de alfabetização para crianças com Transtorno
          do Espectro Autista.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link to="/entrar" className={classesBotao()}>
          Entrar
        </Link>
        <Link
          to="/cadastro"
          className={classesBotao({ variante: 'secundario' })}
        >
          Criar conta
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-3">
        {destaques.map((destaque) => (
          <li
            key={destaque.titulo}
            className="rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-5 text-left shadow-[var(--sombra-cartao)]"
          >
            <p className="font-medium text-[var(--cor-texto)]">
              {destaque.titulo}
            </p>
            <p className="mt-1 text-sm text-[var(--cor-texto-suave)]">
              {destaque.descricao}
            </p>
          </li>
        ))}
      </ul>

      <p className="text-sm text-[var(--cor-texto-suave)]">
        Em construção — acompanhe o desenvolvimento no{' '}
        <a
          href="https://github.com/non-s/TEA"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          repositório no GitHub
        </a>
        .
      </p>
    </main>
  )
}
