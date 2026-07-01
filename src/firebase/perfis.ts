import {
  addDoc,
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

export function ouvirPerfis(
  uidResponsavel: string,
  aoAtualizar: (perfis: PerfilCrianca[]) => void,
) {
  return onSnapshot(colecaoPerfis(uidResponsavel), (snapshot) => {
    const perfis = snapshot.docs.map((doc) => ({
      id: doc.id,
      nome: doc.data().nome as string,
      avatarId: doc.data().avatarId as string,
      preferenciasSensoriais:
        (doc.data().preferenciasSensoriais as PreferenciasSensoriais) ??
        preferenciasPadrao,
    }))
    aoAtualizar(perfis)
  })
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
    criadoEm: serverTimestamp(),
  })
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
