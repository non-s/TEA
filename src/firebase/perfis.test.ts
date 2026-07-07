import { addDoc, arrayRemove, arrayUnion, updateDoc } from 'firebase/firestore'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  LIMITE_COLABORADORES,
  LIMITE_META_ATUAL,
  LIMITE_NOME_PERFIL,
  adicionarColaborador,
  atualizarPerfilApoioPerfil,
  atualizarInteressePerfil,
  atualizarPreferenciasPerfil,
  criarPerfil,
  emailColaboradorValido,
  normalizarPerfilCrianca,
  normalizarPlanoIndividual,
  removerColaborador,
  type PerfilCrianca,
} from './perfis'
import { LIMITE_OBSERVACAO_MEDIADOR } from '../curriculo/perfilApoio'

describe('criarPerfil', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('cria perfil com apoio funcional, preferencias e plano inicial', async () => {
    await criarPerfil('responsavel-1', '  Lia  ', 'estrela', {
      interesseEspecialId: 'animais',
      perfilApoio: {
        comunicacaoPreferencial: 'figuras',
        acessoPreferencial: 'escolha-mediada',
        regulacaoPreferencial: 'ambiente-calmo',
        planoRegulacao: {
          sinaisPausa: 'cobre os ouvidos',
          estrategiasAjudam: 'fone e luz baixa',
          evitarDuranteSobrecarga: 'muitas perguntas',
        },
        observacoes: 'usa prancha em casa',
      },
      preferenciasSensoriais: {
        som: false,
        animacoes: false,
        alvosMaiores: true,
      },
      planoIndividual: {
        apoioPreferencial: 'visual',
        observacaoMediador: 'esperar resposta por olhar',
      },
    })

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        nome: 'Lia',
        avatarId: 'estrela',
        interesseEspecialId: 'animais',
        perfilApoio: expect.objectContaining({
          comunicacaoPreferencial: 'figuras',
          acessoPreferencial: 'escolha-mediada',
          regulacaoPreferencial: 'ambiente-calmo',
          planoRegulacao: expect.objectContaining({
            estrategiasAjudam: 'fone e luz baixa',
          }),
          observacoes: 'usa prancha em casa',
        }),
        preferenciasSensoriais: expect.objectContaining({
          som: false,
          animacoes: false,
          alvosMaiores: true,
          altoContraste: false,
        }),
        planoIndividual: expect.objectContaining({
          apoioPreferencial: 'visual',
          observacaoMediador: 'esperar resposta por olhar',
        }),
      }),
    )
  })

  it('normaliza perfil de apoio antes de salvar no banco', async () => {
    const perfilApoio = {
      comunicacaoPreferencial: 'figuras',
      acessoPreferencial: 'toque-direto',
      regulacaoPreferencial: 'pausa',
      limiteTentativasAntesPausa: 1,
      cartoesComunicacao: [
        {
          id: 'ajuda',
          rotulo: '',
          fala: '',
          apoio: '',
        },
      ],
      planoRegulacao: {
        sinaisPausa: 'olha para a porta',
        estrategiasAjudam: 'fone',
        evitarDuranteSobrecarga: 'perguntas repetidas',
      },
      observacoes: '',
    } satisfies PerfilCrianca['perfilApoio']

    await atualizarPerfilApoioPerfil('responsavel-1', 'perfil-1', perfilApoio)

    expect(updateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        perfilApoio: expect.objectContaining({
          limiteTentativasAntesPausa: 6,
          planoRegulacao: expect.objectContaining({
            sinaisPausa: 'olha para a porta',
          }),
          cartoesComunicacao: expect.arrayContaining([
            expect.objectContaining({
              id: 'ajuda',
              rotulo: 'Ajuda',
              fala: 'Preciso de ajuda.',
              apoio: 'A próxima resposta terá ajuda visual.',
            }),
          ]),
        }),
      }),
    )
  })

  it('normaliza plano individual antes de salvar no banco', () => {
    const plano = normalizarPlanoIndividual({
      metaAtual: ` ${'m'.repeat(LIMITE_META_ATUAL + 20)} `,
      apoioPreferencial: 'pressao',
      observacaoMediador: ` ${'o'.repeat(LIMITE_OBSERVACAO_MEDIADOR + 20)} `,
    } as never)

    expect(plano.metaAtual).toHaveLength(LIMITE_META_ATUAL)
    expect(plano.apoioPreferencial).toBe('visual')
    expect(plano.observacaoMediador).toHaveLength(LIMITE_OBSERVACAO_MEDIADOR)
  })

  it('normaliza preferencias sensoriais antes de salvar no banco', async () => {
    await atualizarPreferenciasPerfil('responsavel-1', 'perfil-1', {
      som: 'sim',
      animacoes: false,
      altoContraste: true,
      alvosMaiores: 'true',
      tamanhoFonte: 'gigante',
    } as never)

    expect(updateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        preferenciasSensoriais: {
          som: true,
          animacoes: false,
          altoContraste: true,
          alvosMaiores: false,
          tamanhoFonte: 'normal',
        },
      }),
    )
  })

  it('normaliza campos basicos antes de criar perfil', async () => {
    await criarPerfil(
      'responsavel-1',
      ` ${'L'.repeat(LIMITE_NOME_PERFIL + 10)} `,
      'dragao',
      {
        interesseEspecialId: 'dinossauros',
      } as never,
    )

    expect(addDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        nome: 'L'.repeat(LIMITE_NOME_PERFIL),
        avatarId: 'circulo',
        interesseEspecialId: 'neutro',
      }),
    )
  })

  it('normaliza campos basicos ao ler perfil infantil', () => {
    const perfil = normalizarPerfilCrianca('perfil-1', {
      nome: '   ',
      avatarId: 'dragao',
      interesseEspecialId: 'dinossauros',
      atividadesDominadas: ['m0-n1-a1', 42, 'm0-n1-a1', '  m0-n1-a2  '],
    })

    expect(perfil).toEqual(
      expect.objectContaining({
        id: 'perfil-1',
        nome: 'Criança',
        avatarId: 'circulo',
        interesseEspecialId: 'neutro',
        atividadesDominadas: ['m0-n1-a1', 'm0-n1-a2'],
      }),
    )
  })

  it('normaliza interesse antes de salvar no banco', async () => {
    await atualizarInteressePerfil(
      'responsavel-1',
      'perfil-1',
      'dinossauros' as never,
    )

    expect(updateDoc).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        interesseEspecialId: 'neutro',
      }),
    )
  })

  it('normaliza colaboradores ao ler perfil infantil: descarta invalidos, duplica e limita a 3', () => {
    const perfil = normalizarPerfilCrianca('perfil-1', {
      colaboradoresEmail: [
        'Terapeuta@Exemplo.com',
        'terapeuta@exemplo.com',
        'segundo@exemplo.com',
        'nao-e-email',
        42,
        'terceiro@exemplo.com',
        'quarto@exemplo.com',
      ],
    })

    expect(perfil.colaboradoresEmail).toEqual([
      'terapeuta@exemplo.com',
      'segundo@exemplo.com',
      'terceiro@exemplo.com',
    ])
  })

  it('normaliza perfil sem colaboradores para lista vazia', () => {
    const perfil = normalizarPerfilCrianca('perfil-1', {})
    expect(perfil.colaboradoresEmail).toEqual([])
  })
})

describe('emailColaboradorValido', () => {
  it('aceita e-mail com formato basico valido', () => {
    expect(emailColaboradorValido('terapeuta@exemplo.com')).toBe(true)
  })

  it('rejeita string sem @ ou sem dominio', () => {
    expect(emailColaboradorValido('nao-e-email')).toBe(false)
    expect(emailColaboradorValido('sem-dominio@')).toBe(false)
  })

  it('rejeita e-mail acima do limite', () => {
    const grande = `${'a'.repeat(160)}@exemplo.com`
    expect(emailColaboradorValido(grande)).toBe(false)
  })
})

describe('adicionarColaborador', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('normaliza e-mail e usa arrayUnion ao adicionar colaborador', async () => {
    await adicionarColaborador(
      'responsavel-1',
      'perfil-1',
      '  Terapeuta@Exemplo.COM  ',
    )

    expect(arrayUnion).toHaveBeenCalledWith('terapeuta@exemplo.com')
    expect(updateDoc).toHaveBeenCalled()
  })

  it('rejeita e-mail invalido antes de escrever no banco', async () => {
    await expect(
      adicionarColaborador('responsavel-1', 'perfil-1', 'nao-e-email'),
    ).rejects.toThrow()

    expect(updateDoc).not.toHaveBeenCalled()
  })
})

describe('removerColaborador', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('normaliza e-mail e usa arrayRemove ao remover colaborador', async () => {
    await removerColaborador(
      'responsavel-1',
      'perfil-1',
      '  Terapeuta@Exemplo.COM  ',
    )

    expect(arrayRemove).toHaveBeenCalledWith('terapeuta@exemplo.com')
    expect(updateDoc).toHaveBeenCalled()
  })
})

describe('LIMITE_COLABORADORES', () => {
  it('e 3', () => {
    expect(LIMITE_COLABORADORES).toBe(3)
  })
})
