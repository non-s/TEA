# TEA

Plataforma open source de **alfabetização para crianças com Transtorno do Espectro Autista (TEA)**, gratuita, em português do Brasil, embasada em práticas com evidência científica (NCAEP/NPDC, TEACCH, CAA/PECS, método fônico-silábico) e em princípios afirmativos da neurodiversidade.

🔗 **Usar agora:** https://non-s.github.io/TEA/

## Objetivo

Oferecer, de forma 100% gratuita e auditável, uma trilha de atividades de alfabetização pensada especificamente para crianças autistas — **qualquer que seja o nível de suporte que precisem** — com apoio visual forte, ensino sem erro, dicas com esmaecimento progressivo (prompt fading), nunca cronômetro ou punição, e configurações sensoriais (som, animação, contraste, tamanho de fonte) ajustáveis a qualquer momento.

O TEA não tem conta, login nem servidor: a criança digita um nome, escolhe um avatar e começa a estudar. Todo o progresso fica salvo só no navegador do aparelho usado — nada é enviado para nenhum lugar. Interface simples, ícones grandes, mínimo texto, nenhuma atividade exige fala para responder — pensada para a criança tocar/usar com um mediador por perto, mas acessível também a crianças não-verbais.

A fundamentação pedagógica completa, com referências científicas, está em [`docs/PEDAGOGIA.md`](docs/PEDAGOGIA.md).

## O que já dá para fazer na plataforma (v1)

- Abrir o app sem conta e sem login: digitar um nome, escolher avatar e começar a estudar na hora. Vários perfis (ex: irmãos) podem coexistir no mesmo aparelho, cada um com seu próprio progresso.
- Resumo público de privacidade dentro do app, explicando exatamente o que fica salvo no aparelho, o que nunca é coletado e por que não há uma base legal de LGPD a cumprir (nenhum dado sai do navegador). Termos de uso também públicos em `/termos`.
- Perfil funcional de apoio opcional na criação do perfil: comunicação preferida, forma de acesso à tela, estratégia de regulação e cartões de comunicação personalizáveis com símbolo visual estável e motivo complementar por interesse da criança; "Pausa", "Ajuda", "Não sei" e "Pronto" têm consequências funcionais na sessão.
- Modo mouse/teclado: quando esse acesso é escolhido, as opções de resposta mostram e aceitam teclas numéricas (`1`, `2`, `3`...), sem exigir precisão de toque na tela.
- Modo de toque com confirmação: o primeiro toque apenas seleciona a opção e a resposta só é registrada depois de "Confirmar", reduzindo erro por toque acidental ou baixa precisão motora.
- Modo de toque com apoio do mediador: o toque ou sinal observado também fica pendente até o adulto confirmar com a criança, evitando registrar dificuldade de acesso como erro pedagógico.
- Modo de resposta mediada: quando o perfil indica escolha por olhar/gesto, a atividade mostra uma opção por vez com controles para o mediador avançar/escolher; setas e Enter/Espaço também funcionam para teclado ou acionador.
- Trilha com **753 atividades em 12 módulos**: emparelhamento visual → maiúscula/minúscula → nomeação receptiva de letras → nomeação expressiva de letras → traçado de letras num guia pontilhado (módulo paralelo, não bloqueia os seguintes) → formação de sílabas CV (17 consoantes de alta frequência × 5 vogais, os dígrafos CH/LH/NH/QU/GU, os encontros consonantais com R e alguns com L, um primeiro grupo de ditongos orais, sílabas fechadas como "POR" e "CAR" e nasalização com M/N como "CAN" e "TEM") com apoio de palavra familiar (ex: "MA, de mamãe", "POR, de porta", "TEM, de tempo") → formação de palavras simples com duas sílabas conhecidas (quase 120 já cobertas) → **montagem de palavras** tocando as sílabas certas em ordem entre distratoras (módulo paralelo de escrita/codificação, acessível por toque) → leitura de frases curtas por seleção → compreensão literal de frase → compreensão literal de texto curto com duas frases → perguntas sobre o texto (literal, presença/ausência e inferência guiada, misturadas no mesmo módulo).
- Jardim de Conquistas: cada módulo da trilha vira um canteiro visual que floresce conforme a criança domina as atividades — sem pontuação, ranking ou cronômetro.
- Cada atividade usa dica com esmaecimento progressivo e critério de domínio (1 acerto já no nível independente, sem dica), reforço positivo imediato, nunca punição.
- O estado pedagógico de uma atividade é retomado pelo histórico salvo no aparelho, então uma pausa ou recarregamento não apaga acertos independentes recentes nem o nível de apoio necessário.
- A trilha da criança destaca um botão "Continuar" para a próxima atividade disponível e mantém aberto apenas o módulo em foco/revisão; módulos concluídos ficam resumidos e podem ser abertos sob demanda, reduzindo escolha excessiva sem remover a navegação livre.
- Ao concluir uma atividade, a criança/adulto pode voltar para a trilha ou abrir a próxima atividade calculada.
- Trocar de perfil (para outra criança no mesmo aparelho) pede confirmação adulta digitando `ADULTO`, com foco inicial em "Continuar na trilha", evitando saída acidental ou transição surpresa.
- Falhas inesperadas de renderização caem em uma tela segura e acessível ("Pausa segura"), com opção de tentar novamente ou voltar ao início, em vez de deixar a criança diante de uma tela em branco.
- Links quebrados ou rotas desconhecidas mostram uma página calma de caminho não encontrado, com retorno ao início.
- Navegação por teclado/leitor de tela com link "Pular para o conteúdo", título de página atualizado por rota e anúncio discreto da tela atual.
- A trilha também sugere revisões leves de atividades já dominadas quando ficam alguns dias sem prática, apoiando manutenção sem bloquear avanço.
- Cada atividade mantém um roteiro visual curto ("Agora", "Depois" e "Pausa") antes e durante a tarefa, com a pausa descrita conforme a regulação preferida do perfil, reforçando previsibilidade sem depender só de instrução verbal.
- Atividades de frase/texto acrescentam apoio de leitura compartilhada na preparação, lembrando o mediador de esperar resposta por olhar, gesto, toque, vocalização ou CAA antes da escolha.
- As atividades sugerem pausas em intervalos configuráveis por perfil, com convite, acordo visual de retorno ("primeiro/depois") e passos adaptados à regulação preferida (pausa, ambiente calmo, movimento ou alternância); depois de prática longa oferecem uma tela previsível de encerramento por agora, sem bloquear a criança nem desfazer progresso.
- Ajustes por aparelho: som, animação, alto contraste, tamanho de fonte e alvos maiores para toque/uso mediado — valem para todos os perfis daquele aparelho.
- Apagar um perfil (com confirmação pelo nome da criança) ou apagar todos os dados do aparelho de uma vez, na tela de Ajustes.
- Personalização inicial por interesse da criança (neutro, animais, veículos, casa, música, comida, brincar ou natureza), com descrição e exemplos, usada para adaptar palavras de apoio nas sílabas CV com A/E/I/O/U e acrescentar um motivo visual discreto nos cartões de comunicação sem mudar a habilidade ensinada.
- Instalável em celular/tablet e funciona 100% offline: manifest com nome/ícone/cor do app e service worker que guarda o código do app para abrir sem conexão; um aviso calmo aparece quando fica offline ou quando há uma versão nova para atualizar. Como todos os dados já ficam só no aparelho, funcionar offline não é um modo especial — é o comportamento normal do app.
- Auditoria de dependências e análise estática (CodeQL) rodam automaticamente a cada mudança de código.

Veja o que **não** está no v1 (e por quê) em [`docs/PEDAGOGIA.md`](docs/PEDAGOGIA.md#o-que-fica-fora-do-escopo-do-v1-documentado-para-não-virar-débito-técnico-silencioso).

## Stack técnica

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- Sem backend: todos os dados ficam no `localStorage` do navegador — sem servidor, sem banco de dados, sem custo de hospedagem além do site estático
- Hospedagem estática em [GitHub Pages](https://pages.github.com/), publicada via GitHub Actions
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + [axe-core](https://github.com/dequelabs/axe-core) para testes e acessibilidade automatizada

Decisões técnicas detalhadas em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md). Modelo de dados e postura de privacidade em [`docs/SEGURANCA.md`](docs/SEGURANCA.md).

## Rodando localmente

```bash
npm install
npm run dev
```

Não precisa de nenhuma conta, chave de API ou variável de ambiente — o app roda inteiramente no navegador desde o primeiro `npm run dev`.

Outros comandos úteis:

```bash
npm run lint     # lint com oxlint (inclui regras de acessibilidade)
npm run test     # testes com Vitest + verificação de acessibilidade (axe-core)
npm run build    # build de produção (mesmo processo usado no deploy)
npm run format   # formata o código com Prettier
```

## Roteiro

- [x] Marco 1 — Scaffold do projeto e deploy automático no GitHub Pages
- [x] Marco 2 — Base de qualidade (testes, acessibilidade automatizada, estrutura de pastas)
- [x] Marco 3 — Autenticação do responsável e perfis de criança (Firebase)
- [x] Marco 4 — Configurações sensoriais (som, animação, contraste, tamanho de fonte)
- [x] Marco 5 — Primeira atividade jogável (emparelhamento visual, Módulo 0)
- [x] Marco 6 — Voz (leitura em voz alta) e reforço positivo
- [x] Marco 7 — Currículo de reconhecimento de letras (maiúscula/minúscula, nomeação receptiva)
- [x] Marco 8 — Nomeação expressiva, sílabas e relatório de progresso para o responsável
- [x] Marco 9 — Documentação completa e release v1.0.0
- [x] Marco 10 — Palavras, frases curtas, comunicação funcional e generalização fora da tela
- [x] Marco 11 — Demonstração sem conta e compreensão literal de frases
- [x] Marco 12 — Textos curtos literais e rota segura para links quebrados
- [x] Marco 13 — Perguntas literais sobre textos curtos por seleção
- [x] Marco 14 — Expansão lexical e mais variação literal em frases/textos
- [x] Marco 15 — Perguntas de presença/ausência no texto com validação semântica
- [x] Marco 16 — Sílabas CV com A/E/I/O/U e vocabulário silábico ampliado
- [x] Marco 17 — Inferência guiada em textos curtos por seleção
- [x] Marco 18 — PWA instalável e funcional offline (service worker + aviso de conexão)
- [x] Marco 19 — Jardim de Conquistas (progresso visual por módulo, sem pontuação)
- [x] Marco 20 — Traçado de Letras (prática grafomotora, módulo paralelo não bloqueante)
- [x] Marco 21 — Resposta por voz opcional na nomeação expressiva
- [x] Marco 22 — Endurecimento de conta (verificação de e-mail, senha forte, auditoria automatizada em CI), política de privacidade com base legal LGPD, termos de uso e compartilhamento de perfil com um segundo responsável/terapeuta
- [x] Marco 23 — Visual mais lúdico e caloroso, alfabeto ampliado (+5 consoantes), critério de domínio simplificado para 1 acerto independente, remoção de voz e módulo de escrita (montagem de palavras)
- [x] Marco 24 — Migração completa para modelo sem conta: todo o backend Firebase (Auth + Firestore), telas do responsável (login, cadastro, gerenciar perfis, configurações, relatório de progresso, colaboradores) e integrações de e-mail/senha foram removidos. O app abre direto na tela de escolha/criação de perfil, e todo o progresso é salvo só no `localStorage` do aparelho — sem coleta de dado nenhum, sem exigência de consentimento LGPD

Próximos passos ficam documentados como ideias em aberto — compreensão aberta, novas famílias silábicas, personalização visual profunda por interesse especial da criança — não como promessas com prazo.

## Contribuindo

Contribuições são bem-vindas — incluindo de terapeutas, pedagogos, fonoaudiólogos, familiares e **pessoas autistas**, não só de programadores. Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) e o [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Licença

Código sob licença [MIT](LICENSE).
