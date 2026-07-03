import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { excluirContaResponsavel } from './conta'

const mocks = vi.hoisted(() => ({
  removerPerfil: vi.fn(),
}))

vi.mock('./perfis', () => ({
  removerPerfil: mocks.removerPerfil,
}))

describe('excluirContaResponsavel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.removerPerfil.mockResolvedValue(undefined)
    vi.mocked(doc).mockReturnValue('responsavel-ref' as never)
  })

  it('reatentica e apaga todos os dados antes de excluir usuario', async () => {
    const usuario = {
      uid: 'uid-1',
      email: 'familia@example.com',
    }
    vi.mocked(EmailAuthProvider.credential).mockReturnValue(
      'credencial' as never,
    )
    vi.mocked(reauthenticateWithCredential).mockResolvedValue(
      undefined as never,
    )
    vi.mocked(collection).mockReturnValue('perfis-ref' as never)
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ id: 'perfil-1' }, { id: 'perfil-2' }],
    } as never)
    vi.mocked(deleteDoc).mockResolvedValue(undefined)
    vi.mocked(deleteUser).mockResolvedValue(undefined)

    await excluirContaResponsavel(usuario as never, 'senha123')

    expect(EmailAuthProvider.credential).toHaveBeenCalledWith(
      'familia@example.com',
      'senha123',
    )
    expect(reauthenticateWithCredential).toHaveBeenCalledWith(
      usuario,
      'credencial',
    )
    expect(collection).toHaveBeenCalledWith(
      expect.anything(),
      'responsaveis',
      'uid-1',
      'perfisCrianca',
    )
    expect(mocks.removerPerfil).toHaveBeenNthCalledWith(1, 'uid-1', 'perfil-1')
    expect(mocks.removerPerfil).toHaveBeenNthCalledWith(2, 'uid-1', 'perfil-2')
    expect(deleteDoc).toHaveBeenCalledWith('responsavel-ref')
    expect(deleteUser).toHaveBeenCalledWith(usuario)
  })

  it('rejeita exclusao de conta sem senha antes de reautenticar', async () => {
    await expect(
      excluirContaResponsavel(
        { uid: 'uid-1', email: 'familia@example.com' } as never,
        '   ',
      ),
    ).rejects.toMatchObject({ code: 'auth/missing-password' })

    expect(reauthenticateWithCredential).not.toHaveBeenCalled()
    expect(deleteUser).not.toHaveBeenCalled()
  })
})
