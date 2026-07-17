# Contribuindo com o TEA

Obrigado por considerar contribuir! Este projeto é sobre crianças autistas de verdade, então contribuições de **terapeutas, pedagogos, fonoaudiólogos, familiares e pessoas autistas** são tão bem-vindas quanto contribuições de código — talvez mais importantes.

## Antes de tudo: se você é autista

Se você é uma pessoa autista lendo isso: sua perspectiva sobre o que funciona (ou não) tem prioridade sobre suposições de neurotípicos, incluindo as minhas. Se algo no design, no vocabulário da interface ou nas escolhas pedagógicas parecer errado pra você, por favor abra uma issue — mesmo que você não saiba programar.

## Rodando o projeto localmente

```bash
git clone https://github.com/non-s/TEA.git
cd TEA
npm install
npm run dev
```

Não precisa de nenhuma conta, chave de API ou variável de ambiente — o app não tem backend, todos os dados ficam no `localStorage` do navegador (ver `docs/ARQUITETURA.md` e `docs/SEGURANCA.md`).

Comandos úteis:

```bash
npm run lint     # oxlint (inclui regras de acessibilidade jsx-a11y)
npm run test     # Vitest, inclui verificação de acessibilidade com axe-core
npm run build    # build de produção — mesmo processo do deploy
npm run format   # Prettier
```

Todo PR passa por `npm run lint && npm run test && npm run build` no CI antes de poder ser mesclado (`.github/workflows/ci.yml`).

## Tipos de contribuição

### Mudanças de currículo pedagógico (`src/curriculo/`)

Essas são as mudanças mais sensíveis do repositório. Antes de abrir um PR mudando `trilha-v1.ts` ou adicionando um módulo novo:

1. Explique **a fundamentação** — que prática/evidência embasa a mudança? Adicione a referência em `docs/PEDAGOGIA.md` no mesmo PR.
2. Se a mudança adiciona um novo tipo de atividade, siga o padrão existente: um componente em `src/components/atividades/`, um tipo em `TipoAtividade` (`src/curriculo/tipos.ts`), dica com esmaecimento (`dicas`) e critério de domínio (`criteriosDominio`) — não pule esses dois, eles são o núcleo do desenho pedagógico (ver `docs/PEDAGOGIA.md`).
3. PRs que tocam `src/curriculo/` idealmente têm revisão de alguém com formação em educação especial, terapia ocupacional, fonoaudiologia ou análise do comportamento aplicada — se você tem essa formação e quer ser um revisor recorrente, comente numa issue ou entre em contato.

### Design e acessibilidade

- Use os tokens de cor existentes (`src/index.css`, `--cor-*`) em vez de cores hardcoded — isso garante que o modo de alto contraste continue funcionando.
- Nunca adicione som ou animação que toque automaticamente sem interação da criança/responsável — ver princípios em `docs/PEDAGOGIA.md`.
- Toda mudança de UI deve passar no teste de acessibilidade automatizado (`axe-core`, já incluso nos testes de componente) e, se possível, ser testada com navegação por teclado.

### Código em geral

- Siga os padrões já existentes no arquivo que você está editando (nomes de variáveis em português, como o resto do projeto).
- Não adicione dependências novas sem necessidade real — o projeto valoriza um bundle pequeno e poucas dependências para auditar.
- Escreva testes para lógica nova (hooks, funções puras). Componentes de atividade seguem o padrão em `src/components/atividades/*.test.tsx`.

## Convenção de commits

Mensagens de commit em português, descrevendo o _porquê_ além do _o quê_, seguindo o padrão já usado no histórico do repositório (`git log` para exemplos). Não há uma convenção rígida tipo Conventional Commits — clareza importa mais que formato.

## Processo de PR

1. Abra uma issue primeiro se a mudança for grande (novo módulo curricular, nova tela) — evita trabalho duplicado ou desalinhado.
2. PRs pequenos e focados são mais fáceis de revisar que PRs grandes.
3. Descreva no PR: o que mudou, por quê, e como você testou (rodou localmente? testou com leitor de tela? testou com uma criança de verdade?).

## Código de conduta

Este projeto segue o [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
