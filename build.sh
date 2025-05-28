#!/bin/bash

# Simple build script for vrm-mixamo-retarget library

echo "Building VRM Animation Retargeting library..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build the library
echo "Building TypeScript..."
npm run build

echo "Build complete! Library files are in the dist/ directory."
echo ""
echo "Files generated:"
echo "- dist/index.js (CommonJS)"
echo "- dist/index.esm.js (ES Module)"
echo "- dist/index.d.ts (TypeScript definitions)"
echo ""
echo "You can now publish with: npm publish" 