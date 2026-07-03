import { beforeEach, describe, expect, it } from 'vitest'
import {
  CHAVE_LIMITE_LOGIN,
  COOLDOWN_LOGIN_LOCAL_MS,
  COOLDOWN_LOGIN_SERVIDOR_MS,
  MAX_FALHAS_LOGIN,
  consultarBloqueioLogin,
  limparFalhasLogin,
  mensagemBloqueioLogin,
  registrarBloqueioServidorLogin,
  registrarFalhaLogin,
  textoEsperaLogin,
} from './limiteLogin'

describe('limiteLogin', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('bloqueia localmente depois de falhas repetidas para o mesmo email', () => {
    const agora = 1_000
    for (let indice = 0; indice < MAX_FALHAS_LOGIN - 1; indice += 1) {
      expect(
        registrarFalhaLogin(' Familia@Example.COM ', agora + indice),
      ).toEqual({
        ativo: false,
        segundosRestantes: 0,
      })
    }

    const bloqueio = registrarFalhaLogin(
      'familia@example.com',
      agora + MAX_FALHAS_LOGIN,
    )

    expect(bloqueio.ativo).toBe(true)
    expect(bloqueio.segundosRestantes).toBe(
      Math.ceil(COOLDOWN_LOGIN_LOCAL_MS / 1000),
    )
    expect(
      consultarBloqueioLogin('familia@example.com', agora + MAX_FALHAS_LOGIN),
    ).toEqual(bloqueio)
    expect(localStorage.getItem(CHAVE_LIMITE_LOGIN)).not.toContain(
      'familia@example.com',
    )
  })

  it('libera depois do cooldown e permite limpar falhas no login correto', () => {
    const agora = 10_000
    for (let indice = 0; indice < MAX_FALHAS_LOGIN; indice += 1) {
      registrarFalhaLogin('familia@example.com', agora + indice)
    }

    expect(
      consultarBloqueioLogin(
        'familia@example.com',
        agora + COOLDOWN_LOGIN_LOCAL_MS + 100,
      ),
    ).toEqual({ ativo: false, segundosRestantes: 0 })

    expect(limparFalhasLogin('familia@example.com')).toBe(true)
    expect(localStorage.getItem(CHAVE_LIMITE_LOGIN)).toBe('{}')
  })

  it('registra bloqueio maior quando o Firebase sinaliza muitas tentativas', () => {
    const bloqueio = registrarBloqueioServidorLogin(
      'familia@example.com',
      20_000,
    )

    expect(bloqueio.ativo).toBe(true)
    expect(bloqueio.segundosRestantes).toBe(
      Math.ceil(COOLDOWN_LOGIN_SERVIDOR_MS / 1000),
    )
  })

  it('formata mensagem de espera em segundos e minutos', () => {
    expect(textoEsperaLogin(12)).toBe('12 segundos')
    expect(textoEsperaLogin(60)).toBe('1 minuto')
    expect(textoEsperaLogin(61)).toBe('2 minutos')
    expect(
      mensagemBloqueioLogin({ ativo: true, segundosRestantes: 60 }),
    ).toContain('Aguarde 1 minuto')
  })
})
