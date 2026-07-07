import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { reenviarVerificacaoEmail } from '../../firebase/auth'
import { Botao } from './Botao'

// Só aparece nas telas do responsável (nunca durante uma atividade da
// criança) — verificar e-mail protege a conta do responsável, não é algo
// relevante para a criança ver na tela.
export function AvisoEmailNaoVerificado() {
  const { usuario } = useAuth()
  const location = useLocation()
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const emRotaResponsavel = location.pathname.startsWith('/responsavel')
  if (!usuario || usuario.emailVerified || !emRotaResponsavel) return null

  async function reenviar() {
    setEnviando(true)
    try {
      await reenviarVerificacaoEmail(usuario!)
      setEnviado(true)
    } catch {
      // Reenvio é best-effort; o próprio Firebase já limita a taxa de envio.
    } finally {
      setEnviando(false)
    }
  }

  return (
    <output
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-3 text-sm text-[var(--cor-texto)] shadow-[var(--sombra-cartao)]">
        <span>
          {enviado
            ? 'E-mail de verificação reenviado. Confira sua caixa de entrada.'
            : 'Confirme seu e-mail para proteger sua conta.'}
        </span>
        {!enviado && (
          <Botao
            type="button"
            variante="secundario"
            tamanho="medio"
            onClick={reenviar}
            disabled={enviando}
          >
            {enviando ? 'Enviando…' : 'Reenviar e-mail'}
          </Botao>
        )}
      </div>
    </output>
  )
}
