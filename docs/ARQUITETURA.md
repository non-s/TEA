# Arquitetura

Registro curto das decisões técnicas do projeto, no estilo ADR (Architecture Decision Record) — o quê, por quê, e o que foi considerado e descartado.

## Stack

| Camada           | Escolha                             | Por quê                                                                                                                                      |
| ---------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Build/dev server | [Vite](https://vite.dev/)           | Rápido, configuração mínima, build estático simples de hospedar no GitHub Pages.                                                             |
| UI               | React 19 + TypeScript               | Ecossistema grande, tipagem reduz bugs num projeto que cresce por contribuições externas.                                                    |
| Estilo           | Tailwind CSS                        | Consistência de espaçamento/cor via tokens (`src/index.css`) sem precisar de um design system separado.                                      |
| Roteamento       | `react-router-dom` com `HashRouter` | GitHub Pages não suporta rewrites de servidor — `HashRouter` evita 404 ao recarregar uma rota profunda, sem precisar do hack de `404.html`.  |
| Dados            | `localStorage` do navegador         | Sem backend, sem conta, sem custo de servidor. Ver `docs/SEGURANCA.md` para o modelo de dados e por que isso elimina a exigência de LGPD.    |
| Hospedagem       | GitHub Pages via GitHub Actions     | Gratuito para repositórios públicos, sem servidor para manter.                                                                               |
| Testes           | Vitest + Testing Library + axe-core | Mesma toolchain do Vite (sem configuração duplicada), `axe-core` roda verificação de acessibilidade automatizada em cada componente de tela. |
| Lint             | oxlint                              | Mais rápido que ESLint, já inclui regras de React/TypeScript/jsx-a11y nativamente sem plugins extras.                                        |

Os testes de acessibilidade não ficam restritos a componentes pequenos: fluxos críticos da criança também recebem cobertura de rota com Testing Library + axe-core. A tela de entrada valida estados de primeiro uso e controles de avatar nomeados; a trilha infantil valida que links de atividades concluídas têm nome acessível específico (ex: "círculo concluída"), evitando vários links indistinguíveis chamados apenas "Concluída".

## Sem backend: por que `localStorage` em vez de um serviço gratuito qualquer

O projeto rodou por um bom tempo sobre Firebase (Auth + Firestore, plano gratuito). Migrou para um modelo 100% local (`src/local/perfilLocal.ts`) porque login/conta é fricção real para o caso de uso: um adulto emprestando o celular pra criança estudar não deveria precisar criar conta, confirmar e-mail ou lembrar senha antes disso acontecer. Sem conta, também não existe mais coleta de dado por um controlador — o que elimina a necessidade de consentimento, base legal de LGPD e toda a superfície de regras de acesso/isolamento por usuário que uma conta exigiria.

O trade-off consciente: sem conta, não há sincronização entre dispositivos nem recuperação de progresso se o `localStorage` for limpo. Para o público-alvo (uso em um tablet/celular da família, muitas vezes sempre o mesmo aparelho), essa perda foi julgada aceitável frente ao ganho de fricção zero para começar a usar.

## Currículo como código, não como dado

O conteúdo pedagógico (`src/curriculo/trilha-v1.ts`) é TypeScript versionado no repositório, não registros num banco de dados. Isso é deliberado: qualquer mudança no currículo passa por pull request, com diff revisável e histórico no Git — em vez de um CMS ou painel administrativo que mudaria conteúdo pedagógico sem revisão nem rastro. O trade-off é que mudar o currículo hoje exige saber TypeScript básico; ver `CONTRIBUTING.md` para como isso deveria evoluir (ex: um formato JSON mais simples de editar sem programar).

Além da tipagem, `src/curriculo/validacaoTrilha.ts` executa validações pedagógicas automatizadas: IDs únicos, pré-requisitos existentes, atividade declarada no módulo certo, distratores válidos, ordem obrigatória de dicas (`modelagem` → `destaque-visual` → `nenhuma`), critério mínimo de domínio e progressão sem introduzir sílabas, palavras, frases, textos, perguntas literais ou inferências guiadas antes do repertório necessário ter sido ensinado. Nas perguntas de presença/ausência, a atividade também declara se a resposta deve aparecer no texto, e o validador confere essa relação para evitar alternativas ambíguas. Nas perguntas de inferência guiada, a resposta precisa ser uma palavra já ensinada e presente no texto âncora.

## Modelo `alvo` / `resposta` nas atividades

`Atividade` (`src/curriculo/tipos.ts`) separa `alvo` (o estímulo mostrado/falado como amostra ou instrução) de `resposta` (o estímulo que deve ser tocado). Nas primeiras atividades implementadas (emparelhamento idêntico) os dois eram sempre o mesmo objeto, então essa distinção pareceria desnecessária — mas em emparelhamento por categoria (Módulo 1, "A" maiúsculo → "a" minúsculo) e nomeação (Módulos 2-3) a resposta correta é visualmente diferente da amostra. Fazer essa distinção explícita no tipo, em vez de reaproveitar `alvo` com convenções implícitas, evitou bugs de "qual estímulo é a resposta certa mesmo" nos componentes de atividade.

O campo opcional `pecas: Estimulo[]` existe só para `montagem-palavra` (Módulo 5-M): representa as sílabas certas **na ordem certa** que a criança precisa tocar em sequência. `distratores` nessa atividade não é "uma palavra inteira errada" como no resto da trilha — são sílabas erradas soltas, misturadas no mesmo grupo de peças. Cada peça tem um id próprio mesmo quando o rótulo se repete (ex. "BEBE" = duas peças com rótulo "BE", ids diferentes), porque o componente precisa distinguir instâncias específicas ao remover uma peça já usada do grupo disponível.

## Preferências sensoriais via CSS custom properties, por dispositivo

`src/contexts/PreferenciasContext.tsx` grava preferências (som, animação, alto contraste, tamanho de fonte) no `localStorage`, por dispositivo — não por perfil de criança. Isso é deliberado: se dois irmãos usam o mesmo tablet, eles compartilham o mesmo ambiente sensorial físico (mesma tela, mesmo volume do aparelho), então faz mais sentido o ajuste ser "deste aparelho" do que "desta criança". O tema de alto contraste é implementado inteiramente redefinindo as variáveis CSS em `src/index.css` sob o seletor `:root[data-alto-contraste='true']` — nenhum componente precisa saber se o alto contraste está ativo, eles só usam `var(--cor-primaria)` etc. Isso mantém a lógica de tema centralizada num único arquivo.

## `PerfilAtivoContext`: perfil selecionado, sem sessão

`src/contexts/PerfilAtivoContext.tsx` envolve `src/local/perfilLocal.ts` (que faz a leitura/escrita crua do `localStorage`) com estado React: mantém a lista de perfis, qual está ativo (`localStorage["tea:perfil-ativo-id"]`) e expõe `criarPerfil`, `selecionarPerfil`, `atualizarPerfilAtivo`, `marcarAtividadeDominada`, `excluirPerfil` e `encerrarPerfil`. Como não há autenticação, não existe conceito de "sessão expirando" ou "usuário deslogado" — o perfil ativo simplesmente persiste entre recarregamentos até a criança/adulto trocar de perfil.

`src/routes/Entrada.tsx` é a rota `/`: lista os perfis já criados neste aparelho (se houver) e o formulário de criação de um novo perfil, com avatar e personalização opcional de interesse/apoio inicial. `RequirePerfilAtivo` (`src/routes/RequirePerfilAtivo.tsx`) redireciona de volta para `/` qualquer rota infantil (`/crianca/*`) quando não há perfil ativo.

`src/components/ui/LimiteErro.tsx` envolve as rotas dentro do `HashRouter`. Se uma tela quebra durante renderização, a criança não fica diante de uma página branca: o app mostra uma "Pausa segura" com linguagem calma, botão para tentar de novo e link para voltar ao início. O limite reseta automaticamente quando a rota muda (`chaveReset` baseada em `pathname/search/hash`), então uma falha isolada não prende a família fora do restante da plataforma.

`src/routes/NaoEncontrada.tsx` cobre o `path="*"` do roteador. Em vez de renderizar nada quando um hash está errado, o app mostra uma mensagem curta, sem culpa, com retorno ao início.

Na trilha infantil (`src/routes/crianca/Trilha.tsx`), trocar de perfil é um "adult gate" leve: o diálogo mantém "Continuar na trilha" como primeira ação e só habilita a troca depois que o adulto digita `ADULTO`. Isso não é autenticação nem senha; é uma barreira de intenção para reduzir toques acidentais e transições adultas inesperadas durante a sessão da criança.

Na conclusão de uma atividade (`src/routes/crianca/Atividade.tsx`), o app calcula a próxima atividade com `encontrarProximaAtividadeAposConclusao`, combinando as atividades dominadas do perfil, domínios confirmados localmente na sessão e a atividade recém-concluída. Como `marcarAtividadeDominada` escreve direto no `localStorage` (síncrono, sem round-trip de rede), não existe estado intermediário de "salvando" nem cenário de falha de rede a tratar aqui.

`RotasApp` também mantém orientação global de navegação: cada mudança de rota atualiza `document.title`, escreve o nome da tela em um `<output>` visualmente oculto e oferece um link "Pular para o conteúdo" para teclado/leitor de tela. O contêiner `#conteudo-principal` é focável para esse atalho, mas a aplicação não força foco global em toda troca de rota para não disputar com os focos pedagógicos já controlados pelas atividades e diálogos.

## `useTentativa`: por que `perfilId` é passado explicitamente

O hook `useTentativa(atividade, perfilId, opcoes)` recebe o id do perfil como parâmetro explícito em vez de ler `usePerfilAtivo()` internamente. Passar como parâmetro mantém `useTentativa` testável com strings simples e move a responsabilidade de "qual perfil é esse" para `Atividade.tsx`, que já está dentro da árvore de rotas protegida (`RequirePerfilAtivo`) e portanto sempre tem essa informação disponível. Por padrão, `useTentativa` grava a tentativa com `registrarTentativa` de `src/local/perfilLocal.ts` (síncrono); um registrador alternativo pode ser injetado via `opcoes.registrarTentativa`, usado por `Demo`-like cenários e pelos testes.

O mesmo hook concentra a política pedagógica de dica: sem histórico, a atividade começa em modelagem (`nivelDicaAtual = 0`) e só esmaece para resposta independente depois de acertos consecutivos. Quando há tentativas salvas, o estado é reconstruído em ordem usando `resultado` e `nivelDicaUsado`, o que preserva continuidade após pausa/recarregamento e evita reinterpretar dados antigos como se tivessem sido feitos em outro nível de suporte. O sinal de sessão `sinalPedirAjuda` volta a atividade para modelagem sem registrar tentativa nem erro; assim, os cartões "Ajuda" e "Não sei" da criança têm consequência funcional sem distorcer o histórico de respostas.

## Estrutura de pastas

```
src/
├── routes/            # uma pasta por tela (Entrada, Ajustes, Privacidade, Termos) + crianca/
├── components/
│   ├── atividades/    # um componente por tipo de atividade pedagógica
│   └── ui/             # primitivos de design (Botao, Cartao, Logo, Interruptor)
├── curriculo/          # conteúdo pedagógico versionado + ícones
├── local/               # toda a persistência (localStorage): perfis e tentativas
├── contexts/           # estado global via React Context (perfil ativo, preferências)
├── hooks/               # lógica reutilizável (useTentativa, ...)
├── pwa/                 # registro do service worker e estado de atualização do PWA
└── test/                # setup global de testes
```

## PWA: o app inteiro funciona offline, desde o primeiro carregamento

O manifest em `public/site.webmanifest` permite instalar/fixar o app em celular ou tablet com nome, ícone e cor próprios. Um service worker (`vite-plugin-pwa`, modo `generateSW`, ver `vite.config.ts`) faz precache do app shell (HTML/JS/CSS/SVG/fontes), permitindo abrir o app sem conexão e atualizar sozinho quando uma nova versão é publicada — `src/pwa/registrarServiceWorker.ts` registra isso fora do ambiente de teste (`import.meta.env.MODE === 'test'`), e `src/components/ui/AvisoConexao.tsx` mostra um aviso calmo de offline/atualização, nunca automático demais (sem recarregar sozinho). Como todos os dados também vivem só no `localStorage` do aparelho (não num backend), não existe uma distinção entre "cache do app" e "cache de dados de progresso" — funcionar sem conexão é o comportamento padrão do app inteiro, não um modo opt-in.

`src/hooks/useConexao.ts` expõe `useEstaOffline` (baseado nos eventos `online`/`offline` do navegador) e `useAtualizacaoPWADisponivel` (observando `src/pwa/estadoAtualizacaoPWA.ts`, um pub-sub simples separado do módulo que importa o virtual module `virtual:pwa-register` — separação deliberada para que testes de componente não precisem resolver esse módulo virtual só para observar o estado de atualização).

## Jardim de Conquistas: derivado, não persistido

`src/curriculo/jardim.ts` (`calcularJardim`) deriva o estágio de cada canteiro (semente/brotando/floresceu) a partir de `trilhaV1.modulos` e do `Set` de atividades dominadas do perfil — não existe nenhum campo salvo separadamente para o jardim. Isso significa que o jardim nunca pode ficar dessincronizado do progresso real: não há dois lugares para o mesmo dado divergir. `src/routes/crianca/Jardim.tsx` reaproveita `acentosPorModulo` (extraído para `src/curriculo/coresModulo.ts`, compartilhado com `Trilha.tsx`) para manter a mesma identidade visual de cor por módulo nas duas telas.

## Traçado de Letras: geometria em vez de canvas/OCR

`src/curriculo/tracadoLetras.ts` representa o guia de cada letra como polilinhas num espaço de coordenadas 0-100 (mesmo viewBox dos ícones em `curriculo/ativos/Icone.tsx`), e a avaliação (`avaliarTracado`) usa distância ponto-a-segmento — geometria pura, sem `<canvas>`, sem rasterização de pixel e sem nenhuma dependência de OCR/ML. A escolha evita duas armadilhas: (1) o stub de `HTMLCanvasElement.getContext` em `src/test/setup.ts` só existe para o `axe-core` não quebrar ao inspecionar canvas, não para suportar desenho real — testar lógica de traçado baseada em canvas exigiria mockar `getImageData` de um jeito que nunca reflete o desenho real; (2) manter tudo em SVG (guia pontilhado + traço do usuário, ambos `<polyline>`) reaproveita o mesmo padrão de ícones do resto do app. A avaliação em si é uma função pura testável com arrays de `{x, y}`, sem DOM.

O componente (`src/components/atividades/TracadoLetra.tsx`) só avalia quando a criança clica "Verificar traçado" — nunca automaticamente enquanto ela desenha, consistente com "nada acontece sem uma ação explícita" no resto da trilha. O resultado aprovado/reprovado é traduzido para uma chamada de `responder()` do `useTentativa` igual às demais atividades (usando `atividade.resposta.id` quando aprovado, um id sentinela quando não), reaproveitando de graça o esmaecimento de dica e o critério de domínio já existentes em vez de duplicar essa lógica para um tipo de resposta contínua.

## Débitos técnicos conhecidos (não escondidos, documentados)

- **Sem sincronização entre dispositivos**: consequência direta e aceita do modelo sem backend (ver seção acima e `docs/SEGURANCA.md`).
- **`Cartao` polimórfico**: o componente `src/components/ui/Cartao.tsx` suporta `as="div" | "form"` via união de tipos manual — funciona, mas não escala bem se precisar de mais tags no futuro (nesse caso, vale considerar uma lib de polimorfismo tipo `Slot` do Radix, mas isso seria over-engineering para as duas variantes atuais).
