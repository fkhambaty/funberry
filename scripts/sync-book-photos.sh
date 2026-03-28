#!/usr/bin/env bash
# Resize and copy textbook photos from Downloads into Next.js public assets.
# Source folder name matches macOS “Photos-3-001 2”.
set -euo pipefail
SRC="${1:-$HOME/Downloads/Photos-3-001 2}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/apps/web/public/book-pages"
MAX_W="${2:-1400}"

if [[ ! -d "$SRC" ]]; then
  echo "Missing folder: $SRC" >&2
  echo "Usage: $0 [path/to/Photos-3-001\\ 2] [max_width]" >&2
  exit 1
fi

mkdir -p "$DEST"
count=0
for f in "$SRC"/*.jpg "$SRC"/*.JPG; do
  [[ -f "$f" ]] || continue
  bn=$(basename "$f")
  sips -Z "$MAX_W" "$f" --out "$DEST/$bn" >/dev/null
  count=$((count + 1))
done

echo "Synced $count image(s) → $DEST ($(du -sh "$DEST" | cut -f1))"
echo "If filenames change, update packages/game-engine/src/data/bookPages.ts to match."
