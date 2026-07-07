import { useState, type FormEvent } from 'react'
import {
  LIMITE_COLABORADORES,
  adicionarColaborador,
  emailColaboradorValido,
  removerColaborador,
  type PerfilCrianca,
} from '../../firebase/perfis'
import { Botao } from '../../components/ui/Botao'

interface ColaboradoresPerfilProps {
  uidResponsavel: string
  perfil: PerfilCrianca
}

// Compartilhamento é deliberadamente manual (sem convite automatizado): o
// projeto não tem orçamento para Cloud Functions (exige plano pago Blaze),
// então o responsável copia o link e envia por fora (WhatsApp, e-mail
// etc.) para quem ele escolher. Ver docs/SEGURANCA.md.
export function ColaboradoresPerfil({
  uidResponsavel,
  perfil,
}: ColaboradoresPerfilProps) {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const linkColaborador = `${window.location.origin}${window.location.pathname}#/colaborador/${uidResponsavel}/${perfil.id}`
  const limiteAtingido =
    perfil.colaboradoresEmail.length >= LIMITE_COLABORADORES

  async function aoAdicionar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    const emailNormalizado = email.trim().toLowerCase()

    if (!emailColaboradorValido(emailNormalizado)) {
      setErro('Digite um e-mail válido.')
      return
    }
    if (perfil.colaboradoresEmail.includes(emailNormalizado)) {
      setErro('Esse e-mail já tem acesso a este perfil.')
      return
    }
    if (limiteAtingido) {
      setErro(`Máximo de ${LIMITE_COLABORADORES} colaboradores por perfil.`)
      return
    }

    setEnviando(true)
    try {
      await adicionarColaborador(uidResponsavel, perfil.id, emailNormalizado)
      setEmail('')
    } catch {
      setErro('Não foi possível adicionar agora. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  async function aoRemover(emailColaborador: string) {
    setRemovendo(emailColaborador)
    setErro(null)
    try {
      await removerColaborador(uidResponsavel, perfil.id, emailColaborador)
    } catch {
      setErro('Não foi possível remover agora. Tente de novo.')
    } finally {
      setRemovendo(null)
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkColaborador)
    } catch {
      // Sem permissão de clipboard: o link continua selecionável na tela.
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--cor-borda)] pt-3">
      <span className="text-sm font-medium text-[var(--cor-texto)]">
        Compartilhar progresso (2º responsável ou terapeuta)
      </span>

      {perfil.colaboradoresEmail.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {perfil.colaboradoresEmail.map((emailColaborador) => (
            <li
              key={emailColaborador}
              className="flex items-center justify-between gap-3 text-sm text-[var(--cor-texto-suave)]"
            >
              <span>{emailColaborador}</span>
              <button
                type="button"
                onClick={() => aoRemover(emailColaborador)}
                disabled={removendo === emailColaborador}
                className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-erro)] underline underline-offset-2"
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <form
        onSubmit={aoAdicionar}
        noValidate
        className="flex flex-wrap items-end gap-2"
      >
        <label className="flex flex-1 flex-col gap-1.5">
          <span className="text-xs text-[var(--cor-texto-suave)]">
            E-mail de quem vai acompanhar
          </span>
          <input
            type="email"
            value={email}
            disabled={limiteAtingido}
            onChange={(evento) => setEmail(evento.target.value)}
            className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-sm text-[var(--cor-texto)]"
          />
        </label>
        <Botao
          type="submit"
          variante="secundario"
          tamanho="medio"
          disabled={enviando || limiteAtingido}
        >
          Adicionar
        </Botao>
      </form>

      {erro && (
        <p role="alert" className="text-sm text-[var(--cor-erro)]">
          {erro}
        </p>
      )}

      {perfil.colaboradoresEmail.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-[var(--cor-texto-suave)]">
            Envie este link para quem você adicionou (a pessoa precisa entrar
            com o mesmo e-mail e confirmar o próprio e-mail):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <code className="break-all rounded-lg bg-[var(--cor-fundo)] px-2 py-1 text-xs text-[var(--cor-texto)]">
              {linkColaborador}
            </code>
            <Botao
              type="button"
              variante="secundario"
              tamanho="medio"
              onClick={copiarLink}
            >
              Copiar link
            </Botao>
          </div>
        </div>
      )}
    </div>
  )
}
