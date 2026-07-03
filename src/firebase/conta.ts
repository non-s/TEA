import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
} from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { db } from './db'
import { removerPerfil } from './perfis'

function erroAuth(codigo: string): Error & { code: string } {
  return Object.assign(new Error(codigo), { code: codigo })
}

export async function excluirContaResponsavel(usuario: User, senha: string) {
  if (!usuario.email) {
    throw erroAuth('auth/invalid-email')
  }
  if (!senha.trim()) {
    throw erroAuth('auth/missing-password')
  }

  const credencial = EmailAuthProvider.credential(usuario.email, senha)
  await reauthenticateWithCredential(usuario, credencial)

  const perfis = await getDocs(
    collection(db, 'responsaveis', usuario.uid, 'perfisCrianca'),
  )
  for (const perfil of perfis.docs) {
    await removerPerfil(usuario.uid, perfil.id)
  }

  await deleteDoc(doc(db, 'responsaveis', usuario.uid))
  await deleteUser(usuario)
}
