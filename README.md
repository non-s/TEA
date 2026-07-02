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

- Criar conta, criar um ou mais perfis de criança (sem senha para a criança — ela só escolhe seu avatar).
- Trilha com **35 atividades em 5 módulos**: emparelhamento visual → maiúscula/minúscula → nomeação receptiva de letras → nomeação expressiva de letras → formação de sílabas com apoio de palavra familiar (ex: "MA, de mamãe").
- Cada atividade usa dica com esmaecimento progressivo e critério de domínio (8 acertos seguidos independente), reforço positivo imediato, nunca punição.
- Leitura em voz alta (Web Speech API, pt-BR), sempre opcional e nunca automática sem interação.
- Ajustes sensoriais por perfil: som, animação, alto contraste, tamanho de fonte.
- Relatório de progresso por módulo para o responsável, com histórico de tentativas.

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

Para testar autenticação/perfis/progresso, copie `.env.example` para `.env.local` com as credenciais do seu próprio projeto Firebase (gratuito) — veja [`CONTRIBUTING.md`](CONTRIBUTING.md).

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

O v1 está completo. Próximos passos (v2) ficam documentados como ideias em aberto — formação de palavras completas, personalização por interesse especial da criança, compartilhamento de progresso com terapeutas externos — não como promessas com prazo.

## Contribuindo

Contribuições são bem-vindas — incluindo de terapeutas, pedagogos, fonoaudiólogos, familiares e **pessoas autistas**, não só de programadores. Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) e o [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

## Licença

Código sob licença [MIT](LICENSE).
