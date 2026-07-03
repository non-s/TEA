import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './config'

export const LIMITE_NOME_RESPONSAVEL = 80
export const LIMITE_EMAIL_RESPONSAVEL = 160
export const VERSAO_CONSENTIMENTO_PRIVACIDADE = 1
export const ESCOPO_CONSENTIMENTO_PRIVACIDADE = 'uso-alfabetizacao-tea-v1'

function erroAuth(codigo: string): Error & { code: string } {
  return Object.assign(new Error(codigo), { code: codigo })
}

function normalizarEmail(email: string): string {
  const emailNormalizado = email.trim().toLowerCase()

  if (emailNormalizado.length > LIMITE_EMAIL_RESPONSAVEL) {
    throw erroAuth('auth/invalid-email')
  }

  return emailNormalizado
}

function normalizarNome(nome: string): string {
  const nomeNormalizado = nome.trim().slice(0, LIMITE_NOME_RESPONSAVEL)

  if (!nomeNormalizado) {
    throw erroAuth('auth/invalid-display-name')
  }

  return nomeNormalizado
}

export async function cadastrar(
  email: string,
  senha: string,
  nome: string,
  consentimentoPrivacidade: boolean,
) {
  const emailNormalizado = normalizarEmail(email)
  const nomeNormalizado = normalizarNome(nome)
  if (!consentimentoPrivacidade) {
    throw erroAuth('auth/privacy-consent-required')
  }
  const credencial = await createUserWithEmailAndPassword(
    auth,
    emailNormalizado,
    senha,
  )
  const [{ doc, serverTimestamp, setDoc }, { db }] = await Promise.all([
    import('firebase/firestore'),
    import('./db'),
  ])

  await setDoc(doc(db, 'responsaveis', credencial.user.uid), {
    nome: nomeNormalizado,
    email: emailNormalizado,
    consentimentoPrivacidade: {
      versao: VERSAO_CONSENTIMENTO_PRIVACIDADE,
      escopo: ESCOPO_CONSENTIMENTO_PRIVACIDADE,
      aceitoEm: serverTimestamp(),
    },
    criadoEm: serverTimestamp(),
  })
  return credencial.user
}

export async function entrar(email: string, senha: string) {
  const credencial = await signInWithEmailAndPassword(
    auth,
    normalizarEmail(email),
    senha,
  )
  return credencial.user
}

export function sair() {
  return signOut(auth)
}

export function redefinirSenha(email: string) {
  return sendPasswordResetEmail(auth, normalizarEmail(email))
}
