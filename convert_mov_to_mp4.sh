#!/usr/bin/env bash
set -euo pipefail

input="${1:-/Users/codymenefee/Documents/Projects/pan/Screen Recording 2026-01-23 at 12.54.31 AM.mov}"
output="${2:-${input%.mov}.mp4}"

if [[ ! -f "$input" ]]; then
  echo "Input file not found: $input" >&2
  exit 1
fi

echo "Converting:"
echo "  input:  $input"
echo "  output: $output"

ffmpeg -hide_banner -y \
  -i "$input" \
  -c:v libx264 -preset medium -crf 20 -pix_fmt yuv420p \
  -c:a aac -b:a 160k \
  -movflags +faststart \
  "$output"

echo "Done: $output"
