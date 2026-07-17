import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { usePerfilAtivo } from '../contexts/PerfilAtivoContext'
import { usePreferencias } from '../contexts/PreferenciasContext'
import { LIMITE_NOME_PERFIL } from '../local/perfilLocal'
import {
  exemplosInteresseEspecial,
  interessesEspeciais,
  obterInteresseEspecial,
  type InteresseEspecialId,
} from '../curriculo/interesses'
import {
  criarAjustesIniciaisPerfilApoio,
  normalizarPerfilApoio,
  perfilApoioPadrao,
  textoAcessoPreferencial,
  textoComunicacaoPreferencial,
  textoRegulacaoPreferencial,
  type AcessoPreferencial,
  type ComunicacaoPreferencial,
  type RegulacaoPreferencial,
} from '../curriculo/perfilApoio'
import { Icone } from '../curriculo/ativos/Icone'
import type { FormaIconeId } from '../curriculo/ativos/tipos'
import { corDoAvatar } from '../components/ui/coresAvatar'
import { Logo } from '../components/ui/Logo'
import { Cartao } from '../components/ui/Cartao'
import { Botao } from '../components/ui/Botao'
import { useFocoPreso } from '../hooks/useFocoPreso'

const avatares: FormaIconeId[] = [
  'circulo',
  'quadrado',
  'triangulo',
  'estrela',
  'coracao',
  'lua',
]

const nomesAvatares: Record<FormaIconeId, string> = {
  circulo: 'círculo',
  quadrado: 'quadrado',
  triangulo: 'triângulo',
  estrela: 'estrela',
  coracao: 'coração',
  lua: 'lua',
}

export function Entrada() {
  const { perfis, criarPerfil, selecionarPerfil, excluirPerfil } =
    usePerfilAtivo()
  const { atualizarPreferencias } = usePreferencias()
  const navigate = useNavigate()

  const [criando, setCriando] = useState(perfis.length === 0)
  const [nome, setNome] = useState('')
  const [avatarId, setAvatarId] = useState<FormaIconeId>('circulo')
  const [interesseEspecialId, setInteresseEspecialId] =
    useState<InteresseEspecialId>('neutro')
  const [comunicacaoPreferencial, setComunicacaoPreferencial] =
    useState<ComunicacaoPreferencial>(perfilApoioPadrao.comunicacaoPreferencial)
  const [acessoPreferencial, setAcessoPreferencial] =
    useState<AcessoPreferencial>(perfilApoioPadrao.acessoPreferencial)
  const [regulacaoPreferencial, setRegulacaoPreferencial] =
    useState<RegulacaoPreferencial>(perfilApoioPadrao.regulacaoPreferencial)
  const [erro, setErro] = useState<string | null>(null)

  const [perfilParaApagar, setPerfilParaApagar] = useState<{
    id: string
    nome: string
  } | null>(null)
  const [confirmacaoApagar, setConfirmacaoApagar] = useState('')
  const botaoCancelarApagarRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoApagarRef, aoKeyDown: aoKeyDownDialogoApagar } =
    useFocoPreso<HTMLDialogElement>()
  const campoNomeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (criando) campoNomeRef.current?.focus()
  }, [criando])

  function aoEscolherPerfil(perfilId: string) {
    selecionarPerfil(perfilId)
    navigate('/crianca/trilha')
  }

  function aoSubmeterNovoPerfil(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    if (!nome.trim()) {
      setErro('Digite um nome ou apelido para começar.')
      return
    }

    const perfilApoio = normalizarPerfilApoio({
      comunicacaoPreferencial,
      acessoPreferencial,
      regulacaoPreferencial,
    })
    const ajustesIniciais = criarAjustesIniciaisPerfilApoio(perfilApoio)

    criarPerfil(nome, avatarId, {
      interesseEspecialId,
      apoioPreferencial: ajustesIniciais.planoIndividual.apoioPreferencial,
      perfilApoio,
    })
    atualizarPreferencias(ajustesIniciais.preferenciasSensoriais)
    navigate('/crianca/trilha')
  }

  function abrirConfirmacaoApagar(perfil: { id: string; nome: string }) {
    setPerfilParaApagar(perfil)
    setConfirmacaoApagar('')
    requestAnimationFrame(() => botaoCancelarApagarRef.current?.focus())
  }

  function fecharConfirmacaoApagar() {
    setPerfilParaApagar(null)
    setConfirmacaoApagar('')
  }

  function aoConfirmarApagar() {
    if (!perfilParaApagar) return
    if (confirmacaoApagar !== perfilParaApagar.nome) return
    excluirPerfil(perfilParaApagar.id)
    fecharConfirmacaoApagar()
  }

  const interesseSelecionado = obterInteresseEspecial(interesseEspecialId)
  const exemplosInteresseSelecionado =
    exemplosInteresseEspecial(interesseEspecialId).join(', ')
  const remocaoConfirmada =
    !!perfilParaApagar && confirmacaoApagar === perfilParaApagar.nome

  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-10 px-6 py-12 text-center animacao-surgir">
      <Logo />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-[var(--cor-texto)]">
          Quem vai estudar agora?
        </h1>
        <p className="text-[var(--cor-texto-suave)]">
          Sem conta, sem login. Tudo fica só neste aparelho.
        </p>
      </div>

      {perfis.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-6">
          {perfis.map((perfil) => {
            const cor = corDoAvatar(perfil.avatarId)
            return (
              <li key={perfil.id} className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => aoEscolherPerfil(perfil.id)}
                  className="group flex flex-col items-center gap-3"
                >
                  <span
                    style={{ background: cor.fundo, color: cor.texto }}
                    className="flex min-h-[var(--min-alvo-atividade)] min-w-[var(--min-alvo-atividade)] items-center justify-center rounded-3xl shadow-[var(--sombra-cartao)] transition-transform motion-reduce:transition-none group-hover:scale-105 group-active:scale-95"
                  >
                    <Icone iconeId={perfil.avatarId} className="h-16 w-16" />
                  </span>
                  <span className="text-base font-medium text-[var(--cor-texto)]">
                    {perfil.nome}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    abrirConfirmacaoApagar({ id: perfil.id, nome: perfil.nome })
                  }
                  className="text-xs text-[var(--cor-texto-suave)] underline underline-offset-2"
                >
                  Apagar perfil
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {!criando && (
        <Botao
          type="button"
          variante="secundario"
          onClick={() => setCriando(true)}
        >
          Novo perfil
        </Botao>
      )}

      {criando && (
        <Cartao
          as="form"
          onSubmit={aoSubmeterNovoPerfil}
          className="flex w-full flex-col gap-4 text-left"
        >
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Novo perfil
          </h2>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-[var(--cor-texto)]">
              Nome ou apelido
            </span>
            <input
              ref={campoNomeRef}
              type="text"
              required
              maxLength={LIMITE_NOME_PERFIL}
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
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
                    aria-label={`Escolher avatar ${nomesAvatares[avatar]}`}
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

          <details className="group rounded-2xl border-2 border-[var(--cor-borda)] px-4 py-3 open:pb-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
              <span className="text-sm font-medium text-[var(--cor-texto)]">
                Personalizar interesse e apoio inicial
              </span>
              <span className="flex items-center gap-2 text-xs text-[var(--cor-texto-suave)]">
                Opcional
                <span
                  aria-hidden="true"
                  className="transition-transform group-open:rotate-180"
                >
                  ⌄
                </span>
              </span>
            </summary>

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="interesse-inicial"
                  className="text-sm font-medium text-[var(--cor-texto)]"
                >
                  Interesse inicial
                </label>
                <select
                  id="interesse-inicial"
                  value={interesseEspecialId}
                  aria-describedby="interesse-inicial-descricao"
                  onChange={(evento) =>
                    setInteresseEspecialId(
                      evento.target.value as InteresseEspecialId,
                    )
                  }
                  className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                >
                  {interessesEspeciais.map((interesse) => (
                    <option key={interesse.id} value={interesse.id}>
                      {interesse.nome}
                    </option>
                  ))}
                </select>
                <span
                  id="interesse-inicial-descricao"
                  className="text-sm text-[var(--cor-texto-suave)]"
                >
                  {interesseSelecionado.descricao} Exemplos:{' '}
                  {exemplosInteresseSelecionado}.
                </span>
              </div>

              <fieldset className="flex flex-col gap-3 border-0 p-0">
                <legend className="text-sm font-medium text-[var(--cor-texto)]">
                  Apoio inicial
                </legend>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-[var(--cor-texto)]">
                    Comunicação que a criança já usa melhor
                  </span>
                  <select
                    value={comunicacaoPreferencial}
                    onChange={(evento) =>
                      setComunicacaoPreferencial(
                        evento.target.value as ComunicacaoPreferencial,
                      )
                    }
                    className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                  >
                    {Object.entries(textoComunicacaoPreferencial).map(
                      ([valor, texto]) => (
                        <option key={valor} value={valor}>
                          {texto}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-[var(--cor-texto)]">
                    Como ela seleciona melhor
                  </span>
                  <select
                    value={acessoPreferencial}
                    onChange={(evento) =>
                      setAcessoPreferencial(
                        evento.target.value as AcessoPreferencial,
                      )
                    }
                    className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                  >
                    {Object.entries(textoAcessoPreferencial).map(
                      ([valor, texto]) => (
                        <option key={valor} value={valor}>
                          {texto}
                        </option>
                      ),
                    )}
                  </select>
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-[var(--cor-texto)]">
                    Para regular, costuma ajudar
                  </span>
                  <select
                    value={regulacaoPreferencial}
                    onChange={(evento) =>
                      setRegulacaoPreferencial(
                        evento.target.value as RegulacaoPreferencial,
                      )
                    }
                    className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                  >
                    {Object.entries(textoRegulacaoPreferencial).map(
                      ([valor, texto]) => (
                        <option key={valor} value={valor}>
                          {texto}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </fieldset>
            </div>
          </details>

          {erro && (
            <p role="alert" className="text-sm text-[var(--cor-erro)]">
              {erro}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Botao type="submit">Começar</Botao>
            {perfis.length > 0 && (
              <Botao
                type="button"
                variante="secundario"
                onClick={() => setCriando(false)}
              >
                Cancelar
              </Botao>
            )}
          </div>
        </Cartao>
      )}

      <p className="text-sm text-[var(--cor-texto-suave)]">
        Código aberto e auditável no{' '}
        <a
          href="https://github.com/non-s/TEA"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          repositório no GitHub
        </a>
        .{' '}
        <Link
          to="/privacidade"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Privacidade
        </Link>
        {' · '}
        <Link
          to="/ajustes"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Ajustes sensoriais
        </Link>
      </p>

      {perfilParaApagar && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-6"
          role="presentation"
        >
          <dialog
            ref={dialogoApagarRef}
            open
            aria-labelledby="titulo-apagar-perfil"
            onKeyDown={(evento) => {
              aoKeyDownDialogoApagar(evento)
              if (evento.key === 'Escape') fecharConfirmacaoApagar()
            }}
            className="m-0 flex w-full max-w-md flex-col gap-4 rounded-xl border-0 bg-[var(--cor-fundo)] p-5 shadow-xl"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="titulo-apagar-perfil"
                className="text-xl font-semibold text-[var(--cor-texto)]"
              >
                Apagar perfil
              </h2>
              <p className="text-sm leading-relaxed text-[var(--cor-texto-suave)]">
                Isso apaga o perfil e o progresso salvo dele neste aparelho. Não
                pode ser desfeito.
              </p>
            </div>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--cor-texto)]">
              Digite {perfilParaApagar.nome} para confirmar
              <input
                value={confirmacaoApagar}
                onChange={(evento) => setConfirmacaoApagar(evento.target.value)}
                className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                autoComplete="off"
              />
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Botao
                ref={botaoCancelarApagarRef}
                type="button"
                variante="secundario"
                onClick={fecharConfirmacaoApagar}
              >
                Cancelar
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                onClick={aoConfirmarApagar}
                disabled={!remocaoConfirmada}
                className="border-[var(--cor-erro)] text-[var(--cor-erro)] hover:border-[var(--cor-erro)]"
              >
                Apagar perfil
              </Botao>
            </div>
          </dialog>
        </div>
      )}
    </main>
  )
}
