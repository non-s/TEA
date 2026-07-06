# TEA

Plataforma open source de **alfabetização para crianças com Transtorno do Espectro Autista (TEA)**, gratuita, em português do Brasil, embasada em práticas com evidência científica (NCAEP/NPDC, TEACCH, CAA/PECS, método fônico-silábico) e em princípios afirmativos da neurodiversidade.

🔗 **Demo:** https://non-s.github.io/TEA/

## Objetivo

Oferecer, de forma 100% gratuita e auditável, uma trilha de atividades de alfabetização pensada especificamente para crianças autistas — **qualquer que seja o nível de suporte que precisem** — com apoio visual forte, ensino sem erro, dicas com esmaecimento progressivo (prompt fading), nunca cronômetro ou punição, e configurações sensoriais (som, animação, contraste, tamanho de fonte) que a família ajusta.

A plataforma tem dois modos de uso:

- **Modo criança**: interface simples, ícones grandes, mínimo texto, nenhuma atividade exige fala para responder — pensada para a criança tocar/usar com um mediador por perto, mas acessível também a crianças não-verbais.
- **Modo responsável**: login completo, gerenciamento de perfis dos filhos, configurações sensoriais e relatório de progresso por módulo.

A fundamentação pedagógica completa, com referências científicas, está em [`docs/PEDAGOGIA.md`](docs/PEDAGOGIA.md).

## O que já dá para fazer na plataforma (v1)

- Criar conta com consentimento explícito do responsável para uso dos dados mínimos, e criar um ou mais perfis de criança (sem senha para a criança — ela só escolhe seu avatar).
- Resumo público de privacidade dentro do app, explicando quais dados são guardados, quais não são pedidos, para que servem, como exportar/apagar e quando evitar cache offline.
- Demonstração pública com etapas visual, sílaba e texto, além de toque direto, confirmação, escolha mediada e interesse da criança, sem conta, sem salvar dados pessoais nem tentativas, para a família experimentar antes de decidir criar cadastro.
- Instalável em celular/tablet e funciona offline: manifest com nome/ícone/cor do app e service worker que guarda o código do app (não os dados da família) para abrir sem conexão; um aviso calmo aparece quando fica offline ou quando há uma versão nova para atualizar. O cache dos dados do Firestore continua sendo opt-in separado (ver abaixo).
- Suporte opcional a Firebase App Check com reCAPTCHA v3, para adicionar uma camada contra abuso automatizado do backend público quando o ambiente de produção tiver chave e enforcement configurados no Console do Firebase.
- Cooldown local após falhas repetidas de login, reduzindo tentativas em sequência e mensagens frustrantes antes do próprio Firebase aplicar limites.
- Perfil funcional de apoio na criação e no progresso: comunicação preferida, forma de acesso à tela, estratégia de regulação, plano curto de regulação, observação curta e cartões de comunicação personalizáveis com símbolo visual estável e motivo complementar por interesse da criança; "Pausa", "Ajuda", "Não sei" e "Pronto" têm consequências funcionais na sessão.
- Modo mouse/teclado: quando esse acesso é escolhido, as opções de resposta mostram e aceitam teclas numéricas (`1`, `2`, `3`...), sem exigir precisão de toque na tela.
- Modo de toque com confirmação: o primeiro toque apenas seleciona a opção e a resposta só é registrada depois de "Confirmar", reduzindo erro por toque acidental ou baixa precisão motora.
- Modo de toque com apoio do mediador: o toque ou sinal observado também fica pendente até o adulto confirmar com a criança, evitando registrar dificuldade de acesso como erro pedagógico.
- Modo de resposta mediada: quando o perfil indica escolha por olhar/gesto, a atividade mostra uma opção por vez com controles para o mediador avançar/escolher; setas e Enter/Espaço também funcionam para teclado ou acionador.
- Trilha com **191 atividades em 13 módulos**: emparelhamento visual → maiúscula/minúscula → nomeação receptiva de letras → nomeação expressiva de letras (por toque ou por voz opcional) → traçado de letras num guia pontilhado (módulo paralelo, não bloqueia os seguintes) → formação de sílabas CV com A/E/I/O/U e apoio de palavra familiar (ex: "MA, de mamãe", "MU, de música") → formação de palavras simples com duas sílabas conhecidas → leitura de frases curtas por seleção → compreensão literal de frase → compreensão literal de texto curto com duas frases → pergunta literal sobre texto curto → presença/ausência de palavra no texto → inferência guiada por seleção.
- Resposta por voz opcional na nomeação expressiva: quando o navegador suporta e a família ativa por dispositivo em Configurações, a criança pode falar o nome da letra em vez de tocar — a opção de toque nunca é removida.
- Jardim de Conquistas: cada módulo da trilha vira um canteiro visual que floresce conforme a criança domina as atividades — sem pontuação, ranking ou cronômetro.
- Cada atividade usa dica com esmaecimento progressivo e critério de domínio (8 acertos seguidos independente), reforço positivo imediato, nunca punição.
- O estado pedagógico de uma atividade é retomado pelo histórico salvo, então uma pausa ou recarregamento não apaga acertos independentes recentes nem o nível de apoio necessário.
- A trilha da criança destaca um botão "Continuar" para a próxima atividade disponível e mantém aberto apenas o módulo em foco/revisão; módulos concluídos ficam resumidos e podem ser abertos sob demanda, reduzindo escolha excessiva sem remover a navegação livre.
- Ao concluir uma atividade, a criança/adulto pode voltar para a trilha ou abrir a próxima atividade calculada, mas a plataforma só mostra esse atalho depois que o domínio foi salvo.
- A passagem da trilha infantil para a área do responsável pede confirmação adulta digitando `ADULTO`, com foco inicial em "Continuar na trilha", evitando saída acidental ou transição surpresa.
- Falhas inesperadas de renderização caem em uma tela segura e acessível ("Pausa segura"), com opção de tentar novamente ou voltar ao início, em vez de deixar a criança diante de uma tela em branco.
- Links quebrados ou rotas desconhecidas mostram uma página calma de caminho não encontrado, com retorno ao início e entrada para a demonstração.
- Navegação por teclado/leitor de tela com link "Pular para o conteúdo", título de página atualizado por rota e anúncio discreto da tela atual.
- A trilha também sugere revisões leves de atividades já dominadas quando ficam alguns dias sem prática, apoiando manutenção sem bloquear avanço.
- Cada atividade mantém um roteiro visual curto ("Agora", "Depois" e "Pausa") antes e durante a tarefa, com a pausa descrita conforme a regulação preferida do perfil, reforçando previsibilidade sem depender só de instrução verbal.
- Atividades de frase/texto acrescentam apoio de leitura compartilhada na preparação, lembrando o mediador de esperar resposta por olhar, gesto, toque, vocalização ou CAA antes da escolha.
- As atividades sugerem pausas em intervalos configuráveis por perfil, com convite, acordo visual de retorno ("primeiro/depois"), passos adaptados à regulação preferida (pausa, ambiente calmo, movimento ou alternância) e, quando registrado, plano individual com sinais de pausa, apoios que ajudam e pontos a evitar; depois de prática longa oferecem uma tela previsível de encerramento por agora, sem bloquear a criança nem desfazer progresso.
- Leitura em voz alta (Web Speech API, pt-BR), sempre opcional, nunca automática sem interação, e cancelada quando o som é desligado ou a tela muda.
- Ajustes por perfil: som, animação, alto contraste, tamanho de fonte e alvos maiores para toque/uso mediado.
- Relatório de progresso por módulo para o responsável, com histórico de tentativas, observações de sessão categorizadas com resumo/filtro por tipo, comunicações funcionais feitas pelos cartões da criança, nível médio de apoio, recomendação de apoio graduado e próximo passo sugerido.
- Guia rápido do mediador no painel do responsável, combinando próximo passo, meta individual, comunicação, acesso e regulação preferidos em quatro ações práticas: antes, durante, se precisar de apoio e depois.
- Exportação local dos dados de um perfil em JSON, incluindo preferências, plano individual, tentativas, observações e resumo de progresso; os nomes dos arquivos não incluem nome/apelido da criança por padrão.
- Cache offline opcional por dispositivo confiável, para carregar dados e sincronizar tentativas quando a conexão voltar.
- Relatório local em Markdown para equipe, com resumo compartilhável para conversar com terapeutas, professores ou cuidadores sem abrir acesso direto à conta.
- Plano local de generalização em Markdown, transformando a próxima habilidade em prática curta fora da tela para casa, escola ou terapia.
- Cartões imprimíveis em HTML local com roteiro visual, opções da próxima atividade e cartões de comunicação/regulação do perfil, preservando os mesmos símbolos e motivos visuais da tela e a estratégia de regulação escolhida.
- Exclusão segura de perfil ou da conta inteira pela família, apagando também tentativas e observações associadas depois de confirmação explícita.
- Personalização inicial por interesse da criança (neutro, animais, veículos, casa, música, comida, brincar ou natureza), com descrição e exemplos para o responsável, usada para adaptar palavras de apoio nas sílabas CV com A/E/I/O/U e acrescentar um motivo visual discreto nos cartões de comunicação sem mudar a habilidade ensinada.

Veja o que **não** está no v1 (e por quê) em [`docs/PEDAGOGIA.md`](docs/PEDAGOGIA.md#o-que-fica-fora-do-escopo-do-v1-documentado-para-não-virar-débito-técnico-silencioso).

## Stack técnica

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Auth + Firestore, plano gratuito Spark) — sem custo de hospedagem
- Hospedagem estática em [GitHub Pages](https://pages.github.com/), publicada via GitHub Actions
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + [axe-core](https://github.com/dequelabs/axe-core) para testes e acessibilidade automatizada

Decisões técnicas detalhadas em [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md). Modelo de dados e postura de privacidade em [`docs/SEGURANCA.md`](docs/SEGURANCA.md).

## Rodando localmente

```bash
npm install
npm run dev
```

Para testar autenticação/perfis/progresso, copie `.env.example` para `.env.local` com as credenciais do seu próprio projeto Firebase (gratuito) — veja [`CONTRIBUTING.md`](CONTRIBUTING.md). App Check é opcional em desenvolvimento: preencha `VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY` apenas quando já tiver registrado o app Web no Firebase Console/App Check.

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

Próximos passos ficam documentados como ideias em aberto — compreensão aberta, novas famílias silábicas, personalização visual profunda por interesse especial da criança, compartilhamento de progresso com terapeutas externos — não como promessas com prazo.

## Contribuindo

Contribuições são bem-vindas — incluindo de terapeutas, pedagogos, fonoaudiólogos, familiares e **pessoas autistas**, não só de programadores. Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) e o [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Licença

Código sob licença [MIT](LICENSE).
