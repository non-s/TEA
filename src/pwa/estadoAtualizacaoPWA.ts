// Pub-sub simples para o hook useAtualizacaoPWADisponivel. Fica separado de
// registrarServiceWorker.ts (que importa o módulo virtual `virtual:pwa-register`,
// só resolvido pelo plugin do Vite) para que qualquer código possa observar
// o estado de atualização sem arrastar essa dependência para os testes.

let atualizacaoDisponivel: (() => void) | null = null
let ouvintes: Array<() => void> = []

export function definirAtualizacaoDisponivel(aplicar: (() => void) | null) {
  atualizacaoDisponivel = aplicar
  ouvintes.forEach((ouvinte) => ouvinte())
}

export function obterAtualizacaoDisponivel() {
  return atualizacaoDisponivel
}

export function assinarAtualizacaoPWA(ouvinte: () => void) {
  ouvintes.push(ouvinte)
  return () => {
    ouvintes = ouvintes.filter((item) => item !== ouvinte)
  }
}
