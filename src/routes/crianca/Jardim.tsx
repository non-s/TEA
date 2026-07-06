import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { calcularJardim, contarFlorescidas } from '../../curriculo/jardim'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { acentoDoModulo } from '../../curriculo/coresModulo'
import { PlantaJardim } from '../../curriculo/ativos/PlantaJardim'
import { ouvirPerfil } from '../../firebase/perfis'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'

const textoPorEstagio = {
  semente: 'Ainda uma semente',
  brotando: 'Crescendo',
  floresceu: 'Floresceu!',
} as const

export function Jardim() {
  const [dominadas, setDominadas] = useState<Set<string>>(new Set())
  const [erro, setErro] = useState<string | null>(null)
  const { usuario } = useAuth()
  const { perfilAtivo, encerrarPerfil } = usePerfilAtivo()
  const navigate = useNavigate()
  const perfilId = perfilAtivo?.id

  useEffect(() => {
    if (!usuario || !perfilId) return
    return ouvirPerfil(
      usuario.uid,
      perfilId,
      (perfil) => {
        if (!perfil) {
          setDominadas(new Set())
          encerrarPerfil()
          navigate('/responsavel/perfis')
          return
        }
        setErro(null)
        setDominadas(new Set(perfil?.atividadesDominadas ?? []))
      },
      () => {
        setErro(
          'Não foi possível atualizar o jardim agora. Você pode tentar novamente em instantes.',
        )
      },
    )
  }, [encerrarPerfil, navigate, perfilId, usuario])

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

      {erro && (
        <p
          role="alert"
          className="rounded-2xl bg-[var(--cor-erro)]/10 px-4 py-3 text-sm text-[var(--cor-erro)]"
        >
          {erro}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {canteiros.map((canteiro) => {
          const acento = acentoDoModulo(canteiro.moduloId)
          return (
            <li
              key={canteiro.moduloId}
              aria-label={`${canteiro.titulo}: ${textoPorEstagio[canteiro.estagio]}`}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-4 text-center shadow-[var(--sombra-cartao)]"
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
            </li>
          )
        })}
      </ul>
    </main>
  )
}
