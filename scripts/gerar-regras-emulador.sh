#!/usr/bin/env bash
# Envolve o fragmento de regras em firestore.rules (que documenta só o bloco
# `match /responsaveis/{responsavelId}` de um projeto Firebase compartilhado
# maior, e por isso não compila sozinho) num arquivo completo e válido, só
# para uso do Firestore Emulator em desenvolvimento local. Não editar o
# arquivo gerado à mão — ele é recriado toda vez a partir de firestore.rules,
# que continua sendo a única fonte de verdade das regras.
set -euo pipefail

raiz="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
saida="$raiz/.firebase-emulador/firestore.rules"

mkdir -p "$raiz/.firebase-emulador"

{
  echo "// GERADO AUTOMATICAMENTE por scripts/gerar-regras-emulador.sh"
  echo "// Não editar à mão — edite firestore.rules e rode 'npm run emuladores:preparar'."
  echo "rules_version = '2';"
  echo "service cloud.firestore {"
  echo "  match /databases/{database}/documents {"
  echo "    function signedIn() {"
  echo "      return request.auth != null;"
  echo "    }"
  tail -n +18 "$raiz/firestore.rules"
  echo "  }"
  echo "}"
} > "$saida"

echo "Regras do emulador geradas em $saida"
