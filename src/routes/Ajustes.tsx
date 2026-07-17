import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AjustesSensoriais } from '../components/ui/AjustesSensoriais'
import { Cartao } from '../components/ui/Cartao'
import { Botao } from '../components/ui/Botao'
import { excluirDadosDoAparelho } from '../local/perfilLocal'
import { useFocoPreso } from '../hooks/useFocoPreso'

export function Ajustes() {
  const navigate = useNavigate()
  const [confirmandoApagarTudo, setConfirmandoApagarTudo] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const botaoCancelarRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()

  function abrirConfirmacao() {
    setConfirmandoApagarTudo(true)
    setConfirmacao('')
    requestAnimationFrame(() => botaoCancelarRef.current?.focus())
  }

  function fecharConfirmacao() {
    setConfirmandoApagarTudo(false)
    setConfirmacao('')
  }

  function aoApagarTudo() {
    excluirDadosDoAparelho()
    navigate('/')
  }

  const confirmado = confirmacao.trim().toUpperCase() === 'APAGAR'

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
          Ajustes
        </h1>
        <Link
          to="/"
          className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar
        </Link>
      </div>

      <Cartao className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-[var(--cor-texto)]">
          Sensorial
        </h2>
        <p className="text-sm text-[var(--cor-texto-suave)]">
          Vale para todos os perfis deste aparelho.
        </p>
        <AjustesSensoriais />
      </Cartao>

      <Cartao className="flex flex-col gap-4 border-[var(--cor-erro)]">
        <h2 className="text-lg font-medium text-[var(--cor-texto)]">
          Apagar dados deste aparelho
        </h2>
        <p className="text-sm leading-relaxed text-[var(--cor-texto-suave)]">
          Nenhum dado deste app sai deste aparelho — não há conta nem nuvem.
          Apagar aqui remove todos os perfis e o progresso salvo neste
          navegador, para sempre.
        </p>
        <Botao
          type="button"
          variante="secundario"
          onClick={abrirConfirmacao}
          className="self-start border-[var(--cor-erro)] text-[var(--cor-erro)] hover:border-[var(--cor-erro)]"
        >
          Apagar todos os dados
        </Botao>
      </Cartao>

      {confirmandoApagarTudo && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-6"
          role="presentation"
        >
          <dialog
            ref={dialogoRef}
            open
            aria-labelledby="titulo-apagar-tudo"
            onKeyDown={(evento) => {
              aoKeyDownDialogo(evento)
              if (evento.key === 'Escape') fecharConfirmacao()
            }}
            className="m-0 flex w-full max-w-md flex-col gap-4 rounded-xl border-0 bg-[var(--cor-fundo)] p-5 shadow-xl"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="titulo-apagar-tudo"
                className="text-xl font-semibold text-[var(--cor-texto)]"
              >
                Apagar todos os dados
              </h2>
              <p className="text-sm leading-relaxed text-[var(--cor-texto-suave)]">
                Isso apaga todos os perfis e o progresso salvo neste aparelho.
                Não pode ser desfeito.
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--cor-texto)]">
              Digite APAGAR para confirmar
              <input
                value={confirmacao}
                onChange={(evento) => setConfirmacao(evento.target.value)}
                className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)] uppercase"
                autoComplete="off"
              />
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Botao
                ref={botaoCancelarRef}
                type="button"
                variante="secundario"
                onClick={fecharConfirmacao}
              >
                Cancelar
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                onClick={aoApagarTudo}
                disabled={!confirmado}
                className="border-[var(--cor-erro)] text-[var(--cor-erro)] hover:border-[var(--cor-erro)]"
              >
                Apagar tudo
              </Botao>
            </div>
          </dialog>
        </div>
      )}
    </main>
  )
}
