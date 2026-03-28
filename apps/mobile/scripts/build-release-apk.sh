#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
MOBILE_ROOT="$(pwd)"
DESKTOP="${HOME}/Desktop"
OUT_NAME="FunBerry-Kids-release.apk"

if [[ ! -f "$MOBILE_ROOT/.env" ]]; then
  echo "Missing apps/mobile/.env — add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
  exit 1
fi

# JDK: prefer 17 (RN-friendly), else whatever java_home returns
if [[ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
elif [[ -n "$(/usr/libexec/java_home -v 17 2>/dev/null)" ]]; then
  export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
else
  export JAVA_HOME="$(/usr/libexec/java_home)"
fi
echo "Using JAVA_HOME=$JAVA_HOME"

# Critical: Metro must see these when bundling release JS
set -a
# shellcheck disable=SC1091
source "$MOBILE_ROOT/.env"
set +a
if [[ -z "${EXPO_PUBLIC_SUPABASE_URL:-}" || -z "${EXPO_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
  echo "EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY must be set in .env"
  exit 1
fi

cd "$MOBILE_ROOT/android"
./gradlew clean assembleRelease --no-daemon

APK="$MOBILE_ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK" ]]; then
  echo "APK not found at $APK"
  exit 1
fi

mkdir -p "$DESKTOP"
cp -f "$APK" "$DESKTOP/$OUT_NAME"
echo "✅ Release APK → $DESKTOP/$OUT_NAME"
ls -la "$DESKTOP/$OUT_NAME"
