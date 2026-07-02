import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from './config'
import type { Tentativa } from '../curriculo/tipos'

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

export function registrarTentativa(
  uidResponsavel: string,
  perfilId: string,
  tentativa: Tentativa,
) {
  return addDoc(colecaoTentativas(uidResponsavel, perfilId), tentativa)
}

export function ouvirTentativas(
  uidResponsavel: string,
  perfilId: string,
  aoAtualizar: (tentativas: Tentativa[]) => void,
) {
  const consulta = query(
    colecaoTentativas(uidResponsavel, perfilId),
    orderBy('timestamp', 'asc'),
  )
  return onSnapshot(consulta, (snapshot) => {
    aoAtualizar(snapshot.docs.map((doc) => doc.data() as Tentativa))
  })
}
