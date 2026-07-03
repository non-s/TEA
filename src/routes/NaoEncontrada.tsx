import { Link } from 'react-router-dom'
import { classesBotao } from '../components/ui/estilosBotao'

export function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <section
        aria-labelledby="titulo-nao-encontrada"
        className="flex w-full flex-col gap-4 rounded-[8px] border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-6 shadow-[var(--sombra-cartao)]"
      >
        <p className="text-sm font-semibold text-[var(--cor-primaria)]">
          Caminho não encontrado
        </p>
        <h1
          id="titulo-nao-encontrada"
          className="text-2xl font-bold text-[var(--cor-texto)]"
        >
          Esta página não existe.
        </h1>
        <p className="text-base leading-7 text-[var(--cor-texto-suave)]">
          Tudo bem. Você pode voltar para o início e escolher o próximo passo
          com calma.
        </p>
      </section>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          className={classesBotao({
            variante: 'primario',
            tamanho: 'grande',
          })}
          to="/"
        >
          Ir para o início
        </Link>
        <Link
          className={classesBotao({
            variante: 'secundario',
            tamanho: 'grande',
          })}
          to="/demo"
        >
          Ver demonstração
        </Link>
      </div>
    </main>
  )
}
