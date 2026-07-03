export const CHAVE_LIMITE_LOGIN = 'tea:limite-login'
export const JANELA_FALHAS_LOGIN_MS = 10 * 60 * 1000
export const MAX_FALHAS_LOGIN = 5
export const COOLDOWN_LOGIN_LOCAL_MS = 60 * 1000
export const COOLDOWN_LOGIN_SERVIDOR_MS = 5 * 60 * 1000

interface RegistroFalhaLogin {
  falhas: number
  primeiraFalhaEm: number
  bloqueadoAte?: number
}

type RegistrosFalhaLogin = Record<string, RegistroFalhaLogin>

export interface BloqueioLogin {
  ativo: boolean
  segundosRestantes: number
}

function chaveDoEmail(email: string): string {
  const normalizado = email.trim().toLowerCase()
  if (!normalizado) return ''

  let hash = 2166136261
  for (let indice = 0; indice < normalizado.length; indice += 1) {
    hash ^= normalizado.charCodeAt(indice)
    hash = Math.imul(hash, 16777619)
  }

  return `email-${(hash >>> 0).toString(36)}`
}

function lerRegistros(): RegistrosFalhaLogin {
  try {
    const bruto = localStorage.getItem(CHAVE_LIMITE_LOGIN)
    if (!bruto) return {}
    const dados = JSON.parse(bruto) as unknown
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) return {}
    return dados as RegistrosFalhaLogin
  } catch {
    return {}
  }
}

function salvarRegistros(registros: RegistrosFalhaLogin): boolean {
  try {
    localStorage.setItem(CHAVE_LIMITE_LOGIN, JSON.stringify(registros))
    return true
  } catch {
    return false
  }
}

function bloqueioDoRegistro(
  registro: RegistroFalhaLogin | undefined,
  agora: number,
): BloqueioLogin {
  const bloqueadoAte = registro?.bloqueadoAte ?? 0
  if (bloqueadoAte <= agora) {
    return { ativo: false, segundosRestantes: 0 }
  }

  return {
    ativo: true,
    segundosRestantes: Math.max(1, Math.ceil((bloqueadoAte - agora) / 1000)),
  }
}

export function consultarBloqueioLogin(
  email: string,
  agora = Date.now(),
): BloqueioLogin {
  const chave = chaveDoEmail(email)
  if (!chave) return { ativo: false, segundosRestantes: 0 }

  return bloqueioDoRegistro(lerRegistros()[chave], agora)
}

export function registrarFalhaLogin(
  email: string,
  agora = Date.now(),
): BloqueioLogin {
  const chave = chaveDoEmail(email)
  if (!chave) return { ativo: false, segundosRestantes: 0 }

  const registros = lerRegistros()
  const atual = registros[chave]
  const foraDaJanela =
    !atual || agora - atual.primeiraFalhaEm > JANELA_FALHAS_LOGIN_MS
  const falhas = foraDaJanela ? 1 : atual.falhas + 1
  const primeiraFalhaEm = foraDaJanela ? agora : atual.primeiraFalhaEm
  const bloqueadoAte =
    falhas >= MAX_FALHAS_LOGIN
      ? agora + COOLDOWN_LOGIN_LOCAL_MS
      : atual?.bloqueadoAte

  registros[chave] = { falhas, primeiraFalhaEm, bloqueadoAte }
  salvarRegistros(registros)

  return bloqueioDoRegistro(registros[chave], agora)
}

export function registrarBloqueioServidorLogin(
  email: string,
  agora = Date.now(),
): BloqueioLogin {
  const chave = chaveDoEmail(email)
  if (!chave) return { ativo: false, segundosRestantes: 0 }

  const registros = lerRegistros()
  registros[chave] = {
    falhas: MAX_FALHAS_LOGIN,
    primeiraFalhaEm: agora,
    bloqueadoAte: agora + COOLDOWN_LOGIN_SERVIDOR_MS,
  }
  salvarRegistros(registros)

  return bloqueioDoRegistro(registros[chave], agora)
}

export function limparFalhasLogin(email: string): boolean {
  const chave = chaveDoEmail(email)
  if (!chave) return true

  const registros = lerRegistros()
  delete registros[chave]
  return salvarRegistros(registros)
}

export function textoEsperaLogin(segundos: number): string {
  if (segundos >= 60) {
    const minutos = Math.ceil(segundos / 60)
    return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`
  }

  return `${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`
}

export function mensagemBloqueioLogin(bloqueio: BloqueioLogin): string {
  return `Aguarde ${textoEsperaLogin(
    bloqueio.segundosRestantes,
  )} antes de tentar entrar de novo. Isso ajuda a evitar bloqueios e tentativas repetidas.`
}
