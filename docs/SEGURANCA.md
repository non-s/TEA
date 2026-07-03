# Segurança e privacidade

## Contexto importante: projeto Firebase compartilhado

O TEA usa o projeto Firebase `non-s-firebase-20260621`, que também hospeda outros aplicativos do mesmo mantenedor (não relacionados ao TEA). Isso significa:

- As regras do Firestore (`firestore.rules` neste repositório documenta **apenas** o bloco `match /responsaveis/{responsavelId}` — ele precisa ser colado dentro do arquivo de regras completo do projeto no Console do Firebase, ao lado dos blocos dos outros apps.
- O TEA **nunca** lê ou escreve em nenhuma coleção fora de `responsaveis/**` (não toca em `chamada_*`, `profiles`, `classes`, etc., usadas por outros apps do mesmo projeto).
- Se você for reproduzir este projeto do zero, o caminho mais simples é criar seu **próprio** projeto Firebase dedicado — a única razão de compartilhar aqui é o mantenedor já ter outros projetos no plano gratuito Spark.

## Modelo de dados e isolamento

```
/responsaveis/{uid}
/responsaveis/{uid}/perfisCrianca/{perfilId}
/responsaveis/{uid}/perfisCrianca/{perfilId}/tentativas/{tentativaId}
/responsaveis/{uid}/perfisCrianca/{perfilId}/observacoesSessao/{observacaoId}
```

Cada responsável só consegue ler/escrever dentro do próprio `responsaveis/{uid}` — a regra central é `request.auth.uid == responsavelId` em todo o subárvore. As regras também validam o formato dos documentos antes de aceitar escrita: campos permitidos, consentimento de privacidade do responsável, enums de perfil funcional, tamanhos máximos de textos, plano curto de regulação, quatro cartões funcionais conhecidos, preferências booleanas, tipo de observação e estrutura de tentativa. O cliente repete essa validação nos normalizadores de domínio antes de renderizar ou salvar dados básicos do perfil, perfil funcional/plano individual, preferências sensoriais/motoras e tentativas: nome/apelido é cortado no limite aceito, avatar e interesse fora das listas voltam para padrões seguros, atividades dominadas inválidas são descartadas, booleanos inválidos não viram estado de UI, tamanho de fonte desconhecido volta para `normal`, tentativas corrompidas são ignoradas antes de afetar dica/domínio/relatórios, o plano de regulação limita cada texto a 140 caracteres e textos são cortados nos mesmos limites aceitos pelas regras. Isso reduz risco de payload arbitrário, dado infantil corrompido, cache legado quebrando a sessão ou observações longas demais dentro do próprio namespace da família. Não existe (ainda) nenhum mecanismo de compartilhamento entre contas (ex: um terapeuta externo acessando os dados de um paciente) — isso é uma limitação deliberada do v1, documentada em `docs/PEDAGOGIA.md`.

As regras de perfil assumem documentos criados ou atualizados pelo schema atual da aplicação. Se forem aplicadas sobre dados antigos de desenvolvimento, primeiro regrave/migre os perfis para incluir `perfilApoio`, `perfilApoio.planoRegulacao`, `preferenciasSensoriais`, `planoIndividual`, `atividadesDominadas` e os quatro cartões funcionais normalizados; caso contrário, updates parciais em documentos legados podem ser recusados corretamente por falta de formato completo.

As coleções `tentativas` e `observacoesSessao` são históricas: as regras permitem `create` apenas quando o registro tem o formato esperado, bloqueiam `update` e permitem `delete` apenas pelo próprio responsável. Isso impede adulteração silenciosa de registros individuais, mas preserva o direito da família de apagar dados do perfil quando necessário.

## Minimização de dados

Na criação de conta, o formulário exige uma confirmação destacada de que a pessoa é responsável pela criança e autoriza o uso dos dados mínimos para alfabetização e acompanhamento pela família. O helper de autenticação também recusa chamadas sem esse aceite antes de criar usuário no Firebase Auth, evitando conta parcial sem documento de responsável. O aceite salvo registra apenas versão, escopo (`uso-alfabetizacao-tea-v1`) e horário, e as regras exigem esse formato em novos documentos de responsável.

O app também expõe `/privacidade` como resumo público em linguagem direta antes do cadastro e a partir da home/configurações. Essa tela traduz o modelo descrito aqui para a família: dados coletados, dados não pedidos, finalidade, exportação, exclusão, cache local e limites da plataforma.

A rota pública `/demo` permite experimentar etapas curtas da trilha sem conta: emparelhamento visual, sílaba e pergunta literal de texto, com toque direto, confirmação, escolha mediada e interesse escolhido apenas naquela tela. Ela usa a mesma lógica pedagógica de dica, acesso e comunicação funcional, mas injeta um registrador local sem persistência; não cria usuário, não escreve tentativas no Firestore e não exige dado pessoal para a primeira experiência.

O manifest de instalação (`public/site.webmanifest`) só informa nome, ícone, URL inicial, cor e modo de exibição. Ele não registra service worker, não ativa cache automático do app shell e não muda a política de cache de dados infantis; a persistência offline do Firestore continua sendo opt-in por dispositivo confiável.

Dados coletados sobre a criança são deliberadamente mínimos:

- **Nome**: só primeiro nome/apelido (o formulário não pede sobrenome).
- **Sem foto real**: o avatar é um de 6 ícones pré-definidos (`src/curriculo/ativos/tipos.ts`), nunca upload de imagem.
- **Sem diagnóstico**: não existe campo para condição clínica, laudo, ou qualquer dado de saúde.
- **Sem data de nascimento**: não é coletada no v1.
- **Perfil funcional de apoio**: registra apenas como a criança costuma comunicar, acessar a tela e se regular dentro da plataforma, incluindo cartões de comunicação curtos personalizáveis e um plano de regulação com sinais/apoios/evitações em textos curtos. Não pede nível de suporte, laudo, escola, terapeuta, CID, histórico médico ou contato externo.

Os dados de progresso (`tentativas`) armazenam apenas: qual atividade, se acertou, quanto de dica precisou, e quanto tempo levou para responder — nada que identifique a criança além do vínculo com o perfil.

- **Observações de sessão**: texto livre curto com uma categoria leve (`comunicacao`, `regulacao`, `acesso`, `generalizacao` ou `outro`) para o responsável registrar sinais de conforto, cansaço, comunicação ou ajustes que funcionaram. A interface não pede laudo, diagnóstico, sobrenome, escola ou dado clínico sensível.

## Exportação local

Na tela de progresso, o responsável pode baixar um arquivo JSON com os dados já carregados daquele perfil: perfil funcional de apoio, preferências sensoriais, plano individual, atividades dominadas, resumo de progresso, tentativas e observações de sessão. As observações podem ser registradas manualmente pelo responsável ou automaticamente quando a criança usa cartões funcionais como "Pausa", "Ajuda", "Não sei" e "Pronto". A exportação é gerada no navegador e não cria nova coleção, não envia dados para outro serviço e não adiciona rastreamento. Por padrão, os nomes dos arquivos baixados usam apenas o tipo do arquivo e a data, sem nome/apelido da criança; o conteúdo ainda pode conter dados do perfil e deve ser compartilhado apenas por decisão da família.

Na mesma tela, o responsável também pode baixar arquivos locais para conversar com terapeutas, professores ou cuidadores: um relatório em Markdown para equipe, um plano de generalização fora da tela e cartões imprimíveis em HTML. Esses arquivos são resumos locais, não convites de acesso: a família escolhe se, quando e com quem compartilhar.

## Cache offline opcional

Por padrão, o Firestore usa cache em memória nesta aplicação. Na tela de configurações, o responsável pode ativar cache offline persistente apenas para aquele navegador/dispositivo. Quando ativado, o SDK do Firebase pode manter dados de perfil e progresso no armazenamento local do navegador para carregar a aplicação e sincronizar tentativas quando a conexão voltar.

Esse ajuste é deliberadamente local e opt-in: não é sincronizado entre dispositivos, não ativa compartilhamento com terceiros e deve ser usado apenas em dispositivo confiável. Desativar o ajuste impede o uso de cache persistente nos próximos carregamentos, mas não promete apagar imediatamente uma cópia IndexedDB já criada pelo SDK do Firebase durante a sessão atual; em computador compartilhado, a recomendação é deixar desativado e limpar os dados do site pelo navegador depois do uso.

## Exclusão de perfil

Na tela de gerenciamento de perfis, o responsável pode apagar um perfil depois de digitar o nome/apelido da criança para confirmar. A ação remove o documento do perfil e também limpa as subcoleções `tentativas` e `observacoesSessao` em lotes antes de apagar o perfil principal.

Essa exclusão acontece diretamente na conta autenticada do responsável, usando as mesmas regras de isolamento por `request.auth.uid == responsavelId`. As subcoleções de tentativas e observações são removidas em lotes antes do documento do perfil, e a exclusão do perfil principal é permitida apenas para o próprio responsável. A interface recomenda exportar uma cópia local antes da remoção quando a família precisar guardar histórico.

## Exclusão de conta

Na tela de configurações, o responsável também pode apagar a conta inteira. Esse fluxo exige senha atual e confirmação textual `APAGAR CONTA`, reautentica o usuário no Firebase Auth, remove todos os perfis com suas subcoleções de tentativas/observações, apaga o documento `responsaveis/{uid}` e por último exclui o usuário do Auth. Quando existe um perfil ativo, a mesma tela mostra um atalho direto para a exportação local antes da confirmação destrutiva.

As regras permitem apagar o documento raiz apenas pelo próprio responsável autenticado. A exclusão de conta não tenta apagar arquivos locais que a família já baixou nem cópias IndexedDB/cache do navegador; por isso a interface continua recomendando exportar o que precisar guardar e limpar dados do site em dispositivo compartilhado.

## Autenticação

- O responsável usa Firebase Authentication (e-mail/senha). A criança **nunca digita senha** — ela só escolhe seu próprio avatar dentro da sessão já autenticada do responsável (`PerfilAtivoContext`), guardado em `sessionStorage` (não sobrevive a fechar o navegador).
- Antes de chamar o Firebase Auth, o cliente normaliza e-mail para minúsculas, limita e-mail/nome do responsável aos mesmos tamanhos aceitos pelo documento `responsaveis/{uid}` e rejeita e-mail grande demais antes de criar a conta. Isso reduz risco de criar usuário no Auth e falhar logo depois ao gravar o documento do responsável no Firestore.
- O perfil ativo da criança é salvo no `sessionStorage` junto com o UID do responsável autenticado. Ele é removido quando o responsável sai da conta, quando o Firebase informa que não há usuário autenticado, quando o UID salvo não bate com o usuário atual ou quando existe um formato legado sem responsável verificável. Isso evita que um dispositivo compartilhado mantenha contexto infantil antigo depois de logout, expiração de sessão ou troca de conta.
- A tela de login aplica um cooldown local por navegador/e-mail depois de falhas repetidas (`src/utils/limiteLogin.ts`). O e-mail é normalizado e transformado em uma chave local derivada antes de ir para `localStorage`, evitando gravar o endereço em texto claro; isso não é criptografia nem proteção contra força bruta. A medida reduz tentativas em sequência, evita martelar a API pública e melhora a mensagem para a família; não substitui rate limiting real de servidor.
- Recuperação de senha via `sendPasswordResetEmail` (fluxo padrão do Firebase).
- A `apiKey` do Firebase que aparece no bundle JS público **é pública por design** — não é segredo. A segurança real vem inteiramente das Firestore Rules, não do sigilo dessa chave. Isso é documentado aqui para qualquer auditor de segurança que veja a chave no código-fonte e queira saber se isso é um problema (não é, desde que as regras estejam corretas).

## App Check opcional

O cliente já inicializa Firebase App Check quando `VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY` está preenchida. A inicialização fica em `src/firebase/appCheck.ts`, usa `ReCaptchaV3Provider` com renovação automática de token e é chamada antes de criar Auth/Firestore em `src/firebase/config.ts` e `src/firebase/db.ts`. Sem essa variável, forks e desenvolvimento local continuam funcionando sem App Check.

Para produção, o app Web precisa ser registrado em Firebase Console > App Check, a chave pública reCAPTCHA v3 deve ser colocada no `.env.local`/segredo de build, e o enforcement deve ser ligado só depois de monitorar que navegadores legítimos estão recebendo tokens. App Check é uma camada adicional contra clientes não autorizados e abuso automatizado; ele não substitui Firebase Auth, Firestore Rules, consentimento explícito, minimização de dados ou revisão do modelo de acesso.

## O que ainda não está implementado (limitações conhecidas)

- **Enforcement do App Check**: o código cliente está pronto, mas o bloqueio efetivo precisa ser ativado e monitorado no Console do Firebase do ambiente real; não vem ligado por padrão para evitar bloquear famílias legítimas durante configuração.
- **Rate limiting de servidor para login**: o cliente tem cooldown local para falhas repetidas, mas um atacante pode contornar JavaScript/localStorage; o limite autoritativo continua sendo o Firebase Auth.
- **Logs de auditoria**: não há log de quem acessou o quê além do que o próprio Firebase Console oferece.

## Reportando uma vulnerabilidade

Se você encontrar uma falha de segurança (ex: uma forma de contornar as regras do Firestore, ou de acessar dados de outra família), por favor **não abra uma issue pública**. Abra um contato privado com o mantenedor pelo perfil do GitHub ([@non-s](https://github.com/non-s)) antes de divulgar publicamente.
