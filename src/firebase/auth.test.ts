import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ESCOPO_CONSENTIMENTO_PRIVACIDADE,
  LIMITE_EMAIL_RESPONSAVEL,
  LIMITE_NOME_RESPONSAVEL,
  LIMITE_SENHA_MINIMO,
  VERSAO_CONSENTIMENTO_PRIVACIDADE,
  cadastrar,
  entrar,
  redefinirSenha,
  reenviarVerificacaoEmail,
  senhaFraca,
} from './auth'

describe('auth firebase helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(doc).mockReturnValue('responsavel-ref' as never)
    vi.mocked(serverTimestamp).mockReturnValue('timestamp' as never)
    vi.mocked(sendEmailVerification).mockResolvedValue(undefined)
  })

  it('normaliza email e nome ao cadastrar responsavel', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'uid-1' },
    } as never)

    await cadastrar(' Familia@Example.COM ', 'senha123', ' Ana ', true)

    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'familia@example.com',
      'senha123',
    )
    expect(setDoc).toHaveBeenCalledWith('responsavel-ref', {
      nome: 'Ana',
      email: 'familia@example.com',
      consentimentoPrivacidade: {
        versao: VERSAO_CONSENTIMENTO_PRIVACIDADE,
        escopo: ESCOPO_CONSENTIMENTO_PRIVACIDADE,
        aceitoEm: 'timestamp',
      },
      criadoEm: 'timestamp',
    })
  })

  it('envia e-mail de verificacao ao cadastrar responsavel', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'uid-1' },
    } as never)

    await cadastrar('familia@example.com', 'senha123', 'Ana', true)

    expect(sendEmailVerification).toHaveBeenCalledWith({ uid: 'uid-1' })
  })

  it('nao bloqueia o cadastro quando o envio do e-mail de verificacao falha', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'uid-1' },
    } as never)
    vi.mocked(sendEmailVerification).mockRejectedValueOnce(new Error('offline'))

    await expect(
      cadastrar('familia@example.com', 'senha123', 'Ana', true),
    ).resolves.toMatchObject({ uid: 'uid-1' })
    expect(setDoc).toHaveBeenCalled()
  })

  it('reenvia e-mail de verificacao para o usuario informado', async () => {
    const usuario = { uid: 'uid-1' }

    await reenviarVerificacaoEmail(usuario as never)

    expect(sendEmailVerification).toHaveBeenCalledWith(usuario)
  })

  it('rejeita cadastro sem consentimento antes de criar usuario no Auth', async () => {
    await expect(
      cadastrar('familia@example.com', 'senha123', 'Ana', false),
    ).rejects.toMatchObject({ code: 'auth/privacy-consent-required' })

    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('limita nome do responsavel ao contrato das regras antes de salvar', async () => {
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'uid-1' },
    } as never)

    await cadastrar(
      'familia@example.com',
      'senha123',
      ` ${'A'.repeat(LIMITE_NOME_RESPONSAVEL + 10)} `,
      true,
    )

    expect(setDoc).toHaveBeenCalledWith(
      'responsavel-ref',
      expect.objectContaining({
        nome: 'A'.repeat(LIMITE_NOME_RESPONSAVEL),
      }),
    )
  })

  it('rejeita email acima do limite antes de criar usuario no Auth', async () => {
    await expect(
      cadastrar(
        `${'a'.repeat(LIMITE_EMAIL_RESPONSAVEL)}@x.com`,
        'senha123',
        'Ana',
        true,
      ),
    ).rejects.toMatchObject({ code: 'auth/invalid-email' })

    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('normaliza email ao entrar', async () => {
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({
      user: { uid: 'uid-1' },
    } as never)

    await entrar(' Familia@Example.COM ', 'senha123')

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      'familia@example.com',
      'senha123',
    )
  })

  it('normaliza email ao enviar redefinicao de senha', async () => {
    vi.mocked(sendPasswordResetEmail).mockResolvedValue(undefined)

    await redefinirSenha(' Familia@Example.COM ')

    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      expect.anything(),
      'familia@example.com',
    )
  })
})

describe('senhaFraca', () => {
  it('rejeita senha curta demais mesmo com letras e numeros', () => {
    expect(senhaFraca('a1'.repeat(3))).toBe(true)
    expect('a1'.repeat(3).length).toBeLessThan(LIMITE_SENHA_MINIMO)
  })

  it('rejeita senha so com letras', () => {
    expect(senhaFraca('somenteletras')).toBe(true)
  })

  it('rejeita senha so com numeros', () => {
    expect(senhaFraca('12345678')).toBe(true)
  })

  it('aceita senha com letras, numeros e tamanho suficiente', () => {
    expect(senhaFraca('senha123')).toBe(false)
  })
})
