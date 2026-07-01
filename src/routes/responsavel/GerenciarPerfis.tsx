import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  criarPerfil,
  ouvirPerfis,
  removerPerfil,
  type PerfilCrianca,
} from '../../firebase/perfis'
import { Icone } from '../../curriculo/ativos/Icone'
import type { FormaIconeId } from '../../curriculo/ativos/tipos'

const avatares: FormaIconeId[] = [
  'circulo',
  'quadrado',
  'triangulo',
  'estrela',
  'coracao',
  'lua',
]

export function GerenciarPerfis() {
  const { usuario } = useAuth()
  const [perfis, setPerfis] = useState<PerfilCrianca[]>([])
  const [nome, setNome] = useState('')
  const [avatarId, setAvatarId] = useState<FormaIconeId>('circulo')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario) return
    return ouvirPerfis(usuario.uid, setPerfis)
  }, [usuario])

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault()
    if (!usuario) return
    setErro(null)
    setEnviando(true)
    try {
      await criarPerfil(usuario.uid, nome, avatarId)
      setNome('')
      setAvatarId('circulo')
    } catch {
      setErro('Não foi possível criar o perfil. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  async function aoRemover(perfilId: string) {
    if (!usuario) return
    if (
      !window.confirm('Remover este perfil? O progresso dele será perdido.')
    ) {
      return
    }
    await removerPerfil(usuario.uid, perfilId)
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
          Gerenciar perfis
        </h1>
        <Link
          to="/responsavel/perfis"
          className="text-sm text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {perfis.map((perfil) => (
          <li
            key={perfil.id}
            className="flex items-center justify-between rounded-xl border border-[var(--cor-borda)] px-4 py-3"
          >
            <span className="flex items-center gap-3">
              <Icone
                iconeId={perfil.avatarId as FormaIconeId}
                className="h-8 w-8 text-[var(--cor-primaria-escura)]"
              />
              <span className="text-[var(--cor-texto)]">{perfil.nome}</span>
            </span>
            <button
              type="button"
              onClick={() => aoRemover(perfil.id)}
              className="text-sm text-red-700 underline underline-offset-2"
            >
              Remover
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={aoSubmeter}
        className="flex flex-col gap-4 rounded-xl border border-[var(--cor-borda)] p-4"
      >
        <h2 className="text-lg font-medium text-[var(--cor-texto)]">
          Novo perfil
        </h2>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Nome ou apelido da criança
          </span>
          <input
            type="text"
            required
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            className="rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-[var(--cor-texto)]"
          />
        </label>

        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="text-sm font-medium text-[var(--cor-texto)]">
            Avatar
          </legend>
          <div className="flex flex-wrap gap-2">
            {avatares.map((avatar) => (
              <button
                key={avatar}
                type="button"
                aria-pressed={avatarId === avatar}
                onClick={() => setAvatarId(avatar)}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 ${
                  avatarId === avatar
                    ? 'border-[var(--cor-primaria)]'
                    : 'border-[var(--cor-borda)]'
                }`}
              >
                <Icone
                  iconeId={avatar}
                  className="h-7 w-7 text-[var(--cor-primaria-escura)]"
                />
              </button>
            ))}
          </div>
        </fieldset>

        {erro && (
          <p role="alert" className="text-sm text-red-700">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-[var(--cor-primaria)] px-6 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {enviando ? 'Criando…' : 'Criar perfil'}
        </button>
      </form>
    </main>
  )
}
