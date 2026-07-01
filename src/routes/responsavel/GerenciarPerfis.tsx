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
import { corDoAvatar } from '../../components/ui/coresAvatar'
import { Cartao } from '../../components/ui/Cartao'
import { Botao } from '../../components/ui/Botao'

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

      {perfis.length > 0 && (
        <ul className="flex flex-col gap-3">
          {perfis.map((perfil) => {
            const cor = corDoAvatar(perfil.avatarId as FormaIconeId)
            return (
              <li key={perfil.id}>
                <Cartao className="flex items-center justify-between gap-3 p-4">
                  <span className="flex items-center gap-3">
                    <span
                      style={{ background: cor.fundo, color: cor.texto }}
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                    >
                      <Icone
                        iconeId={perfil.avatarId as FormaIconeId}
                        className="h-6 w-6"
                      />
                    </span>
                    <span className="font-medium text-[var(--cor-texto)]">
                      {perfil.nome}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => aoRemover(perfil.id)}
                    className="text-sm text-[var(--cor-erro)] underline underline-offset-2"
                  >
                    Remover
                  </button>
                </Cartao>
              </li>
            )
          })}
        </ul>
      )}

      <Cartao as="form" onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-[var(--cor-texto)]">
          Novo perfil
        </h2>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Nome ou apelido da criança
          </span>
          <input
            type="text"
            required
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <fieldset className="flex flex-col gap-2 border-0 p-0">
          <legend className="text-sm font-medium text-[var(--cor-texto)]">
            Avatar
          </legend>
          <div className="flex flex-wrap gap-2">
            {avatares.map((avatar) => {
              const cor = corDoAvatar(avatar)
              const selecionado = avatarId === avatar
              return (
                <button
                  key={avatar}
                  type="button"
                  aria-pressed={selecionado}
                  onClick={() => setAvatarId(avatar)}
                  style={{ background: cor.fundo, color: cor.texto }}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl transition-transform motion-reduce:transition-none hover:scale-105 ${
                    selecionado
                      ? 'ring-3 ring-[var(--cor-primaria)] ring-offset-2'
                      : ''
                  }`}
                >
                  <Icone iconeId={avatar} className="h-7 w-7" />
                </button>
              )
            })}
          </div>
        </fieldset>

        {erro && (
          <p role="alert" className="text-sm text-[var(--cor-erro)]">
            {erro}
          </p>
        )}

        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Criando…' : 'Criar perfil'}
        </Botao>
      </Cartao>
    </main>
  )
}
