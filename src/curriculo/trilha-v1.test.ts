import { describe, expect, it } from 'vitest'
import { encontrarAtividade, trilhaV1 } from './trilha-v1'

describe('trilhaV1', () => {
  it('inclui leitura, compreensao de frases e textos curtos apos palavras', () => {
    const moduloSilabas = trilhaV1.modulos.find((modulo) => modulo.id === 'm4')
    const moduloPalavras = trilhaV1.modulos.find((modulo) => modulo.id === 'm5')
    const moduloFrases = trilhaV1.modulos.find((modulo) => modulo.id === 'm6')
    const moduloCompreensao = trilhaV1.modulos.find(
      (modulo) => modulo.id === 'm7',
    )
    const moduloTextos = trilhaV1.modulos.find((modulo) => modulo.id === 'm8')
    const moduloPerguntas = trilhaV1.modulos.find(
      (modulo) => modulo.id === 'm9',
    )
    const moduloPresenca = trilhaV1.modulos.find(
      (modulo) => modulo.id === 'm10',
    )
    const moduloInferencia = trilhaV1.modulos.find(
      (modulo) => modulo.id === 'm11',
    )

    expect(trilhaV1.modulos).toHaveLength(13)
    expect(
      trilhaV1.modulos.reduce(
        (total, modulo) => total + modulo.atividades.length,
        0,
      ),
    ).toBe(191)
    expect(moduloSilabas?.atividades).toHaveLength(25)
    expect(moduloSilabas?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm4-MU',
        tipo: 'formacao-silaba',
        resposta: expect.objectContaining({
          rotulo: 'MU',
          audioTexto: 'MU, de música',
        }),
      }),
    )
    expect(moduloPalavras?.atividades).toHaveLength(22)
    expect(moduloPalavras?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm5-MOTO',
        tipo: 'formacao-palavra',
        resposta: expect.objectContaining({
          rotulo: 'MOTO',
          audioTexto: 'MO-TO, MOTO',
        }),
      }),
    )
    expect(moduloFrases?.preRequisitoModuloId).toBe('m5')
    expect(moduloFrases?.atividades).toHaveLength(22)
    expect(moduloFrases?.atividades[0]).toEqual(
      expect.objectContaining({
        id: 'm6-A-MALA',
        tipo: 'leitura-frase',
        resposta: expect.objectContaining({ rotulo: 'A MALA' }),
      }),
    )
    expect(moduloFrases?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm6-A-MOTO',
        tipo: 'leitura-frase',
        resposta: expect.objectContaining({ rotulo: 'A MOTO' }),
      }),
    )
    expect(moduloCompreensao?.preRequisitoModuloId).toBe('m6')
    expect(moduloCompreensao?.atividades).toHaveLength(22)
    expect(moduloCompreensao?.atividades[0]).toEqual(
      expect.objectContaining({
        id: 'm7-A-MALA',
        tipo: 'compreensao-frase',
        resposta: expect.objectContaining({ rotulo: 'MALA' }),
      }),
    )
    expect(moduloCompreensao?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm7-O-BEBE',
        tipo: 'compreensao-frase',
        resposta: expect.objectContaining({
          rotulo: 'BEBE',
          audioTexto: 'BE-BE, BEBE',
        }),
      }),
    )
    expect(moduloTextos?.preRequisitoModuloId).toBe('m7')
    expect(moduloTextos?.atividades).toHaveLength(15)
    expect(moduloTextos?.atividades[0]).toEqual(
      expect.objectContaining({
        id: 'm8-A-MALA-A-BALA',
        tipo: 'compreensao-texto',
        alvo: expect.objectContaining({ rotulo: 'A MALA. A BALA.' }),
        resposta: expect.objectContaining({ rotulo: 'MALA' }),
      }),
    )
    expect(moduloTextos?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm8-A-MOTO-A-PIPA',
        tipo: 'compreensao-texto',
        alvo: expect.objectContaining({ rotulo: 'A MOTO. A PIPA.' }),
        resposta: expect.objectContaining({ rotulo: 'MOTO' }),
      }),
    )
    expect(moduloPerguntas?.preRequisitoModuloId).toBe('m8')
    expect(moduloPerguntas?.atividades).toHaveLength(15)
    expect(moduloPerguntas?.atividades[0]).toEqual(
      expect.objectContaining({
        id: 'm9-O-que-apareceu-primeiro-A-MALA-A-BALA',
        tipo: 'pergunta-literal-texto',
        pergunta: 'O que apareceu primeiro?',
        resposta: expect.objectContaining({ rotulo: 'MALA' }),
      }),
    )
    expect(moduloPerguntas?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm9-O-que-apareceu-primeiro-A-MOTO-A-PIPA',
        tipo: 'pergunta-literal-texto',
        pergunta: 'O que apareceu primeiro?',
        resposta: expect.objectContaining({ rotulo: 'MOTO' }),
      }),
    )
    expect(moduloPresenca?.preRequisitoModuloId).toBe('m9')
    expect(moduloPresenca?.atividades).toHaveLength(22)
    expect(moduloPresenca?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm10-Qual-palavra-nao-apareceu-no-texto-A-MALA-A-BALA',
        tipo: 'pergunta-presenca-texto',
        pergunta: 'Qual palavra não apareceu no texto?',
        resposta: expect.objectContaining({ rotulo: 'LATA' }),
        respostaDeveAparecerNoTexto: false,
      }),
    )
    expect(moduloInferencia?.preRequisitoModuloId).toBe('m10')
    expect(moduloInferencia?.atividades).toHaveLength(8)
    expect(moduloInferencia?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm11-Qual-palavra-e-de-levar-coisas-A-MALA-A-BALA',
        tipo: 'pergunta-inferencia-texto',
        pergunta: 'Qual palavra é de levar coisas?',
        resposta: expect.objectContaining({ rotulo: 'MALA' }),
      }),
    )
  })

  it('encontra atividades de frase e texto pelo id', () => {
    expect(encontrarAtividade('m6-A-BALA')).toEqual(
      expect.objectContaining({
        moduloId: 'm6',
        tipo: 'leitura-frase',
        alvo: expect.objectContaining({ audioTexto: 'A bala' }),
      }),
    )
    expect(encontrarAtividade('m7-A-MALA')).toEqual(
      expect.objectContaining({
        moduloId: 'm7',
        tipo: 'compreensao-frase',
        resposta: expect.objectContaining({ rotulo: 'MALA' }),
      }),
    )
    expect(encontrarAtividade('m8-A-MALA-A-BALA')).toEqual(
      expect.objectContaining({
        moduloId: 'm8',
        tipo: 'compreensao-texto',
        alvo: expect.objectContaining({ audioTexto: 'A mala. A bala.' }),
      }),
    )
    expect(
      encontrarAtividade('m9-O-que-apareceu-primeiro-A-MALA-A-BALA'),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm9',
        tipo: 'pergunta-literal-texto',
        pergunta: 'O que apareceu primeiro?',
      }),
    )
    expect(encontrarAtividade('m5-MAPA')).toEqual(
      expect.objectContaining({
        moduloId: 'm5',
        tipo: 'formacao-palavra',
        resposta: expect.objectContaining({
          rotulo: 'MAPA',
          audioTexto: 'MA-PA, MAPA',
        }),
      }),
    )
    expect(encontrarAtividade('m5-BULE')).toEqual(
      expect.objectContaining({
        moduloId: 'm5',
        tipo: 'formacao-palavra',
        resposta: expect.objectContaining({
          rotulo: 'BULE',
          audioTexto: 'BU-LE, BULE',
        }),
      }),
    )
    expect(encontrarAtividade('m8-A-LAMA-A-PATA')).toEqual(
      expect.objectContaining({
        moduloId: 'm8',
        tipo: 'compreensao-texto',
        resposta: expect.objectContaining({ rotulo: 'LAMA' }),
      }),
    )
    expect(
      encontrarAtividade('m9-O-que-apareceu-depois-A-LAMA-A-PATA'),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm9',
        tipo: 'pergunta-literal-texto',
        pergunta: 'O que apareceu depois?',
        resposta: expect.objectContaining({ rotulo: 'PATA' }),
      }),
    )
    expect(
      encontrarAtividade('m10-Qual-palavra-apareceu-no-texto-O-MAPA-A-MALA'),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm10',
        tipo: 'pergunta-presenca-texto',
        pergunta: 'Qual palavra apareceu no texto?',
        resposta: expect.objectContaining({ rotulo: 'MAPA' }),
        respostaDeveAparecerNoTexto: true,
      }),
    )
    expect(
      encontrarAtividade(
        'm10-Qual-palavra-nao-apareceu-no-texto-A-MOTO-A-PIPA',
      ),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm10',
        tipo: 'pergunta-presenca-texto',
        pergunta: 'Qual palavra não apareceu no texto?',
        resposta: expect.objectContaining({ rotulo: 'POTE' }),
        respostaDeveAparecerNoTexto: false,
      }),
    )
    expect(
      encontrarAtividade('m11-Qual-palavra-anda-na-rua-A-MOTO-A-PIPA'),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm11',
        tipo: 'pergunta-inferencia-texto',
        pergunta: 'Qual palavra anda na rua?',
        resposta: expect.objectContaining({ rotulo: 'MOTO' }),
      }),
    )
  })
})
