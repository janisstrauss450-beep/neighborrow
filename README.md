# NeighBorrow

Standalone mobile-first PWA prototype for neighborhood sharing.

NeighBorrow lets community members lend or rent underused household items and exchange local caregiving, repair, and small-task skills. This version is a local functional prototype with seeded data and browser persistence.

## Run locally

```sh
npm install
npm run dev
```

Open the Vite URL in a browser. The layout is optimized for phone widths, but it can be previewed on desktop through the built-in phone frame.

## What works

- Home feed with categories and nearby posts
- Search and filters for items, requests, and skills
- Add form for lending, renting, requesting, and skill offers
- Favorites saved in `localStorage`
- Booking/request action that opens a chat
- Paid rentals and paid skills open a demo checkout with Visa, Mastercard, Google Pay, Apple Pay, and PayPal
- Chat list and chat thread with persisted sent messages
- Profile screen with verification, stats, evaluations, and reviews
- Light/dark mode toggle saved in `localStorage`

## Android APK

This project includes a Capacitor Android wrapper and a GitHub Actions workflow:

```text
.github/workflows/android-apk.yml
```

When pushed to GitHub, run the **Android APK** workflow. The downloadable artifact will be:

```text
neighborrow-debug-apk / app-debug.apk
```

The local Android project lives in `android/`. A local APK build requires Java 17 plus Android SDK 36.

## Payment model demo

The prototype separates community favors from paid exchanges:

- Free lending and neighbor favors stay commission-free.
- Paid rentals and paid skills use a refundable payment hold.
- NeighBorrow can take a small service fee only on paid transactions.
- A small protection fee can fund dispute handling, safety checks, and support.

## Prototype limits

This v1 has no backend, authentication, real payment processor, real maps, image upload, moderation, or server messaging. Data is stored locally in the browser under the `neighborrow:v1` key.
