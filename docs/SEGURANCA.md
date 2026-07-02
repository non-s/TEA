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
```

Cada responsável só consegue ler/escrever dentro do próprio `responsaveis/{uid}` — a regra central é `request.auth.uid == responsavelId` em todo o subárvore. Não existe (ainda) nenhum mecanismo de compartilhamento entre contas (ex: um terapeuta externo acessando os dados de um paciente) — isso é uma limitação deliberada do v1, documentada em `docs/PEDAGOGIA.md`.

A coleção `tentativas` é **append-only**: as regras permitem `create` mas não `update`/`delete`. Isso existe para que o histórico de tentativas (base do relatório de progresso) não possa ser adulterado, nem sequer pelo próprio dono da conta.

## Minimização de dados

Dados coletados sobre a criança são deliberadamente mínimos:

- **Nome**: só primeiro nome/apelido (o formulário não pede sobrenome).
- **Sem foto real**: o avatar é um de 6 ícones pré-definidos (`src/curriculo/ativos/tipos.ts`), nunca upload de imagem.
- **Sem diagnóstico**: não existe campo para condição clínica, laudo, ou qualquer dado de saúde.
- **Sem data de nascimento**: não é coletada no v1.

Os dados de progresso (`tentativas`) armazenam apenas: qual atividade, se acertou, quanto de dica precisou, e quanto tempo levou para responder — nada que identifique a criança além do vínculo com o perfil.

## Autenticação

- O responsável usa Firebase Authentication (e-mail/senha). A criança **nunca digita senha** — ela só escolhe seu próprio avatar dentro da sessão já autenticada do responsável (`PerfilAtivoContext`), guardado em `sessionStorage` (não sobrevive a fechar o navegador).
- Recuperação de senha via `sendPasswordResetEmail` (fluxo padrão do Firebase).
- A `apiKey` do Firebase que aparece no bundle JS público **é pública por design** — não é segredo. A segurança real vem inteiramente das Firestore Rules, não do sigilo dessa chave. Isso é documentado aqui para qualquer auditor de segurança que veja a chave no código-fonte e queira saber se isso é um problema (não é, desde que as regras estejam corretas).

## O que ainda não está implementado (limitações conhecidas)

- **App Check**: não configurado. Adicionaria uma camada extra contra abuso automatizado da API pública. Candidato a v2.
- **Rate limiting** de tentativas de login: depende inteiramente dos limites padrão do Firebase Auth.
- **Exclusão de perfil não remove as tentativas — de propósito.** Remover um perfil de criança (`removerPerfil`) apaga o documento do perfil, mas as regras do Firestore proíbem explicitamente `update`/`delete` na subcoleção `tentativas` (`allow update, delete: if false;`) para que o histórico de progresso seja imutável e auditável (ver "Modelo de dados e isolamento" acima). Isso significa que excluir um perfil deixa as tentativas antigas órfãs, mas ainda protegidas pelas mesmas regras de isolamento por dono — elas não desaparecem sozinhas nem ficam acessíveis a mais ninguém. É uma troca deliberada (integridade do histórico > limpeza automática), não um bug esquecido. Se um responsável realmente precisar apagar esses dados residuais (ex: pedido de exclusão via LGPD), isso hoje só é possível manualmente pelo Console do Firebase — não há um botão de "excluir tudo" na interface do v1.
- **Logs de auditoria**: não há log de quem acessou o quê além do que o próprio Firebase Console oferece.

## Reportando uma vulnerabilidade

Se você encontrar uma falha de segurança (ex: uma forma de contornar as regras do Firestore, ou de acessar dados de outra família), por favor **não abra uma issue pública**. Abra um contato privado com o mantenedor pelo perfil do GitHub ([@non-s](https://github.com/non-s)) antes de divulgar publicamente.
