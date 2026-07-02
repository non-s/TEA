# Arquitetura

Registro curto das decisões técnicas do projeto, no estilo ADR (Architecture Decision Record) — o quê, por quê, e o que foi considerado e descartado.

## Stack

| Camada           | Escolha                                           | Por quê                                                                                                                                      |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Build/dev server | [Vite](https://vite.dev/)                         | Rápido, configuração mínima, build estático simples de hospedar no GitHub Pages.                                                             |
| UI               | React 18 + TypeScript                             | Ecossistema grande, tipagem reduz bugs num projeto que cresce por contribuições externas.                                                    |
| Estilo           | Tailwind CSS                                      | Consistência de espaçamento/cor via tokens (`src/index.css`) sem precisar de um design system separado.                                      |
| Roteamento       | `react-router-dom` com `HashRouter`               | GitHub Pages não suporta rewrites de servidor — `HashRouter` evita 404 ao recarregar uma rota profunda, sem precisar do hack de `404.html`.  |
| Backend          | Firebase (Auth + Firestore), plano gratuito Spark | Exigência do projeto: zero custo. Ver `docs/SEGURANCA.md` para o modelo de dados.                                                            |
| Hospedagem       | GitHub Pages via GitHub Actions                   | Gratuito para repositórios públicos, sem servidor para manter.                                                                               |
| Testes           | Vitest + Testing Library + axe-core               | Mesma toolchain do Vite (sem configuração duplicada), `axe-core` roda verificação de acessibilidade automatizada em cada componente de tela. |
| Lint             | oxlint                                            | Mais rápido que ESLint, já inclui regras de React/TypeScript/jsx-a11y nativamente sem plugins extras.                                        |

## Por que não Firebase Hosting?

O Firebase tem hospedagem própria, mas o requisito do projeto era usar GitHub Pages especificamente (mantém tudo — código e deploy — dentro do GitHub, sem depender de mais uma conta/serviço). Firebase aqui é usado **só** para Auth e Firestore.

## Currículo como código, não como dado

O conteúdo pedagógico (`src/curriculo/trilha-v1.ts`) é TypeScript versionado no repositório, não registros no Firestore. Isso é deliberado: qualquer mudança no currículo passa por pull request, com diff revisável e histórico no Git — em vez de um CMS ou painel administrativo que mudaria conteúdo pedagógico sem revisão nem rastro. O trade-off é que mudar o currículo hoje exige saber TypeScript básico; ver `CONTRIBUTING.md` para como isso deveria evoluir (ex: um formato JSON mais simples de editar sem programar).

## Modelo `alvo` / `resposta` nas atividades

`Atividade` (`src/curriculo/tipos.ts`) separa `alvo` (o estímulo mostrado/falado como amostra ou instrução) de `resposta` (o estímulo que deve ser tocado). Nas primeiras atividades implementadas (emparelhamento idêntico) os dois eram sempre o mesmo objeto, então essa distinção pareceria desnecessária — mas em emparelhamento por categoria (Módulo 1, "A" maiúsculo → "a" minúsculo) e nomeação (Módulos 2-3) a resposta correta é visualmente diferente da amostra. Fazer essa distinção explícita no tipo, em vez de reaproveitar `alvo` com convenções implícitas, evitou bugs de "qual estímulo é a resposta certa mesmo" nos componentes de atividade.

## Preferências sensoriais via CSS custom properties

`src/contexts/PreferenciasContext.tsx` grava preferências (som, animação, alto contraste, tamanho de fonte) tanto no Firestore (por perfil, persistente) quanto define atributos/variáveis no elemento raiz (`document.documentElement`). O tema de alto contraste é implementado inteiramente redefinindo as variáveis CSS em `src/index.css` sob o seletor `:root[data-alto-contraste='true']` — nenhum componente precisa saber se o alto contraste está ativo, eles só usam `var(--cor-primaria)` etc. Isso mantém a lógica de tema centralizada num único arquivo.

## `useTentativa`: por que uid/perfilId são passados explicitamente

O hook `useTentativa(atividade, uidResponsavel, perfilId)` recebe identidade do usuário como parâmetros explícitos em vez de ler `useAuth()`/`usePerfilAtivo()` internamente. A primeira versão fazia a leitura interna, mas isso acoplava o hook (e os componentes de atividade que o usam) aos providers globais de autenticação, tornando os testes de componente muito mais complicados de configurar (precisariam simular uma sessão de auth completa via mocks profundos). Passar como parâmetros mantém `useTentativa` testável com strings simples e move a responsabilidade de "de onde vem esse uid" para `Atividade.tsx`, que já está dentro da árvore de rotas protegida (`RequireAuth` + `RequirePerfilAtivo`) e portanto sempre tem essa informação disponível.

## Estrutura de pastas

```
src/
├── routes/            # uma pasta por tela, agrupadas em responsavel/ e crianca/
├── components/
│   ├── atividades/    # um componente por tipo de atividade pedagógica
│   └── ui/             # primitivos de design (Botao, Cartao, Logo, Interruptor)
├── curriculo/          # conteúdo pedagógico versionado + ícones
├── firebase/           # toda a integração com Firebase (auth, perfis, progresso)
├── contexts/           # estado global via React Context (auth, perfil ativo, preferências)
├── hooks/               # lógica reutilizável (useTentativa, useSpeech, ...)
└── test/                # setup global de testes (mocks do SDK do Firebase)
```

## Débitos técnicos conhecidos (não escondidos, documentados)

- **Tamanho do bundle**: o build de produção passa de 500kB (aviso do Vite), principalmente pelo SDK do Firebase. Candidato a `dynamic import()` ou `manualChunks` numa v2, mas não é um problema real de performance ainda dado o tamanho do app.
- **Exclusão em cascata**: ver `docs/SEGURANCA.md`.
- **`Cartao` polimórfico**: o componente `src/components/ui/Cartao.tsx` suporta `as="div" | "form"` via união de tipos manual — funciona, mas não escala bem se precisar de mais tags no futuro (nesse caso, vale considerar uma lib de polimorfismo tipo `Slot` do Radix, mas isso seria over-engineering para as duas variantes atuais).
