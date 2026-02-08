#!/usr/bin/env bash
set -euo pipefail

echo "Setting up product-template..."
echo ""

if [ ! -f api/.dev.vars ]; then
  cp api/.dev.vars.example api/.dev.vars
  echo "Created api/.dev.vars from example"
else
  echo "api/.dev.vars already exists, skipping"
fi

if [ ! -f web/.env ]; then
  cp web/.env.example web/.env
  echo "Created web/.env from example"
else
  echo "web/.env already exists, skipping"
fi

echo ""

echo "Installing dependencies..."
pnpm install

echo "Running migrations..."
cd api
pnpm run db:generate
pnpm run db:migrate:local

echo ""
echo "Done! Next steps:"
echo ""
echo "  1. Edit api/.dev.vars with your Polar and auth keys"
echo "  2. Run the database migration:"
echo "     cd api && pnpm run db:generate && pnpm run db:migrate:local"
echo "  3. Start the dev servers:"
echo "     Terminal 1: cd api && pnpm dev"
echo "     Terminal 2: cd web && pnpm dev"
echo ""
echo "See README.md for full setup instructions."
