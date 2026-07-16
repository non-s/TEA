import { initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { readFileSync } from 'fs'

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'demo-tea',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  })

  const dono = testEnv.authenticatedContext('dono-uid', {
    email: 'dono@example.com',
    email_verified: true,
  })

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore()
    await db.doc('responsaveis/dono-uid').set({
      nome: 'Dono',
      email: 'dono@example.com',
      consentimentoPrivacidade: {
        versao: 1,
        escopo: 'uso-alfabetizacao-tea-v1',
        aceitoEm: new Date(),
      },
    })
    await db.doc('responsaveis/dono-uid/perfisCrianca/perfil-1').set({
      nome: 'Crianca',
      avatarId: 'circulo',
      interesseEspecialId: 'neutro',
      perfilApoio: {
        comunicacaoPreferencial: 'fala',
        acessoPreferencial: 'toque-direto',
        regulacaoPreferencial: 'pausa',
        limiteTentativasAntesPausa: 5,
        cartoesComunicacao: [
          { id: 'pausa', rotulo: 'pausa', fala: 'pausa', apoio: 'pausa' },
          { id: 'ajuda', rotulo: 'ajuda', fala: 'ajuda', apoio: 'ajuda' },
          {
            id: 'nao-sei',
            rotulo: 'nao-sei',
            fala: 'nao-sei',
            apoio: 'nao-sei',
          },
          { id: 'pronto', rotulo: 'pronto', fala: 'pronto', apoio: 'pronto' },
        ],
        planoRegulacao: {
          sinaisPausa: '',
          estrategiasAjudam: '',
          evitarDuranteSobrecarga: '',
        },
        observacoes: '',
      },
      preferenciasSensoriais: {
        som: true,
        animacoes: true,
        altoContraste: false,
        alvosMaiores: false,
        tamanhoFonte: 'normal',
      },
      planoIndividual: {
        metaAtual: '',
        apoioPreferencial: 'visual',
        observacaoMediador: '',
      },
      atividadesDominadas: [],
    })
  })

  const db = dono.firestore()
  try {
    await db.doc('responsaveis/dono-uid/perfisCrianca/perfil-1').update({
      atividadesDominadas: ['m0-n1-a1'],
    })
    console.log('SUCCESS!')
  } catch (e) {
    console.error('ERROR:', e)
  }

  await testEnv.cleanup()
}

run()
