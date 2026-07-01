import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { lerAtividadesDominadas } from '../../progresso/dominadas'
import { Icone } from '../../curriculo/ativos/Icone'
import type { IconeId } from '../../curriculo/ativos/tipos'

export function Trilha() {
  const [dominadas, setDominadas] = useState<Set<string>>(new Set())

  useEffect(() => {
    setDominadas(lerAtividadesDominadas())
  }, [])

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
      <h1 className="text-center text-3xl font-semibold text-[var(--cor-texto)]">
        Minha trilha
      </h1>

      {trilhaV1.modulos.map((modulo) => (
        <section key={modulo.id} className="flex flex-col gap-4">
          <h2 className="text-xl font-medium text-[var(--cor-texto)]">
            {modulo.titulo}
          </h2>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {modulo.atividades.map((atividade) => {
              const dominada = dominadas.has(atividade.id)
              return (
                <li key={atividade.id}>
                  <Link
                    to={`/crianca/atividade/${atividade.id}`}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-colors motion-reduce:transition-none ${
                      dominada
                        ? 'border-[var(--cor-sucesso)] bg-[var(--cor-sucesso)]/10'
                        : 'border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)]'
                    }`}
                  >
                    <Icone
                      iconeId={atividade.alvo.iconeId as IconeId}
                      className="h-12 w-12 text-[var(--cor-primaria-escura)]"
                    />
                    <span className="text-sm text-[var(--cor-texto-suave)]">
                      {dominada ? 'Concluída ✓' : atividade.alvo.rotulo}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </main>
  )
}
