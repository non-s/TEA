# Arquitetura

Registro curto das decisões técnicas do projeto, no estilo ADR (Architecture Decision Record) — o quê, por quê, e o que foi considerado e descartado.

## Stack

| Camada           | Escolha                                           | Por quê                                                                                                                                      |
| ---------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Build/dev server | [Vite](https://vite.dev/)                         | Rápido, configuração mínima, build estático simples de hospedar no GitHub Pages.                                                             |
| UI               | React 19 + TypeScript                             | Ecossistema grande, tipagem reduz bugs num projeto que cresce por contribuições externas.                                                    |
| Estilo           | Tailwind CSS                                      | Consistência de espaçamento/cor via tokens (`src/index.css`) sem precisar de um design system separado.                                      |
| Roteamento       | `react-router-dom` com `HashRouter`               | GitHub Pages não suporta rewrites de servidor — `HashRouter` evita 404 ao recarregar uma rota profunda, sem precisar do hack de `404.html`.  |
| Backend          | Firebase (Auth + Firestore), plano gratuito Spark | Exigência do projeto: zero custo. Ver `docs/SEGURANCA.md` para o modelo de dados.                                                            |
| Hospedagem       | GitHub Pages via GitHub Actions                   | Gratuito para repositórios públicos, sem servidor para manter.                                                                               |
| Testes           | Vitest + Testing Library + axe-core               | Mesma toolchain do Vite (sem configuração duplicada), `axe-core` roda verificação de acessibilidade automatizada em cada componente de tela. |
| Lint             | oxlint                                            | Mais rápido que ESLint, já inclui regras de React/TypeScript/jsx-a11y nativamente sem plugins extras.                                        |

Os testes de acessibilidade não ficam restritos a componentes pequenos: fluxos críticos da criança e do responsável também recebem cobertura de rota com Testing Library + axe-core. A seleção/criação inicial de perfil valida estados de primeiro uso e controles de avatar nomeados; a trilha infantil valida que links de atividades concluídas têm nome acessível específico (ex: "círculo concluída"), evitando vários links indistinguíveis chamados apenas "Concluída". A tela de progresso valida exportações locais e mensagens anunciadas por `<output>`.

## Por que não Firebase Hosting?

O Firebase tem hospedagem própria, mas o requisito do projeto era usar GitHub Pages especificamente (mantém tudo — código e deploy — dentro do GitHub, sem depender de mais uma conta/serviço). Firebase aqui é usado **só** para Auth e Firestore.

## Currículo como código, não como dado

O conteúdo pedagógico (`src/curriculo/trilha-v1.ts`) é TypeScript versionado no repositório, não registros no Firestore. Isso é deliberado: qualquer mudança no currículo passa por pull request, com diff revisável e histórico no Git — em vez de um CMS ou painel administrativo que mudaria conteúdo pedagógico sem revisão nem rastro. O trade-off é que mudar o currículo hoje exige saber TypeScript básico; ver `CONTRIBUTING.md` para como isso deveria evoluir (ex: um formato JSON mais simples de editar sem programar).

Além da tipagem, `src/curriculo/validacaoTrilha.ts` executa validações pedagógicas automatizadas: IDs únicos, pré-requisitos existentes, atividade declarada no módulo certo, distratores válidos, ordem obrigatória de dicas (`modelagem` → `destaque-visual` → `nenhuma`), critério mínimo de domínio e progressão sem introduzir sílabas, palavras, frases, textos, perguntas literais ou inferências guiadas antes do repertório necessário ter sido ensinado. Nas perguntas de presença/ausência, a atividade também declara se a resposta deve aparecer no texto, e o validador confere essa relação para evitar alternativas ambíguas. Nas perguntas de inferência guiada, a resposta precisa ser uma palavra já ensinada e presente no texto âncora.

## Modelo `alvo` / `resposta` nas atividades

`Atividade` (`src/curriculo/tipos.ts`) separa `alvo` (o estímulo mostrado/falado como amostra ou instrução) de `resposta` (o estímulo que deve ser tocado). Nas primeiras atividades implementadas (emparelhamento idêntico) os dois eram sempre o mesmo objeto, então essa distinção pareceria desnecessária — mas em emparelhamento por categoria (Módulo 1, "A" maiúsculo → "a" minúsculo) e nomeação (Módulos 2-3) a resposta correta é visualmente diferente da amostra. Fazer essa distinção explícita no tipo, em vez de reaproveitar `alvo` com convenções implícitas, evitou bugs de "qual estímulo é a resposta certa mesmo" nos componentes de atividade.

## Preferências sensoriais via CSS custom properties

`src/contexts/PreferenciasContext.tsx` grava preferências (som, animação, alto contraste, tamanho de fonte) tanto no Firestore (por perfil, persistente) quanto define atributos/variáveis no elemento raiz (`document.documentElement`). O tema de alto contraste é implementado inteiramente redefinindo as variáveis CSS em `src/index.css` sob o seletor `:root[data-alto-contraste='true']` — nenhum componente precisa saber se o alto contraste está ativo, eles só usam `var(--cor-primaria)` etc. Isso mantém a lógica de tema centralizada num único arquivo.

O `PerfilAtivoContext` mantém uma cópia curta do perfil em `sessionStorage` apenas para preservar a navegação da criança dentro da sessão, sempre associada ao UID do responsável autenticado. Se não houver usuário, se o UID salvo não bater com o usuário atual ou se o registro local vier de um formato legado sem responsável verificável, o perfil ativo é apagado. A fonte de verdade continua sendo o Firestore: ao entrar na trilha, `Trilha.tsx` escuta o documento do perfil, atualiza o perfil ativo em memória e reaplica as preferências sensoriais carregadas. A leitura de perfil passa por normalizadores de domínio (`perfilApoio`, incluindo `planoRegulacao`, e `planoIndividual`) que aplicam listas permitidas e limites de texto iguais aos das regras do Firestore; assim, dados antigos ou cache local corrompido caem para apoios seguros em vez de quebrar a experiência infantil. Quando o responsável salva plano individual ou perfil de apoio na tela de progresso, a tela também atualiza imediatamente o perfil ativo local se for a mesma criança, evitando que a próxima atividade use apoios antigos até a família reescolher o avatar. Se o documento do perfil deixar de existir durante a sessão infantil, a trilha encerra o perfil ativo e volta para a seleção do responsável, em vez de manter uma experiência infantil apoiada em cache antigo.

O cadastro do responsável também é tratado como fronteira de dados infantis: `src/routes/responsavel/Cadastro.tsx` exige consentimento destacado antes de enviar, e `src/firebase/auth.ts` repete a verificação antes de chamar `createUserWithEmailAndPassword`. O documento `responsaveis/{uid}` guarda apenas nome, e-mail, timestamp de criação e `consentimentoPrivacidade` com versão/escopo/timestamp; as regras recusam criação sem esse mapa.

`src/utils/limiteLogin.ts` mantém um cooldown local em `localStorage` por e-mail normalizado depois de falhas repetidas de login. A tela de login consulta esse estado antes de chamar Firebase Auth, desabilita o envio enquanto a espera está ativa e limpa o registro quando o login funciona. Isso é uma proteção de UX/abuso leve, não uma barreira de segurança autoritativa: o servidor continua dependendo dos limites do Firebase Auth.

`src/routes/Privacidade.tsx` é uma rota pública e lazy, ligada à home, ao cadastro e às configurações. Ela não cria novo estado nem importa Firebase; serve como camada de transparência acessível antes da família criar conta ou alterar escolhas de cache/exclusão.

`src/routes/Demo.tsx` também é pública e lazy. Ela reaproveita componentes reais da trilha (`EmparelhamentoIdentico`, `FormacaoSilaba` e `PerguntaLiteralTexto`) e permite alternar entre toque direto, toque com confirmação e escolha mediada, mas passa um `registrarTentativa` local sem persistência para `useTentativa`, então a demonstração usa a mesma lógica de dica/fading e acesso sem acionar Firestore. Para viabilizar isso, `useTentativa` recebe um registrador opcional; quando nenhum é fornecido, ele importa dinamicamente `firebase/progresso` apenas no momento de salvar uma tentativa real.

A exclusão da conta inteira fica em `src/firebase/conta.ts`, não em `src/firebase/auth.ts`, porque ela precisa listar perfis e apagar subcoleções no Firestore. Manter esse caminho em um módulo separado evita que rotas públicas de login/cadastro baixem o módulo de perfis/progresso só por importarem autenticação básica. A tela de configurações é a única que importa esse fluxo pesado, pede reautenticação por senha e confirma a frase `APAGAR CONTA` antes de executar.

A seleção de perfil também trata o primeiro uso como uma etapa explícita: se a conta ainda não tem nenhum perfil de criança, a tela mostra a ação primária "Criar primeiro perfil" em vez de depender apenas de um link genérico de gerenciamento. Ao criar esse primeiro perfil, o app já ativa a criança, aplica as preferências iniciais e abre a trilha infantil. Essa decisão segue a orientação COGA/W3C de tornar a etapa atual e a próxima ação claras para pessoas que podem perder foco, memória de trabalho ou orientação no processo.

`src/components/ui/LimiteErro.tsx` envolve as rotas dentro do `HashRouter`. Se uma tela quebra durante renderização, a criança não fica diante de uma página branca: o app mostra uma "Pausa segura" com linguagem calma, botão para tentar de novo e link para voltar ao início. O limite reseta automaticamente quando a rota muda (`chaveReset` baseada em `pathname/search/hash`), então uma falha isolada não prende a família fora do restante da plataforma.

`src/routes/NaoEncontrada.tsx` cobre o `path="*"` do roteador. Em vez de renderizar nada quando um hash está errado, o app mostra uma mensagem curta, sem culpa, com retorno ao início e acesso à demonstração pública.

Na trilha infantil (`src/routes/crianca/Trilha.tsx`), a saída para a área do responsável é um "adult gate" leve: o diálogo mantém "Continuar na trilha" como primeira ação e só habilita "Abrir área do responsável" depois que o adulto digita `ADULTO`. Isso não é autenticação nem senha; é uma barreira de intenção para reduzir toques acidentais e transições adultas inesperadas durante a sessão da criança.

Na conclusão de uma atividade (`src/routes/crianca/Atividade.tsx`), o app calcula a próxima atividade com `encontrarProximaAtividadeAposConclusao`, combinando as atividades dominadas do perfil, domínios confirmados localmente na sessão e a atividade recém-concluída. O atalho "Próxima atividade" só é exibido depois que `marcarAtividadeDominada` resolve sem erro; enquanto salva, a tela informa que o progresso está sendo salvo, e em caso de falha mantém apenas o retorno à trilha com alerta. Assim a continuidade da sessão não depende de esperar o snapshot do Firestore, mas também não incentiva avanço quando o domínio não foi persistido.

`RotasApp` também mantém orientação global de navegação: cada mudança de rota atualiza `document.title`, escreve o nome da tela em um `<output>` visualmente oculto e oferece um link "Pular para o conteúdo" para teclado/leitor de tela. O contêiner `#conteudo-principal` é focável para esse atalho, mas a aplicação não força foco global em toda troca de rota para não disputar com os focos pedagógicos já controlados pelas atividades e diálogos.

## `useTentativa`: por que uid/perfilId são passados explicitamente

O hook `useTentativa(atividade, uidResponsavel, perfilId, opcoes)` recebe identidade do usuário como parâmetros explícitos em vez de ler `useAuth()`/`usePerfilAtivo()` internamente. A primeira versão fazia a leitura interna, mas isso acoplava o hook (e os componentes de atividade que o usam) aos providers globais de autenticação, tornando os testes de componente muito mais complicados de configurar (precisariam simular uma sessão de auth completa via mocks profundos). Passar como parâmetros mantém `useTentativa` testável com strings simples e move a responsabilidade de "de onde vem esse uid" para `Atividade.tsx`, que já está dentro da árvore de rotas protegida (`RequireAuth` + `RequirePerfilAtivo`) e portanto sempre tem essa informação disponível.

O mesmo hook concentra a política pedagógica de dica: sem histórico, a atividade começa em modelagem (`nivelDicaAtual = 0`) e só esmaece para resposta independente depois de acertos consecutivos. Quando há tentativas salvas, o estado é reconstruído em ordem usando `resultado` e `nivelDicaUsado`, o que preserva continuidade após pausa/recarregamento e evita reinterpretar dados antigos como se tivessem sido feitos em outro nível de suporte. O sinal de sessão `sinalPedirAjuda` volta a atividade para modelagem sem registrar tentativa nem erro; assim, os cartões "Ajuda" e "Não sei" da criança têm consequência funcional sem distorcer o histórico de respostas.

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
├── hooks/               # lógica reutilizável (useTentativa, ...)
├── pwa/                 # registro do service worker e estado de atualização do PWA
└── test/                # setup global de testes (mocks do SDK do Firebase)
```

## Code splitting por rota e por SDK do Firebase

Toda rota exceto a home (`src/routes/Home.tsx`) é carregada via `React.lazy()` em `App.tsx`. Isso sozinho não bastava: `AuthProvider` precisa saber se há sessão ativa em toda a árvore (inclusive na home pública), então `firebase/auth` é importado de forma eager. Por isso os módulos Firebase ficam separados por responsabilidade, para que essa necessidade global de Auth não puxe Firestore nem App Check para quem só está chegando à home, à demonstração ou ao login.

A separação atual é: `src/firebase/app.ts` (só `initializeApp`, eager), `src/firebase/config.ts` (só `getAuth`, eager — usado por `AuthContext`), `src/firebase/appCheck.ts` (App Check opcional com reCAPTCHA v3 quando há chave de ambiente) e `src/firebase/db.ts` (Firestore + App Check, importado apenas pelos módulos que leem/escrevem dados familiares). `src/firebase/auth.ts` mantém `entrar`, `sair` e `redefinirSenha` sem Firestore; somente `cadastrar()` importa dinamicamente `firebase/firestore` e `./db` para criar `responsaveis/{uid}`. Resultado: a tela de login não baixa o SDK do Firestore, enquanto cadastro, perfis, progresso e atividades ainda carregam Firestore quando realmente precisam persistir dados.

Isso importa porque muitas famílias que mais precisam desta plataforma têm conexões de internet limitadas — carregar menos JavaScript na primeira visita (antes mesmo de decidir criar conta) é uma questão de acessibilidade, não só de performance.

`src/firebase/appCheck.ts` é chamado por `db.ts` antes da criação do Firestore. Quando `VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY` está vazia, ele retorna `null` e não ativa App Check; quando está preenchida, inicializa `initializeAppCheck` com `ReCaptchaV3Provider` e renovação automática de token. A ativação real de enforcement continua fora do código e deve ser feita no Console do Firebase depois de monitoramento, como descrito em `docs/SEGURANCA.md`.

`src/firebase/db.ts` também centraliza a escolha do cache local do Firestore. O padrão é cache em memória; cache offline persistente só é usado quando a família ativa a flag local nas configurações antes de recarregar o app, evitando gravar dados infantis em dispositivos compartilhados sem consentimento explícito. Esse suporte aumenta o chunk lazy do Firestore, mas não volta para o bundle inicial público: é um custo pago apenas dentro da área autenticada, em troca de resiliência para conexões instáveis.

O `vite.config.ts` mantém `chunkSizeWarningLimit` em 600 kB porque o maior chunk esperado é justamente o vendor lazy do Firestore; abaixo disso o aviso padrão de 500 kB virava ruído mesmo sem afetar a primeira visita. Esse limite ainda funciona como orçamento: crescimento real do Firestore, do entry público ou de outro vendor acima de 600 kB volta a aparecer no build.

O manifest em `public/site.webmanifest` permite instalar/fixar o app em celular ou tablet com nome, ícone e cor próprios. Um service worker (`vite-plugin-pwa`, modo `generateSW`, ver `vite.config.ts`) faz precache do app shell (HTML/JS/CSS/SVG/fontes), permitindo abrir o app sem conexão e atualizar sozinho quando uma nova versão é publicada — `src/pwa/registrarServiceWorker.ts` registra isso fora do ambiente de teste (`import.meta.env.MODE === 'test'`), e `src/components/ui/AvisoConexao.tsx` mostra um aviso calmo de offline/atualização, nunca automático demais (sem recarregar sozinho). Essa decisão mantém a instalação/offline do **código** do app separada do cache de **dados**: dados infantis persistentes continuam sob a escolha explícita de cache offline do Firestore dentro das configurações (`src/firebase/db.ts`), não do service worker.

`src/hooks/useConexao.ts` expõe `useEstaOffline` (baseado nos eventos `online`/`offline` do navegador) e `useAtualizacaoPWADisponivel` (observando `src/pwa/estadoAtualizacaoPWA.ts`, um pub-sub simples separado do módulo que importa o virtual module `virtual:pwa-register` — separação deliberada para que testes de componente não precisem resolver esse módulo virtual só para observar o estado de atualização).

## Jardim de Conquistas: derivado, não persistido

`src/curriculo/jardim.ts` (`calcularJardim`) deriva o estágio de cada canteiro (semente/brotando/floresceu) a partir de `trilhaV1.modulos` e do `Set` de atividades dominadas do perfil — não existe nenhum campo novo no Firestore para o jardim. Isso significa que o jardim nunca pode ficar dessincronizado do progresso real: não há dois lugares para o mesmo dado divergir. `src/routes/crianca/Jardim.tsx` reaproveita `acentosPorModulo` (extraído para `src/curriculo/coresModulo.ts`, compartilhado com `Trilha.tsx`) para manter a mesma identidade visual de cor por módulo nas duas telas.

## Traçado de Letras: geometria em vez de canvas/OCR

`src/curriculo/tracadoLetras.ts` representa o guia de cada letra como polilinhas num espaço de coordenadas 0-100 (mesmo viewBox dos ícones em `curriculo/ativos/Icone.tsx`), e a avaliação (`avaliarTracado`) usa distância ponto-a-segmento — geometria pura, sem `<canvas>`, sem rasterização de pixel e sem nenhuma dependência de OCR/ML. A escolha evita duas armadilhas: (1) o stub de `HTMLCanvasElement.getContext` em `src/test/setup.ts` só existe para o `axe-core` não quebrar ao inspecionar canvas, não para suportar desenho real — testar lógica de traçado baseada em canvas exigiria mockar `getImageData` de um jeito que nunca reflete o desenho real; (2) manter tudo em SVG (guia pontilhado + traço do usuário, ambos `<polyline>`) reaproveita o mesmo padrão de ícones do resto do app. A avaliação em si é uma função pura testável com arrays de `{x, y}`, sem DOM.

O componente (`src/components/atividades/TracadoLetra.tsx`) só avalia quando a criança clica "Verificar traçado" — nunca automaticamente enquanto ela desenha, consistente com "nada acontece sem uma ação explícita" no resto da trilha. O resultado aprovado/reprovado é traduzido para uma chamada de `responder()` do `useTentativa` igual às demais atividades (usando `atividade.resposta.id` quando aprovado, um id sentinela quando não), reaproveitando de graça o esmaecimento de dica e o critério de domínio já existentes em vez de duplicar essa lógica para um tipo de resposta contínua.

## Débitos técnicos conhecidos (não escondidos, documentados)

- **Exclusão em cascata**: ver `docs/SEGURANCA.md`.
- **`Cartao` polimórfico**: o componente `src/components/ui/Cartao.tsx` suporta `as="div" | "form"` via união de tipos manual — funciona, mas não escala bem se precisar de mais tags no futuro (nesse caso, vale considerar uma lib de polimorfismo tipo `Slot` do Radix, mas isso seria over-engineering para as duas variantes atuais).
