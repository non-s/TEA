import { Link } from 'react-router-dom'
import { calcularJardim, contarFlorescidas } from '../../curriculo/jardim'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { acentoDoModulo } from '../../curriculo/coresModulo'
import { PlantaJardim } from '../../curriculo/ativos/PlantaJardim'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'

const textoPorEstagio = {
  semente: 'Ainda uma semente',
  brotando: 'Crescendo',
  floresceu: 'Floresceu!',
} as const

const incentivoPorEstagio = {
  semente: 'Vai começar quando quiser.',
  brotando: 'Já está brotando bonito.',
  floresceu: 'Que canteiro lindo!',
} as const

export function Jardim() {
  const { perfilAtivo } = usePerfilAtivo()
  const dominadas = new Set(perfilAtivo?.atividadesDominadas ?? [])
  const canteiros = calcularJardim(trilhaV1, dominadas)
  const florescidas = contarFlorescidas(canteiros)

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-[var(--cor-texto)]">
          Meu jardim
        </h1>
        <Link
          to="/crianca/trilha"
          className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-texto-suave)] underline underline-offset-2"
        >
          Voltar para a trilha
        </Link>
      </div>

      <p className="text-[var(--cor-texto-suave)]">
        {florescidas === 0
          ? 'Cada módulo que você completa faz um canteiro florescer aqui.'
          : florescidas === canteiros.length
            ? 'Todos os canteiros floresceram! Você pode voltar aqui sempre que quiser.'
            : `${florescidas} de ${canteiros.length} canteiros já floresceram.`}
      </p>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {canteiros.map((canteiro) => {
          const acento = acentoDoModulo(canteiro.moduloId)
          const floresceu = canteiro.estagio === 'floresceu'
          return (
            <li
              key={canteiro.moduloId}
              aria-label={`${canteiro.titulo}: ${textoPorEstagio[canteiro.estagio]}`}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center shadow-[var(--sombra-cartao)] transition-colors ${
                floresceu
                  ? 'border-[var(--cor-conquista)] bg-[var(--cor-conquista-clara)]'
                  : 'border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)]'
              }`}
            >
              <PlantaJardim
                estagio={canteiro.estagio}
                className="h-20 w-16"
                style={{ color: acento.texto }}
              />
              <span className="text-sm font-medium text-[var(--cor-texto)]">
                {canteiro.titulo}
              </span>
              <span className="text-xs text-[var(--cor-texto-suave)]">
                {textoPorEstagio[canteiro.estagio]}
              </span>
              <span className="text-xs italic text-[var(--cor-texto-suave)]">
                {incentivoPorEstagio[canteiro.estagio]}
              </span>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
