import { addDoc, getDocs, writeBatch } from 'firebase/firestore'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  normalizarTentativa,
  registrarObservacaoSessao,
  registrarTentativa,
  removerDadosDeProgresso,
} from './progresso'

describe('registrarObservacaoSessao', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('registra observacao de sessao com texto limpo e timestamp', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(123)

    await registrarObservacaoSessao(
      'responsavel-1',
      'perfil-1',
      '  pediu pausa e voltou melhor  ',
    )

    expect(addDoc).toHaveBeenCalledWith(undefined, {
      texto: 'pediu pausa e voltou melhor',
      tipo: 'outro',
      timestamp: 123,
    })
  })

  it('registra categoria funcional da observacao quando informada', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(456)

    await registrarObservacaoSessao(
      'responsavel-1',
      'perfil-1',
      'apontou antes do adulto repetir',
      'comunicacao',
    )

    expect(addDoc).toHaveBeenCalledWith(undefined, {
      texto: 'apontou antes do adulto repetir',
      tipo: 'comunicacao',
      timestamp: 456,
    })
  })

  it('limita texto longo antes de salvar', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(789)

    await registrarObservacaoSessao(
      'responsavel-1',
      'perfil-1',
      `${'a'.repeat(500)} fim`,
    )

    expect(addDoc).toHaveBeenCalledWith(undefined, {
      texto: 'a'.repeat(500),
      tipo: 'outro',
      timestamp: 789,
    })
  })

  it('rejeita observacao vazia sem chamar o Firestore', async () => {
    await expect(
      registrarObservacaoSessao('responsavel-1', 'perfil-1', '    '),
    ).rejects.toThrow('Observacao vazia.')

    expect(addDoc).not.toHaveBeenCalled()
  })

  it('remove tentativas e observacoes do perfil em lotes', async () => {
    const deletar = vi.fn()
    const confirmar = vi.fn().mockResolvedValue(undefined)
    vi.mocked(writeBatch).mockReturnValue({
      delete: deletar,
      commit: confirmar,
    } as never)
    vi.mocked(getDocs)
      .mockResolvedValueOnce({
        empty: false,
        size: 2,
        docs: [{ ref: 'tentativa-1' }, { ref: 'tentativa-2' }],
      } as never)
      .mockResolvedValueOnce({
        empty: false,
        size: 1,
        docs: [{ ref: 'observacao-1' }],
      } as never)

    await removerDadosDeProgresso('responsavel-1', 'perfil-1')

    expect(deletar).toHaveBeenCalledWith('tentativa-1')
    expect(deletar).toHaveBeenCalledWith('tentativa-2')
    expect(deletar).toHaveBeenCalledWith('observacao-1')
    expect(confirmar).toHaveBeenCalledTimes(2)
  })
})

describe('tentativas de progresso', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('normaliza tentativa valida antes de usar em historico ou escrita', () => {
    expect(
      normalizarTentativa({
        atividadeId: '  m0-n1-a1  ',
        moduloId: ' m0 ',
        timestamp: 123,
        resultado: 'correto',
        nivelDicaUsado: 2,
        tempoRespostaMs: 1200,
      }),
    ).toEqual({
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp: 123,
      resultado: 'correto',
      nivelDicaUsado: 2,
      tempoRespostaMs: 1200,
    })
  })

  it('descarta tentativa corrompida para nao afetar dominio ou relatorio', () => {
    expect(
      normalizarTentativa({
        atividadeId: 'm0-n1-a1',
        moduloId: 'm0',
        timestamp: 123,
        resultado: 'sorte',
        nivelDicaUsado: 99,
        tempoRespostaMs: -1,
      }),
    ).toBeNull()
  })

  it('registra tentativa normalizada no Firestore', async () => {
    await registrarTentativa('responsavel-1', 'perfil-1', {
      atividadeId: '  m0-n1-a1  ',
      moduloId: ' m0 ',
      timestamp: 123,
      resultado: 'incorreto',
      nivelDicaUsado: 0,
      tempoRespostaMs: 0,
    })

    expect(addDoc).toHaveBeenCalledWith(undefined, {
      atividadeId: 'm0-n1-a1',
      moduloId: 'm0',
      timestamp: 123,
      resultado: 'incorreto',
      nivelDicaUsado: 0,
      tempoRespostaMs: 0,
    })
  })

  it('rejeita tentativa invalida sem chamar o Firestore', async () => {
    await expect(
      registrarTentativa('responsavel-1', 'perfil-1', {
        atividadeId: '',
        moduloId: 'm0',
        timestamp: 0,
        resultado: 'correto',
        nivelDicaUsado: 2,
        tempoRespostaMs: 1000,
      }),
    ).rejects.toThrow('Tentativa invalida.')

    expect(addDoc).not.toHaveBeenCalled()
  })
})
