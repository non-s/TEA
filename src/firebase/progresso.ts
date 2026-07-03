import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore'
import { db } from './db'
import type { ResultadoTentativa, Tentativa } from '../curriculo/tipos'

export type TipoObservacaoSessao =
  'comunicacao' | 'regulacao' | 'acesso' | 'generalizacao' | 'outro'

export const textoTipoObservacaoSessao: Record<TipoObservacaoSessao, string> = {
  comunicacao: 'Comunicacao',
  regulacao: 'Regulacao',
  acesso: 'Acesso',
  generalizacao: 'Generalizacao',
  outro: 'Geral',
}

export interface ObservacaoSessao {
  id?: string
  tipo?: TipoObservacaoSessao
  texto: string
  timestamp: number
}

type AoErroSnapshot = (erro: unknown) => void

export const LIMITE_TEXTO_OBSERVACAO_SESSAO = 500
const LIMITE_ID_ATIVIDADE = 80
const LIMITE_ID_MODULO = 20
const TEMPO_RESPOSTA_MAXIMO_MS = 3_600_000

function colecaoTentativas(uidResponsavel: string, perfilId: string) {
  return collection(
    db,
    'responsaveis',
    uidResponsavel,
    'perfisCrianca',
    perfilId,
    'tentativas',
  )
}

function colecaoObservacoes(uidResponsavel: string, perfilId: string) {
  return collection(
    db,
    'responsaveis',
    uidResponsavel,
    'perfisCrianca',
    perfilId,
    'observacoesSessao',
  )
}

const LIMITE_EXCLUSAO_LOTE = 450
const tiposObservacaoSessao = new Set<TipoObservacaoSessao>([
  'comunicacao',
  'regulacao',
  'acesso',
  'generalizacao',
  'outro',
])

function normalizarTipoObservacaoSessao(tipo: unknown): TipoObservacaoSessao {
  return typeof tipo === 'string' &&
    tiposObservacaoSessao.has(tipo as TipoObservacaoSessao)
    ? (tipo as TipoObservacaoSessao)
    : 'outro'
}

function normalizarTextoObservacaoSessao(texto: string) {
  return texto.trim().slice(0, LIMITE_TEXTO_OBSERVACAO_SESSAO)
}

function textoObrigatorioAte(valor: unknown, limite: number): string | null {
  if (typeof valor !== 'string') return null
  const texto = valor.trim()
  if (!texto || texto.length > limite) return null
  return texto
}

function resultadoTentativaValido(valor: unknown): valor is ResultadoTentativa {
  return valor === 'correto' || valor === 'incorreto'
}

function numeroPositivo(valor: unknown): number | null {
  return typeof valor === 'number' && Number.isFinite(valor) && valor > 0
    ? valor
    : null
}

function numeroEntre(
  valor: unknown,
  minimo: number,
  maximo: number,
): number | null {
  return typeof valor === 'number' &&
    Number.isFinite(valor) &&
    valor >= minimo &&
    valor <= maximo
    ? valor
    : null
}

function inteiroEntre(
  valor: unknown,
  minimo: number,
  maximo: number,
): number | null {
  return typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= minimo &&
    valor <= maximo
    ? valor
    : null
}

export function normalizarTentativa(dados: unknown): Tentativa | null {
  if (!dados || typeof dados !== 'object') return null

  const tentativa = dados as Record<string, unknown>
  const atividadeId = textoObrigatorioAte(
    tentativa.atividadeId,
    LIMITE_ID_ATIVIDADE,
  )
  const moduloId = textoObrigatorioAte(tentativa.moduloId, LIMITE_ID_MODULO)
  const timestamp = numeroPositivo(tentativa.timestamp)
  const resultado = resultadoTentativaValido(tentativa.resultado)
    ? tentativa.resultado
    : null
  const nivelDicaUsado = inteiroEntre(tentativa.nivelDicaUsado, 0, 2)
  const tempoRespostaMs = numeroEntre(
    tentativa.tempoRespostaMs,
    0,
    TEMPO_RESPOSTA_MAXIMO_MS,
  )

  if (
    !atividadeId ||
    !moduloId ||
    !timestamp ||
    !resultado ||
    nivelDicaUsado === null ||
    tempoRespostaMs === null
  ) {
    return null
  }

  return {
    atividadeId,
    moduloId,
    timestamp,
    resultado,
    nivelDicaUsado,
    tempoRespostaMs,
  }
}

async function removerDocumentosDaColecao(
  colecao: ReturnType<typeof colecaoTentativas>,
) {
  while (true) {
    const snapshot = await getDocs(query(colecao, limit(LIMITE_EXCLUSAO_LOTE)))

    if (snapshot.empty) return

    const lote = writeBatch(db)
    snapshot.docs.forEach((documento) => lote.delete(documento.ref))
    await lote.commit()

    if (snapshot.size < LIMITE_EXCLUSAO_LOTE) return
  }
}

export function registrarTentativa(
  uidResponsavel: string,
  perfilId: string,
  tentativa: Tentativa,
) {
  const tentativaNormalizada = normalizarTentativa(tentativa)
  if (!tentativaNormalizada) {
    return Promise.reject(new Error('Tentativa invalida.'))
  }

  return addDoc(
    colecaoTentativas(uidResponsavel, perfilId),
    tentativaNormalizada,
  )
}

export function ouvirTentativas(
  uidResponsavel: string,
  perfilId: string,
  aoAtualizar: (tentativas: Tentativa[]) => void,
  aoErro?: AoErroSnapshot,
) {
  const consulta = query(
    colecaoTentativas(uidResponsavel, perfilId),
    orderBy('timestamp', 'asc'),
  )
  return onSnapshot(
    consulta,
    (snapshot) => {
      aoAtualizar(
        snapshot.docs
          .map((doc) => normalizarTentativa(doc.data()))
          .filter((tentativa): tentativa is Tentativa => tentativa !== null),
      )
    },
    aoErro,
  )
}

export function registrarObservacaoSessao(
  uidResponsavel: string,
  perfilId: string,
  texto: string,
  tipo: TipoObservacaoSessao = 'outro',
) {
  const textoNormalizado = normalizarTextoObservacaoSessao(texto)

  if (!textoNormalizado) {
    return Promise.reject(new Error('Observacao vazia.'))
  }

  return addDoc(colecaoObservacoes(uidResponsavel, perfilId), {
    texto: textoNormalizado,
    tipo: normalizarTipoObservacaoSessao(tipo),
    timestamp: Date.now(),
  })
}

export function ouvirObservacoesSessao(
  uidResponsavel: string,
  perfilId: string,
  aoAtualizar: (observacoes: ObservacaoSessao[]) => void,
  aoErro?: AoErroSnapshot,
) {
  const consulta = query(
    colecaoObservacoes(uidResponsavel, perfilId),
    orderBy('timestamp', 'desc'),
  )
  return onSnapshot(
    consulta,
    (snapshot) => {
      aoAtualizar(
        snapshot.docs.map((documento) => {
          const dados = documento.data() as Omit<ObservacaoSessao, 'id'>

          return {
            id: documento.id,
            ...dados,
            tipo: normalizarTipoObservacaoSessao(dados.tipo),
          }
        }),
      )
    },
    aoErro,
  )
}

export function removerDadosDeProgresso(
  uidResponsavel: string,
  perfilId: string,
) {
  return Promise.all([
    removerDocumentosDaColecao(colecaoTentativas(uidResponsavel, perfilId)),
    removerDocumentosDaColecao(colecaoObservacoes(uidResponsavel, perfilId)),
  ])
}
