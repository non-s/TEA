import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { entrar, redefinirSenha } from '../../firebase/auth'

const mensagensErro: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/invalid-email': 'Digite um e-mail válido.',
  'auth/too-many-requests':
    'Muitas tentativas. Aguarde um pouco antes de tentar de novo.',
}

function mensagemDoErro(erro: unknown): string {
  const codigo = (erro as { code?: string })?.code
  return (
    (codigo && mensagensErro[codigo]) ||
    'Não foi possível entrar. Tente de novo.'
  )
}

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [mensagem, setMensagem] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setMensagem(null)
    setEnviando(true)
    try {
      await entrar(email, senha)
      navigate('/responsavel/perfis')
    } catch (erroCapturado) {
      setErro(mensagemDoErro(erroCapturado))
    } finally {
      setEnviando(false)
    }
  }

  async function aoClicarEmEsqueciSenha() {
    setErro(null)
    setMensagem(null)
    if (!email) {
      setErro('Digite seu e-mail acima para receber o link de redefinição.')
      return
    }
    try {
      await redefinirSenha(email)
      setMensagem('Enviamos um link de redefinição de senha para o seu e-mail.')
    } catch (erroCapturado) {
      setErro(mensagemDoErro(erroCapturado))
    }
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-6 py-10">
      <h1 className="text-center text-2xl font-semibold text-[var(--cor-texto)]">
        Entrar
      </h1>

      <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            E-mail
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(evento) => setEmail(evento.target.value)}
            className="rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-[var(--cor-texto)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Senha
          </span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            className="rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-[var(--cor-texto)]"
          />
        </label>

        {erro && (
          <p role="alert" className="text-sm text-red-700">
            {erro}
          </p>
        )}
        {mensagem && (
          <output className="text-sm text-[var(--cor-sucesso)]">
            {mensagem}
          </output>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-full bg-[var(--cor-primaria)] px-6 py-3 text-base font-medium text-white disabled:opacity-60"
        >
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>

        <button
          type="button"
          onClick={aoClicarEmEsqueciSenha}
          className="text-sm text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Esqueci minha senha
        </button>
      </form>

      <p className="text-center text-sm text-[var(--cor-texto-suave)]">
        Ainda não tem conta?{' '}
        <Link
          to="/cadastro"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Criar conta
        </Link>
      </p>
    </main>
  )
}
