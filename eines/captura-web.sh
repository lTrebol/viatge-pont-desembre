#!/bin/sh
# Captures de la web final per revisar-la (a 1280 px i a 375 px).
# Executar al terminal del sistema:  sh eines/captura-web.sh
set -e
DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$DIR/design_preview/web"
mkdir -p "$OUT"
PROF="$(mktemp -d)"
FF="${FIREFOX:-/usr/bin/firefox}"
shot() { "$FF" --headless --no-remote --profile "$PROF" --window-size="$2" --screenshot "$OUT/$1" "file://$DIR/index.html$3"; }
shot escriptori.png 1280,6000 ""
shot mobil.png      375,9000  ""
shot comparador.png 1280,1600 "#comparar=2-8-1"
rm -rf "$PROF"
ls -la "$OUT"
