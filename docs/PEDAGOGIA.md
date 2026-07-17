# Fundamentação pedagógica

Este documento explica **por que** a trilha do TEA é estruturada do jeito que é, com referência às fontes que embasam cada decisão. O objetivo é permitir que terapeutas, pedagogos e pesquisadores auditem e critiquem as escolhas — e que qualquer contribuidor entenda o raciocínio antes de propor mudanças em [`src/curriculo/`](../src/curriculo/).

## Princípio central: afirmação da neurodiversidade

Antes de qualquer técnica específica, uma decisão de design vem primeiro: **o objetivo desta plataforma não é fazer a criança "parecer menos autista"**. É ensinar uma habilidade acadêmica concreta (reconhecer letras, formar sílabas) da forma mais acessível possível para _aquela_ criança, respeitando autorregulação (stimming, pausas, ritmo próprio) e autonomia.

Essa postura segue o movimento de práticas afirmativas da neurodiversidade, que ganhou peso crescente na literatura de intervenção em TEA na última década:

- Dallman, Williams & Villa (2021), _"Autistic Self-Advocacy and the Neurodiversity Movement: Implications for Autism Early Intervention Research and Practice"_, propõem que intervenções afirmativas devem apoiar autonomia e autodeterminação, tratar apenas o que causa desconforto ou risco real, e não tentar eliminar traços não-prejudiciais.
- A Autistic Self Advocacy Network (ASAN) documenta preocupações históricas sobre intervenções (incluindo ABA tradicional) com o objetivo declarado de tornar a criança "indistinguível" de pares neurotípicos — algo que esta plataforma rejeita explicitamente como meta.

Na prática, isso significa:

- **Nunca** há feedback punitivo, tom de voz alarmante ou "contagem de erros" visível à criança — errar apenas dá mais suporte na tentativa seguinte (ver "Ensino sem erro" abaixo).
- **Nunca** há cronômetro pressionando a resposta. A criança responde no seu tempo.
- A criança pode sair de qualquer atividade a qualquer momento (botão "Voltar para a trilha" sempre visível) — nunca é obrigada a terminar.
- Os ajustes sensoriais e motores (som, animação, contraste, tamanho de fonte e alvos maiores) existem porque a carga sensorial e a precisão de acesso corretas são decididas pela criança/família, não pela plataforma.
- O vocabulário da interface evita linguagem de "cura" ou "correção de comportamento" — fala-se em _aprender_, _praticar_, _dominar uma habilidade_.

## Por que o foco é 100% TEA, "não importando o grau"

O TEA é um espectro amplo — da DSM-5, os "níveis de suporte" (1 a 3) descrevem necessidade de apoio, não capacidade cognitiva ou valor da pessoa, e a maioria das pessoas autistas não se encaixa perfeitamente em um nível fixo ao longo da vida. Por isso a trilha:

1. **Não assume fala funcional.** Nenhuma atividade exige que a criança fale para responder — todas usam toque/seleção entre opções (compatível com CAA, apoio a crianças minimamente verbais) como via principal.
2. **Não assume leitura prévia.** O Módulo 0 começa em discriminação visual pura (formas, não letras), o pré-requisito mais básico possível antes de qualquer conteúdo acadêmico.
3. **Oferece dica com esmaecimento em toda atividade** (ver abaixo), então uma criança que precisa de mais suporte visual recebe mais suporte, e uma que já domina o conceito avança rápido — o mesmo currículo serve necessidades de suporte muito diferentes.
4. **É ajustável sensorial e motoramente**, já que hipo/hipersensibilidade sensorial, coordenação motora fina, precisão de toque e forma de mediação variam enormemente entre indivíduos autistas e não se correlacionam diretamente com "nível de suporte".

## A sequência de habilidades (Módulos 0–11, mais o módulo paralelo 3-T)

A ordem dos módulos segue uma cadeia de pré-requisitos bem estabelecida na literatura comportamental sobre discriminação de estímulos, unida ao consenso mais recente sobre alfabetização em TEA.

### Módulo 0 — Emparelhamento Idêntico

Discriminação visual básica (tocar a figura idêntica à mostrada) é o pré-requisito mais elementar antes de qualquer tarefa acadêmica em programas comportamentais — sem essa habilidade, nenhuma instrução visual seguinte é significativa. Por isso o módulo começa com formas abstratas (não letras), removendo a exigência de já "saber" o alfabeto.

### Módulo 1 — Maiúscula e Minúscula

Depois de emparelhamento idêntico, o próximo passo é generalização: reconhecer que "A" e "a" são a _mesma_ letra apesar de visualmente diferentes. Essa etapa intermediária de emparelhamento por identidade/categoria é o que separa cópia visual pura de reconhecimento conceitual.

### Módulo 2 — Nomeação Receptiva de Letras

"Toque na letra que eu disser" (nomeação receptiva) é ensinada antes de "diga o nome desta letra" (nomeação expressiva) porque não depende de fala — é acessível a crianças não-verbais ou com fala emergente, e antecede consistentemente a nomeação expressiva em programas de ensino de discriminação. Vogais entram primeiro, seguidas pelas 5 consoantes de maior frequência em português (M, P, T, L, B), refletindo a ordem comum de cartilhas fônicas no Brasil.

### Módulo 3 — Nomeação Expressiva de Letras

Agora a criança escolhe/produz o nome da letra mostrada, e não apenas a localiza. A via principal continua sendo escolher a letra correspondente ao nome falado/ouvido entre poucas opções — acessível a crianças não-verbais, minimamente verbais ou com fala emergente.

### Módulo 3-T — Traçado de Letras

Em paralelo ao Módulo 3 (mesmo pré-requisito, sem depender um do outro), a trilha oferece uma atividade grafomotora: a criança traça a letra sobre um guia pontilhado, com o dedo ou o mouse. Isso responde a uma limitação real das atividades anteriores — todas usam reconhecimento/seleção, nenhuma pratica o movimento de escrever a letra, que é uma habilidade separada e necessária para alfabetização funcional. A revisão de Verma & Lahiri (2022, _Review Journal of Autism and Developmental Disorders_) descreve dificuldades de escrita à mão como um achado consistente em autismo (nos componentes espacial, temporal e cinestésico do movimento) e cataloga abordagens de intervenção convencionais e assistidas por tecnologia — o traçado guiado desta plataforma é uma versão minimalista e gratuita dessa categoria, não uma intervenção clínica de terapia ocupacional.

A avaliação do traçado (`src/curriculo/tracadoLetras.ts`) é deliberadamente tolerante: mede se o traçado ficou perto do guia (precisão) e se percorreu o guia inteiro (cobertura), sem comparar contra uma fonte real nem exigir caligrafia. Não é uma ferramenta de avaliação motora clínica — é uma prática de exposição ao movimento, com o mesmo esquema de dica/critério de domínio das outras atividades.

Esse módulo é deliberadamente **não bloqueante**: ele não é pré-requisito de Formação de Sílabas, e Formação de Sílabas não exige tê-lo completado. A decisão é de inclusão de acesso — o toque em uma tela e o traçado motor fino são habilidades diferentes, e uma criança cujo perfil de acesso não favorece coordenação motora fina (por exemplo, quem usa escolha mediada ou acionador) não deveria ficar bloqueada de avançar na leitura por não conseguir/preferir traçar.

### Módulo 4 — Consciência Fonológica e Formação de Sílabas

Juntar consoante + vogal (ex: M + A = "MA") só é introduzido depois que as letras-alvo já foram dominadas nos módulos 2–3 — consciência fonológica depende de já reconhecer os grafemas envolvidos. O método é fônico-silábico, o padrão de alfabetização inicial em português do Brasil, com apoio de imagem (ponte de Comunicação Alternativa: a sílaba aparece associada a uma palavra/figura familiar, ex. "MA" de "mamãe"). A trilha cobre combinações CV com as consoantes ensinadas e as vogais A/E/I/O/U, como MA/ME/MI/MO/MU, PA/PE/PI/PO/PU, TA/TE/TI/TO/TU, LA/LE/LI/LO/LU e BA/BE/BI/BO/BU.

A pesquisa mais recente sobre leitura em TEA (Wittenburg-Bausell & Ganz, 2020, _"The Promise of Comprehensive Early Reading Instruction for Children With Autism"_, ASHA _LSHSS_) recomenda cobrir os "cinco pilares" da leitura — consciência fonêmica, fonética, fluência, vocabulário e compreensão — de forma direta, sistemática e individualizada. A trilha desta plataforma começa pelos dois primeiros pilares (consciência fonêmica e fonética/fonics) e, depois de palavras simples, introduz leitura inicial de frases curtas por seleção, compreensão literal de frase, primeiro contato com textos de duas frases, perguntas literais sobre esses textos, discriminação explícita de palavra que apareceu/não apareceu e inferência guiada por seleção. Fluência, vocabulário amplo e compreensão textual aberta continuam como evolução futura.

### Módulo 5 — Formação de Palavras Simples

Depois que a criança domina sílabas-alvo, a trilha introduz palavras CV-CV compostas apenas por sílabas já trabalhadas (ex: "MALA", "PATA", "BALA", "MAPA", "LAMA", "BABA", "MOTO", "PIPA", "BOLA", "BULE", "LOBO" e "TUBO"). A tarefa ainda é por seleção/toque, sem exigir fala, e mantém o mesmo desenho de ensino sem erro. Esta etapa cria a ponte entre consciência silábica e leitura de palavras, com repertório suficiente para variar frases e textos sem introduzir sílabas novas escondidas.

### Módulo 6 — Leitura de Frases Simples

Após palavras isoladas, a trilha apresenta frases curtas formadas com palavras já praticadas, como "A MALA", "A BALA", "O MAPA", "A MOTO" e "O BULE". A criança escolhe a frase correta entre poucas opções; não precisa ler em voz alta, falar oralmente nem responder perguntas abertas. A meta é começar a coordenar palavra + função de frase com baixa carga cognitiva, mantendo previsibilidade, pausas e apoio visual.

### Módulo 7 — Compreensão de Frases

Depois de escolher a frase correta, a trilha dá um passo pequeno para compreensão literal: a criança lê ou escuta uma frase curta e escolhe a palavra que aparece nela. A resposta continua por seleção entre poucas palavras conhecidas, sem pergunta aberta e sem fala obrigatória. Isso começa a trabalhar compreensão sem abandonar a estrutura visual, o ensino sem erro e a comunicação funcional.

### Módulo 8 — Compreensão de Textos Curtos

Depois da frase isolada, a trilha apresenta textos de duas frases formados apenas por palavras já praticadas (ex: "A MALA. A BALA.", "O MAPA. A MALA." e "A MOTO. A PIPA."). A criança escolhe uma palavra que aparece no texto entre poucas alternativas conhecidas. Ainda não há pergunta aberta, reconto ou exigência de fala; o objetivo é aumentar a unidade de leitura de uma frase para um texto mínimo preservando seleção visual, previsibilidade e apoio.

### Módulo 9 — Perguntas Literais sobre Textos

Depois de reconhecer palavras dentro de textos curtos, a trilha apresenta uma pergunta literal simples sobre o texto, como "O que apareceu primeiro?" ou "O que apareceu depois?". A resposta continua por seleção entre palavras conhecidas, sem fala oral, digitação, reconto, inferência ou pergunta aberta. Esse degrau começa a aproximar compreensão de pergunta-resposta mantendo baixa carga motora, previsibilidade e apoio visual.

### Módulo 10 — Presença e Ausência no Texto

Antes de pergunta aberta, a trilha acrescenta um degrau literal mais explícito: a criança responde "Qual palavra apareceu no texto?" ou "Qual palavra não apareceu no texto?". Esse tipo de pergunta trabalha atenção ao texto inteiro e discriminação de presença/ausência com palavras conhecidas, sem exigir explicar, recontar, interpretar intenção de personagem ou produzir fala oral. Tecnicamente, cada atividade declara se a resposta correta deve estar presente ou ausente no texto, e o validador da trilha confere isso para evitar telas com duas respostas semanticamente corretas.

### Módulo 11 — Inferência Guiada em Textos

Depois de dominar presença/ausência literal, a trilha introduz inferência guiada com perguntas de sentido muito ancoradas no repertório já ensinado, como "Qual palavra anda na rua?" depois de ler "A MOTO. A PIPA.". A resposta continua por seleção entre poucas palavras conhecidas, sem fala oral, escrita, justificativa aberta ou avaliação de intenção social complexa. O objetivo é começar a ligar texto e conhecimento sem abandonar previsibilidade, apoio visual e baixa carga motora. O validador exige que o texto use apenas palavras já ensinadas, que a pergunta exista, que a resposta seja uma palavra já ensinada e que ela apareça no texto âncora.

Nas atividades de frase e texto, a tela de preparação também lembra o mediador de fazer uma leitura compartilhada curta: esperar comunicação por olhar, gesto, toque, vocalização ou CAA, comentar uma palavra do texto e só então convidar a criança a responder. Essa decisão se inspira em leitura dialogada/compartilhada adaptada ao autismo: a revisão de Alharbi, Terlektsi & Kossyvaki (2023) encontrou qualidade de relato adequada/forte nos estudos incluídos e concluiu que a prática é promissora, embora os efeitos sobre iniciações e respostas comunicativas ainda sejam inconsistentes. Por isso o app usa esse apoio como orientação leve de mediação, não como exigência, escore ou intervenção clínica fechada.

## Técnicas de ensino usadas em toda atividade

### Ensino sem erro (errorless learning) e esmaecimento de dica (prompt fading)

Cada atividade tem 3 níveis de dica, do mais para o menos suporte: **modelagem** (a resposta aparece com o aviso visual "Escolha esta") → **destaque visual** (a opção correta recebe um leve brilho) → **nenhuma** (resposta independente). A criança começa recebendo suporte total e o sistema retira o suporte gradualmente conforme os acertos se acumulam — e devolve suporte na primeira resposta errada.

Esse desenho segue diretamente a literatura sobre _most-to-least prompting_: começar com o prompt mais intrusivo e esmaecer reduz a chance de a criança "praticar" o erro, o que a pesquisa mostra reduzir frustração e acelerar aquisição em comparação com deixar a criança errar livremente primeiro.

A interface mostra o apoio atual em linguagem simples ("Sozinho", "Com pista", "Com ajuda visual"). Isso ajuda o adulto mediador a entender quando manter ou retirar suporte sem transformar erro em falha pública para a criança.

O relatório do responsável também calcula uma recomendação de apoio graduado a partir das tentativas recentes da atividade-alvo: aumentar apoio quando há baixo acerto, manter quando a resposta ainda precisa estabilizar e reduzir um passo quando há acerto com suporte alto. A recomendação é sempre operacional ("modelar", "destacar", "esperar") e preserva conforto antes de independência.

### Critério de domínio

Uma atividade é considerada dominada assim que a criança acerta uma vez já no nível "sem dica" — depois de ter passado pelo esmaecimento de modelagem e destaque visual descrito acima. Isso evita o problema oposto de exigir repetição excessiva do mesmo item depois que a criança já demonstrou saber a resposta sem nenhum apoio: uma vez que a resposta veio de forma independente, insistir em mais tentativas idênticas não ensina nada novo, só cansa e frustra.

Esse critério não exige que a criança faça tudo em uma única sessão longa. Ao abrir a atividade, a plataforma reconstrói o estado de apoio e a sequência recente a partir das tentativas salvas: se a criança fez acertos independentes, pausou e voltou depois, esse progresso continua contando; se houve erro ou necessidade de dica, o apoio também é retomado de forma coerente.

### Revisão espaçada sem pressão

Dominar uma atividade não significa que ela deve desaparecer para sempre. A plataforma sugere uma revisão leve quando uma atividade já dominada fica alguns dias sem prática registrada. Isso segue a ideia de espaçamento e recuperação: retomar uma habilidade depois de um intervalo ajuda retenção de longo prazo e mostra ao adulto se a habilidade segue acessível sem reaprender tudo do zero.

Para crianças autistas, isso também conversa com a preocupação recorrente da literatura sobre generalização e manutenção de habilidades. A revisão aparece como convite separado ("Revisão leve"), não como bloqueio, erro, perda de progresso ou obrigação. O critério de domínio continua preservado; revisar é manter, não desfazer conquista.

### Reforço positivo imediato, nunca punição

Toda resposta correta recebe feedback visual imediato ("Isso!"). Toda resposta incorreta recebe apenas "Tente de novo" — sem alarme, sem contagem visível de erros — e mais suporte na tentativa seguinte. Reforço positivo consistente e imediato é um dos elementos mais replicados na literatura de práticas baseadas em evidência para TEA (NPDC/NCAEP, ver abaixo).

Quando a criança atinge domínio, a plataforma não troca de tela automaticamente. Depois do feedback de acerto, aparece uma tela simples de conclusão ("Feito", "Atividade concluída" e o nome da atividade), com foco no botão "Voltar para a trilha". Quando o domínio já foi salvo com sucesso, a tela também oferece "Próxima atividade" como escolha explícita. Se o salvamento falha, esse atalho não aparece: a prioridade é não mascarar perda de progresso. Isso mantém previsibilidade, evita transição surpresa e deixa a criança/adulto controlar o próximo passo.

### Apoio visual e previsibilidade (TEACCH)

O programa TEACCH, desenvolvido por Eric Schopler e Robert Reichler na Universidade da Carolina do Norte, parte da premissa de que pessoas autistas costumam ser aprendizes predominantemente visuais e se beneficiam de estrutura previsível — mesma disposição espacial, mesmos ícones significando sempre a mesma coisa, informação sobre "o que fazer, quanto falta, o que vem depois" sempre visível. A revisão sistemática de Li et al. mostra efeito consistente de ensino estruturado em habilidades adaptativas. Esta plataforma aplica isso via: layout de atividade sempre no mesmo formato, ícones consistentes entre telas, contador "X de Y concluídas" em cada módulo da trilha (visibilidade de progresso).

Na trilha da criança, um cartão "Agora" destaca a próxima atividade disponível com um botão "Continuar". A tela mantém aberto apenas o módulo em foco ou revisão leve; módulos já concluídos ficam resumidos com progresso e podem ser abertos sob demanda. Assim a navegação livre continua acessível, mas a criança não encontra dezenas de escolhas simultâneas quando precisa apenas saber o próximo passo.

O botão para voltar à área do responsável não troca a tela imediatamente: ele abre uma confirmação curta, com foco inicial em "Continuar na trilha", e só libera a saída quando o adulto digita `ADULTO`. A intenção é prevenir toque acidental, preservar previsibilidade e manter a tela adulta como uma decisão do mediador, não como uma transição surpresa para a criança.

Dentro da atividade, um roteiro visual permanece visível antes e depois de começar: "Agora", "Depois", "Fim" e "Pausa". Esse desenho segue a prática de suportes visuais/quadros de rotina descrita pelo AFIRM/NCAEP: transformar sequência, expectativa e transição em informação estável na tela, diminuindo a dependência de fala adulta repetida. A pausa aparece como parte do roteiro, não como falha ou recompensa, e seu cartão antecipa a regulação preferida do perfil: pausa combinada, ambiente calmo, movimento ou alternância.

O botão de voltar da atividade também não abandona a tarefa imediatamente: ele abre uma confirmação curta, com foco inicial em "Continuar atividade". Essa fricção intencional protege crianças com toque impulsivo, baixa precisão motora, uso de tablet ou apoio físico do mediador, sem impedir que a família encerre a tarefa quando essa for a melhor decisão.

### Início previsível

Cada atividade começa com uma etapa curta de preparação: o que fazer agora, um roteiro visual simples com ação atual, próxima ação, finalização e pausa, e um botão explícito de começar. Isso reduz surpresa sensorial e preserva controle antes de qualquer resposta ser exigida.

A mesma lógica aparece na demonstração pública sem conta: a família pode experimentar uma etapa visual, uma etapa de sílaba e uma pergunta literal de texto, alternar entre toque direto, toque com confirmação e escolha mediada, testar um interesse da criança, pedir pausa/ajuda/pronto e ver o apoio visual antes de cadastrar qualquer dado. O cadastro existe para salvar continuidade, perfil individual e relatórios, não como barreira para conhecer a experiência.

Essa decisão é coerente com recomendações de interface para crianças autistas que destacam clareza, baixa complexidade, previsibilidade, controle do usuário, estímulos visuais consistentes e possibilidade de personalização. Também segue a lógica de tecnologia assistiva em educação infantil: a tecnologia deve aumentar participação funcional, não apenas "entregar conteúdo".

Para navegação por teclado e leitor de tela, a plataforma oferece link "Pular para o conteúdo", título de página atualizado a cada rota e anúncio discreto da tela atual. A preparação move o foco para a instrução atual e, depois de "Começar", move o foco para a região da atividade iniciada. Quando uma pausa, confirmação de saída ou confirmação de área adulta está aberta, o foco por Tab fica contido dentro dessa decisão até a criança/adulto continuar ou confirmar a mudança. Feedbacks de acerto/tentativa usam anúncios educados (`aria-live="polite"`) em vez de interrupções assertivas. A intenção é manter orientação sem adicionar susto, pressa ou ruído.

Quando o perfil indica mouse ou teclado, as opções de resposta também podem ser selecionadas por teclas numéricas (`1`, `2`, `3`...). Isso torna o modo declarado no perfil operacional para crianças que usam teclado, mouse adaptado, teclado ampliado, acionadores que enviam teclas ou um adulto mediando pelo teclado. Os atalhos não aparecem como instrução visual para a criança e são ignorados quando o foco está em campos editáveis, para reduzir ruído e evitar respostas acidentais durante ajustes do adulto.

As áreas de toque da criança usam tamanho mínimo amplo, animação discreta e destaque visual moderado. O objetivo é apoiar coordenação motora e atenção compartilhada sem depender de efeitos grandes, brilhos fortes ou mudanças bruscas de escala.

A família também pode ativar "Alvos maiores" no perfil. Quando isso está ligado, botões, seletores e cartões de atividade passam a usar alvos ainda maiores em toda a experiência. Essa decisão segue o princípio de que acessibilidade motora não deve depender de diagnóstico adicional: crianças com tremor, baixa precisão, uso de tablet, suporte físico do mediador ou fadiga podem precisar de uma área de toque mais generosa mesmo quando entendem a tarefa.

### Comunicação Alternativa como ponte, não como substituto

O trabalho de Bondy & Frost sobre PECS (Sistema de Comunicação por Troca de Figuras), e a meta-análise de Ganz et al. (2010, _American Journal of Speech-Language Pathology_), mostram evidência sólida de que apoio pictórico melhora comunicação funcional em TEA, mesmo que a evidência para geração de fala vocal seja mais fraca. Por isso a plataforma usa emparelhamento palavra-imagem no Módulo 4 (sílaba associada a uma figura familiar) como ponte para a leitura, sem exigir fala em nenhum momento.

Na interface da criança, o painel de comunicação e regulação oferece cartões como "Pausa", "Ajuda", "Não sei" e "Pronto". Cada ação tem um símbolo visual estável além do texto, e o responsável pode personalizar rótulo, frase falada e apoio ao mediador, mantendo ações seguras (por exemplo: o cartão de pausa continua abrindo a tela calma de pausa). Quando o perfil tem um interesse escolhido, o painel acrescenta um motivo visual pequeno ligado a esse interesse, sem trocar o símbolo funcional principal nem o nome acessível do cartão. Ele não tenta substituir uma CAA individualizada prescrita por fonoaudiólogo, mas cria uma ponte mínima de comunicação funcional dentro da atividade: uma criança não verbal, minimamente verbal, em sobrecarga ou em fase inicial de alfabetização pode comunicar necessidade sem depender de fala oral.

Quando a criança escolhe "Pausa", a plataforma abre uma tela calma de pausa em vez de apenas registrar a mensagem. Isso reforça autonomia comunicativa: comunicar necessidade tem consequência real e respeitosa, com a opção de continuar, pedir mais pausa/regulação ou voltar para a trilha.

Quando a família registra um plano curto de regulação, a pausa também mostra combinados individuais: sinais de que a criança pode precisar parar, estratégias que costumam ajudar e o que evitar durante sobrecarga. Isso mantém a pausa concreta e previsível sem exigir fala oral, memória de trabalho ou interpretação adulta improvisada no momento mais sensível da sessão.

A pausa também mostra um acordo visual de transição ("primeiro" pausa, "depois" voltar para uma parte pequena). Essa escolha vem da mesma lógica de suportes visuais/first-then descrita pelo AFIRM/NCAEP: a criança não precisa inferir quanto falta, nem é empurrada de volta por um cronômetro; ela vê a sequência, pode estender a pausa e só retorna por ação explícita.

Quando a criança escolhe "Ajuda" ou "Não sei", a plataforma também responde com uma consequência funcional: a atividade atual volta para modelagem visual ("Escolha esta") sem registrar erro. O pedido de apoio reinicia a sequência de acertos independentes, porque a resposta seguinte volta a ter suporte, mas não pune a criança por comunicar necessidade ou incerteza. Essa decisão segue a lógica de comunicação funcional e prompt fading: o apoio aumenta quando necessário e volta a esmaecer conforme a criança responde com segurança.

Quando a criança escolhe "Pronto", a plataforma dispensa sugestões abertas de pausa ou encerramento sem registrar tentativa. Assim, comunicar prontidão também muda o ambiente de forma coerente: a criança pode dizer que quer continuar, e a interface remove a interrupção em vez de exigir que o adulto interprete a mensagem fora do sistema.

O uso desses cartões também é registrado como observação de sessão categorizada: "Pausa" entra como regulação; "Ajuda", "Não sei" e "Pronto" entram como comunicação. Isso preserva evidência de comunicação funcional para a família e a equipe sem transformar cada toque em erro, pontuação ou exigência acadêmica. Se a conexão falhar, a ação da criança continua funcionando e a tela avisa o mediador de que apenas o registro não foi salvo; o acompanhamento é apoio, não pré-requisito para respeitar a mensagem.

As atividades também podem sugerir uma pausa depois de algumas respostas, conforme limite configurado no perfil de apoio. A sugestão não bloqueia a atividade, não conta como erro e não reduz progresso; ela apenas torna visível que pausar é uma forma legítima de autorregulação antes de fadiga ou sobrecarga virarem abandono da tarefa. O convite já usa a regulação preferida do perfil: pode sugerir ambiente calmo, movimento, alternância ou pausa combinada. Quando a pausa abre, seus passos e o acordo visual de retorno respeitam a mesma preferência. Depois de alguns intervalos de pausa, a plataforma sugere encerrar por agora; escolher "Encerrar" abre uma tela de fechamento com roteiro "Agora/Depois", foco em "Voltar para a trilha" e opção de retomar se o toque foi acidental. Continuar ainda é possível, mas a interface deixa claro que terminar também é uma escolha válida.

### Perfil funcional de apoio

Ao criar ou revisar um perfil, o responsável registra como a criança costuma comunicar, selecionar na tela e se regular melhor: fala, gestos/olhar, figuras/CAA, dispositivo, escolha mediada, toque direto, toque com apoio, pausas, ambiente calmo ou alternância entre tarefa e pausa. Isso não é diagnóstico, triagem clínica nem tentativa de classificar "grau" de autismo. É um retrato funcional para o adulto começar a mediação de forma menos genérica.

Esse perfil inicial também ajusta a experiência de entrada: uma criança que seleciona por olhar/gesto com mediador começa com alvos maiores; uma criança que se regula melhor em ambiente calmo começa com som/animações reduzidos; uma criança que usa figuras/CAA recebe apoio visual como padrão. A família pode corrigir esses dados depois na tela de progresso, inclusive refinando o plano de regulação usado na pausa e nos materiais locais, porque comunicação, acesso motor e regulação mudam com contexto, cansaço, familiaridade e desenvolvimento.

Essa decisão segue a lógica de CAA e práticas mediadas por tecnologia: oferecer múltiplas formas de participação funcional antes de exigir uma resposta acadêmica, especialmente para crianças minimamente verbais, não falantes, em sobrecarga, com baixa precisão motora ou que dependem de mediação adulta para selecionar.

Quando o perfil indica escolha por olhar/gesto e mediador toca, as atividades deixam de mostrar todas as respostas como uma grade de toque direto e passam para escolha mediada: uma opção por vez, com controles de anterior/próxima/escolher. As setas também alternam a opção em foco e Enter/Espaço escolhem quando nenhum botão ou campo está focado, apoiando teclado, acionador ou varredura manual pelo mediador. Isso se aproxima de estratégias de varredura assistida usadas em CAA e tecnologia assistiva: a criança pode responder com olhar, gesto, apontar ou outro sinal combinado, enquanto o adulto executa o toque sem exigir precisão motora fina da criança.

Quando o perfil indica toque com confirmação, o primeiro toque apenas marca a opção escolhida e a tentativa só é registrada depois do botão "Confirmar". Esse modo existe para crianças que entendem a tarefa, mas podem tocar sem querer, arrastar a mão na tela, ter tremor, baixa precisão motora, impulsividade ou precisar que o adulto ajude a estabilizar o acesso. A intenção é separar "acesso motor inseguro" de "resposta acadêmica errada", reduzindo frustração e preservando dados de progresso mais fiéis.

Quando o perfil indica toque com apoio do mediador, a lógica também deixa a resposta pendente, mas o texto da confirmação explicita que há apoio adulto. Assim, um olhar, gesto, aproximação de mão ou toque assistido pode ser conferido com a criança antes de virar tentativa registrada. Isso evita que o sistema transforme mediação de acesso em erro pedagógico e mantém a trilha compatível com crianças que precisam de co-regulação ou assistência física leve para responder.

### Jardim de Conquistas: gamificação sem pontuação, ranking ou tempo

Cada módulo da trilha corresponde a um canteiro num jardim visual acessível pela criança (`/crianca/jardim`), que muda de estágio (semente → brotando → floresceu) conforme as atividades daquele módulo são dominadas. Deliberadamente **não existe** pontuação numérica, ranking entre crianças, cronômetro ou celebração ruidosa/automática — a tela é uma forma concreta e visual de mostrar progresso acumulado, coerente com o princípio de reforço positivo sem competição ou pressão de velocidade já estabelecido para o resto da trilha (ver "Reforço positivo imediato, nunca punição" acima).

### Personalização por interesse da criança

Perfis de criança podem indicar um interesse inicial (neutro, animais, veículos, casa, música, comida, brincar ou natureza). No Módulo 4, essa escolha adapta as palavras de apoio das sílabas CV com A/E/I/O/U quando existe uma alternativa adequada (por exemplo, "MA, de macaco" no tema animais, "MU, de música" no tema música ou "PU, de pudim" no tema comida), mantendo a mesma sílaba, os mesmos IDs de resposta e o mesmo critério de domínio. O mesmo interesse também pode aparecer como motivo visual complementar nos cartões de comunicação, preservando os símbolos funcionais de CAA. A tela do responsável mostra descrição e exemplos antes da escolha, para deixar claro o efeito pedagógico do tema.

Esta personalização é propositalmente limitada: ela muda o contexto sem alterar a habilidade ensinada. A revisão sistemática de Harrop et al. (2019) encontrou efeitos positivos quando interesses circunscritos são incorporados a intervenções, mas com base ainda muito concentrada em desenhos de caso único; Courchesne et al. (2020) também alertam que interesses e forças devem apoiar bem-estar e acesso ao material, não criar expectativa automática de desempenho acadêmico. Por isso, o app usa interesses como familiarização leve do vocabulário e da interface, não como reforço condicionado, pressão motivacional ou promessa clínica. Uma personalização visual mais profunda (conjuntos completos de imagens/ícones por tema, fotos da família, personagens preferidos ou vocabulário importado pela família) exige curadoria e revisão de acessibilidade, então fica como evolução futura.

### Relatório para mediação, não vigilância

O relatório do responsável resume domínio por módulo, tentativas, taxa de acerto, nível médio de apoio usado, recomendação de apoio graduado e uma orientação curta de próximo passo. Ele existe para ajudar o adulto a ajustar mediação, pausas e suporte visual, não para ranquear a criança, pressionar velocidade ou transformar erro em punição. Tempo de resposta é registrado apenas como dado técnico da tentativa; a interface não mostra cronômetro nem metas de rapidez para a criança.

O painel também gera um guia rápido do mediador a partir do perfil funcional, do plano individual e da próxima atividade sugerida. Ele organiza a sessão em quatro decisões observáveis — antes, durante, se precisar de apoio e depois — para que família, escola ou terapia tenham uma forma curta e consistente de preparar CAA, acesso motor, regulação e registro sem transformar a plataforma em protocolo clínico fechado.

A tela também gera arquivos locais para equipe e generalização. O relatório foi pensado para conversas com terapeutas, professores ou cuidadores sobre quais apoios funcionam, que comunicação a criança usa, qual meta pequena está ativa e que habilidade deve ser praticada fora da plataforma. O plano de generalização transforma a próxima atividade sugerida em um roteiro curto para casa, escola ou terapia, com materiais simples, pausa disponível e registro rápido de manutenção/generalização. Os cartões imprimíveis levam a habilidade-alvo, opções de resposta, roteiro visual e comunicação/regulação para uma forma low-tech, preservando os mesmos símbolos e motivos visuais da tela e a pausa/regulação preferida do perfil. Isso é útil quando a criança precisa praticar longe da tela ou quando a equipe usa materiais físicos. Os arquivos são gerados no navegador e a família decide se compartilha; não há acesso direto de terceiros à conta.

Nas últimas tentativas, a interface usa rótulos humanos da atividade e "Tentou" em vez de "Errou", preservando informação útil para o adulto sem reforçar uma leitura punitiva do erro.

O responsável também pode registrar observações de sessão em texto curto, categorizando cada nota como comunicação, regulação, acesso, generalização ou geral. A tela resume quantas observações existem por categoria e permite filtrar o histórico recente, ajudando equipe e família a separar "o que a criança comunicou", "o que regulou", "como acessou" e "onde a habilidade apareceu fora da tela" sem criar score comportamental. O histórico ajuda a perceber padrões de mediação ao longo do tempo sem transformar a criança em uma soma de erros ou velocidade de resposta.

### Plano individual e observação do mediador

Cada perfil pode registrar uma meta atual, o apoio preferencial e uma observação curta do mediador. A recomendação do relatório combina esse plano com a próxima atividade disponível, para que a tecnologia não funcione como uma trilha genérica: ela lembra ao adulto qual habilidade pequena está sendo trabalhada e qual tipo de apoio tende a preservar conforto e participação.

Essa escolha segue a lógica de práticas mediadas por tecnologia descritas pelo AFIRM/NCAEP: escolher objetivo, preparar apoios adicionais quando necessário (apoio visual, análise de tarefa, modelagem), treinar a equipe/família e monitorar a resposta do aprendiz. A plataforma não substitui avaliação clínica ou plano terapêutico, mas torna o uso cotidiano mais fiel a metas individualizadas.

O apoio preferencial também altera a experiência da criança: a tela de preparação e a tela de pausa mostram passos compatíveis com o combinado do perfil (visual, fala curta, modelo gestual ou pausa combinada). A habilidade ensinada e os critérios de domínio não mudam; muda apenas a forma de mediar a entrada e a regulação durante a atividade.

## O que fica fora do escopo do v1 (documentado para não virar débito técnico silencioso)

- Compreensão textual aberta, novas famílias silábicas e expansão lexical mais ampla — planejadas para depois que Módulos 0–11 estiverem validados com uso real.
- Personalização visual profunda por interesse especial da criança (ex. trocar conjuntos inteiros de ícones por trens/dinossauros/personagens favoritos) — a v1 já adapta palavras de apoio por tema e usa um motivo visual complementar no painel de comunicação, mas ainda não oferece biblioteca visual completa por interesse.
- Compartilhamento de progresso com terapeutas externos (fora da conta do responsável) — exigiria um sistema de convite/permissão que não existe no v1.

## Fontes

- Steinbrenner, J. R., Hume, K., Odom, S. L., et al. (2020). _Evidence-Based Practices for Children, Youth, and Young Adults with Autism._ National Clearinghouse on Autism Evidence and Practice Review Team. [ncaep.fpg.unc.edu](https://ncaep.fpg.unc.edu/research-and-resources/) · [Journal of Autism and Developmental Disorders](https://link.springer.com/article/10.1007/s10803-020-04844-2)
- Autism Focused Intervention Resources & Modules (AFIRM). Módulos gratuitos para planejar, usar e monitorar práticas baseadas em evidência com aprendizes autistas. [afirm.fpg.unc.edu](https://afirm.fpg.unc.edu/)
- Wittenburg-Bausell, C., & Ganz, J. (2020). _The Promise of Comprehensive Early Reading Instruction for Children With Autism and Recommendations for Future Directions._ Language, Speech, and Hearing Services in Schools. [pubs.asha.org](https://pubs.asha.org/doi/10.1044/2020_LSHSS-20-00019)
- Alharbi, H., Terlektsi, E., & Kossyvaki, L. (2023). _Dialogic Reading Effect on Communicative Initiations and Responses for Children with Autism: a Systematic Review._ Review Journal of Autism and Developmental Disorders. [springer.com](https://link.springer.com/article/10.1007/s40489-023-00395-1)
- Ganz, J. B., et al. (2010). _Effectiveness of the Picture Exchange Communication System (PECS) on Communication and Speech for Children With Autism Spectrum Disorders: A Meta-Analysis._ American Journal of Speech-Language Pathology. [pubs.asha.org](<https://pubs.asha.org/doi/10.1044/1058-0360(2010/09-0022)>)
- Li, S., et al. _The effectiveness of TEACCH-based interventions in improving adaptive skills in children with autism spectrum disorders: a systematic review and meta-analysis._ Translational Pediatrics. [tp.amegroups.org](https://tp.amegroups.org/article/view/147226/html)
- Dallman, A. R., Williams, K. L., & Villa, L. (2021). _Autistic Self-Advocacy and the Neurodiversity Movement: Implications for Autism Early Intervention Research and Practice._ Frontiers in Psychology. [frontiersin.org](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.635690/full) · [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8075160/)
- Groba, B., Nieto-Riveiro, L., Canosa, N., et al. (2021). _Stakeholder Perspectives to Support Graphical User Interface Design for Children with Autism Spectrum Disorder: A Qualitative Study._ International Journal of Environmental Research and Public Health. [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC8123795/)
- AFIRM Team / NCAEP. _Visual Supports Brief Packet._ [afirm.fpg.unc.edu](https://afirm.fpg.unc.edu/wp-content/uploads/Visual-Supports-Brief-Packet.pdf)
- AFIRM Team / NCAEP. _Technology-Aided Instruction & Intervention Brief Packet_ (updated 2025). [afirm.fpg.unc.edu](https://afirm.fpg.unc.edu/wp-content/uploads/Technology-Aided-Instruction-Intervention-Brief-Packet-Hedges-AFIRM-Team-Updated-2025.pdf)
- American Speech-Language-Hearing Association (ASHA). _Augmentative and Alternative Communication (AAC)_ practice portal. [asha.org](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/)
- Human Development Institute, University of Kentucky. _Partner-Assisted Scanning._ [hdi.uky.edu](https://hdi.uky.edu/ky-speaks-aac/partner-assisted-scanning/)
- OECD (2023). _Digital technologies to support young children with special needs in early childhood education and care: A literature review._ [oecd.org](https://www.oecd.org/en/publications/digital-technologies-to-support-young-children-with-special-needs-in-early-childhood-education-and-care_34f9d9e8-en.html)
- Harrop, C., Amsbary, J., Towner-Wright, S., Reichow, B., & Boyd, B. A. (2019). _That's what I like: The use of circumscribed interests within interventions for individuals with autism spectrum disorder. A systematic review._ Research in Autism Spectrum Disorders. [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1750946718301429)
- Courchesne, V., Langlois, V., Gregoire, P., et al. (2020). _Interests and Strengths in Autism, Useful but Misunderstood: A Pragmatic Case-Study._ Frontiers in Psychology. [frontiersin.org](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2020.569339/full)
- W3C. _Web Content Accessibility Guidelines (WCAG) 2.2_, Success Criterion 2.5.8 Target Size (Minimum). [w3.org](https://www.w3.org/TR/WCAG22/#target-size-minimum)
- Australian Education Research Organisation. _Spacing and retrieval practice guide._ [edresearch.edu.au](https://www.edresearch.edu.au/guides-resources/practice-guides/spacing-and-retrieval-practice-guide-full-publication)
- Ledford, J. R., Lane, J. D., Elam, K. L., & Wolery, M. _Beyond intervention into daily life: A systematic review of generalization and maintenance outcomes._ [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC7187421/)
- Autistic Self Advocacy Network (ASAN) — posicionamento público sobre intervenções e neurodiversidade. [autisticadvocacy.org](https://autisticadvocacy.org/)
- Verma, P., & Lahiri, U. (2022). _Deficits in Handwriting of Individuals with Autism: a Review on Identification and Intervention Approaches._ Review Journal of Autism and Developmental Disorders, 9, 70–90. [springer.com](https://link.springer.com/article/10.1007/s40489-020-00234-7)

> Este documento é vivo: se uma fonte estiver desatualizada, mal interpretada, ou se você (especialmente se for uma pessoa autista, terapeuta ou pesquisador) discordar de alguma escolha pedagógica, abra uma issue ou PR. Mudanças em `src/curriculo/` idealmente passam por revisão de alguém com formação em educação especial ou terapia — ver [`CONTRIBUTING.md`](../CONTRIBUTING.md).
