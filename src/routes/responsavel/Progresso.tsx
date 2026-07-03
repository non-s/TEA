import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePerfilAtivo } from '../../contexts/PerfilAtivoContext'
import {
  atualizarPerfilApoioPerfil,
  atualizarPlanoIndividualPerfil,
  LIMITE_META_ATUAL,
  normalizarPlanoIndividual,
  ouvirPerfil,
  planoIndividualPadrao,
  type PerfilCrianca,
  type PlanoIndividual,
} from '../../firebase/perfis'
import {
  atualizarCartaoComunicacao,
  type CartaoComunicacaoId,
} from '../../curriculo/cartoesComunicacao'
import {
  LIMITE_OBSERVACAO_MEDIADOR,
  LIMITE_OBSERVACOES_PERFIL_APOIO,
  LIMITE_TEXTO_PLANO_REGULACAO,
  normalizarPerfilApoio,
  perfilApoioPadrao,
  textoAcessoPreferencial,
  textoComunicacaoPreferencial,
  textoRegulacaoPreferencial,
  type AcessoPreferencial,
  type ComunicacaoPreferencial,
  type PerfilApoio,
  type RegulacaoPreferencial,
} from '../../curriculo/perfilApoio'
import { criarGuiaMediador } from '../../curriculo/guiaMediador'
import {
  LIMITE_TEXTO_OBSERVACAO_SESSAO,
  ouvirObservacoesSessao,
  ouvirTentativas,
  registrarObservacaoSessao,
  textoTipoObservacaoSessao,
  type ObservacaoSessao,
  type TipoObservacaoSessao,
} from '../../firebase/progresso'
import { trilhaV1 } from '../../curriculo/trilha-v1'
import { criarRelatorioProgresso } from '../../curriculo/relatorioProgresso'
import type { Tentativa } from '../../curriculo/tipos'
import { Icone } from '../../curriculo/ativos/Icone'
import type { FormaIconeId } from '../../curriculo/ativos/tipos'
import { corDoAvatar } from '../../components/ui/coresAvatar'
import { Cartao } from '../../components/ui/Cartao'
import { Botao } from '../../components/ui/Botao'
import {
  criarExportacaoPerfil,
  nomeArquivoExportacaoPerfil,
} from '../../utils/exportarPerfil'
import {
  criarRelatorioEquipe,
  nomeArquivoRelatorioEquipe,
} from '../../utils/relatorioEquipe'
import {
  criarPlanoGeneralizacao,
  nomeArquivoPlanoGeneralizacao,
} from '../../utils/planoGeneralizacao'
import {
  criarCartoesImprimiveis,
  nomeArquivoCartoesImprimiveis,
} from '../../utils/cartoesImprimiveis'

function formatarDataHora(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

const textoStatusModulo = {
  bloqueado: 'Bloqueado',
  'nao-iniciado': 'Não iniciado',
  'em-pratica': 'Em prática',
  dominado: 'Dominado',
}

const textoApoioPreferencial: Record<
  PlanoIndividual['apoioPreferencial'],
  string
> = {
  visual: 'Apoio visual',
  verbal: 'Fala curta',
  gestual: 'Modelo gestual',
  pausa: 'Pausas combinadas',
}

function textoApoioMedio(mediaNivelDica: number): string {
  if (mediaNivelDica < 1) return 'alto'
  if (mediaNivelDica < 1.8) return 'moderado'
  return 'baixo'
}

export function Progresso() {
  const { perfilId } = useParams<{ perfilId: string }>()
  const { usuario } = useAuth()
  const { perfilAtivo, selecionarPerfil } = usePerfilAtivo()
  const [perfil, setPerfil] = useState<PerfilCrianca | null>(null)
  const [tentativas, setTentativas] = useState<Tentativa[]>([])
  const [observacoesSessao, setObservacoesSessao] = useState<
    ObservacaoSessao[]
  >([])
  const [novaObservacao, setNovaObservacao] = useState('')
  const [tipoNovaObservacao, setTipoNovaObservacao] =
    useState<TipoObservacaoSessao>('outro')
  const [planoIndividual, setPlanoIndividual] = useState<PlanoIndividual>(
    planoIndividualPadrao,
  )
  const [perfilApoio, setPerfilApoio] = useState<PerfilApoio>(perfilApoioPadrao)
  const [salvandoPerfilApoio, setSalvandoPerfilApoio] = useState(false)
  const [mensagemPerfilApoio, setMensagemPerfilApoio] = useState<string | null>(
    null,
  )
  const [salvandoPlano, setSalvandoPlano] = useState(false)
  const [mensagemPlano, setMensagemPlano] = useState<string | null>(null)
  const [salvandoObservacao, setSalvandoObservacao] = useState(false)
  const [mensagemObservacao, setMensagemObservacao] = useState<string | null>(
    null,
  )
  const [mensagemExportacao, setMensagemExportacao] = useState<string | null>(
    null,
  )
  const [carregando, setCarregando] = useState(true)
  const [erroPerfil, setErroPerfil] = useState<string | null>(null)
  const [erroTentativas, setErroTentativas] = useState<string | null>(null)
  const [erroObservacoes, setErroObservacoes] = useState<string | null>(null)

  useEffect(() => {
    if (!usuario || !perfilId) return
    const mensagemErro =
      'Não foi possível carregar todos os dados deste perfil agora. Verifique a conexão e tente novamente.'
    const pararPerfil = ouvirPerfil(
      usuario.uid,
      perfilId,
      (perfilAtualizado) => {
        setPerfil(perfilAtualizado)
        setErroPerfil(null)
      },
      () => {
        setErroPerfil(mensagemErro)
        setCarregando(false)
      },
    )
    const pararTentativas = ouvirTentativas(
      usuario.uid,
      perfilId,
      (t) => {
        setTentativas(t)
        setErroTentativas(null)
        setCarregando(false)
      },
      () => {
        setErroTentativas(mensagemErro)
        setCarregando(false)
      },
    )
    const pararObservacoes = ouvirObservacoesSessao(
      usuario.uid,
      perfilId,
      (observacoes) => {
        setObservacoesSessao(observacoes)
        setErroObservacoes(null)
      },
      () => {
        setErroObservacoes(mensagemErro)
        setCarregando(false)
      },
    )
    return () => {
      pararPerfil()
      pararTentativas()
      pararObservacoes()
    }
  }, [usuario, perfilId])

  useEffect(() => {
    if (perfil) {
      setPlanoIndividual(perfil.planoIndividual)
      setPerfilApoio(perfil.perfilApoio)
    }
  }, [perfil])

  const relatorio = useMemo(
    () =>
      criarRelatorioProgresso(
        trilhaV1,
        perfil?.atividadesDominadas ?? [],
        tentativas,
        perfil?.planoIndividual,
      ),
    [tentativas, perfil],
  )
  const guiaMediador = useMemo(
    () =>
      criarGuiaMediador({
        perfilApoio,
        planoIndividual,
        proximaAtividade: relatorio.proximaAtividade?.alvo.rotulo,
      }),
    [perfilApoio, planoIndividual, relatorio.proximaAtividade],
  )
  const erroCarregamento = erroPerfil ?? erroTentativas ?? erroObservacoes

  async function aoSalvarPlano() {
    if (!usuario || !perfilId) return
    setSalvandoPlano(true)
    setMensagemPlano(null)

    try {
      const planoNormalizado = normalizarPlanoIndividual(planoIndividual)
      await atualizarPlanoIndividualPerfil(
        usuario.uid,
        perfilId,
        planoNormalizado,
      )
      setPlanoIndividual(planoNormalizado)
      if (perfil) {
        const perfilAtualizado = {
          ...perfil,
          planoIndividual: planoNormalizado,
        }
        setPerfil(perfilAtualizado)
        if (perfilAtivo?.id === perfilAtualizado.id) {
          selecionarPerfil(perfilAtualizado)
        }
      }
      setMensagemPlano('Plano salvo.')
    } catch {
      setMensagemPlano('Nao foi possivel salvar o plano agora.')
    } finally {
      setSalvandoPlano(false)
    }
  }

  async function aoSalvarPerfilApoio() {
    if (!usuario || !perfilId) return
    setSalvandoPerfilApoio(true)
    setMensagemPerfilApoio(null)

    try {
      const perfilApoioNormalizado = normalizarPerfilApoio(perfilApoio)
      await atualizarPerfilApoioPerfil(
        usuario.uid,
        perfilId,
        perfilApoioNormalizado,
      )
      setPerfilApoio(perfilApoioNormalizado)
      if (perfil) {
        const perfilAtualizado = {
          ...perfil,
          perfilApoio: perfilApoioNormalizado,
        }
        setPerfil(perfilAtualizado)
        if (perfilAtivo?.id === perfilAtualizado.id) {
          selecionarPerfil(perfilAtualizado)
        }
      }
      setMensagemPerfilApoio('Perfil de apoio salvo.')
    } catch {
      setMensagemPerfilApoio('Nao foi possivel salvar o perfil de apoio agora.')
    } finally {
      setSalvandoPerfilApoio(false)
    }
  }

  function aoAlterarCartaoComunicacao(
    id: CartaoComunicacaoId,
    campo: 'rotulo' | 'fala' | 'apoio',
    valor: string,
  ) {
    setPerfilApoio((apoio) => ({
      ...apoio,
      cartoesComunicacao: atualizarCartaoComunicacao(
        apoio.cartoesComunicacao,
        id,
        campo,
        valor,
      ),
    }))
  }

  async function aoRegistrarObservacao() {
    if (!usuario || !perfilId || !novaObservacao.trim()) return
    setSalvandoObservacao(true)
    setMensagemObservacao(null)

    try {
      await registrarObservacaoSessao(
        usuario.uid,
        perfilId,
        novaObservacao,
        tipoNovaObservacao,
      )
      setNovaObservacao('')
      setTipoNovaObservacao('outro')
      setMensagemObservacao('Observacao registrada.')
    } catch {
      setMensagemObservacao('Nao foi possivel registrar agora.')
    } finally {
      setSalvandoObservacao(false)
    }
  }

  function baixarArquivoLocal(
    conteudo: BlobPart,
    tipo: string,
    nomeArquivo: string,
  ) {
    const blob = new Blob([conteudo], { type: tipo })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = nomeArquivo
    link.click()
    URL.revokeObjectURL(url)
  }

  function aoExportarDados() {
    if (!perfil) return

    const agora = new Date()
    const exportacao = criarExportacaoPerfil({
      perfil,
      relatorio,
      tentativas,
      observacoesSessao,
      geradoEm: agora.toISOString(),
    })
    baixarArquivoLocal(
      JSON.stringify(exportacao, null, 2),
      'application/json',
      nomeArquivoExportacaoPerfil(perfil, agora),
    )
    setMensagemExportacao('Dados do perfil gerados localmente.')
  }

  function aoExportarRelatorioEquipe() {
    if (!perfil) return

    const agora = new Date()
    const markdown = criarRelatorioEquipe({
      perfil,
      relatorio,
      observacoesSessao,
      geradoEm: agora.toISOString(),
    })
    baixarArquivoLocal(
      markdown,
      'text/markdown;charset=utf-8',
      nomeArquivoRelatorioEquipe(perfil, agora),
    )
    setMensagemExportacao('Relatório para equipe gerado localmente.')
  }

  function aoExportarPlanoGeneralizacao() {
    if (!perfil) return

    const agora = new Date()
    const markdown = criarPlanoGeneralizacao({
      perfil,
      relatorio,
      geradoEm: agora.toISOString(),
    })
    baixarArquivoLocal(
      markdown,
      'text/markdown;charset=utf-8',
      nomeArquivoPlanoGeneralizacao(perfil, agora),
    )
    setMensagemExportacao('Plano fora da tela gerado localmente.')
  }

  function aoExportarCartoesImprimiveis() {
    if (!perfil) return

    const agora = new Date()
    const html = criarCartoesImprimiveis({
      perfil,
      relatorio,
      geradoEm: agora.toISOString(),
    })
    baixarArquivoLocal(
      html,
      'text/html;charset=utf-8',
      nomeArquivoCartoesImprimiveis(perfil, agora),
    )
    setMensagemExportacao('Cartões imprimíveis gerados localmente.')
  }

  if (erroCarregamento && !perfil) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-10 text-center">
        <p
          role="alert"
          className="rounded-lg bg-[var(--cor-erro)]/10 px-3 py-2 text-sm text-[var(--cor-erro)]"
        >
          {erroCarregamento}
        </p>
        <Link
          to="/responsavel/perfis/gerenciar"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar para gerenciar perfis
        </Link>
      </main>
    )
  }

  if (carregando) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-6 py-10">
        <p className="text-[var(--cor-texto-suave)]">Carregando progresso...</p>
      </main>
    )
  }

  if (!perfil) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-10 text-center">
        <p className="text-lg text-[var(--cor-texto)]">
          Não encontramos esse perfil.
        </p>
        <Link
          to="/responsavel/perfis/gerenciar"
          className="font-medium text-[var(--cor-primaria)] underline underline-offset-2"
        >
          Voltar para gerenciar perfis
        </Link>
      </main>
    )
  }

  const cor = corDoAvatar(perfil.avatarId as FormaIconeId)

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            style={{ background: cor.fundo, color: cor.texto }}
            className="flex h-12 w-12 items-center justify-center rounded-xl"
          >
            <Icone
              iconeId={perfil.avatarId as FormaIconeId}
              className="h-7 w-7"
            />
          </span>
          <h1 className="text-2xl font-semibold text-[var(--cor-texto)]">
            Progresso de {perfil.nome}
          </h1>
        </div>
        <Link
          to="/responsavel/perfis/gerenciar"
          className="text-sm text-[var(--cor-primaria)] underline underline-offset-2"
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

      <Cartao className="flex flex-wrap gap-8">
        <div>
          <p className="text-3xl font-semibold text-[var(--cor-conquista)]">
            {relatorio.totalDominadas}
            <span className="text-lg text-[var(--cor-texto-suave)]">
              {' '}
              / {relatorio.totalAtividades}
            </span>
          </p>
          <p className="text-sm text-[var(--cor-texto-suave)]">
            atividades dominadas
          </p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-[var(--cor-primaria)]">
            {relatorio.percentualGeral}%
          </p>
          <p className="text-sm text-[var(--cor-texto-suave)]">
            da trilha atual
          </p>
        </div>
        <div>
          <p className="text-3xl font-semibold text-[var(--cor-texto)]">
            {tentativas.length}
          </p>
          <p className="text-sm text-[var(--cor-texto-suave)]">
            tentativas registradas
          </p>
        </div>
      </Cartao>

      <Cartao className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Controle dos dados
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Baixe uma cópia local com perfil, preferências, plano, tentativas e
            observações registradas, gere um resumo para a equipe ou prepare uma
            prática fora da tela.
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Os nomes dos arquivos não incluem o nome da criança; o conteúdo pode
            conter dados do perfil e deve ser compartilhado apenas pela família.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Botao type="button" variante="secundario" onClick={aoExportarDados}>
            Baixar dados do perfil
          </Botao>
          <Botao
            type="button"
            variante="secundario"
            onClick={aoExportarRelatorioEquipe}
          >
            Baixar relatório para equipe
          </Botao>
          <Botao
            type="button"
            variante="secundario"
            onClick={aoExportarPlanoGeneralizacao}
          >
            Baixar plano fora da tela
          </Botao>
          <Botao
            type="button"
            variante="secundario"
            onClick={aoExportarCartoesImprimiveis}
          >
            Baixar cartões para imprimir
          </Botao>
        </div>
        {mensagemExportacao && (
          <output className="block text-sm text-[var(--cor-texto-suave)]">
            {mensagemExportacao}
          </output>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-3 border-2 border-[var(--cor-primaria-clara)]">
        <div>
          <p className="text-sm font-medium uppercase text-[var(--cor-texto-suave)]">
            Próximo passo
          </p>
          <p className="mt-1 text-lg font-semibold text-[var(--cor-texto)]">
            {relatorio.proximaAtividade
              ? relatorio.proximaAtividade.alvo.rotulo
              : 'Revisar e manter'}
          </p>
        </div>
        <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
          {relatorio.orientacao}
        </p>
        <p className="text-sm leading-6 text-[var(--cor-texto)]">
          {relatorio.recomendacaoMediacao}
        </p>
        <p className="text-sm leading-6 text-[var(--cor-texto)]">
          {relatorio.recomendacaoApoioGraduado}
        </p>
        {relatorio.revisaoEspacada && (
          <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
            Revisao leve sugerida:{' '}
            <span className="font-medium text-[var(--cor-texto)]">
              {relatorio.revisaoEspacada.atividade.alvo.rotulo}
            </span>
            {relatorio.revisaoEspacada.diasDesdeUltimaPratica !== null
              ? `, praticada ha ${relatorio.revisaoEspacada.diasDesdeUltimaPratica} dias.`
              : ', sem pratica registrada recentemente.'}
          </p>
        )}
      </Cartao>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Guia rapido do mediador
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            {guiaMediador.contexto}
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-[var(--cor-texto)]">
            {guiaMediador.resumo}
          </p>
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {guiaMediador.itens.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-4"
            >
              <p className="text-sm font-semibold text-[var(--cor-texto)]">
                {item.titulo}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
                {item.texto}
              </p>
            </li>
          ))}
        </ol>
      </Cartao>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Perfil de apoio
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Registre como a crianca comunica, acessa a tela e se regula melhor
            hoje.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Comunicacao preferida
          </span>
          <select
            value={perfilApoio.comunicacaoPreferencial}
            onChange={(evento) =>
              setPerfilApoio((apoio) => ({
                ...apoio,
                comunicacaoPreferencial: evento.target
                  .value as ComunicacaoPreferencial,
              }))
            }
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
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
            Acesso preferido
          </span>
          <select
            value={perfilApoio.acessoPreferencial}
            onChange={(evento) =>
              setPerfilApoio((apoio) => ({
                ...apoio,
                acessoPreferencial: evento.target.value as AcessoPreferencial,
              }))
            }
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          >
            {Object.entries(textoAcessoPreferencial).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Regulacao preferida
          </span>
          <select
            value={perfilApoio.regulacaoPreferencial}
            onChange={(evento) =>
              setPerfilApoio((apoio) => ({
                ...apoio,
                regulacaoPreferencial: evento.target
                  .value as RegulacaoPreferencial,
              }))
            }
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
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
            Sugerir pausa a cada
          </span>
          <select
            value={perfilApoio.limiteTentativasAntesPausa}
            onChange={(evento) =>
              setPerfilApoio((apoio) => ({
                ...apoio,
                limiteTentativasAntesPausa: Number(evento.target.value),
              }))
            }
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          >
            <option value={4}>4 respostas</option>
            <option value={6}>6 respostas</option>
            <option value={8}>8 respostas</option>
            <option value={12}>12 respostas</option>
          </select>
          <span className="text-sm text-[var(--cor-texto-suave)]">
            A sugestao nao bloqueia a atividade; depois de alguns intervalos, o
            app tambem sugere encerrar por agora.
          </span>
        </label>

        <fieldset className="grid gap-3 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-4">
          <legend className="px-1 text-sm font-medium text-[var(--cor-texto)]">
            Plano de regulacao
          </legend>
          <p className="text-sm leading-6 text-[var(--cor-texto-suave)]">
            Combine sinais e apoios que a pausa da crianca deve lembrar.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
              Sinal de pausa
            </span>
            <input
              value={perfilApoio.planoRegulacao.sinaisPausa}
              onChange={(evento) =>
                setPerfilApoio((apoio) => ({
                  ...apoio,
                  planoRegulacao: {
                    ...apoio.planoRegulacao,
                    sinaisPausa: evento.target.value,
                  },
                }))
              }
              maxLength={LIMITE_TEXTO_PLANO_REGULACAO}
              placeholder="Ex: cobre os ouvidos ou afasta o olhar"
              className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
              Ajuda a regular
            </span>
            <textarea
              value={perfilApoio.planoRegulacao.estrategiasAjudam}
              onChange={(evento) =>
                setPerfilApoio((apoio) => ({
                  ...apoio,
                  planoRegulacao: {
                    ...apoio.planoRegulacao,
                    estrategiasAjudam: evento.target.value,
                  },
                }))
              }
              rows={2}
              maxLength={LIMITE_TEXTO_PLANO_REGULACAO}
              placeholder="Ex: fone, luz baixa e dois minutos sem fala"
              className="resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
              Evitar durante sobrecarga
            </span>
            <textarea
              value={perfilApoio.planoRegulacao.evitarDuranteSobrecarga}
              onChange={(evento) =>
                setPerfilApoio((apoio) => ({
                  ...apoio,
                  planoRegulacao: {
                    ...apoio.planoRegulacao,
                    evitarDuranteSobrecarga: evento.target.value,
                  },
                }))
              }
              rows={2}
              maxLength={LIMITE_TEXTO_PLANO_REGULACAO}
              placeholder="Ex: muitas perguntas ou repetir instrucao"
              className="resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
            />
          </label>
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Observacao de acesso e comunicacao
          </span>
          <textarea
            value={perfilApoio.observacoes}
            onChange={(evento) =>
              setPerfilApoio((apoio) => ({
                ...apoio,
                observacoes: evento.target.value,
              }))
            }
            rows={3}
            maxLength={LIMITE_OBSERVACOES_PERFIL_APOIO}
            placeholder="Ex: escolhe melhor por olhar quando cansada"
            className="resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <div className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo)] p-4">
          <div>
            <h3 className="font-medium text-[var(--cor-texto)]">
              Cartoes de comunicacao
            </h3>
            <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
              Personalize a fala e o apoio que aparecem na atividade. O cartao
              de pausa continua abrindo pausa.
            </p>
          </div>

          {perfilApoio.cartoesComunicacao.map((cartao) => (
            <fieldset
              key={cartao.id}
              className="grid gap-3 rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] p-3"
            >
              <legend className="px-1 text-sm font-medium text-[var(--cor-texto)]">
                {cartao.rotulo}
              </legend>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
                  Rotulo curto
                </span>
                <input
                  value={cartao.rotulo}
                  onChange={(evento) =>
                    aoAlterarCartaoComunicacao(
                      cartao.id,
                      'rotulo',
                      evento.target.value,
                    )
                  }
                  maxLength={24}
                  className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
                  Frase falada
                </span>
                <input
                  value={cartao.fala}
                  onChange={(evento) =>
                    aoAlterarCartaoComunicacao(
                      cartao.id,
                      'fala',
                      evento.target.value,
                    )
                  }
                  maxLength={90}
                  className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-[var(--cor-texto-suave)]">
                  Apoio para o mediador
                </span>
                <textarea
                  value={cartao.apoio}
                  onChange={(evento) =>
                    aoAlterarCartaoComunicacao(
                      cartao.id,
                      'apoio',
                      evento.target.value,
                    )
                  }
                  rows={2}
                  maxLength={140}
                  className="resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
                />
              </label>
            </fieldset>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Botao
            type="button"
            onClick={aoSalvarPerfilApoio}
            disabled={salvandoPerfilApoio}
          >
            {salvandoPerfilApoio ? 'Salvando...' : 'Salvar perfil de apoio'}
          </Botao>
          {mensagemPerfilApoio && (
            <output className="text-sm text-[var(--cor-texto-suave)]">
              {mensagemPerfilApoio}
            </output>
          )}
        </div>
      </Cartao>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Plano individual
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Registre uma meta pequena e o apoio que melhor preserva conforto e
            participacao.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Meta atual
          </span>
          <input
            type="text"
            value={planoIndividual.metaAtual}
            onChange={(evento) =>
              setPlanoIndividual((plano) => ({
                ...plano,
                metaAtual: evento.target.value,
              }))
            }
            placeholder="Ex: pedir pausa com o botao antes de sair da atividade"
            maxLength={LIMITE_META_ATUAL}
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Apoio preferencial
          </span>
          <select
            value={planoIndividual.apoioPreferencial}
            onChange={(evento) =>
              setPlanoIndividual((plano) => ({
                ...plano,
                apoioPreferencial: evento.target
                  .value as PlanoIndividual['apoioPreferencial'],
              }))
            }
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          >
            {Object.entries(textoApoioPreferencial).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Observacao do mediador
          </span>
          <textarea
            value={planoIndividual.observacaoMediador}
            onChange={(evento) =>
              setPlanoIndividual((plano) => ({
                ...plano,
                observacaoMediador: evento.target.value,
              }))
            }
            rows={3}
            placeholder="Ex: responde melhor depois de escolher uma pausa curta"
            maxLength={LIMITE_OBSERVACAO_MEDIADOR}
            className="resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Botao type="button" onClick={aoSalvarPlano} disabled={salvandoPlano}>
            {salvandoPlano ? 'Salvando...' : 'Salvar plano'}
          </Botao>
          {mensagemPlano && (
            <output className="text-sm text-[var(--cor-texto-suave)]">
              {mensagemPlano}
            </output>
          )}
        </div>
      </Cartao>

      <Cartao className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Observacoes de sessao
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--cor-texto-suave)]">
            Registre sinais de conforto, cansaco, comunicacao ou ajustes que
            funcionaram hoje.
          </p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            Tipo de observacao
          </span>
          <select
            value={tipoNovaObservacao}
            onChange={(evento) =>
              setTipoNovaObservacao(evento.target.value as TipoObservacaoSessao)
            }
            className="rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          >
            {Object.entries(textoTipoObservacaoSessao).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[var(--cor-texto)]">
            O que observei hoje
          </span>
          <textarea
            value={novaObservacao}
            onChange={(evento) => setNovaObservacao(evento.target.value)}
            rows={3}
            maxLength={LIMITE_TEXTO_OBSERVACAO_SESSAO}
            placeholder="Ex: pediu pausa antes de cansar e voltou melhor depois de respirar"
            className="resize-none rounded-xl border-2 border-[var(--cor-borda)] bg-[var(--cor-fundo-alt)] px-4 py-2.5 text-[var(--cor-texto)]"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          <Botao
            type="button"
            onClick={aoRegistrarObservacao}
            disabled={salvandoObservacao || !novaObservacao.trim()}
          >
            {salvandoObservacao ? 'Registrando...' : 'Registrar observacao'}
          </Botao>
          {mensagemObservacao && (
            <output className="text-sm text-[var(--cor-texto-suave)]">
              {mensagemObservacao}
            </output>
          )}
        </div>

        {observacoesSessao.length > 0 && (
          <ul className="divide-y divide-[var(--cor-borda)] rounded-2xl border-2 border-[var(--cor-borda)]">
            {observacoesSessao.slice(0, 5).map((observacao) => (
              <li key={observacao.id ?? observacao.timestamp} className="p-4">
                <p className="mb-1 text-xs font-medium uppercase text-[var(--cor-texto-suave)]">
                  {textoTipoObservacaoSessao[observacao.tipo ?? 'outro']}
                </p>
                <p className="text-sm leading-6 text-[var(--cor-texto)]">
                  {observacao.texto}
                </p>
                <p className="mt-1 text-xs text-[var(--cor-texto-suave)]">
                  {formatarDataHora(observacao.timestamp)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Cartao>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium text-[var(--cor-texto)]">
          Por módulo
        </h2>
        {relatorio.resumoPorModulo.map(
          ({
            modulo,
            status,
            totalTentativas,
            percentualAcerto,
            dominadasNoModulo,
            totalAtividades,
            mediaNivelDica,
          }) => (
            <Cartao key={modulo.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-[var(--cor-texto)]">
                  {modulo.titulo}
                </p>
                <p className="text-sm text-[var(--cor-texto-suave)]">
                  {dominadasNoModulo} de {totalAtividades} dominadas
                </p>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--cor-fundo)]">
                <div
                  className="h-full rounded-full bg-[var(--cor-primaria)]"
                  style={{
                    width: `${(dominadasNoModulo / totalAtividades) * 100}%`,
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--cor-texto-suave)]">
                <span>{textoStatusModulo[status]}</span>
                <span>
                  {totalTentativas > 0
                    ? `${percentualAcerto}% de acerto em ${totalTentativas} tentativas`
                    : 'Ainda não praticou este módulo'}
                </span>
                {mediaNivelDica !== null && (
                  <span>apoio médio: {textoApoioMedio(mediaNivelDica)}</span>
                )}
              </div>
            </Cartao>
          ),
        )}
      </section>

      {relatorio.ultimasTentativas.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-[var(--cor-texto)]">
            Últimas tentativas
          </h2>
          <Cartao className="p-0">
            <ul className="divide-y divide-[var(--cor-borda)]">
              {relatorio.ultimasTentativas.map((item, indice) => (
                <li
                  key={`${item.tentativa.atividadeId}-${item.tentativa.timestamp}-${indice}`}
                  className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-3"
                >
                  <span className="flex flex-col">
                    <span className="font-medium text-[var(--cor-texto)]">
                      {item.atividadeRotulo}
                    </span>
                    <span className="text-xs text-[var(--cor-texto-suave)]">
                      {item.moduloTitulo} · apoio {item.apoioUsado}
                    </span>
                  </span>
                  <span
                    className={
                      item.tentativa.resultado === 'correto'
                        ? 'text-[var(--cor-sucesso)]'
                        : 'text-[var(--cor-texto-suave)]'
                    }
                  >
                    {item.tentativa.resultado === 'correto'
                      ? 'Acertou'
                      : 'Tentou'}
                  </span>
                  <span className="text-[var(--cor-texto-suave)]">
                    {formatarDataHora(item.tentativa.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          </Cartao>
        </section>
      )}
    </main>
  )
}
