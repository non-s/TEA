import { describe, expect, it } from 'vitest'
import { trilhaV1 } from './trilha-v1'
import type { Trilha } from './tipos'
import { validarTrilha } from './validacaoTrilha'

function clonarTrilha(trilha: Trilha): Trilha {
  return JSON.parse(JSON.stringify(trilha)) as Trilha
}

function codigosDaTrilha(trilha: Trilha): string[] {
  return validarTrilha(trilha).map((problema) => problema.codigo)
}

describe('validarTrilha', () => {
  it('aceita a trilha v1 sem problemas estruturais ou pedagogicos', () => {
    expect(validarTrilha(trilhaV1)).toEqual([])
  })

  it('detecta atividade duplicada', () => {
    const trilha = clonarTrilha(trilhaV1)
    trilha.modulos[1].atividades[0].id = trilha.modulos[0].atividades[0].id

    expect(codigosDaTrilha(trilha)).toContain('ATIVIDADE_DUPLICADA')
  })

  it('detecta palavra formada por silaba ainda nao ensinada', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[6].atividades[0]
    atividade.resposta.rotulo = 'CAMA'
    atividade.resposta.audioTexto = 'CA-MA, CAMA'

    expect(codigosDaTrilha(trilha)).toContain('PALAVRA_COM_SILABA_NAO_ENSINADA')
  })

  it('detecta frase com palavra ainda nao ensinada', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[7].atividades[0]
    atividade.resposta.rotulo = 'A CASA'
    atividade.resposta.audioTexto = 'A casa'

    expect(codigosDaTrilha(trilha)).toContain('FRASE_COM_PALAVRA_NAO_ENSINADA')
  })

  it('detecta compreensao de frase com palavra-resposta ainda nao ensinada', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[8].atividades[0]
    atividade.resposta.rotulo = 'CASA'
    atividade.resposta.audioTexto = 'CA-SA, CASA'

    expect(codigosDaTrilha(trilha)).toContain(
      'COMPREENSAO_COM_PALAVRA_NAO_ENSINADA',
    )
  })

  it('detecta compreensao de texto com palavra ainda nao ensinada', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[9].atividades[0]
    atividade.alvo.rotulo = 'A MALA. A CASA.'

    expect(codigosDaTrilha(trilha)).toContain('TEXTO_COM_PALAVRA_NAO_ENSINADA')

    atividade.alvo.rotulo = 'A MALA. A BALA.'
    atividade.resposta.rotulo = 'CASA'

    expect(codigosDaTrilha(trilha)).toContain(
      'COMPREENSAO_TEXTO_COM_PALAVRA_NAO_ENSINADA',
    )
  })

  it('detecta pergunta literal de texto incompleta ou fora do repertorio', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[10].atividades[0]
    atividade.alvo.rotulo = 'A MALA. A CASA.'
    atividade.pergunta = ''

    const codigosTextoInvalido = codigosDaTrilha(trilha)
    expect(codigosTextoInvalido).toContain(
      'PERGUNTA_TEXTO_COM_PALAVRA_NAO_ENSINADA',
    )
    expect(codigosTextoInvalido).toContain('PERGUNTA_TEXTO_SEM_PERGUNTA')

    atividade.alvo.rotulo = 'A MALA. A BALA.'
    atividade.pergunta = 'O que apareceu primeiro?'
    atividade.resposta.rotulo = 'CASA'

    expect(codigosDaTrilha(trilha)).toContain(
      'PERGUNTA_TEXTO_RESPOSTA_NAO_ENSINADA',
    )
  })

  it('detecta pergunta de presenca/ausencia ambigua ou fora do repertorio', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[11].atividades[0]
    atividade.pergunta = ''
    atividade.respostaDeveAparecerNoTexto = undefined
    atividade.resposta.rotulo = 'CASA'

    const codigosIncompletos = codigosDaTrilha(trilha)
    expect(codigosIncompletos).toContain('PERGUNTA_PRESENCA_TEXTO_SEM_PERGUNTA')
    expect(codigosIncompletos).toContain(
      'PERGUNTA_PRESENCA_TEXTO_MODO_INVALIDO',
    )
    expect(codigosIncompletos).toContain(
      'PERGUNTA_PRESENCA_TEXTO_RESPOSTA_NAO_ENSINADA',
    )

    atividade.pergunta = 'Qual palavra apareceu no texto?'
    atividade.resposta.rotulo = 'LATA'
    atividade.respostaDeveAparecerNoTexto = true

    expect(codigosDaTrilha(trilha)).toContain(
      'PERGUNTA_PRESENCA_TEXTO_RESPOSTA_DEVERIA_APARECER',
    )

    atividade.resposta.rotulo = 'MALA'
    atividade.respostaDeveAparecerNoTexto = false

    expect(codigosDaTrilha(trilha)).toContain(
      'PERGUNTA_PRESENCA_TEXTO_RESPOSTA_DEVERIA_NAO_APARECER',
    )
  })

  it('detecta pergunta de inferencia incompleta ou fora do texto ancora', () => {
    const trilha = clonarTrilha(trilhaV1)
    const atividade = trilha.modulos[12].atividades[0]
    atividade.alvo.rotulo = 'A MALA. A CASA.'
    atividade.pergunta = ''
    atividade.resposta.rotulo = 'CASA'

    const codigosInvalidos = codigosDaTrilha(trilha)
    expect(codigosInvalidos).toContain(
      'PERGUNTA_INFERENCIA_TEXTO_COM_PALAVRA_NAO_ENSINADA',
    )
    expect(codigosInvalidos).toContain('PERGUNTA_INFERENCIA_TEXTO_SEM_PERGUNTA')
    expect(codigosInvalidos).toContain(
      'PERGUNTA_INFERENCIA_TEXTO_RESPOSTA_NAO_ENSINADA',
    )

    atividade.alvo.rotulo = 'A MALA. A BALA.'
    atividade.pergunta = 'Qual palavra é de levar coisas?'
    atividade.resposta.rotulo = 'LATA'

    expect(codigosDaTrilha(trilha)).toContain(
      'PERGUNTA_INFERENCIA_TEXTO_RESPOSTA_FORA_DO_TEXTO',
    )
  })

  it('detecta dica fora da ordem pedagogica most-to-least', () => {
    const trilha = clonarTrilha(trilhaV1)
    trilha.modulos[0].atividades[0].dicas[0].tipo = 'nenhuma'

    expect(codigosDaTrilha(trilha)).toContain('DICA_FORA_DA_ORDEM_PEDAGOGICA')
  })

  it('detecta criterio de dominio fraco ou incoerente', () => {
    const trilha = clonarTrilha(trilhaV1)
    trilha.modulos[0].atividades[0].criteriosDominio = {
      acertosConsecutivosNecessarios: 0,
      janelaTentativas: -1,
    }

    const codigos = codigosDaTrilha(trilha)
    expect(codigos).toContain('CRITERIO_DOMINIO_FRACO')
    expect(codigos).toContain('JANELA_DOMINIO_INVALIDA')
  })
})
