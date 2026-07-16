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

    expect(trilhaV1.modulos).toHaveLength(11)
    expect(
      trilhaV1.modulos.reduce(
        (total, modulo) => total + modulo.atividades.length,
        0,
      ),
    ).toBe(277)
    expect(moduloSilabas?.atividades).toHaveLength(50)
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
    expect(moduloSilabas?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm4-DA',
        tipo: 'formacao-silaba',
        resposta: expect.objectContaining({
          rotulo: 'DA',
          audioTexto: 'DA, de dado',
        }),
      }),
    )
    expect(moduloPalavras?.atividades).toHaveLength(39)
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
    expect(moduloPalavras?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm5-DADO',
        tipo: 'formacao-palavra',
        resposta: expect.objectContaining({
          rotulo: 'DADO',
          audioTexto: 'DA-DO, DADO',
        }),
      }),
    )
    expect(moduloFrases?.preRequisitoModuloId).toBe('m5')
    expect(moduloFrases?.atividades).toHaveLength(39)
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
    expect(moduloFrases?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm6-O-DADO',
        tipo: 'leitura-frase',
        resposta: expect.objectContaining({ rotulo: 'O DADO' }),
      }),
    )
    expect(moduloCompreensao?.preRequisitoModuloId).toBe('m6')
    expect(moduloCompreensao?.atividades).toHaveLength(39)
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
    expect(moduloCompreensao?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm7-A-VIDA',
        tipo: 'compreensao-frase',
        resposta: expect.objectContaining({ rotulo: 'VIDA' }),
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
    expect(moduloPerguntas?.atividades).toHaveLength(45)
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
    expect(moduloPerguntas?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm9-presenca-Qual-palavra-nao-apareceu-no-texto-A-MALA-A-BALA',
        tipo: 'pergunta-presenca-texto',
        pergunta: 'Qual palavra não apareceu no texto?',
        resposta: expect.objectContaining({ rotulo: 'LATA' }),
        respostaDeveAparecerNoTexto: false,
      }),
    )
    expect(moduloPerguntas?.atividades).toContainEqual(
      expect.objectContaining({
        id: 'm9-inferencia-Qual-palavra-e-de-levar-coisas-A-MALA-A-BALA',
        tipo: 'pergunta-inferencia-texto',
        pergunta: 'Qual palavra é de levar coisas?',
        resposta: expect.objectContaining({ rotulo: 'MALA' }),
      }),
    )
    expect(
      moduloPerguntas?.atividades.filter(
        (atividade) => atividade.tipo === 'pergunta-literal-texto',
      ),
    ).toHaveLength(15)
    expect(
      moduloPerguntas?.atividades.filter(
        (atividade) => atividade.tipo === 'pergunta-presenca-texto',
      ),
    ).toHaveLength(22)
    expect(
      moduloPerguntas?.atividades.filter(
        (atividade) => atividade.tipo === 'pergunta-inferencia-texto',
      ),
    ).toHaveLength(8)
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
    expect(encontrarAtividade('m5-NOTA')).toEqual(
      expect.objectContaining({
        moduloId: 'm5',
        tipo: 'formacao-palavra',
        resposta: expect.objectContaining({
          rotulo: 'NOTA',
          audioTexto: 'NO-TA, NOTA',
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
      encontrarAtividade(
        'm9-presenca-Qual-palavra-apareceu-no-texto-O-MAPA-A-MALA',
      ),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm9',
        tipo: 'pergunta-presenca-texto',
        pergunta: 'Qual palavra apareceu no texto?',
        resposta: expect.objectContaining({ rotulo: 'MAPA' }),
        respostaDeveAparecerNoTexto: true,
      }),
    )
    expect(
      encontrarAtividade(
        'm9-presenca-Qual-palavra-nao-apareceu-no-texto-A-MOTO-A-PIPA',
      ),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm9',
        tipo: 'pergunta-presenca-texto',
        pergunta: 'Qual palavra não apareceu no texto?',
        resposta: expect.objectContaining({ rotulo: 'POTE' }),
        respostaDeveAparecerNoTexto: false,
      }),
    )
    expect(
      encontrarAtividade(
        'm9-inferencia-Qual-palavra-anda-na-rua-A-MOTO-A-PIPA',
      ),
    ).toEqual(
      expect.objectContaining({
        moduloId: 'm9',
        tipo: 'pergunta-inferencia-texto',
        pergunta: 'Qual palavra anda na rua?',
        resposta: expect.objectContaining({ rotulo: 'MOTO' }),
      }),
    )
  })
})
