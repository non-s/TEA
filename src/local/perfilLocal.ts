// Toda a persistência do app vive só no navegador do aparelho (localStorage),
// nunca num servidor. Isso é uma escolha deliberada, não só técnica: sem
// conta, sem e-mail e sem dado saindo do aparelho, não existe coleta de
// dado de criança por um controlador — logo não há exigência de
// consentimento (LGPD/COPPA) a cumprir. Ver docs/SEGURANCA.md.
//
// Preferências sensoriais (som/animação/contraste/fonte) ficam de fora
// deste perfil de propósito: já vivem em contexts/PreferenciasContext.tsx,
// por dispositivo, independente de qual criança está usando agora — dois
// irmãos no mesmo tablet ajustam o mesmo dispositivo, não "levam" a
// preferência com o nome.
import {
  normalizarPerfilApoio,
  type PerfilApoio,
} from '../curriculo/perfilApoio'
import {
  interesseEspecialIds,
  type InteresseEspecialId,
} from '../curriculo/interesses'
import { formasIcone, type FormaIconeId } from '../curriculo/ativos/tipos'
import {
  apoiosPreferenciais,
  type ApoioPreferencial,
} from '../curriculo/apoioPreferencial'
import type { Tentativa } from '../curriculo/tipos'

export const LIMITE_NOME_PERFIL = 40
const LIMITE_ATIVIDADES_DOMINADAS = 2000
const LIMITE_TENTATIVAS_POR_PERFIL = 20000

export interface PerfilLocal {
  id: string
  nome: string
  avatarId: FormaIconeId
  interesseEspecialId: InteresseEspecialId
  perfilApoio: PerfilApoio
  apoioPreferencial: ApoioPreferencial
  atividadesDominadas: string[]
  criadoEm: number
}

const CHAVE_PERFIS = 'tea:perfis-locais'
const CHAVE_PERFIL_ATIVO_ID = 'tea:perfil-ativo-id'
const PREFIXO_TENTATIVAS = 'tea:tentativas:'

function gerarId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `perfil-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function lerJson<T>(chave: string, valorPadrao: T): T {
  try {
    const bruto = localStorage.getItem(chave)
    if (!bruto) return valorPadrao
    return JSON.parse(bruto) as T
  } catch {
    return valorPadrao
  }
}

function escreverJson(chave: string, valor: unknown): boolean {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
    return true
  } catch {
    return false
  }
}

function normalizarNome(valor: unknown): string {
  const nome =
    typeof valor === 'string' ? valor.trim().slice(0, LIMITE_NOME_PERFIL) : ''
  return nome || 'Criança'
}

function normalizarAvatarId(valor: unknown): FormaIconeId {
  return typeof valor === 'string' &&
    (formasIcone as readonly string[]).includes(valor)
    ? (valor as FormaIconeId)
    : 'circulo'
}

function normalizarInteresseEspecialId(valor: unknown): InteresseEspecialId {
  return typeof valor === 'string' &&
    (interesseEspecialIds as readonly string[]).includes(valor)
    ? (valor as InteresseEspecialId)
    : 'neutro'
}

function normalizarApoioPreferencial(valor: unknown): ApoioPreferencial {
  return typeof valor === 'string' &&
    (apoiosPreferenciais as readonly string[]).includes(valor)
    ? (valor as ApoioPreferencial)
    : 'visual'
}

function normalizarAtividadesDominadas(valor: unknown): string[] {
  if (!Array.isArray(valor)) return []

  const atividades = valor
    .filter((id): id is string => typeof id === 'string')
    .map((id) => id.trim())
    .filter(Boolean)

  return Array.from(new Set(atividades)).slice(0, LIMITE_ATIVIDADES_DOMINADAS)
}

function normalizarPerfil(dados: Record<string, unknown>): PerfilLocal {
  return {
    id: typeof dados.id === 'string' ? dados.id : gerarId(),
    nome: normalizarNome(dados.nome),
    avatarId: normalizarAvatarId(dados.avatarId),
    interesseEspecialId: normalizarInteresseEspecialId(
      dados.interesseEspecialId,
    ),
    perfilApoio: normalizarPerfilApoio(
      dados.perfilApoio as Partial<PerfilApoio> | undefined,
    ),
    apoioPreferencial: normalizarApoioPreferencial(dados.apoioPreferencial),
    atividadesDominadas: normalizarAtividadesDominadas(
      dados.atividadesDominadas,
    ),
    criadoEm: typeof dados.criadoEm === 'number' ? dados.criadoEm : Date.now(),
  }
}

export function listarPerfis(): PerfilLocal[] {
  const brutos = lerJson<unknown[]>(CHAVE_PERFIS, [])
  if (!Array.isArray(brutos)) return []
  return brutos
    .filter((p): p is Record<string, unknown> => !!p && typeof p === 'object')
    .map(normalizarPerfil)
}

function salvarPerfis(perfis: PerfilLocal[]): boolean {
  return escreverJson(CHAVE_PERFIS, perfis)
}

export function obterPerfil(id: string): PerfilLocal | null {
  return listarPerfis().find((perfil) => perfil.id === id) ?? null
}

export function criarPerfil(
  nome: string,
  avatarId: string,
  opcoes: Partial<
    Pick<
      PerfilLocal,
      'interesseEspecialId' | 'apoioPreferencial' | 'perfilApoio'
    >
  > = {},
): PerfilLocal {
  const perfil = normalizarPerfil({
    id: gerarId(),
    nome,
    avatarId,
    interesseEspecialId: opcoes.interesseEspecialId,
    apoioPreferencial: opcoes.apoioPreferencial,
    perfilApoio: opcoes.perfilApoio,
    criadoEm: Date.now(),
  })
  salvarPerfis([...listarPerfis(), perfil])
  return perfil
}

export function atualizarPerfil(
  id: string,
  alteracoes: Partial<Omit<PerfilLocal, 'id' | 'criadoEm'>>,
): PerfilLocal | null {
  const perfis = listarPerfis()
  const indice = perfis.findIndex((perfil) => perfil.id === id)
  if (indice === -1) return null

  const atualizado = normalizarPerfil({
    ...perfis[indice],
    ...alteracoes,
    id,
  })
  perfis[indice] = atualizado
  salvarPerfis(perfis)
  return atualizado
}

export function marcarAtividadeDominada(
  id: string,
  atividadeId: string,
): PerfilLocal | null {
  const perfil = obterPerfil(id)
  if (!perfil) return null
  if (perfil.atividadesDominadas.includes(atividadeId)) return perfil

  return atualizarPerfil(id, {
    atividadesDominadas: [...perfil.atividadesDominadas, atividadeId],
  })
}

export function excluirPerfil(id: string): void {
  salvarPerfis(listarPerfis().filter((perfil) => perfil.id !== id))
  localStorage.removeItem(PREFIXO_TENTATIVAS + id)
  if (perfilAtivoId() === id) definirPerfilAtivoId(null)
}

export function perfilAtivoId(): string | null {
  try {
    return localStorage.getItem(CHAVE_PERFIL_ATIVO_ID)
  } catch {
    return null
  }
}

export function definirPerfilAtivoId(id: string | null): void {
  try {
    if (id) localStorage.setItem(CHAVE_PERFIL_ATIVO_ID, id)
    else localStorage.removeItem(CHAVE_PERFIL_ATIVO_ID)
  } catch {
    // Sem persistência disponível (ex. modo privado bloqueando storage) —
    // a seleção some ao recarregar, mas o app continua funcionando.
  }
}

export function listarTentativas(perfilId: string): Tentativa[] {
  return lerJson<Tentativa[]>(PREFIXO_TENTATIVAS + perfilId, [])
}

export function registrarTentativa(perfilId: string, tentativa: Tentativa) {
  const tentativas = listarTentativas(perfilId)
  tentativas.push(tentativa)
  const salvou = escreverJson(
    PREFIXO_TENTATIVAS + perfilId,
    tentativas.slice(-LIMITE_TENTATIVAS_POR_PERFIL),
  )
  if (!salvou) {
    throw new Error('Não foi possível salvar a tentativa neste aparelho.')
  }
}

/** Apaga todos os perfis, tentativas e a seleção ativa deste aparelho. */
export function excluirDadosDoAparelho(): void {
  for (const perfil of listarPerfis()) {
    localStorage.removeItem(PREFIXO_TENTATIVAS + perfil.id)
  }
  localStorage.removeItem(CHAVE_PERFIS)
  localStorage.removeItem(CHAVE_PERFIL_ATIVO_ID)
}
