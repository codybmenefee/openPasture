#!/bin/bash

# Start OpenPasture dev environment
# Runs Convex backend + Vite dev server concurrently

cd "$(dirname "$0")/app"

cleanup() {
  echo "Shutting down..."
  kill "$CONVEX_PID" "$VITE_PID" 2>/dev/null
  wait "$CONVEX_PID" "$VITE_PID" 2>/dev/null
  exit 0
}

trap cleanup INT TERM

npx convex dev &
CONVEX_PID=$!

pnpm dev &
VITE_PID=$!

wait "$CONVEX_PID" "$VITE_PID"
