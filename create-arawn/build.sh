#!/bin/bash

set -e

echo "Building create-arawn CLI..."
pnpm build

echo "✓ Build complete"
echo ""
echo "To test the CLI locally, run:"
echo "  node dist/index.js [project-name]"
echo ""
echo "To publish to npm:"
echo "  npm publish"
