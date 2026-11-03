#!/bin/sh
# Captures de la web final per revisar-la (a 1280 px i a 375 px).
# Executar al terminal del sistema:  sh eines/captura-web.sh
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$DIR/design_preview/web"
mkdir -p "$OUT"
PROF="$(mktemp -d)"
FF="${FIREFOX:-/usr/bin/firefox}"
shot() { "$FF" --headless --no-remote --profile "$PROF" --window-size="$2" --screenshot "$OUT/$1" "file://$DIR/$3"; }
for p in index resum cases comparar mapa activitats preguntes votacio; do
  shot "$p-escriptori.png" 1280,3000 "$p.html"
  shot "$p-mobil.png"      375,5000  "$p.html"
done
shot comparador-amb-cases.png 1280,1600 "comparar.html#comparar=8-1-5"
rm -rf "$PROF"
ls -la "$OUT"
