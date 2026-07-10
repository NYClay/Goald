#!/usr/bin/env bash
# Post-create setup script for Goald dev container
# Runs after container is created to set up the development environment

set -euo pipefail

echo "🔧 Setting up Goald development environment..."

# Ensure we're in the workspace
cd /workspaces/Goald

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm ci --prefer-offline --no-audit --no-fund 2>&1 | tail -20

# Fix Expo dependencies
echo "🔧 Fixing Expo dependencies..."
npx expo install --fix 2>&1 | tail -10

# Set up Husky git hooks
echo "🐕 Setting up Husky..."
npm run prepare 2>&1 | tail -5

# Verify TypeScript compilation
echo "🔍 Running TypeScript type check..."
npm run typecheck 2>&1 | tail -10 || true

# Run linter to verify setup
echo "🔍 Running linter..."
npm run lint 2>&1 | tail -10 || true

# Set up Android SDK environment
echo "🤖 Configuring Android SDK..."
export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=/opt/android-sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator

# Verify ADB works
echo "📱 Verifying ADB..."
adb version

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from example..."
    cp .env.example .env.local 2>/dev/null || touch .env.local
fi

# Print summary
echo ""
echo "✅ Goald dev container setup complete!"
echo ""
echo "📋 Next steps:"
echo "   make dev        # Start Expo development server"
echo "   make android    # Start Android emulator (if available)"
echo "   make test       # Run unit tests"
echo "   make test:e2e   # Run E2E tests"
echo "   make lint       # Run linter"
echo "   make typecheck  # Run TypeScript type check"
echo ""
echo "🌐 Ports forwarded:"
echo "   8081  - Expo Dev Server"
echo "   19000 - Expo DevTools"
echo "   19006 - Expo Web"
echo "   5555  - ADB (Android Debug Bridge)"
echo ""