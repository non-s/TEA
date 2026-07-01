import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './config'

export async function cadastrar(email: string, senha: string, nome: string) {
  const credencial = await createUserWithEmailAndPassword(auth, email, senha)
  await setDoc(doc(db, 'responsaveis', credencial.user.uid), {
    nome,
    email,
    criadoEm: serverTimestamp(),
  })
  return credencial.user
}

export async function entrar(email: string, senha: string) {
  const credencial = await signInWithEmailAndPassword(auth, email, senha)
  return credencial.user
}

export function sair() {
  return signOut(auth)
}

export function redefinirSenha(email: string) {
  return sendPasswordResetEmail(auth, email)
}
