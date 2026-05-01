# Android build

MiniGamesWF uses EAS Build for native Android packages. The web build remains unchanged and still runs through `npm run build:web`.

## Requirements

- Expo account with access to this app.
- Google Play developer account for store submission.
- Supabase public environment variables configured in EAS:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Do not commit service-role keys or Play service-account JSON files.

## Commands

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
eas build --platform android --profile production
eas submit -p android --profile production
```

Use `preview` to generate an APK for device testing. Use `production` to generate the AAB for Google Play.

## Local verification

```bash
npm run typecheck
npm run build:web
eas build --platform android --profile preview --local
```

The local EAS build requires Android build tooling. If the local machine is not configured, use EAS cloud build.
