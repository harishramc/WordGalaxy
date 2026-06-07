# Word Galaxy

**Connect the stars. Discover the words. Reveal the galaxy.**

A casual word puzzle game. Players connect letters on a constellation wheel to
spell words, completing **galaxies** (not "levels"). Each finished galaxy reveals
a hidden theme, awards coins, and shows a fun fact.

Pure vanilla JS — no build step, no framework, no backend. Runs by opening
`index.html`, and deploys straight to web game portals or a Capacitor APK.

---

## Run it

Because everything is plain `<script>` tags (no ES modules), you can just open
`index.html` in a browser. For the cleanest experience (and to avoid any
`file://` quirks), serve the folder:

```bash
# any static server works
npx serve word-galaxy
# or
python3 -m http.server --directory word-galaxy 8080
```

Then visit the printed URL.

---

## What's in V1

| Feature | Status |
|---|---|
| Galaxy progression (unlock next on completion) | ✅ |
| 3 words per galaxy (Easy) | ✅ |
| Swipe / drag to connect letters | ✅ |
| Hint system — reveals letters left→right, 100 coins each | ✅ |
| Rewarded-ad fallback when out of coins | ✅ |
| Shuffle (free) | ✅ |
| Coin economy (start 500, +150 per galaxy) | ✅ |
| Galaxy reveal popup (theme + words + fact) | ✅ |
| Double-reward rewarded ad | ✅ |
| Daily puzzle (`dayOfYear % galaxies.length`, no extra content) | ✅ |
| Save progress (localStorage) | ✅ |
| Mobile responsive | ✅ |

Ships with **8 galaxies** of content (Space, Ocean, Dinosaurs, Computers,
Animals, Food, Sports, Music). The frozen V1 minimum was 2 — adding more is just
data.

---

## Project structure

```
word-galaxy/
├── index.html            # shell + starfield + script order
├── styles.css            # full cosmic theme
├── app.js                # bootstrap
├── data/
│   └── galaxies.js       # ALL puzzle content (static)
├── game/
│   ├── GameEngine.js     # state, routing, coins, daily, ad hooks, sound
│   ├── HintSystem.js     # left→right letter reveals
│   ├── ShuffleSystem.js  # free tile rearrange
│   └── SaveManager.js    # localStorage persistence
└── screens/
    ├── MainMenu.js
    ├── GalaxyMap.js
    ├── PuzzleScreen.js   # the swipe-to-connect core loop
    └── RevealScreen.js
```

---

## Adding content

Open `data/galaxies.js` and push a new object. The only rule: each puzzle's
`letters` must be an anagram of its `word` (a console warning fires if not).

```js
{
  id: 9,
  theme: "SCIENCE",
  fact: "A teaspoon of a neutron star would weigh about a billion tons.",
  reward: 150,
  puzzles: [
    { word: "ATOM",  letters: ["T","A","M","O"] },
    { word: "LASER", letters: ["S","L","A","E","R"] },
    { word: "ENERGY",letters: ["N","E","E","G","R","Y"] }
  ]
}
```

Scale to 30, then 100+ — no code changes needed.

---

## Wiring real ads

Only **rewarded** ads are used, in two places, both routed through
`GameEngine._playRewardedAd()`. Replace its body with the real SDK call:

**CrazyGames**
```js
window.CrazyGames.SDK.ad.requestAd("rewarded", {
  adFinished: onComplete,
  adError: onCancel,
});
```

**Yandex Games**
```js
ysdk.adv.showRewardedVideo({
  callbacks: { onRewarded: onComplete, onError: onCancel }
});
```

**AdMob (Android via Capacitor)** — use the `@capacitor-community/admob`
rewarded API and call `onComplete` on the reward event.

The two placements are already implemented:
- `watchAdForHint()` — "out of coins, watch to reveal a letter"
- `watchAdToDouble()` — "double your galaxy reward"

---

## Capacitor (Android APK)

```bash
npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Word Galaxy" com.yourstudio.wordgalaxy --web-dir=word-galaxy
npx cap add android
npx cap copy
npx cap open android   # build the APK/AAB in Android Studio
```

Save data uses `localStorage`, which persists inside the WebView, so progress
survives between sessions on device.

---

## Deploy targets

- **CrazyGames / Yandex / GameDistribution** — zip the folder and upload; it's
  fully static and offline-capable. Add the portal's SDK script and wire the ad
  hooks above.
- The web fonts load from Google Fonts with safe fallbacks; for a guaranteed
  offline APK you can self-host the two fonts and swap the `<link>` in
  `index.html`.

---

## Excluded from V1 (by design)

Achievements, streaks, seasonal events, collections, multiplayer,
AI-generated content, live services. The save schema already reserves space
(`stats`, `dailyCompleted`) so these can be added later without a migration.
