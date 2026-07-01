# TEA

Plataforma open source de **alfabetização para crianças com Transtorno do Espectro Autista (TEA)**, gratuita, em português do Brasil, embasada em práticas com evidência científica (ABA/NPDC-NCAEP, TEACCH, CAA/PECS, método fônico-silábico).

🔗 **Demo:** https://non-s.github.io/TEA/ (em construção)

> Este projeto está em desenvolvimento ativo e incremental. Consulte a seção [Roteiro](#roteiro) para ver o que já existe e o que vem a seguir.

## Objetivo

Oferecer, de forma 100% gratuita e auditável, uma trilha de atividades de alfabetização pensada especificamente para crianças autistas — com apoio visual forte, ensino sem erro, dicas com esmaecimento progressivo (prompt fading) e configurações sensoriais (som, animação, contraste, tamanho de fonte) que a família e o(a) terapeuta podem ajustar.

A plataforma tem dois modos de uso:

- **Modo criança**: interface simples, ícones grandes, mínimo texto, pensada para a criança tocar/usar com um mediador por perto.
- **Modo responsável**: login completo, gerenciamento de perfis dos filhos, configurações sensoriais e relatório de progresso.

A fundamentação pedagógica completa, com referências científicas, está em [`docs/PEDAGOGIA.md`](docs/PEDAGOGIA.md) (em construção).

## Stack técnica

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) (Auth + Firestore, plano gratuito Spark) — sem custo de hospedagem
- Hospedagem estática em [GitHub Pages](https://pages.github.com/), publicada via GitHub Actions
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) + [axe-core](https://github.com/dequelabs/axe-core) para testes e acessibilidade automatizada

## Rodando localmente

```bash
npm install
npm run dev
```

Outros comandos úteis:

```bash
npm run lint     # lint com oxlint
npm run test     # testes com Vitest
npm run build    # build de produção (mesmo processo usado no deploy)
npm run format   # formata o código com Prettier
```

## Roteiro

- [x] Marco 1 — Scaffold do projeto e deploy automático no GitHub Pages
- [x] Marco 2 — Base de qualidade (testes, acessibilidade automatizada, estrutura de pastas)
- [ ] Marco 3 — Autenticação do responsável e perfis de criança (Firebase) — **aguardando configuração do projeto Firebase**
- [x] Marco 4 — Configurações sensoriais (som, animação, contraste, tamanho de fonte)
- [x] Marco 5 — Primeira atividade jogável (emparelhamento visual, Módulo 0)
- [x] Marco 6 — Voz (leitura em voz alta) e reforço positivo
- [ ] Marco 7 — Currículo completo de reconhecimento de letras
- [ ] Marco 8 — Nomeação expressiva, sílabas e relatório de progresso para o responsável
- [ ] Marco 9 — Documentação completa e release v1.0.0

> Os Marcos 4, 5 e 6 foram adiantados antes do Marco 3 porque não dependem do Firebase — o progresso das atividades é gravado em `localStorage` por enquanto (interface já pensada para trocar por Firestore sem reescrever quem chama essas funções).

## Contribuindo

Contribuições são bem-vindas — incluindo de terapeutas, pedagogos e familiares, não só de programadores. Veja [`CONTRIBUTING.md`](CONTRIBUTING.md) (em construção).

## Licença

Código sob licença [MIT](LICENSE).
