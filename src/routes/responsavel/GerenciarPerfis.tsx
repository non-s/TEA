import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import { usePreferencias } from '../../contexts/PreferenciasContext'
import {
  atualizarInteressePerfil,
  criarPerfil,
  LIMITE_NOME_PERFIL,
  ouvirPerfis,
  planoIndividualPadrao,
  preferenciasSensoriaisPadrao,
  removerPerfil,
  type PerfilCrianca,
} from '../../firebase/perfis'
import {
  exemplosInteresseEspecial,
  interessesEspeciais,
  obterInteresseEspecial,
  type InteresseEspecialId,
} from '../../curriculo/interesses'
import {
  LIMITE_OBSERVACOES_PERFIL_APOIO,
  criarAjustesIniciaisPerfilApoio,
  perfilApoioPadrao,
  normalizarPerfilApoio,
  textoAcessoPreferencial,
  textoComunicacaoPreferencial,
  textoRegulacaoPreferencial,
  type AcessoPreferencial,
  type ComunicacaoPreferencial,
  type RegulacaoPreferencial,
} from '../../curriculo/perfilApoio'
import { Icone } from '../../curriculo/ativos/Icone'
import type { FormaIconeId } from '../../curriculo/ativos/tipos'
import { corDoAvatar } from '../../components/ui/coresAvatar'
import { Cartao } from '../../components/ui/Cartao'
import { Botao } from '../../components/ui/Botao'
import { useFocoPreso } from '../../hooks/useFocoPreso'

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

export function GerenciarPerfis() {
  const { usuario } = useAuth()
  const { perfilAtivo, selecionarPerfil, encerrarPerfil } = usePerfilAtivo()
  const { atualizarPreferencias } = usePreferencias()
  const navigate = useNavigate()
  const [perfis, setPerfis] = useState<PerfilCrianca[]>([])
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
  const [observacoesApoio, setObservacoesApoio] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [erroCarregamento, setErroCarregamento] = useState<string | null>(null)
  const [salvandoInteresseId, setSalvandoInteresseId] = useState<string | null>(
    null,
  )
  const [mensagemInteresse, setMensagemInteresse] = useState<{
    tipo: 'sucesso' | 'erro'
    texto: string
  } | null>(null)
  const [perfilParaRemover, setPerfilParaRemover] =
    useState<PerfilCrianca | null>(null)
  const [confirmacaoRemocao, setConfirmacaoRemocao] = useState('')
  const [removendoPerfil, setRemovendoPerfil] = useState(false)
  const [erroRemocao, setErroRemocao] = useState<string | null>(null)
  const botaoCancelarRemocaoRef = useRef<HTMLButtonElement>(null)
  const { ref: dialogoRemocaoRef, aoKeyDown: aoKeyDownDialogo } =
    useFocoPreso<HTMLDialogElement>()

  useEffect(() => {
    if (!usuario) return
    return ouvirPerfis(
      usuario.uid,
      (novosPerfis) => {
        setPerfis(novosPerfis)
        setErroCarregamento(null)
      },
      () => {
        setErroCarregamento(
          'Não foi possível carregar os perfis agora. Verifique a conexão e tente novamente.',
        )
      },
    )
  }, [usuario])

  useEffect(() => {
    if (!perfilParaRemover) return
    setConfirmacaoRemocao('')
    setErroRemocao(null)
    const quadro = requestAnimationFrame(() => {
      botaoCancelarRemocaoRef.current?.focus()
    })

    return () => cancelAnimationFrame(quadro)
  }, [perfilParaRemover])

  async function aoSubmeter(evento: FormEvent) {
    evento.preventDefault()
    if (!usuario) return
    setErro(null)
    if (!nome.trim()) {
      setErro('Digite um nome ou apelido para criar o perfil.')
      return
    }
    setEnviando(true)
    try {
      const nomeNormalizado = nome.trim()
      const primeiroPerfil = perfis.length === 0
      const perfilApoio = normalizarPerfilApoio({
        comunicacaoPreferencial,
        acessoPreferencial,
        regulacaoPreferencial,
        observacoes: observacoesApoio,
      })
      const ajustesIniciais = criarAjustesIniciaisPerfilApoio(perfilApoio)
      const preferenciasSensoriais = {
        ...preferenciasSensoriaisPadrao,
        ...ajustesIniciais.preferenciasSensoriais,
      }
      const planoIndividual = {
        ...planoIndividualPadrao,
        ...ajustesIniciais.planoIndividual,
      }

      const perfilCriadoRef = await criarPerfil(
        usuario.uid,
        nomeNormalizado,
        avatarId,
        {
          interesseEspecialId,
          perfilApoio,
          preferenciasSensoriais,
          planoIndividual,
        },
      )

      if (primeiroPerfil) {
        const perfilCriado: PerfilCrianca = {
          id: perfilCriadoRef.id,
          nome: nomeNormalizado,
          avatarId,
          interesseEspecialId,
          perfilApoio,
          preferenciasSensoriais,
          planoIndividual,
          atividadesDominadas: [],
        }

        atualizarPreferencias(perfilCriado.preferenciasSensoriais)
        selecionarPerfil(perfilCriado)
        navigate('/crianca/trilha')
        return
      }

      setNome('')
      setAvatarId('circulo')
      setInteresseEspecialId('neutro')
      setComunicacaoPreferencial(perfilApoioPadrao.comunicacaoPreferencial)
      setAcessoPreferencial(perfilApoioPadrao.acessoPreferencial)
      setRegulacaoPreferencial(perfilApoioPadrao.regulacaoPreferencial)
      setObservacoesApoio('')
    } catch {
      setErro('Não foi possível criar o perfil. Tente de novo.')
    } finally {
      setEnviando(false)
    }
  }

  function abrirRemocao(perfil: PerfilCrianca) {
    setPerfilParaRemover(perfil)
  }

  function fecharRemocao() {
    if (removendoPerfil) return
    setPerfilParaRemover(null)
    setConfirmacaoRemocao('')
    setErroRemocao(null)
  }

  async function aoConfirmarRemocao() {
    if (!usuario || !perfilParaRemover) return
    if (confirmacaoRemocao !== perfilParaRemover.nome) return

    setRemovendoPerfil(true)
    setErroRemocao(null)
    try {
      await removerPerfil(usuario.uid, perfilParaRemover.id)
      if (perfilAtivo?.id === perfilParaRemover.id) {
        encerrarPerfil()
      }
      setPerfilParaRemover(null)
      setConfirmacaoRemocao('')
    } catch {
      setErroRemocao('Não foi possível apagar o perfil. Tente de novo.')
    } finally {
      setRemovendoPerfil(false)
    }
  }

  async function aoAlterarInteresse(
    perfilId: string,
    proximoInteresseId: InteresseEspecialId,
  ) {
    if (!usuario) return
    setSalvandoInteresseId(perfilId)
    setMensagemInteresse(null)

    try {
      await atualizarInteressePerfil(usuario.uid, perfilId, proximoInteresseId)
      if (perfilAtivo?.id === perfilId) {
        selecionarPerfil({
          ...perfilAtivo,
          interesseEspecialId: proximoInteresseId,
        })
      }
      setMensagemInteresse({
        tipo: 'sucesso',
        texto: 'Interesse salvo.',
      })
    } catch {
      setMensagemInteresse({
        tipo: 'erro',
        texto: 'Nao foi possivel salvar o interesse agora.',
      })
    } finally {
      setSalvandoInteresseId(null)
    }
  }

  const remocaoConfirmada =
    !!perfilParaRemover && confirmacaoRemocao === perfilParaRemover.nome
  const interesseSelecionado = obterInteresseEspecial(interesseEspecialId)
  const exemplosInteresseSelecionado =
    exemplosInteresseEspecial(interesseEspecialId).join(', ')

  return (
    <>
      <main className="mx-auto flex max-w-xl flex-col gap-8 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
            Gerenciar perfis
          </h1>
          <Link
            to="/responsavel/perfis"
            className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-primaria)] underline underline-offset-2"
          >
            Voltar
          </Link>
        </div>

        {erroCarregamento && (
          <p
            role="alert"
            className="rounded-lg bg-[var(--cor-erro)]/10 px-3 py-2 text-sm text-[var(--cor-erro)]"
          >
            {erroCarregamento}
          </p>
        )}

        {mensagemInteresse?.tipo === 'sucesso' && (
          <output className="rounded-lg bg-[var(--cor-primaria-clara)] px-3 py-2 text-sm text-[var(--cor-primaria-escura)]">
            {mensagemInteresse.texto}
          </output>
        )}

        {mensagemInteresse?.tipo === 'erro' && (
          <p
            role="alert"
            className="rounded-lg bg-[var(--cor-erro)]/10 px-3 py-2 text-sm text-[var(--cor-erro)]"
          >
            {mensagemInteresse.texto}
          </p>
        )}

        {perfis.length > 0 && (
          <ul className="flex flex-col gap-3">
            {perfis.map((perfil) => {
              const cor = corDoAvatar(perfil.avatarId as FormaIconeId)
              const interesseAtual = obterInteresseEspecial(
                perfil.interesseEspecialId,
              )
              const exemplosInteresseAtual = exemplosInteresseEspecial(
                perfil.interesseEspecialId,
              ).join(', ')
              return (
                <li key={perfil.id}>
                  <Cartao className="flex flex-col gap-4 p-4">
                    <span className="flex items-center justify-between gap-3">
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
                      <span className="flex items-center gap-4">
                        <Link
                          to={`/responsavel/progresso/${perfil.id}`}
                          className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-primaria)] underline underline-offset-2"
                        >
                          Progresso
                        </Link>
                        <button
                          type="button"
                          onClick={() => abrirRemocao(perfil)}
                          className="inline-flex min-h-[var(--min-alvo-controle)] items-center text-sm text-[var(--cor-erro)] underline underline-offset-2"
                        >
                          Remover
                        </button>
                      </span>
                    </span>

                    <div className="flex flex-col gap-1.5 text-left">
                      <label
                        htmlFor={`interesse-${perfil.id}`}
                        className="text-sm font-medium text-[var(--cor-texto)]"
                      >
                        Interesse da criança
                      </label>
                      <select
                        id={`interesse-${perfil.id}`}
                        value={perfil.interesseEspecialId}
                        aria-describedby={`interesse-${perfil.id}-descricao`}
                        disabled={salvandoInteresseId === perfil.id}
                        onChange={(evento) =>
                          aoAlterarInteresse(
                            perfil.id,
                            evento.target.value as InteresseEspecialId,
                          )
                        }
                        className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-3 py-2 text-[var(--cor-texto)]"
                      >
                        {interessesEspeciais.map((interesse) => (
                          <option key={interesse.id} value={interesse.id}>
                            {interesse.nome}
                          </option>
                        ))}
                      </select>
                      <span
                        id={`interesse-${perfil.id}-descricao`}
                        className="text-sm leading-6 text-[var(--cor-texto-suave)]"
                      >
                        {interesseAtual.descricao} Exemplos:{' '}
                        {exemplosInteresseAtual}.
                      </span>
                    </div>
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

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-[var(--cor-texto)]">
                Observação curta de acesso
              </span>
              <textarea
                value={observacoesApoio}
                onChange={(evento) => setObservacoesApoio(evento.target.value)}
                rows={3}
                maxLength={LIMITE_OBSERVACOES_PERFIL_APOIO}
                placeholder="Ex: escolhe melhor quando o adulto espera e aponta uma opção por vez"
                className="min-h-[var(--min-alvo-controle)] resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
              />
            </label>
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

      {perfilParaRemover && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/35 px-4 py-6"
          role="presentation"
        >
          <dialog
            ref={dialogoRemocaoRef}
            open
            aria-labelledby="titulo-remover-perfil"
            onKeyDown={(evento) => {
              aoKeyDownDialogo(evento)
              if (evento.key === 'Escape') fecharRemocao()
            }}
            className="m-0 flex w-full max-w-md flex-col gap-4 rounded-xl border-0 bg-[var(--cor-fundo)] p-5 shadow-xl"
          >
            <div className="flex flex-col gap-1">
              <h2
                id="titulo-remover-perfil"
                className="text-xl font-semibold text-[var(--cor-texto)]"
              >
                Apagar perfil
              </h2>
              <p className="text-sm leading-relaxed text-[var(--cor-texto-suave)]">
                Isso remove o perfil, as tentativas registradas e as observações
                de sessão deste app. Baixe uma cópia dos dados antes se precisar
                guardar histórico.
              </p>
            </div>

            <Link
              to={`/responsavel/progresso/${perfilParaRemover.id}`}
              className="w-fit text-sm font-medium text-[var(--cor-primaria)] underline underline-offset-2"
            >
              Baixar copia deste perfil antes de apagar
            </Link>

            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--cor-texto)]">
              Digite {perfilParaRemover.nome} para confirmar
              <input
                value={confirmacaoRemocao}
                onChange={(evento) =>
                  setConfirmacaoRemocao(evento.target.value)
                }
                className="min-h-[var(--min-alvo-controle)] rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                autoComplete="off"
              />
            </label>

            {erroRemocao && (
              <p role="alert" className="text-sm text-[var(--cor-erro)]">
                {erroRemocao}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Botao
                ref={botaoCancelarRemocaoRef}
                type="button"
                variante="secundario"
                onClick={fecharRemocao}
                disabled={removendoPerfil}
              >
                Cancelar
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                onClick={aoConfirmarRemocao}
                disabled={!remocaoConfirmada || removendoPerfil}
                className="border-[var(--cor-erro)] text-[var(--cor-erro)] hover:border-[var(--cor-erro)]"
              >
                {removendoPerfil ? 'Apagando…' : 'Apagar dados'}
              </Botao>
            </div>
          </dialog>
        </div>
      )}
    </>
  )
}
