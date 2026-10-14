# FunBerry Kids mobile release

Checked on 14 October 2026 from this repository. No store listing exists.

## Identity

| | |
|---|---|
| App name | FunBerry Kids |
| Scheme | `funberrykids` |
| iOS bundle id | `com.funberrykids.app` |
| Android package | `com.funberrykids.app` |
| Version | 1.1.0, iOS build 3, Android versionCode 3 |
| API | `https://funberry-api.fkhambaty.workers.dev` |
| Web origin | `https://www.funberrykids.in` |
| Support | `hello@funberrykids.in` |

`eas.json` does not contain a project id. Cloud builds start only after `npx eas init` writes a real Expo project id. Do not put a placeholder back. Do not commit `google-service-account.json`, a keystore, or a `.p8` key.

## Checks that do not need a phone

From the repository root:

```bash
npm run check --workspace=@funberry/mobile
npm run doctor --workspace=@funberry/mobile
```

`check` is lint, `tsc --noEmit`, Jest, and `scripts/check-static.mjs`. The static scan fails if the app mentions Supabase, RevenueCat, Stripe, a Razorpay key, offline mode, or AsyncStorage. GitHub Actions runs this in the `mobile` job. The existing `check` job is unchanged apart from the new sibling job.

Icons are regenerated from the website artwork:

```bash
npm run icons --workspace=@funberry/mobile
```

## Android and iOS builds

`android/` and `ios/` are generated and gitignored.

```bash
cd apps/mobile
npx expo prebuild --platform android
bash scripts/build-release-apk.sh
```

The release script requires JDK 17 and a generated `android/` directory. It copies `app-release.apk` to the Desktop. `npm run android` is a debug device build, not the store bundle. EAS production builds an Android App Bundle after `eas init`.

iOS needs full Xcode, not only the Command Line Tools:

```bash
npx expo prebuild --platform ios
npx expo run:ios
```

## This machine on 14 October 2026

The Android source was clean-built with JDK 17, installed on the stable Android
16 `CJS_API_36` emulator, and exercised with
`maestro/onboarding.yaml`. The welcome and sign-in route passed with no fatal
exception or app ANR. A separate idle-machine cold launch completed in
1,210 ms. The same APK and Maestro flow passed on the Android 16
`CJS_TABLET_API_36` Pixel Tablet emulator at 2560×1600. Local outputs
(generated and gitignored) are:

- `android/app/build/outputs/apk/release/app-release.apk` — 64,192,366 bytes;
  SHA-256 `6db024ef82293fe109c2c6203d503674c84a5b2708e686cc372705e6954e3113`
- `android/app/build/outputs/bundle/release/app-release.aab` — 30,854,712 bytes;
  SHA-256 `cd597d83c295a3ec75bad9b542e5cbd4b2c099f711ecd05b85cdffdeb6cd8548`

These local release outputs use the generated development signing setup. They
are test artifacts, not Play Store-signed deliverables.

The iOS JavaScript/Hermes export passed. No iOS Simulator binary was produced:
`xcode-select` still points at Command Line Tools because the owner cancelled
the administrator prompt required to install full Xcode. That native check
remains explicit rather than being claimed.

- `eas init` has not been run, so there is no cloud build or store signing.
- `cloudflare/d1/005_play_tickets.sql` has been applied to the remote D1
  database and the Worker has been deployed successfully. The remaining
  production check is an end-to-end play with a non-demo parent.
- Real email delivery, a real Razorpay charge, and App Store or Play review were not run.
- `npm audit --omit=dev` still reports upstream Expo 52 build-tool advisories,
  including `tar`; an attempted incompatible `query-string` bump caused a
  navigation crash and was rejected by device testing. Upgrade the Expo SDK as
  a dedicated migration before store submission rather than forcing transitive
  versions into this release.

## Before a store submission

1. Measure the two gates in `docs/EVIDENCE_GATES.md`. They are not met.
2. Add store billing and server receipt checks before any in-app sale. The current plan screen is read-only and does not link to a website checkout.
3. Play one native game and one WebView game against production with a
   non-demo parent.
4. Confirm the binary's permission list has no camera, microphone, location or photo library.
5. Keep the privacy and terms URLs pointed at `https://www.funberrykids.in`.
