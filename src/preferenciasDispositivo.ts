// Preferências que vivem só neste navegador/dispositivo, nunca no perfil
// da criança no Firestore — porque dependem de capacidade de hardware
// (microfone) e não de quem é a criança. Mesmo padrão de
// firebase/db.ts#cacheOfflineFirestoreAtivo.

export const CHAVE_RESPOSTA_POR_VOZ = 'tea:resposta-por-voz'

export function respostaPorVozAtiva(): boolean {
  try {
    return localStorage.getItem(CHAVE_RESPOSTA_POR_VOZ) === 'true'
  } catch {
    return false
  }
}

export function definirRespostaPorVoz(ativo: boolean): boolean {
  try {
    if (ativo) {
      localStorage.setItem(CHAVE_RESPOSTA_POR_VOZ, 'true')
    } else {
      localStorage.removeItem(CHAVE_RESPOSTA_POR_VOZ)
    }
    return true
  } catch {
    return false
  }
}
