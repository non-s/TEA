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
- Os ajustes sensoriais (som, animação, contraste) existem porque a carga sensorial correta é decidida pela criança/família, não pela plataforma.
- O vocabulário da interface evita linguagem de "cura" ou "correção de comportamento" — fala-se em _aprender_, _praticar_, _dominar uma habilidade_.

## Por que o foco é 100% TEA, "não importando o grau"

O TEA é um espectro amplo — da DSM-5, os "níveis de suporte" (1 a 3) descrevem necessidade de apoio, não capacidade cognitiva ou valor da pessoa, e a maioria das pessoas autistas não se encaixa perfeitamente em um nível fixo ao longo da vida. Por isso a trilha:

1. **Não assume fala funcional.** Nenhuma atividade exige que a criança fale para responder — todas usam toque/seleção entre opções (compatível com CAA, apoio a crianças minimamente verbais).
2. **Não assume leitura prévia.** O Módulo 0 começa em discriminação visual pura (formas, não letras), o pré-requisito mais básico possível antes de qualquer conteúdo acadêmico.
3. **Oferece dica com esmaecimento em toda atividade** (ver abaixo), então uma criança que precisa de mais suporte visual recebe mais suporte, e uma que já domina o conceito avança rápido — o mesmo currículo serve necessidades de suporte muito diferentes.
4. **É ajustável sensorialmente**, já que hipo/hipersensibilidade sensorial varia enormemente entre indivíduos autistas e não se correlaciona diretamente com "nível de suporte".

## A sequência de habilidades (Módulos 0–4)

A ordem dos módulos segue uma cadeia de pré-requisitos bem estabelecida na literatura comportamental sobre discriminação de estímulos, unida ao consenso mais recente sobre alfabetização em TEA.

### Módulo 0 — Emparelhamento Idêntico

Discriminação visual básica (tocar a figura idêntica à mostrada) é o pré-requisito mais elementar antes de qualquer tarefa acadêmica em programas comportamentais — sem essa habilidade, nenhuma instrução visual seguinte é significativa. Por isso o módulo começa com formas abstratas (não letras), removendo a exigência de já "saber" o alfabeto.

### Módulo 1 — Maiúscula e Minúscula

Depois de emparelhamento idêntico, o próximo passo é generalização: reconhecer que "A" e "a" são a _mesma_ letra apesar de visualmente diferentes. Essa etapa intermediária de emparelhamento por identidade/categoria é o que separa cópia visual pura de reconhecimento conceitual.

### Módulo 2 — Nomeação Receptiva de Letras

"Toque na letra que eu disser" (nomeação receptiva) é ensinada antes de "diga o nome desta letra" (nomeação expressiva) porque não depende de fala — é acessível a crianças não-verbais ou com fala emergente, e antecede consistentemente a nomeação expressiva em programas de ensino de discriminação. Vogais entram primeiro, seguidas pelas 5 consoantes de maior frequência em português (M, P, T, L, B), refletindo a ordem comum de cartilhas fônicas no Brasil.

### Módulo 3 — Nomeação Expressiva de Letras

Agora a criança escolhe/produz o nome da letra mostrada, e não apenas a localiza. Como esta plataforma não faz reconhecimento de fala (custoso, impreciso e fora do escopo gratuito do projeto), "expressiva" aqui significa a criança compor a resposta ativamente — escolhendo a letra correspondente ao nome falado _e_ ouvido/lido simultaneamente, com o suporte de voz sempre disponível como modelo, sem depender de fala funcional para participar.

### Módulo 4 — Consciência Fonológica e Formação de Sílabas

Juntar consoante + vogal (ex: M + A = "MA") só é introduzido depois que as letras-alvo já foram dominadas nos módulos 2–3 — consciência fonológica depende de já reconhecer os grafemas envolvidos. O método é fônico-silábico, o padrão de alfabetização inicial em português do Brasil, com apoio de imagem (ponte de Comunicação Alternativa: a sílaba aparece associada a uma palavra/figura familiar, ex. "MA" de "mamãe").

A pesquisa mais recente sobre leitura em TEA (Wittenburg-Bausell & Ganz, 2020, _"The Promise of Comprehensive Early Reading Instruction for Children With Autism"_, ASHA _LSHSS_) recomenda cobrir os "cinco pilares" da leitura — consciência fonêmica, fonética, fluência, vocabulário e compreensão — de forma direta, sistemática e individualizada. A trilha desta plataforma cobre os dois primeiros pilares (consciência fonêmica e fonética/fonics); fluência, vocabulário amplo e compreensão textual ficam documentados como v2 (fora do escopo do MVP).

## Técnicas de ensino usadas em toda atividade

### Ensino sem erro (errorless learning) e esmaecimento de dica (prompt fading)

Cada atividade tem 3 níveis de dica, do mais para o menos suporte: **modelagem** (o sistema literalmente mostra/aponta a resposta) → **destaque visual** (a opção correta recebe um leve brilho) → **nenhuma** (resposta independente). A criança começa recebendo suporte total e o sistema retira o suporte gradualmente conforme os acertos se acumulam — e devolve suporte na primeira resposta errada.

Esse desenho segue diretamente a literatura sobre _most-to-least prompting_: começar com o prompt mais intrusivo e esmaecer reduz a chance de a criança "praticar" o erro, o que a pesquisa mostra reduzir frustração e acelerar aquisição em comparação com deixar a criança errar livremente primeiro.

### Critério de domínio

Uma atividade é considerada dominada após 8 acertos consecutivos já no nível "sem dica" — um critério conservador comum em programas de Análise do Comportamento Aplicada, escolhido para reduzir a chance de "falso domínio" (acerto por sorte) antes de avançar.

### Reforço positivo imediato, nunca punição

Toda resposta correta recebe feedback imediato (visual "Isso! 🎉" e, se o som estiver ligado, voz). Toda resposta incorreta recebe apenas "Tente de novo" — sem alarme, sem contagem visível de erros — e mais suporte na tentativa seguinte. Reforço positivo consistente e imediato é um dos elementos mais replicados na literatura de práticas baseadas em evidência para TEA (NPDC/NCAEP, ver abaixo).

### Apoio visual e previsibilidade (TEACCH)

O programa TEACCH, desenvolvido por Eric Schopler e Robert Reichler na Universidade da Carolina do Norte, parte da premissa de que pessoas autistas costumam ser aprendizes predominantemente visuais e se beneficiam de estrutura previsível — mesma disposição espacial, mesmos ícones significando sempre a mesma coisa, informação sobre "o que fazer, quanto falta, o que vem depois" sempre visível. A revisão sistemática de Li et al. mostra efeito consistente de ensino estruturado em habilidades adaptativas. Esta plataforma aplica isso via: layout de atividade sempre no mesmo formato, ícones consistentes entre telas, contador "X de Y concluídas" em cada módulo da trilha (visibilidade de progresso).

### Comunicação Alternativa como ponte, não como substituto

O trabalho de Bondy & Frost sobre PECS (Sistema de Comunicação por Troca de Figuras), e a meta-análise de Ganz et al. (2010, _American Journal of Speech-Language Pathology_), mostram evidência sólida de que apoio pictórico melhora comunicação funcional em TEA, mesmo que a evidência para geração de fala vocal seja mais fraca. Por isso a plataforma usa emparelhamento palavra-imagem no Módulo 4 (sílaba associada a uma figura familiar) como ponte para a leitura, sem exigir fala em nenhum momento.

## O que fica fora do escopo do v1 (documentado para não virar débito técnico silencioso)

- Reconhecimento de fala (fora do orçamento gratuito e impreciso demais para confiar em uma criança pequena).
- Formação de palavras completas (CV-CV, ex. "BOLA", "SAPO") e leitura de frases — planejado como v2, depois que Módulos 0–4 estiverem validados com uso real.
- Personalização por interesse especial da criança (ex. trocar os ícones por trens/dinossauros/personagens favoritos) — tecnicamente simples de adicionar dado o desenho de `src/curriculo/tipos.ts`, mas não implementado ainda.
- Compartilhamento de progresso com terapeutas externos (fora da conta do responsável) — exigiria um sistema de convite/permissão que não existe no v1.

## Fontes

- Steinbrenner, J. R., Hume, K., Odom, S. L., et al. (2020). _Evidence-Based Practices for Children, Youth, and Young Adults with Autism._ National Clearinghouse on Autism Evidence and Practice Review Team. [ncaep.fpg.unc.edu](https://ncaep.fpg.unc.edu/research-and-resources/) · [Journal of Autism and Developmental Disorders](https://link.springer.com/article/10.1007/s10803-020-04844-2)
- Wittenburg-Bausell, C., & Ganz, J. (2020). _The Promise of Comprehensive Early Reading Instruction for Children With Autism and Recommendations for Future Directions._ Language, Speech, and Hearing Services in Schools. [pubs.asha.org](https://pubs.asha.org/doi/10.1044/2020_LSHSS-20-00019)
- Ganz, J. B., et al. (2010). _Effectiveness of the Picture Exchange Communication System (PECS) on Communication and Speech for Children With Autism Spectrum Disorders: A Meta-Analysis._ American Journal of Speech-Language Pathology. [pubs.asha.org](<https://pubs.asha.org/doi/10.1044/1058-0360(2010/09-0022)>)
- Li, S., et al. _The effectiveness of TEACCH-based interventions in improving adaptive skills in children with autism spectrum disorders: a systematic review and meta-analysis._ Translational Pediatrics. [tp.amegroups.org](https://tp.amegroups.org/article/view/147226/html)
- Dallman, A. R., Williams, K. L., & Villa, L. (2021). _Autistic Self-Advocacy and the Neurodiversity Movement: Implications for Autism Early Intervention Research and Practice._ Frontiers in Psychology. [frontiersin.org](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.635690/full) · [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8075160/)
- Autistic Self Advocacy Network (ASAN) — posicionamento público sobre intervenções e neurodiversidade. [autisticadvocacy.org](https://autisticadvocacy.org/)

> Este documento é vivo: se uma fonte estiver desatualizada, mal interpretada, ou se você (especialmente se for uma pessoa autista, terapeuta ou pesquisador) discordar de alguma escolha pedagógica, abra uma issue ou PR. Mudanças em `src/curriculo/` idealmente passam por revisão de alguém com formação em educação especial ou terapia — ver [`CONTRIBUTING.md`](../CONTRIBUTING.md).
