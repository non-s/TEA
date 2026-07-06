/**
 * Normaliza texto falado para comparação: minúsculas, sem acentos, sem
 * pontuação. Usado tanto para o que o reconhecimento de fala transcreve
 * quanto para as respostas aceitas (que já vêm de curriculo/trilha-v1.ts).
 */
export function normalizarFala(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Compara a transcrição da fala com as respostas aceitas para a atividade
 * atual. Exige correspondência exata (frase inteira ou uma palavra isolada
 * da transcrição) — nunca substring livre, porque um alvo curto como a
 * vogal "i" apareceria dentro de quase qualquer frase transcrita
 * ("… assim", "… disse") e gerariam falsos positivos.
 */
export function falaCorrespondeResposta(
  transcricao: string,
  respostasAceitas: string[],
): boolean {
  const transcricaoNormalizada = normalizarFala(transcricao)
  if (!transcricaoNormalizada) return false

  const palavrasTranscricao = transcricaoNormalizada.split(' ')

  return respostasAceitas
    .map(normalizarFala)
    .filter(Boolean)
    .some(
      (resposta) =>
        resposta === transcricaoNormalizada ||
        palavrasTranscricao.includes(resposta),
    )
}
