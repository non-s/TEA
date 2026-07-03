import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ESCOPO_CONSENTIMENTO_PRIVACIDADE,
  LIMITE_EMAIL_RESPONSAVEL,
  LIMITE_NOME_RESPONSAVEL,
  VERSAO_CONSENTIMENTO_PRIVACIDADE,
  cadastrar,
  entrar,
  redefinirSenha,
} from './auth'

describe('auth firebase helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(doc).mockReturnValue('responsavel-ref' as never)
    vi.mocked(serverTimestamp).mockReturnValue('timestamp' as never)
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
