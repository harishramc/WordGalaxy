/* =========================================================================
 * GameEngine
 * -------------------------------------------------------------------------
 * The heart of Word Galaxy. It owns runtime state and coordinates every
 * other module:
 *   - which screen is shown
 *   - the active galaxy / puzzle
 *   - coins (via SaveManager)
 *   - hint reveals (via HintSystem) including the rewarded-ad fallback
 *   - shuffles (via ShuffleSystem)
 *   - the daily puzzle resolution
 *   - rewarded-ad hooks (stubbed; wire real SDKs here)
 *   - simple WebAudio sound effects (no asset files required)
 *
 * Screens register themselves on WG.Screens[name] and expose:
 *     render(engine, params) -> HTMLElement
 * ========================================================================= */

(function (global) {
  "use strict";

  const WG = (global.WG = global.WG || {});

  /* ----------------------------------------------------------------------
   * Tiny WebAudio sound helper. Generates blips at runtime so the game
   * ships with zero audio files but still feels responsive. Safe no-op if
   * the browser has no AudioContext.
   * -------------------------------------------------------------------- */
  class Sound {
    //constructor() {
    //  this.enabled = true;
    //  this.ctx = null;
    //}
    constructor() {
      this.enabled = true;
      this.ctx = null;

      this.swipeNotes = [
        392, // G4
        440, // A4
        523, // C5
        587, // D5
        659, // E5
        784, // G5
        880  // A5
      ];
    }
    _ensure() {
      if (this.ctx) return this.ctx;
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      return this.ctx;
    }
    _blip(freq, dur, type, gain) {
      if (!this.enabled) return;
      const ctx = this._ensure();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.value = freq;
      g.gain.value = gain === undefined ? 0.06 : gain;
      osc.connect(g);
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      osc.start(now);
      osc.stop(now + dur);
    }
    tick() { this._blip(520, 0.05, "triangle", 0.04); }
    select() { this._blip(660, 0.06, "sine", 0.05); }
    swipeStep(stepIndex) {
      if (!this.enabled) return;

      const note =
        this.swipeNotes[
          Math.min(
            stepIndex,
            this.swipeNotes.length - 1
          )
        ];

      this._blip(
        note,
        0.08,
        "triangle",
        0.025
      );
    }
    //correct() {
    //  this._blip(523, 0.10, "sine", 0.06);
    //  setTimeout(() => this._blip(784, 0.16, "sine", 0.06), 90);
    //}
    correct() {
      if (!this.enabled) return;

      const notes = [
        { freq: 392, delay: 0 },     // G4
        { freq: 523, delay: 120 },   // C5
        { freq: 659, delay: 240 }    // E5
      ];

      notes.forEach(({ freq, delay }) => {
        setTimeout(() => {
          this._blip(
            freq,
            0.28,
            "triangle",
            0.05
          );
        }, delay);
      });
    }
    wrong() { this._blip(180, 0.18, "sawtooth", 0.05); }
    coin() { this._blip(880, 0.08, "square", 0.04); }
    reveal() {
      this._blip(440, 0.10, "sine", 0.06);
      setTimeout(() => this._blip(660, 0.10, "sine", 0.06), 80);
      setTimeout(() => this._blip(990, 0.22, "sine", 0.06), 170);
    }
  }

  class GameEngine {
    constructor(rootEl, saveManager, galaxies) {
      this.root = rootEl;
      this.save = saveManager;
      this.galaxies = galaxies;
      this.sound = new Sound();

      // active-session state
      this.currentGalaxy = null;
      this.currentPuzzleIndex = 0;
      this.revealedCount = 0;       // hint reveals for the current word
      this.sessionSolved = [];      // indexes solved this session
      this.isDaily = false;

      this.currentScreenName = null;
    }

    /* ---- bootstrap ---------------------------------------------------- */
    start() {
      this.showScreen("MainMenu");
    }

    /* ---- screen routing ---------------------------------------------- */
    showScreen(name, params) {
      const screen = WG.Screens && WG.Screens[name];
      if (!screen) {
        console.error(`[GameEngine] Unknown screen "${name}".`);
        return;
      }
      this.currentScreenName = name;
      this.root.innerHTML = "";
      const el = screen.render(this, params || {});
      el.classList.add("screen");
      this.root.appendChild(el);
      // trigger enter animation on next frame
      requestAnimationFrame(() => el.classList.add("screen--in"));
    }

    showMainMenu() { this.showScreen("MainMenu"); }
    showGalaxyMap() { this.showScreen("GalaxyMap"); }

    /* ---- galaxy / puzzle lifecycle ----------------------------------- */
    getGalaxyById(id) {
      return this.galaxies.find((g) => g.id === id) || null;
    }

    playGalaxy(galaxyId, opts) {
      opts = opts || {};
      const galaxy = this.getGalaxyById(galaxyId);
      if (!galaxy) return;
      this.currentGalaxy = galaxy;
      this.currentPuzzleIndex = 0;
      this.revealedCount = 0;
      this.sessionSolved = [];
      this.isDaily = !!opts.daily;
      this.showScreen("PuzzleScreen");
    }

    /* The daily puzzle reuses an existing galaxy: dayOfYear % galaxies.length.
     * No separate daily content is maintained — everyone shares the same
     * galaxy each day, and it rotates forever. */
    getDailyGalaxy() {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const dayOfYear = Math.floor(diff / 86400000); // ms per day
      const index = dayOfYear % this.galaxies.length;
      return this.galaxies[index];
    }

    getDailyKey() {
      const d = new Date();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${d.getFullYear()}-${m}-${day}`;
    }

    playDaily() {
      const galaxy = this.getDailyGalaxy();
      this.playGalaxy(galaxy.id, { daily: true });
    }

    getCurrentPuzzle() {
      if (!this.currentGalaxy) return null;
      return this.currentGalaxy.puzzles[this.currentPuzzleIndex] || null;
    }

    /* Called by the PuzzleScreen when the player connects the right word. */
    onWordSolved() {
      if (this.sessionSolved.indexOf(this.currentPuzzleIndex) === -1) {
        this.sessionSolved.push(this.currentPuzzleIndex);
        this.save.incStat("wordsSolved", 1);
      }
      this.sound.correct();

      const isLast =
        this.currentPuzzleIndex >= this.currentGalaxy.puzzles.length - 1;

      if (isLast) {
        this.completeGalaxy();
      } else {
        // advance to the next word
        this.currentPuzzleIndex += 1;
        this.revealedCount = 0;
        this.showScreen("PuzzleScreen");
      }
    }

    completeGalaxy() {
      const galaxy = this.currentGalaxy;
      const baseReward = galaxy.reward;

      // Daily completions are tracked but do not re-unlock progression.
      if (this.isDaily) {
        this.save.markDailyCompleted(this.getDailyKey());
      }

      const firstTime = !this.save.isSolved(galaxy.id);
      this.save.markGalaxySolved(galaxy.id, this.galaxies.length);

      // Coins are only awarded the first time a galaxy is completed
      // (or every day for the daily). Replays are free practice.
      const awardCoins = firstTime || this.isDaily;
      if (awardCoins) {
        this.save.addCoins(baseReward);
        this.sound.coin();
      }

      this.showScreen("RevealScreen", {
        galaxy: galaxy,
        reward: awardCoins ? baseReward : 0,
        doubled: false,
        isDaily: this.isDaily
      });
    }

    /* ---- hints -------------------------------------------------------- */
    /**
     * Attempt to buy a hint reveal.
     * Returns { ok, revealedCount, needAd } so the screen can react.
     *   - ok:true        -> a letter was revealed (coins spent)
     *   - needAd:true     -> not enough coins; offer a rewarded ad
     *   - ok:false (else) -> nothing left to reveal
     */
    buyHint() {
      const puzzle = this.getCurrentPuzzle();
      if (!puzzle) return { ok: false };
      if (!WG.HintSystem.canReveal(puzzle.word, this.revealedCount)) {
        return { ok: false, exhausted: true, revealedCount: this.revealedCount };
      }
      if (this.save.getCoins() < WG.HintSystem.COST) {
        return { ok: false, needAd: true, revealedCount: this.revealedCount };
      }
      this.save.spendCoins(WG.HintSystem.COST);
      return this._applyHint(puzzle);
    }

    /* Grant a free reveal (used after a rewarded ad completes). */
    grantFreeHint() {
      const puzzle = this.getCurrentPuzzle();
      if (!puzzle) return { ok: false };
      if (!WG.HintSystem.canReveal(puzzle.word, this.revealedCount)) {
        return { ok: false, exhausted: true, revealedCount: this.revealedCount };
      }
      return this._applyHint(puzzle);
    }

    _applyHint(puzzle) {
      this.revealedCount = WG.HintSystem.nextRevealCount(
        puzzle.word,
        this.revealedCount
      );
      this.save.incStat("hintsUsed", 1);
      this.sound.reveal();

      const fullyRevealed = this.revealedCount >= puzzle.word.length;
      return {
        ok: true,
        revealedCount: this.revealedCount,
        fullyRevealed: fullyRevealed
      };
    }

    /* ---- shuffle ------------------------------------------------------ */
    shuffle(letters) {
      this.save.incStat("shufflesUsed", 1);
      this.sound.tick();
      return WG.ShuffleSystem.shuffle(letters);
    }

    /* ---- coins helpers ------------------------------------------------ */
    getCoins() { return this.save.getCoins(); }

    /* ====================================================================
     * REWARDED-AD HOOKS
     * --------------------------------------------------------------------
     * Only rewarded ads are used in Word Galaxy. Two placements:
     *   1) "No coins? Watch an ad to get a hint."
     *   2) "Galaxy completed — watch an ad to double the reward."
     *
     * These stubs simulate an ad with a short overlay so the full loop is
     * testable today. To go live, replace the body of `_playRewardedAd`
     * with the real SDK call:
     *
     *   CrazyGames:  window.CrazyGames.SDK.ad.requestAd("rewarded", {
     *                  adFinished: onComplete, adError: onError });
     *   Yandex:      ysdk.adv.showRewardedVideo({ callbacks: {
     *                  onRewarded: onComplete, onError: onError }});
     *   AdMob (APK): via the Capacitor AdMob plugin's rewarded API.
     * ================================================================== */

    
    _playRewardedAd(onComplete, onCancel) {

      if (
        window.CrazyGames &&
        window.CrazyGames.SDK &&
        window.CrazyGames.SDK.ad
      ) {

        window.CrazyGames.SDK.ad.requestAd(
          "rewarded",
          {
            adFinished: () => {
              console.log(
                "[Word Galaxy] Rewarded ad completed"
              );

              if (onComplete) {
                onComplete();
              }
            },

            adError: (error) => {
              console.warn(
                "[Word Galaxy] Rewarded ad failed",
                error
              );

              if (onCancel) {
                onCancel();
              }
            },

            adStarted: () => {
              console.log(
                "[Word Galaxy] Rewarded ad started"
              );
            }
          }
        );

        return;
      }

      console.warn(
        "[Word Galaxy] CrazyGames SDK unavailable"
      );

      if (onCancel) {
        onCancel();
      }
    }


    watchAdForHint(onComplete) {
      this._playRewardedAd(
        () => {
          const res = this.grantFreeHint();
          onComplete && onComplete(res);
        },
        () => { /* ad cancelled: no reward */ }
      );
    }

    watchAdToDouble(galaxy, baseReward, onDone) {
      this._playRewardedAd(
        () => {
          // Player already received baseReward; add it again to double.
          if (baseReward > 0) {
            this.save.addCoins(baseReward);
            this.sound.coin();
          }
          onDone && onDone(true);
        },
        () => { onDone && onDone(false); }
      );
    }
  }

  WG.GameEngine = GameEngine;
})(window);
