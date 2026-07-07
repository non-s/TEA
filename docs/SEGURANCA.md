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

Cada responsável só consegue ler/escrever dentro do próprio `responsaveis/{uid}` — a regra central é `request.auth.uid == responsavelId` em todo o subárvore, com uma exceção estreita e explícita para leitura por colaborador (ver seção dedicada abaixo). As regras também validam o formato dos documentos antes de aceitar escrita: campos permitidos, consentimento de privacidade do responsável, enums de perfil funcional, tamanhos máximos de textos, plano curto de regulação, quatro cartões funcionais conhecidos, preferências booleanas, tipo de observação, estrutura de tentativa e lista de e-mails de colaborador. O cliente repete essa validação nos normalizadores de domínio antes de renderizar ou salvar dados básicos do perfil, perfil funcional/plano individual, preferências sensoriais/motoras e tentativas: nome/apelido é cortado no limite aceito, avatar e interesse fora das listas voltam para padrões seguros, atividades dominadas inválidas são descartadas, booleanos inválidos não viram estado de UI, tamanho de fonte desconhecido volta para `normal`, tentativas corrompidas são ignoradas antes de afetar dica/domínio/relatórios, o plano de regulação limita cada texto a 140 caracteres e textos são cortados nos mesmos limites aceitos pelas regras. Isso reduz risco de payload arbitrário, dado infantil corrompido, cache legado quebrando a sessão ou observações longas demais dentro do próprio namespace da família.

As regras de perfil assumem documentos criados ou atualizados pelo schema atual da aplicação. Se forem aplicadas sobre dados antigos de desenvolvimento, primeiro regrave/migre os perfis para incluir `perfilApoio`, `perfilApoio.planoRegulacao`, `preferenciasSensoriais`, `planoIndividual`, `atividadesDominadas` e os quatro cartões funcionais normalizados; caso contrário, updates parciais em documentos legados podem ser recusados corretamente por falta de formato completo.

As coleções `tentativas` e `observacoesSessao` são históricas: as regras permitem `create` apenas quando o registro tem o formato esperado, bloqueiam `update` e permitem `delete` apenas pelo próprio responsável. Isso impede adulteração silenciosa de registros individuais, mas preserva o direito da família de apagar dados do perfil quando necessário.

## Acesso de um segundo responsável (colaborador)

Cada perfil de criança pode ter até 3 e-mails de colaborador em `colaboradoresEmail` (`src/firebase/perfis.ts#adicionarColaborador`/`removerColaborador`), adicionados manualmente pelo responsável dono da conta em "Gerenciar perfis". É pensado para um segundo responsável ou terapeuta acompanhar o progresso à distância, sem precisar da senha da conta principal.

O que um colaborador pode fazer, e o que não pode:

- **Pode**: ler o perfil, o progresso (tentativas) e as observações de sessão daquele perfil especificamente, e registrar uma nova observação de sessão.
- **Não pode**: editar o perfil, adicionar/remover outros colaboradores, criar tentativas (como se estivesse "jogando" pela família), apagar qualquer dado, nem ver o documento raiz `responsaveis/{uid}` (nome/e-mail/consentimento do responsável dono).

Como não há backend próprio (Cloud Functions exige o plano pago Blaze, fora do orçamento do projeto), não existe um fluxo de convite automatizado. O responsável compartilha manualmente um link (`/colaborador/{uidResponsavel}/{perfilId}`) com a pessoa, que precisa:

1. Ter (ou criar) uma conta no TEA com o **mesmo e-mail** que o responsável cadastrou como colaborador.
2. Verificar esse e-mail (clicar no link de verificação) — sem isso, as regras recusam o acesso. Essa exigência existe porque o Firebase Auth permite criar uma conta com qualquer e-mail sem provar posse da caixa de entrada; exigir `email_verified` evita que alguém se cadastre com o e-mail de outra pessoa para roubar o acesso antes do dono legítimo confirmar a própria conta.

A validação de que o e-mail do token (`request.auth.token.email`) bate com um item da lista `colaboradoresEmail` do perfil acontece inteiramente nas Firestore Rules (`firestore.rules#colaboradorAutorizado`), não no cliente — um colaborador mal-intencionado não consegue contornar isso só editando o JavaScript da página.

**Limitação conhecida**: esta funcionalidade não passou por testes automatizados de regras em emulador (o projeto não tem infraestrutura de emulator/rules-unit-testing configurada). A verificação foi manual, seguindo este roteiro antes de publicar qualquer atualização das regras no Console: (1) dono lê/edita o próprio perfil normalmente; (2) usuário autenticado sem e-mail na lista tenta ler o perfil e é recusado; (3) e-mail na lista mas conta não verificada é recusado; (4) e-mail na lista e verificado consegue ler perfil/tentativas/observações e criar uma observação; (5) esse mesmo colaborador tenta criar uma tentativa, editar o perfil ou ler `responsaveis/{uid}` diretamente e é recusado em todos os casos.

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

## Cache offline: app (sempre) vs. dados (opt-in)

Um service worker guarda em cache o **código** do app (HTML/JS/CSS/ícones) para abrir sem conexão e instalar como app — isso é sempre ativo, mesmo antes de qualquer login, porque não envolve nenhum dado pessoal, só os arquivos públicos do site (ver `docs/ARQUITETURA.md`). Esse cache é atualizado automaticamente quando uma nova versão é publicada, com um aviso visível na tela para a família recarregar quando quiser.

Isso é deliberadamente separado do cache de **dados** do Firestore (perfil, progresso, tentativas), que continua opt-in por dispositivo, descrito abaixo. Desativar/limpar um não afeta o outro.

Por padrão, o Firestore usa cache em memória nesta aplicação. Na tela de configurações, o responsável pode ativar cache offline persistente apenas para aquele navegador/dispositivo. Quando ativado, o SDK do Firebase pode manter dados de perfil e progresso no armazenamento local do navegador para carregar a aplicação e sincronizar tentativas quando a conexão voltar.

Esse ajuste é deliberadamente local e opt-in: não é sincronizado entre dispositivos, não ativa compartilhamento com terceiros e deve ser usado apenas em dispositivo confiável. Desativar o ajuste impede o uso de cache persistente nos próximos carregamentos, mas não promete apagar imediatamente uma cópia IndexedDB já criada pelo SDK do Firebase durante a sessão atual; em computador compartilhado, a recomendação é deixar desativado e limpar os dados do site pelo navegador depois do uso.

## Resposta por voz e dados de áudio

Quando a família ativa "Resposta por voz" nas configurações (opt-in por dispositivo, desligado por padrão — ver `docs/ARQUITETURA.md`), a Nomeação Expressiva passa a aceitar fala como via alternativa ao toque. Ao tocar em "Falar a resposta", o navegador aciona sua própria API de reconhecimento de fala (Web Speech API); em navegadores baseados em Chromium isso envia o áudio captado para um serviço de reconhecimento de fala do próprio navegador/fabricante (fora da infraestrutura desta plataforma) para ser transcrito em texto. O TEA nunca recebe, armazena ou processa o áudio em si — só o texto já transcrito, comparado localmente contra a resposta esperada da atividade (`src/curriculo/reconhecimentoFala.ts`) e descartado após a comparação (não é salvo no Firestore; só o resultado certo/errado da tentativa é registrado, exatamente como uma resposta por toque).

Essa é uma escolha explícita: a plataforma não teria como oferecer reconhecimento de fala próprio dentro do orçamento zero-custo do projeto, então reaproveita o que o navegador já oferece nativamente, sendo transparente sobre a consequência (áudio sai do dispositivo para transcrição) em vez de esconder isso atrás de um botão sem explicação. A opção nunca é ativada automaticamente, é sempre alternativa ao toque (nunca obrigatória) e é uma preferência do navegador/dispositivo, não do perfil da criança — não é sincronizada com o Firestore.

## Exclusão de perfil

Na tela de gerenciamento de perfis, o responsável pode apagar um perfil depois de digitar o nome/apelido da criança para confirmar. A ação remove o documento do perfil e também limpa as subcoleções `tentativas` e `observacoesSessao` em lotes antes de apagar o perfil principal.

Essa exclusão acontece diretamente na conta autenticada do responsável, usando as mesmas regras de isolamento por `request.auth.uid == responsavelId`. As subcoleções de tentativas e observações são removidas em lotes antes do documento do perfil, e a exclusão do perfil principal é permitida apenas para o próprio responsável. O diálogo de remoção oferece um atalho para a exportação local antes da confirmação quando a família precisar guardar histórico.

## Exclusão de conta

Na tela de configurações, o responsável também pode apagar a conta inteira. Esse fluxo exige senha atual e confirmação textual `APAGAR CONTA`, reautentica o usuário no Firebase Auth, remove todos os perfis com suas subcoleções de tentativas/observações, apaga o documento `responsaveis/{uid}` e por último exclui o usuário do Auth. Quando existe um perfil ativo, a mesma tela mostra um atalho direto para a exportação local antes da confirmação destrutiva.

As regras permitem apagar o documento raiz apenas pelo próprio responsável autenticado. A exclusão de conta não tenta apagar arquivos locais que a família já baixou nem cópias IndexedDB/cache do navegador; por isso a interface continua recomendando exportar o que precisar guardar e limpar dados do site em dispositivo compartilhado.

## Retenção de dados e backup

O projeto usa o Cloud Firestore na região `southamerica-east1` (São Paulo) — confirmado no Console em julho de 2026. Isso significa que os dados da família **não saem do Brasil**, então não há transferência internacional a declarar para efeitos de LGPD.

No plano gratuito Spark, o Firestore **não oferece recuperação pontual (PITR) nem backups programados** — esses recursos exigem upgrade para o plano pago Blaze, o que o projeto optou por não fazer (ver `docs/SEGURANCA.md#autenticação` sobre a mesma decisão em relação a MFA). Na prática, isso quer dizer:

- Quando um perfil ou conta é apagado pela interface (ver seções acima), a remoção é imediata e não existe uma cópia de backup gerenciada pelo Firebase para recuperar depois.
- Não há uma janela de retenção formal "os dados ficam guardados por X dias após a exclusão" — o dado excluído via `deleteDoc`/`deleteUser` deixa de existir no banco ativo assim que a operação é confirmada pelo Firestore.
- A única cópia que pode sobreviver à exclusão é um arquivo já exportado manualmente pela família (ver "Exportação local" acima) ou uma cópia IndexedDB/cache local do navegador — nenhuma delas fica sob controle do mantenedor.

Se o projeto algum dia adotar o plano Blaze, esta seção precisa ser atualizada para refletir a janela de retenção real dos backups configurados.

## Autenticação

- O responsável usa Firebase Authentication (e-mail/senha). A criança **nunca digita senha** — ela só escolhe seu próprio avatar dentro da sessão já autenticada do responsável (`PerfilAtivoContext`), guardado em `sessionStorage` (não sobrevive a fechar o navegador).
- Ao cadastrar, o cliente exige senha com pelo menos 8 caracteres, misturando letras e números (`src/routes/responsavel/Cadastro.tsx#senhaFraca`), reforçando o mínimo de 6 caracteres do próprio Firebase Auth. Essa validação é só no cliente; o limite autoritativo continua sendo o Firebase.
- Ao cadastrar, o app envia automaticamente um e-mail de verificação (`sendEmailVerification`); enquanto o e-mail não é confirmado, um aviso discreto aparece nas telas do responsável com opção de reenviar (`AvisoEmailNaoVerificado`). A verificação não bloqueia o uso do app hoje, mas é um passo importante de higiene de conta e pré-requisito para o compartilhamento com um segundo responsável (ver seção "Acesso de um segundo responsável" abaixo).
- Antes de chamar o Firebase Auth, o cliente normaliza e-mail para minúsculas, limita e-mail/nome do responsável aos mesmos tamanhos aceitos pelo documento `responsaveis/{uid}` e rejeita e-mail grande demais antes de criar a conta. Isso reduz risco de criar usuário no Auth e falhar logo depois ao gravar o documento do responsável no Firestore.
- O perfil ativo da criança é salvo no `sessionStorage` junto com o UID do responsável autenticado. Ele é removido quando o responsável sai da conta, quando o Firebase informa que não há usuário autenticado, quando o UID salvo não bate com o usuário atual ou quando existe um formato legado sem responsável verificável. Isso evita que um dispositivo compartilhado mantenha contexto infantil antigo depois de logout, expiração de sessão ou troca de conta.
- A tela de login aplica um cooldown local por navegador/e-mail depois de falhas repetidas (`src/utils/limiteLogin.ts`). O e-mail é normalizado e transformado em uma chave local derivada antes de ir para `localStorage`, evitando gravar o endereço em texto claro; isso não é criptografia nem proteção contra força bruta. A medida reduz tentativas em sequência, evita martelar a API pública e melhora a mensagem para a família; não substitui rate limiting real de servidor.
- Recuperação de senha via `sendPasswordResetEmail` (fluxo padrão do Firebase).
- A `apiKey` do Firebase que aparece no bundle JS público **é pública por design** — não é segredo. A segurança real vem inteiramente das Firestore Rules, não do sigilo dessa chave. Isso é documentado aqui para qualquer auditor de segurança que veja a chave no código-fonte e queira saber se isso é um problema (não é, desde que as regras estejam corretas).

## App Check opcional

O cliente já inicializa Firebase App Check quando `VITE_FIREBASE_APPCHECK_RECAPTCHA_SITE_KEY` está preenchida. A inicialização fica em `src/firebase/appCheck.ts`, usa `ReCaptchaV3Provider` com renovação automática de token e é chamada antes de criar Auth/Firestore em `src/firebase/config.ts` e `src/firebase/db.ts`. Sem essa variável, forks e desenvolvimento local continuam funcionando sem App Check.

Para produção, o app Web precisa ser registrado em Firebase Console > App Check, a chave pública reCAPTCHA v3 deve ser colocada no `.env.local`/segredo de build, e o enforcement deve ser ligado só depois de monitorar que navegadores legítimos estão recebendo tokens. App Check é uma camada adicional contra clientes não autorizados e abuso automatizado; ele não substitui Firebase Auth, Firestore Rules, consentimento explícito, minimização de dados ou revisão do modelo de acesso.

## Verificação automatizada de segurança

Como o projeto não tem orçamento para contratar uma auditoria de segurança humana independente, o que existe hoje é verificação automatizada, gratuita, rodando a cada mudança de código:

- **`npm audit --audit-level=high`** no CI (`.github/workflows/ci.yml`) — quebra o build se uma dependência tiver vulnerabilidade conhecida de severidade alta ou crítica.
- **Dependabot** (`.github/dependabot.yml`) — abre PR automático toda semana para atualizar dependências desatualizadas do npm e das GitHub Actions; alertas de vulnerabilidade e correções automáticas de segurança estão habilitados no repositório.
- **CodeQL** (`.github/workflows/codeql.yml`) — análise estática (SAST) do código JavaScript/TypeScript a cada push/PR na `main` e semanalmente, usando o mecanismo gratuito do GitHub para repositórios públicos.
- **Secret scanning** e **push protection** do GitHub já vêm habilitados no repositório, para pegar credenciais commitadas por engano antes mesmo do push.

Isso pega uma classe real de problemas (dependências vulneráveis, segredos vazados, padrões inseguros conhecidos em código), mas **não substitui** uma auditoria ou pentest humano independente — nenhuma dessas ferramentas testa a lógica de negócio das Firestore Rules, engenharia social, ou vetores específicos da aplicação. Se você é uma instituição avaliando uso do TEA em escala, contratar uma auditoria humana continua sendo recomendado antes de tratar isso como suficiente.

## O que ainda não está implementado (limitações conhecidas)

- **Enforcement do App Check**: o código cliente está pronto, mas o bloqueio efetivo precisa ser ativado e monitorado no Console do Firebase do ambiente real; não vem ligado por padrão para evitar bloquear famílias legítimas durante configuração.
- **Rate limiting de servidor para login**: o cliente tem cooldown local para falhas repetidas, mas um atacante pode contornar JavaScript/localStorage; o limite autoritativo continua sendo o Firebase Auth.
- **Logs de auditoria**: não há log de quem acessou o quê além do que o próprio Firebase Console oferece.
- **Autenticação multifator (MFA/2FA)**: o Firebase só oferece MFA (SMS ou TOTP) no plano pago Identity Platform; o projeto roda no plano gratuito Spark compartilhado com outros apps do mantenedor, e a decisão consciente foi não assumir esse custo por ora. A conta continua protegida só por e-mail/senha.
- **Auditoria de segurança humana independente**: nunca foi feita (nem pentest, nem bug bounty); ver seção acima sobre o que existe no lugar disso.

## Reportando uma vulnerabilidade

Se você encontrar uma falha de segurança (ex: uma forma de contornar as regras do Firestore, ou de acessar dados de outra família), por favor **não abra uma issue pública**. Abra um contato privado com o mantenedor pelo perfil do GitHub ([@non-s](https://github.com/non-s)) antes de divulgar publicamente.
