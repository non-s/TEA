import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { entrar, redefinirSenha } from '../../firebase/auth'
import { Logo } from '../../components/ui/Logo'
import { Cartao } from '../../components/ui/Cartao'
import { Botao } from '../../components/ui/Botao'

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

const classesCampo =
  'rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]'

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
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-8 px-6 py-10">
      <Link to="/" className="mx-auto">
        <Logo />
      </Link>

      <Cartao className="flex flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold text-[var(--cor-texto)]">
          Entrar
        </h1>

        <form onSubmit={aoSubmeter} className="flex flex-col gap-4">
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
              autoComplete="current-password"
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
          {mensagem && (
            <output className="rounded-lg bg-[var(--cor-sucesso-clara)] px-3 py-2 text-sm text-[var(--cor-sucesso)]">
              {mensagem}
            </output>
          )}

          <Botao type="submit" disabled={enviando} className="mt-2">
            {enviando ? 'Entrando…' : 'Entrar'}
          </Botao>

          <button
            type="button"
            onClick={aoClicarEmEsqueciSenha}
            className="text-center text-sm text-[var(--cor-primaria)] underline underline-offset-2"
          >
            Esqueci minha senha
          </button>
        </form>
      </Cartao>

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
