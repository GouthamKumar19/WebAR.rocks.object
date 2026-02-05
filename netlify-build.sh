#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
REACT_DEMO_DIR="$ROOT_DIR/reactViteThreeFilberDemos/webar-object-demos"
PUBLIC_DIR="$ROOT_DIR/public"

# Ensure clean output directory
echo "Cleaning public directory..."
rm -rf "$PUBLIC_DIR"
mkdir -p "$PUBLIC_DIR/reactViteThreeFilberDemos/webar-object-demos"

# Install dependencies and build React/Vite bundle
echo "Installing React demo dependencies..."
npm --prefix "$REACT_DEMO_DIR" install

echo "Building React demo..."
npm --prefix "$REACT_DEMO_DIR" run build

# Copy static assets
echo "Copying assets to public/"
cp -R "$ROOT_DIR/site" "$PUBLIC_DIR/site"
cp -R "$ROOT_DIR/demos" "$PUBLIC_DIR/demos"
cp -R "$ROOT_DIR/dist" "$PUBLIC_DIR/dist"
cp -R "$ROOT_DIR/helpers" "$PUBLIC_DIR/helpers"
cp -R "$ROOT_DIR/libs" "$PUBLIC_DIR/libs"
cp -R "$ROOT_DIR/neuralNets" "$PUBLIC_DIR/neuralNets"
cp -R "$REACT_DEMO_DIR/dist" "$PUBLIC_DIR/reactViteThreeFilberDemos/webar-object-demos/dist"

echo "Netlify payload ready in $PUBLIC_DIR"
