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
import { db } from './config'

export type TamanhoFonte = 'normal' | 'grande' | 'extra-grande'

export interface PreferenciasSensoriais {
  som: boolean
  animacoes: boolean
  altoContraste: boolean
  tamanhoFonte: TamanhoFonte
}

export interface PerfilCrianca {
  id: string
  nome: string
  avatarId: string
  preferenciasSensoriais: PreferenciasSensoriais
  atividadesDominadas: string[]
}

const preferenciasPadrao: PreferenciasSensoriais = {
  som: true,
  animacoes: true,
  altoContraste: false,
  tamanhoFonte: 'normal',
}

function colecaoPerfis(uidResponsavel: string) {
  return collection(db, 'responsaveis', uidResponsavel, 'perfisCrianca')
}

function paraPerfil(id: string, dados: Record<string, unknown>): PerfilCrianca {
  return {
    id,
    nome: dados.nome as string,
    avatarId: dados.avatarId as string,
    preferenciasSensoriais:
      (dados.preferenciasSensoriais as PreferenciasSensoriais) ??
      preferenciasPadrao,
    atividadesDominadas: (dados.atividadesDominadas as string[]) ?? [],
  }
}

export function ouvirPerfis(
  uidResponsavel: string,
  aoAtualizar: (perfis: PerfilCrianca[]) => void,
) {
  return onSnapshot(colecaoPerfis(uidResponsavel), (snapshot) => {
    aoAtualizar(snapshot.docs.map((doc) => paraPerfil(doc.id, doc.data())))
  })
}

export function ouvirPerfil(
  uidResponsavel: string,
  perfilId: string,
  aoAtualizar: (perfil: PerfilCrianca | null) => void,
) {
  return onSnapshot(
    doc(db, 'responsaveis', uidResponsavel, 'perfisCrianca', perfilId),
    (snapshot) => {
      aoAtualizar(
        snapshot.exists() ? paraPerfil(snapshot.id, snapshot.data()) : null,
      )
    },
  )
}

export function criarPerfil(
  uidResponsavel: string,
  nome: string,
  avatarId: string,
) {
  return addDoc(colecaoPerfis(uidResponsavel), {
    nome,
    avatarId,
    preferenciasSensoriais: preferenciasPadrao,
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

export function removerPerfil(uidResponsavel: string, perfilId: string) {
  return deleteDoc(
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
    { preferenciasSensoriais: preferencias },
  )
}
