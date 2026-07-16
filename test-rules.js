import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { updateDoc, doc, setDoc, arrayUnion } from 'firebase/firestore';
import fs from 'fs';

async function run() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'non-s-firebase-20260621',
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });

  const authCtx = testEnv.authenticatedContext('responsavel-1');
  const db = authCtx.firestore();

  // Create a valid profile first!
  const perfilId = 'perfil-1';
  const docRef = doc(db, 'responsaveis', 'responsavel-1', 'perfisCrianca', perfilId);
  
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'responsaveis', 'responsavel-1', 'perfisCrianca', perfilId), {
      nome: 'Criança 1',
      avatarId: 'estrela',
      interesseEspecialId: 'neutro',
      perfilApoio: {
        comunicacaoPreferencial: 'figuras',
        acessoPreferencial: 'escolha-mediada',
        regulacaoPreferencial: 'ambiente-calmo',
        limiteTentativasAntesPausa: 5,
        cartoesComunicacao: [],
        planoRegulacao: {
          sinaisPausa: 'cobre os ouvidos',
          estrategiasAjudam: 'fone e luz baixa',
          evitarDuranteSobrecarga: 'muitas perguntas'
        },
        observacoes: ''
      },
      preferenciasSensoriais: {},
      planoIndividual: {
        metaAtual: '',
        apoioPreferencial: 'visual',
        observacaoMediador: ''
      },
      atividadesDominadas: [],
      colaboradoresEmail: [],
      criadoEm: new Date()
    });
  });

  // Now try to update it using the authenticated context
  try {
    await assertSucceeds(updateDoc(docRef, { atividadesDominadas: arrayUnion('m0-n1-a1') }));
    console.log("SUCESSO!");
  } catch (e) {
    console.log("FALHA AO ATUALIZAR:", e.message);
  }

  await testEnv.cleanup();
}

run();
