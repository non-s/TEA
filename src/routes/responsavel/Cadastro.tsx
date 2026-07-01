import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { cadastrar } from '../../firebase/auth'
import { Logo } from '../../components/ui/Logo'
import { Cartao } from '../../components/ui/Cartao'
import { Botao } from '../../components/ui/Botao'

const mensagensErro: Record<string, string> = {
  'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
  'auth/invalid-email': 'Digite um e-mail válido.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
}

function mensagemDoErro(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code
  return (
    (codigo && mensagensErro[codigo]) ||
    'Não foi possível criar a conta. Tente de novo.'
  )
}

const classesCampo =
  'rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]'

export function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await cadastrar(email, senha, nome)
      navigate('/responsavel/perfis')
    } catch (erroCapturado) {
      setErro(mensagemDoErro(erroCapturado))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-8 px-6 py-10">
      <Link to="/" className="mx-auto">
        <Logo />
      </Link>

      <Cartao className="flex flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold text-[var(--cor-texto)]">
          Criar conta
        </h1>

        <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--cor-texto)]">
              Seu nome
            </span>
            <input
              type="text"
              required
              autoComplete="name"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              className={classesCampo}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--cor-texto)]">
              E-mail
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              className={classesCampo}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--cor-texto)]">
              Senha
            </span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              className={classesCampo}
            />
          </label>

          {erro && (
            <p
              role="alert"
              className="rounded-lg bg-[var(--cor-erro)]/10 px-3 py-2 text-sm text-[var(--cor-erro)]"
            >
              {erro}
            </p>
          )}

          <Botao type="submit" disabled={enviando} className="mt-2">
            {enviando ? 'Criando conta…' : 'Criar conta'}
          </Botao>
        </form>
      </Cartao>

      <p className="text-center text-sm text-[var(--cor-texto-suave)]">
        Já tem conta?{' '}
        <Link
          to="/entrar"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Entrar
        </Link>
      </p>
    </main>
  )
}
