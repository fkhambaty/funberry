#!/usr/bin/env bash
# Local release APK. Requires a generated android/ directory and JDK 17.
# This script does not create a keystore and does not embed a payment SDK.
set -euo pipefail
cd "$(dirname "$0")/.."
MOBILE_ROOT="$(pwd)"

if [[ ! -d "$MOBILE_ROOT/android" ]]; then
  echo "android/ is not generated. From apps/mobile run: npx expo prebuild --platform android"
  echo "See docs/MOBILE_RELEASE.md. android/ stays out of git."
  exit 1
fi

if [[ -d "/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home" ]]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
elif JAVA17="$(/usr/libexec/java_home -v 17 2>/dev/null)"; then
  export JAVA_HOME="$JAVA17"
else
  echo "JDK 17 is required. The current Java is not 17, and a release build was not started."
  exit 1
fi

export EXPO_PUBLIC_FUNBERRY_API="${EXPO_PUBLIC_FUNBERRY_API:-https://funberry-api.fkhambaty.workers.dev}"
export EXPO_PUBLIC_FUNBERRY_WEB="${EXPO_PUBLIC_FUNBERRY_WEB:-https://www.funberrykids.in}"
echo "Using JAVA_HOME=$JAVA_HOME"

cd "$MOBILE_ROOT/android"
./gradlew assembleRelease --no-daemon

APK="$MOBILE_ROOT/android/app/build/outputs/apk/release/app-release.apk"
if [[ ! -f "$APK" ]]; then
  echo "APK not found at $APK"
  exit 1
fi
mkdir -p "${HOME}/Desktop"
cp -f "$APK" "${HOME}/Desktop/FunBerry-Kids-release.apk"
echo "Release APK copied to ${HOME}/Desktop/FunBerry-Kids-release.apk"
