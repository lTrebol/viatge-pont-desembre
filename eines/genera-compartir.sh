#!/bin/sh
# Genera img/compartir.png (vista prèvia en compartir l'enllaç) amb Firefox headless.
# Executar al terminal del sistema:  sh eines/genera-compartir.sh
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PROF="$(mktemp -d)"
"${FIREFOX:-/usr/bin/firefox}" --headless --no-remote --profile "$PROF" --window-size=1200,630 \
  --screenshot "$DIR/../img/compartir.png" "file://$DIR/compartir.html"
rm -rf "$PROF"
ls -la "$DIR/../img/compartir.png"
