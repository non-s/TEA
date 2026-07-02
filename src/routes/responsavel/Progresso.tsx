import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ouvirPerfil, type PerfilCrianca } from '../../firebase/perfis'
import { ouvirTentativas } from '../../firebase/progresso'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import type { Tentativa } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { FormaIconeId } from '../../curriculo/ativos/tipos'
import { corDoAvatar } from '../../components/ui/coresAvatar'
import { Cartao } from '../../components/ui/Cartao'

function formatarDataHora(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function Progresso() {
  const { perfilId } = useParams<{ perfilId: string }>()
  const { usuario } = useAuth()
  const [perfil, setPerfil] = useState<PerfilCrianca | null>(null)
  const [tentativas, setTentativas] = useState<Tentativa[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario || !perfilId) return
    const pararPerfil = ouvirPerfil(usuario.uid, perfilId, setPerfil)
    const pararTentativas = ouvirTentativas(usuario.uid, perfilId, (t) => {
      setTentativas(t)
      setCarregando(false)
    })
    return () => {
      pararPerfil()
      pararTentativas()
    }
  }, [usuario, perfilId])

  const resumoPorModulo = useMemo(() => {
    return trilhaV1.modulos.map((modulo) => {
      const tentativasDoModulo = tentativas.filter(
        (t) => t.moduloId === modulo.id,
      )
      const corretas = tentativasDoModulo.filter(
        (t) => t.resultado === 'correto',
      ).length
      const percentualAcerto =
        tentativasDoModulo.length > 0
          ? Math.round((corretas / tentativasDoModulo.length) * 100)
          : null
      const dominadasNoModulo = modulo.atividades.filter((a) =>
        (perfil?.atividadesDominadas ?? []).includes(a.id),
      ).length

      return {
        modulo,
        totalTentativas: tentativasDoModulo.length,
        percentualAcerto,
        dominadasNoModulo,
      }
    })
  }, [tentativas, perfil])

  const totalAtividades = trilhaV1.modulos.reduce(
    (soma, m) => soma + m.atividades.length,
    0,
  )
  const totalDominadas = perfil?.atividadesDominadas.length ?? 0

  const ultimasTentativas = [...tentativas].reverse().slice(0, 10)

  if (carregando) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-10">
        <p className="text-[var(--cor-texto-suave)]">Carregando progresso…</p>
      </main>
    )
  }

  if (!perfil) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-10 text-center">
        <p className="text-lg text-[var(--cor-texto)]">
          Não encontramos esse perfil.
        </p>
        <Link
          to="/responsavel/perfis/gerenciar"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar para gerenciar perfis
        </Link>
      </main>
    )
  }

  const cor = corDoAvatar(perfil.avatarId as FormaIconeId)

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            style={{ background: cor.fundo, color: cor.texto }}
            className="flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <Icone
              iconeId={perfil.avatarId as FormaIconeId}
              className="h-7 w-7"
            />
          </span>
          <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
            Progresso de {perfil.nome}
          </h1>
        </div>
        <Link
          to="/responsavel/perfis/gerenciar"
          className="text-sm text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
      </div>

      <Cartao className="flex flex-wrap gap-8">
        <div>
          <p className="text-3xl font-semibold text-[var(--cor-conquista)]">
            {totalDominadas}
            <span className="text-lg text-[var(--cor-texto-suave)]">
              {' '}
              / {totalAtividades}
            </span>
          </p>
          <p className="text-sm text-[var(--cor-texto-suave)]">
            atividades dominadas
          </p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-[var(--cor-texto)]">
            {tentativas.length}
          </p>
          <p className="text-sm text-[var(--cor-texto-suave)]">
            tentativas registradas
          </p>
        </div>
      </Cartao>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-[var(--cor-texto)]">
          Por módulo
        </h2>
        {resumoPorModulo.map(
          ({
            modulo,
            totalTentativas,
            percentualAcerto,
            dominadasNoModulo,
          }) => (
            <Cartao key={modulo.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-[var(--cor-texto)]">
                  {modulo.titulo}
                </p>
                <p className="text-sm text-[var(--cor-texto-suave)]">
                  {dominadasNoModulo} de {modulo.atividades.length} dominadas
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--cor-fundo)]">
                <div
                  className="h-full rounded-full bg-[var(--cor-primaria)]"
                  style={{
                    width: `${(dominadasNoModulo / modulo.atividades.length) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[var(--cor-texto-suave)]">
                {totalTentativas > 0
                  ? `${percentualAcerto}% de acerto em ${totalTentativas} tentativas`
                  : 'Ainda não praticou este módulo'}
              </p>
            </Cartao>
          ),
        )}
      </section>

      {ultimasTentativas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Últimas tentativas
          </h2>
          <Cartao className="p-0">
            <ul className="divide-y divide-[var(--cor-borda)]">
              {ultimasTentativas.map((tentativa, indice) => (
                <li
                  key={`${tentativa.atividadeId}-${tentativa.timestamp}-${indice}`}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-[var(--cor-texto)]">
                    {tentativa.atividadeId}
                  </span>
                  <span
                    className={
                      tentativa.resultado === 'correto'
                        ? 'text-[var(--cor-sucesso)]'
                        : 'text-[var(--cor-texto-suave)]'
                    }
                  >
                    {tentativa.resultado === 'correto' ? 'Acertou' : 'Errou'}
                  </span>
                  <span className="text-[var(--cor-texto-suave)]">
                    {formatarDataHora(tentativa.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          </Cartao>
        </section>
      )}
    </main>
  )
}
