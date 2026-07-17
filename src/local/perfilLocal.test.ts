import { beforeEach, describe, expect, it } from 'vitest'
import {
  atualizarPerfil,
  criarPerfil,
  definirPerfilAtivoId,
  excluirDadosDoAparelho,
  excluirPerfil,
  listarPerfis,
  listarTentativas,
  marcarAtividadeDominada,
  obterPerfil,
  perfilAtivoId,
  registrarTentativa,
} from './perfilLocal'

function tentativaExemplo(atividadeId: string) {
  return {
    atividadeId,
    moduloId: 'm0',
    timestamp: Date.now(),
    resultado: 'correto' as const,
    nivelDicaUsado: 2,
    tempoRespostaMs: 800,
  }
}

describe('perfilLocal', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('cria e lista perfis com valores normalizados', () => {
    const perfil = criarPerfil('  Lia  ', 'estrela')

    expect(perfil.nome).toBe('Lia')
    expect(perfil.avatarId).toBe('estrela')
    expect(perfil.atividadesDominadas).toEqual([])
    expect(listarPerfis()).toHaveLength(1)
    expect(obterPerfil(perfil.id)).toEqual(perfil)
  })

  it('usa avatar/interesse padrão quando o valor é inválido', () => {
    const perfil = criarPerfil('Rio', 'formato-inexistente')

    expect(perfil.avatarId).toBe('circulo')
    expect(perfil.interesseEspecialId).toBe('neutro')
  })

  it('usa nome padrão quando o nome vem vazio', () => {
    const perfil = criarPerfil('   ', 'circulo')

    expect(perfil.nome).toBe('Criança')
  })

  it('atualiza campos de um perfil existente sem afetar outros perfis', () => {
    const perfilA = criarPerfil('A', 'circulo')
    const perfilB = criarPerfil('B', 'quadrado')

    const atualizado = atualizarPerfil(perfilA.id, {
      interesseEspecialId: 'animais',
    })

    expect(atualizado?.interesseEspecialId).toBe('animais')
    expect(obterPerfil(perfilB.id)?.interesseEspecialId).toBe('neutro')
  })

  it('retorna null ao atualizar um perfil que não existe', () => {
    expect(atualizarPerfil('inexistente', { nome: 'X' })).toBeNull()
  })

  it('marca atividade dominada sem duplicar', () => {
    const perfil = criarPerfil('Lia', 'circulo')

    marcarAtividadeDominada(perfil.id, 'm0-n1-a1')
    marcarAtividadeDominada(perfil.id, 'm0-n1-a1')
    marcarAtividadeDominada(perfil.id, 'm0-n1-a2')

    expect(obterPerfil(perfil.id)?.atividadesDominadas).toEqual([
      'm0-n1-a1',
      'm0-n1-a2',
    ])
  })

  it('registra e lista tentativas por perfil, sem misturar perfis', () => {
    const perfilA = criarPerfil('A', 'circulo')
    const perfilB = criarPerfil('B', 'quadrado')

    registrarTentativa(perfilA.id, tentativaExemplo('m0-n1-a1'))
    registrarTentativa(perfilA.id, tentativaExemplo('m0-n1-a2'))
    registrarTentativa(perfilB.id, tentativaExemplo('m0-n1-a1'))

    expect(listarTentativas(perfilA.id)).toHaveLength(2)
    expect(listarTentativas(perfilB.id)).toHaveLength(1)
  })

  it('define e lê o perfil ativo', () => {
    const perfil = criarPerfil('Lia', 'circulo')
    expect(perfilAtivoId()).toBeNull()

    definirPerfilAtivoId(perfil.id)
    expect(perfilAtivoId()).toBe(perfil.id)

    definirPerfilAtivoId(null)
    expect(perfilAtivoId()).toBeNull()
  })

  it('exclui um perfil e suas tentativas, e desmarca como ativo se era o ativo', () => {
    const perfil = criarPerfil('Lia', 'circulo')
    registrarTentativa(perfil.id, tentativaExemplo('m0-n1-a1'))
    definirPerfilAtivoId(perfil.id)

    excluirPerfil(perfil.id)

    expect(listarPerfis()).toHaveLength(0)
    expect(listarTentativas(perfil.id)).toEqual([])
    expect(perfilAtivoId()).toBeNull()
  })

  it('exclui todos os dados do aparelho de uma vez', () => {
    const perfilA = criarPerfil('A', 'circulo')
    const perfilB = criarPerfil('B', 'quadrado')
    registrarTentativa(perfilA.id, tentativaExemplo('m0-n1-a1'))
    registrarTentativa(perfilB.id, tentativaExemplo('m0-n1-a1'))
    definirPerfilAtivoId(perfilA.id)

    excluirDadosDoAparelho()

    expect(listarPerfis()).toEqual([])
    expect(listarTentativas(perfilA.id)).toEqual([])
    expect(listarTentativas(perfilB.id)).toEqual([])
    expect(perfilAtivoId()).toBeNull()
  })

  it('ignora dado corrompido no localStorage em vez de quebrar', () => {
    localStorage.setItem('tea:perfis-locais', '{ nao é um json valido')

    expect(listarPerfis()).toEqual([])
  })
})
