#!/usr/bin/env bash
# Generate an image with Nano Banana (Gemini 2.5 Flash Image).
# Usage: tools/nanobanana.sh "prompt text" output.png [input_image.png]
# Reads GEMINI_API_KEY from .env in the repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export $(grep -v '^#' "$ROOT/.env" | xargs)

PROMPT="$1"
OUT="$2"
INPUT_IMG="${3:-}"

if [ -n "$INPUT_IMG" ]; then
  MIME=$(file -b --mime-type "$INPUT_IMG")
  B64=$(base64 -i "$INPUT_IMG")
  PARTS=$(jq -n --arg t "$PROMPT" --arg m "$MIME" --arg d "$B64" \
    '[{text:$t},{inline_data:{mime_type:$m,data:$d}}]')
else
  PARTS=$(jq -n --arg t "$PROMPT" '[{text:$t}]')
fi

RESP=$(jq -n --argjson p "$PARTS" '{contents:[{parts:$p}]}' | \
  curl -s -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d @-)

DATA=$(echo "$RESP" | jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' 2>/dev/null | head -1)
if [ -z "$DATA" ] || [ "$DATA" = "null" ]; then
  echo "ERROR: no image in response:" >&2
  echo "$RESP" | jq -r '.error.message // (.candidates[0].content.parts[] | select(.text) | .text) // .' >&2 2>/dev/null || echo "$RESP" | head -c 500 >&2
  exit 1
fi
echo "$DATA" | base64 -d > "$OUT"
echo "wrote $OUT ($(stat -f%z "$OUT") bytes)"
