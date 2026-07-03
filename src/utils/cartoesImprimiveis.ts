import {
  conteudoPausaPreferencial,
  conteudoRoteiroPausa,
} from '../curriculo/apoioPreferencial'
import {
  motivoComunicacaoPorInteresse,
  simbolosCartaoComunicacao,
} from '../curriculo/cartoesComunicacao'
import { itensPlanoRegulacao } from '../curriculo/perfilApoio'
import type { RelatorioProgresso } from '../curriculo/relatorioProgresso'
import type { Atividade, Estimulo } from '../curriculo/tipos'
import type { PerfilCrianca } from '../firebase/perfis'
import { nomeArquivoLocalPrivado } from './nomesArquivosPrivados'

interface CriarCartoesImprimiveisParams {
  perfil: PerfilCrianca
  relatorio: RelatorioProgresso
  geradoEm: string
}

function dataCurta(timestampOuIso: number | string): string {
  const data = new Date(timestampOuIso)
  if (Number.isNaN(data.getTime())) return 'data não informada'
  return data.toLocaleDateString('pt-BR')
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function atividadeFoco(relatorio: RelatorioProgresso): Atividade | null {
  return (
    relatorio.proximaAtividade ?? relatorio.revisaoEspacada?.atividade ?? null
  )
}

function instrucaoMediador(atividade: Atividade | null): string {
  if (!atividade) {
    return 'Escolha uma habilidade já dominada e pratique em bloco curto, com pausa disponível.'
  }

  switch (atividade.tipo) {
    case 'emparelhamento-identico':
      return `Mostre o modelo "${atividade.alvo.rotulo}" e ofereça poucas opções para encontrar o igual.`
    case 'emparelhamento-categoria':
      return `Mostre "${atividade.alvo.rotulo}" e peça a opção que combina com a mesma letra.`
    case 'nomeacao-receptiva':
      return `Diga "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}" e ofereça as letras para seleção.`
    case 'nomeacao-expressiva':
      return `Mostre a letra e aceite resposta por fala, gesto, olhar, toque, CAA ou escolha mediada.`
    case 'formacao-silaba':
      return `Diga "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}" e ofereça sílabas para seleção.`
    case 'formacao-palavra':
      return `Diga "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}" e ofereça palavras para seleção.`
    case 'leitura-frase':
      return `Leia "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}" e ofereça frases curtas para seleção.`
    case 'compreensao-frase':
      return `Leia "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}" e ofereça palavras conhecidas para seleção.`
    case 'compreensao-texto':
      return `Leia o texto curto "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}" e ofereça palavras conhecidas para seleção.`
    case 'pergunta-literal-texto':
      return `Leia o texto curto "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}", faça a pergunta "${atividade.pergunta ?? 'O que apareceu no texto?'}" e ofereça palavras conhecidas para seleção.`
    case 'pergunta-presenca-texto':
      return `Leia o texto curto "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}", faça a pergunta "${atividade.pergunta ?? 'Qual palavra apareceu?'}" e ofereça palavras conhecidas para seleção.`
    case 'pergunta-inferencia-texto':
      return `Leia o texto curto "${atividade.alvo.audioTexto ?? atividade.alvo.rotulo}", faça a pergunta "${atividade.pergunta ?? 'Qual palavra combina?'}" e ofereça palavras conhecidas para seleção.`
  }
}

function cartaoOpcao(opcao: Estimulo): string {
  return `<article class="card option"><span>${escaparHtml(opcao.rotulo)}</span></article>`
}

function cartoesAtividade(atividade: Atividade | null): string {
  if (!atividade) {
    return `
      <article class="card target">
        <small>Escolha</small>
        <span>Revisão leve</span>
      </article>
    `
  }

  const opcoes = [atividade.resposta, ...atividade.distratores]
  return `
    <article class="card target">
      <small>Modelo</small>
      <span>${escaparHtml(atividade.alvo.rotulo)}</span>
      <em>${escaparHtml(atividade.alvo.audioTexto ?? atividade.alvo.rotulo)}</em>
    </article>
    ${
      atividade.pergunta
        ? `<article class="card target"><small>Pergunta</small><span>${escaparHtml(atividade.pergunta)}</span></article>`
        : ''
    }
    ${opcoes.map(cartaoOpcao).join('\n')}
  `
}

export function nomeArquivoCartoesImprimiveis(
  _perfil: PerfilCrianca,
  data: Date,
): string {
  return nomeArquivoLocalPrivado('cartoes-pratica', data, 'html')
}

export function criarCartoesImprimiveis({
  perfil,
  relatorio,
  geradoEm,
}: CriarCartoesImprimiveisParams): string {
  const foco = atividadeFoco(relatorio)
  const cartoesComunicacao = perfil.perfilApoio.cartoesComunicacao
  const motivoComunicacao = motivoComunicacaoPorInteresse(
    perfil.interesseEspecialId,
  )
  const planoRegulacao = itensPlanoRegulacao(perfil.perfilApoio.planoRegulacao)
  const pausaACada = perfil.perfilApoio.limiteTentativasAntesPausa
  const pausaRoteiro = conteudoRoteiroPausa(
    perfil.planoIndividual.apoioPreferencial,
    perfil.perfilApoio.regulacaoPreferencial,
  )
  const pausaPreferencial = conteudoPausaPreferencial(
    perfil.planoIndividual.apoioPreferencial,
    perfil.perfilApoio.regulacaoPreferencial,
  )

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Cartões de prática - ${escaparHtml(perfil.nome)}</title>
  <style>
    :root {
      color: #2c2a33;
      background: #fff;
      font-family: system-ui, "Segoe UI", sans-serif;
    }
    body {
      margin: 0;
      padding: 24px;
    }
    main {
      display: grid;
      gap: 24px;
      max-width: 960px;
      margin: 0 auto;
    }
    h1, h2, p {
      margin: 0;
    }
    h1 {
      font-size: 28px;
    }
    h2 {
      font-size: 18px;
      margin-bottom: 12px;
    }
    .muted {
      color: #5b5866;
      line-height: 1.5;
    }
    .section {
      border: 2px solid #ddd8d0;
      border-radius: 12px;
      padding: 18px;
      break-inside: avoid;
    }
    .routine,
    .cards,
    .communication {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }
    .step,
    .card {
      min-height: 112px;
      border: 2px solid #2c2a33;
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 8px;
      text-align: center;
      page-break-inside: avoid;
    }
    .step {
      border-style: dashed;
    }
    .card span,
    .step strong {
      font-size: 28px;
      font-weight: 700;
      line-height: 1.15;
      overflow-wrap: anywhere;
    }
    .card small,
    .step small {
      color: #5b5866;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: .04em;
    }
    .card em {
      color: #5b5866;
      font-style: normal;
      font-size: 14px;
    }
    .target {
      background: #dce8f0;
    }
    .communication .card span {
      font-size: 22px;
    }
    .communication-card .symbol {
      position: relative;
      width: 56px;
      height: 56px;
      border: 2px solid #2c2a33;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      line-height: 1;
    }
    .interest-motif {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 24px;
      height: 24px;
      border: 1px solid #2c2a33;
      border-radius: 999px;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      line-height: 1;
    }
    .answer {
      font-size: 14px;
      line-height: 1.5;
    }
    .regulation {
      margin: 12px 0 0;
      padding-left: 18px;
      color: #2c2a33;
      line-height: 1.5;
    }
    @media print {
      body {
        padding: 10mm;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Cartões de prática - ${escaparHtml(perfil.nome)}</h1>
      <p class="muted">Gerado em ${escaparHtml(dataCurta(geradoEm))}. Arquivo local para imprimir, recortar ou usar na tela da família.</p>
    </header>

    <section class="section">
      <h2>Habilidade-alvo</h2>
      <p><strong>${escaparHtml(foco?.alvo.rotulo ?? 'Revisão leve')}</strong></p>
      <p class="muted">${escaparHtml(instrucaoMediador(foco))}</p>
      <p class="answer">Pausa/regulação sugerida: ${escaparHtml(pausaPreferencial.textoPausa)} Oferecer por volta de ${pausaACada} respostas ou antes se houver sinal de sobrecarga.</p>
      ${
        planoRegulacao.length > 0
          ? `<ul class="regulation">${planoRegulacao
              .map(
                (item) =>
                  `<li><strong>${escaparHtml(item.rotulo)}:</strong> ${escaparHtml(item.texto)}</li>`,
              )
              .join('')}</ul>`
          : ''
      }
    </section>

    <section class="section">
      <h2>Roteiro visual</h2>
      <div class="routine">
        <article class="step"><small>Agora</small><strong>Ver</strong></article>
        <article class="step"><small>Depois</small><strong>Escolher</strong></article>
        <article class="step"><small>${escaparHtml(pausaRoteiro.detalhe)}</small><strong>${escaparHtml(pausaRoteiro.titulo)}</strong></article>
        <article class="step"><small>Fim</small><strong>Terminar</strong></article>
      </div>
    </section>

    <section class="section">
      <h2>Cartões da atividade</h2>
      <div class="cards">
        ${cartoesAtividade(foco)}
      </div>
      ${
        foco
          ? `<p class="answer">Gabarito para o mediador: ${escaparHtml(foco.resposta.rotulo)}.</p>`
          : ''
      }
    </section>

    <section class="section">
      <h2>Comunicação e regulação</h2>
      <div class="communication">
        ${cartoesComunicacao
          .map(
            (cartao) => `
              <article class="card communication-card">
                <strong class="symbol">${escaparHtml(simbolosCartaoComunicacao[cartao.id])}${
                  motivoComunicacao
                    ? `<span class="interest-motif" aria-hidden="true">${escaparHtml(motivoComunicacao.simbolo)}</span>`
                    : ''
                }</strong>
                <small>${escaparHtml(cartao.rotulo)}</small>
                <span>${escaparHtml(cartao.fala)}</span>
                <em>${escaparHtml(cartao.apoio)}</em>
              </article>
            `,
          )
          .join('\n')}
      </div>
    </section>

    <p class="muted no-print">Use o comando de impressão do navegador para salvar em PDF ou imprimir. Compartilhe apenas se a família quiser.</p>
  </main>
</body>
</html>`
}
