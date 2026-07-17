# Segurança e privacidade

## Modelo: sem servidor, sem coleta

O TEA não tem backend, conta, login nem banco de dados. Todo o código roda inteiramente no navegador de quem usa o app, e todos os dados digitados (nome do perfil, avatar, preferências, progresso das atividades) ficam salvos apenas no `localStorage` desse mesmo navegador (`src/local/perfilLocal.ts`). Nenhum dado é enviado para um servidor, para a nuvem ou para qualquer terceiro — não existe um endpoint de rede para dado pessoal neste app.

Essa não é só uma escolha técnica: é a razão pela qual o app não pede consentimento nem exibe um fluxo de aceite de termos antes de usar. A LGPD (Lei 13.709/2018) regula o tratamento de dado pessoal por um controlador; como não há transmissão de dado nenhum a um controlador, não há tratamento de dado pessoal por terceiro a regular. Ver `src/routes/Privacidade.tsx` para o resumo em linguagem direta mostrado à família.

## O que fica salvo, e onde

```
localStorage["tea:perfis-locais"]       — lista de perfis (nome, avatar, interesse, perfil de apoio, atividades dominadas)
localStorage["tea:perfil-ativo-id"]     — qual perfil está selecionado agora
localStorage["tea:tentativas:{id}"]     — histórico de tentativas de cada perfil
localStorage["tea:preferencias"]        — preferências sensoriais do aparelho (som, animação, contraste, fonte), por dispositivo, não por perfil
```

Todas as leituras desses dados passam por normalizadores (`normalizarPerfil`, `normalizarPerfilApoio`, etc.) que aplicam listas permitidas, tamanhos máximos de texto e valores padrão seguros — um `localStorage` corrompido, editado manualmente ou de uma versão antiga do app cai para valores padrão em vez de quebrar a experiência infantil (ver testes em `src/local/perfilLocal.test.ts`, incluindo o caso de JSON inválido).

Dados coletados sobre a criança são deliberadamente mínimos, e nenhum deles sai do aparelho:

- **Nome**: só o que for digitado no campo (o app não pede nem valida sobrenome).
- **Sem foto real**: o avatar é um de 6 ícones pré-definidos (`src/curriculo/ativos/tipos.ts`), nunca upload de imagem.
- **Sem diagnóstico**: não existe campo para condição clínica, laudo, ou qualquer dado de saúde.
- **Sem data de nascimento, e-mail, senha ou qualquer identificador de conta**: não existem, porque não há conta.
- **Perfil funcional de apoio (opcional)**: registra apenas como a criança costuma comunicar, acessar a tela e se regular dentro da plataforma, incluindo cartões de comunicação curtos personalizáveis. Não pede nível de suporte, laudo, escola, terapeuta, CID, histórico médico ou contato externo.

Os dados de progresso (`tentativas`) armazenam apenas: qual atividade, se acertou, quanto de dica precisou, e quanto tempo levou para responder.

## Apagar dados

Cada perfil pode ser apagado individualmente (tela inicial, com confirmação digitando o nome do perfil) — isso remove o perfil e seu histórico de tentativas. Também é possível apagar todos os perfis e todo o progresso deste aparelho de uma vez, na tela de Ajustes (`excluirDadosDoAparelho`, em `src/local/perfilLocal.ts`), com confirmação digitando "APAGAR".

Como não há conta nem servidor, "apagar" aqui é definitivo e imediato: não existe uma cópia em nuvem para recuperar depois, nem uma janela de retenção — a remoção do `localStorage` é a única cópia dos dados deixando de existir. Limpar os dados de navegação do navegador, ou desinstalar o app quando instalado como PWA, também apaga tudo.

## Sem sincronização entre dispositivos

Os dados de um perfil não saem do aparelho onde foram criados. Trocar de aparelho, reinstalar o navegador ou usar modo privado/anônimo significa começar um perfil novo, sem o progresso anterior. Isso é uma limitação real e conhecida do modelo (ver `docs/ARQUITETURA.md`), e é comunicada à família na tela de Privacidade.

## Cache offline: o app inteiro, desde o início

Um service worker guarda em cache o **código** do app (HTML/JS/CSS/ícones) para abrir sem conexão e instalar como app (`vite-plugin-pwa`, ver `docs/ARQUITETURA.md`). Como os dados já vivem só no `localStorage` do aparelho, não existe uma distinção entre "cache do app" e "cache de dados" como em uma arquitetura com backend — o app funciona 100% offline por padrão, sem nenhum ajuste ou consentimento adicional.

## Verificação automatizada de segurança

Como o projeto não tem orçamento para contratar uma auditoria de segurança humana independente, o que existe hoje é verificação automatizada, gratuita, rodando a cada mudança de código:

- **`npm audit --audit-level=high`** no CI (`.github/workflows/ci.yml`) — quebra o build se uma dependência tiver vulnerabilidade conhecida de severidade alta ou crítica.
- **Dependabot** (`.github/dependabot.yml`) — abre PR automático toda semana para atualizar dependências desatualizadas do npm e das GitHub Actions; alertas de vulnerabilidade e correções automáticas de segurança estão habilitados no repositório.
- **CodeQL** (`.github/workflows/codeql.yml`) — análise estática (SAST) do código JavaScript/TypeScript a cada push/PR na `main` e semanalmente, usando o mecanismo gratuito do GitHub para repositórios públicos.
- **Secret scanning** e **push protection** do GitHub já vêm habilitados no repositório, para pegar credenciais commitadas por engano antes mesmo do push.

Como o app não tem backend nem segredo de produção (nenhuma chave de API, nenhuma credencial), a superfície de ataque relevante é essencialmente o próprio código-fonte servido como site estático — sem regras de banco de dados, autenticação ou autorização de servidor para auditar.

## Reportando uma vulnerabilidade

Se você encontrar uma falha de segurança, por favor **não abra uma issue pública**. Abra um contato privado com o mantenedor pelo perfil do GitHub ([@non-s](https://github.com/non-s)) antes de divulgar publicamente.
