import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './db'
import {
  interesseEspecialIds,
  type InteresseEspecialId,
} from '../curriculo/interesses'
import { formasIcone, type FormaIconeId } from '../curriculo/ativos/tipos'
import {
  LIMITE_OBSERVACAO_MEDIADOR,
  normalizarPerfilApoio,
  type PerfilApoio,
} from '../curriculo/perfilApoio'
import {
  normalizarPreferenciasSensoriais,
  preferenciasSensoriaisPadrao,
  type PreferenciasSensoriais,
  type TamanhoFonte,
} from '../curriculo/preferenciasSensoriais'
import { removerDadosDeProgresso } from './progresso'

export { preferenciasSensoriaisPadrao }
export type { PreferenciasSensoriais, TamanhoFonte }

export const LIMITE_NOME_PERFIL = 40
const LIMITE_ATIVIDADES_DOMINADAS = 300

export interface PlanoIndividual {
  metaAtual: string
  apoioPreferencial: 'visual' | 'verbal' | 'gestual' | 'pausa'
  observacaoMediador: string
}

export interface PerfilCrianca {
  id: string
  nome: string
  avatarId: string
  interesseEspecialId: InteresseEspecialId
  perfilApoio: PerfilApoio
  preferenciasSensoriais: PreferenciasSensoriais
  planoIndividual: PlanoIndividual
  atividadesDominadas: string[]
}

export const LIMITE_META_ATUAL = 160

interface CriarPerfilOpcoes {
  interesseEspecialId?: InteresseEspecialId
  perfilApoio?: Partial<PerfilApoio>
  preferenciasSensoriais?: Partial<PreferenciasSensoriais>
  planoIndividual?: Partial<PlanoIndividual>
}

type AoErroSnapshot = (erro: unknown) => void

export const planoIndividualPadrao: PlanoIndividual = {
  metaAtual: '',
  apoioPreferencial: 'visual',
  observacaoMediador: '',
}

const apoiosPreferenciais = [
  'visual',
  'verbal',
  'gestual',
  'pausa',
] as const satisfies readonly PlanoIndividual['apoioPreferencial'][]

function colecaoPerfis(uidResponsavel: string) {
  return collection(db, 'responsaveis', uidResponsavel, 'perfisCrianca')
}

function normalizarNomePerfil(nome: string): string {
  return nome.trim().slice(0, LIMITE_NOME_PERFIL)
}

function normalizarNomePerfilSeguro(valor: unknown): string {
  const nome = typeof valor === 'string' ? normalizarNomePerfil(valor) : ''
  return nome || 'Criança'
}

function formaIconeValida(valor: unknown): valor is FormaIconeId {
  return (
    typeof valor === 'string' &&
    (formasIcone as readonly string[]).includes(valor)
  )
}

function normalizarAvatarId(valor: unknown): FormaIconeId {
  return formaIconeValida(valor) ? valor : 'circulo'
}

function interesseEspecialValido(valor: unknown): valor is InteresseEspecialId {
  return (
    typeof valor === 'string' &&
    (interesseEspecialIds as readonly string[]).includes(valor)
  )
}

function normalizarInteresseEspecialId(valor: unknown): InteresseEspecialId {
  return interesseEspecialValido(valor) ? valor : 'neutro'
}

function normalizarAtividadesDominadas(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []

  const atividades = valor
    .filter(
      (atividadeId): atividadeId is string => typeof atividadeId === 'string',
    )
    .map((atividadeId) => atividadeId.trim())
    .filter(Boolean)

  return Array.from(new Set(atividades)).slice(0, LIMITE_ATIVIDADES_DOMINADAS)
}

function limitarTexto(valor: unknown, limite: number): string {
  return typeof valor === 'string' ? valor.trim().slice(0, limite) : ''
}

function apoioPreferencialValido(
  valor: unknown,
): valor is PlanoIndividual['apoioPreferencial'] {
  return (
    typeof valor === 'string' &&
    (apoiosPreferenciais as readonly string[]).includes(valor)
  )
}

export function normalizarPlanoIndividual(
  planoIndividual: Partial<PlanoIndividual> | undefined = {},
): PlanoIndividual {
  const dados = planoIndividual as Record<string, unknown>

  return {
    metaAtual: limitarTexto(dados.metaAtual, LIMITE_META_ATUAL),
    apoioPreferencial: apoioPreferencialValido(dados.apoioPreferencial)
      ? dados.apoioPreferencial
      : planoIndividualPadrao.apoioPreferencial,
    observacaoMediador: limitarTexto(
      dados.observacaoMediador,
      LIMITE_OBSERVACAO_MEDIADOR,
    ),
  }
}

export function normalizarPerfilCrianca(
  id: string,
  dados: Record<string, unknown>,
): PerfilCrianca {
  const perfilApoio = normalizarPerfilApoio(
    dados.perfilApoio as Partial<PerfilApoio> | undefined,
  )

  return {
    id,
    nome: normalizarNomePerfilSeguro(dados.nome),
    avatarId: normalizarAvatarId(dados.avatarId),
    interesseEspecialId: normalizarInteresseEspecialId(
      dados.interesseEspecialId,
    ),
    perfilApoio,
    preferenciasSensoriais: normalizarPreferenciasSensoriais(
      dados.preferenciasSensoriais as
        Partial<PreferenciasSensoriais> | undefined,
    ),
    planoIndividual: normalizarPlanoIndividual(
      dados.planoIndividual as Partial<PlanoIndividual> | undefined,
    ),
    atividadesDominadas: normalizarAtividadesDominadas(
      dados.atividadesDominadas,
    ),
  }
}

export function ouvirPerfis(
  uidResponsavel: string,
  aoAtualizar: (perfis: PerfilCrianca[]) => void,
  aoErro?: AoErroSnapshot,
) {
  return onSnapshot(
    colecaoPerfis(uidResponsavel),
    (snapshot) => {
      aoAtualizar(
        snapshot.docs.map((doc) => normalizarPerfilCrianca(doc.id, doc.data())),
      )
    },
    aoErro,
  )
}

export function ouvirPerfil(
  uidResponsavel: string,
  perfilId: string,
  aoAtualizar: (perfil: PerfilCrianca | null) => void,
  aoErro?: AoErroSnapshot,
) {
  return onSnapshot(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    (snapshot) => {
      aoAtualizar(
        snapshot.exists()
          ? normalizarPerfilCrianca(snapshot.id, snapshot.data())
          : null,
      )
    },
    aoErro,
  )
}

export function criarPerfil(
  uidResponsavel: string,
  nome: string,
  avatarId: string,
  opcoes: CriarPerfilOpcoes = {},
) {
  const nomeNormalizado = normalizarNomePerfil(nome)
  const avatarNormalizado = normalizarAvatarId(avatarId)
  const interesseEspecialId = normalizarInteresseEspecialId(
    opcoes.interesseEspecialId,
  )
  const perfilApoio = normalizarPerfilApoio(opcoes.perfilApoio)
  const preferenciasSensoriais = normalizarPreferenciasSensoriais(
    opcoes.preferenciasSensoriais,
  )
  const planoIndividual = {
    ...normalizarPlanoIndividual(opcoes.planoIndividual),
  }

  return addDoc(colecaoPerfis(uidResponsavel), {
    nome: nomeNormalizado,
    avatarId: avatarNormalizado,
    interesseEspecialId,
    perfilApoio,
    preferenciasSensoriais,
    planoIndividual,
    atividadesDominadas: [],
    criadoEm: serverTimestamp(),
  })
}

export function marcarAtividadeDominada(
  uidResponsavel: string,
  perfilId: string,
  atividadeId: string,
) {
  return updateDoc(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    { atividadesDominadas: arrayUnion(atividadeId) },
  )
}

export async function removerPerfil(uidResponsavel: string, perfilId: string) {
  await removerDadosDeProgresso(uidResponsavel, perfilId)
  await deleteDoc(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
  )
}

export function atualizarPreferenciasPerfil(
  uidResponsavel: string,
  perfilId: string,
  preferencias: PreferenciasSensoriais,
) {
  return updateDoc(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    { preferenciasSensoriais: normalizarPreferenciasSensoriais(preferencias) },
  )
}

export function atualizarInteressePerfil(
  uidResponsavel: string,
  perfilId: string,
  interesseEspecialId: InteresseEspecialId,
) {
  return updateDoc(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    { interesseEspecialId: normalizarInteresseEspecialId(interesseEspecialId) },
  )
}

export function atualizarPerfilApoioPerfil(
  uidResponsavel: string,
  perfilId: string,
  perfilApoio: PerfilApoio,
) {
  const perfilApoioNormalizado = normalizarPerfilApoio(perfilApoio)

  return updateDoc(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    { perfilApoio: perfilApoioNormalizado },
  )
}

export function atualizarPlanoIndividualPerfil(
  uidResponsavel: string,
  perfilId: string,
  planoIndividual: PlanoIndividual,
) {
  return updateDoc(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    { planoIndividual: normalizarPlanoIndividual(planoIndividual) },
  )
}
