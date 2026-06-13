/* =========================================================================
 * SaveManager
 * -------------------------------------------------------------------------
 * Owns all persistence. Reads/writes a single JSON blob to localStorage.
 * The schema is intentionally future-proof: fields the V1 game does not use
 * yet (stats, dailyCompleted) are created up-front so future versions never
 * need a migration just to add them.
 *
 * Save shape:
 *   {
 *     coins:          500,
 *     unlockedGalaxy: 1,            // highest galaxy id the player may enter
 *     solvedGalaxies: [],           // [galaxyId, ...]
 *     dailyCompleted: [],           // ["2026-04-21", ...] ISO day keys
 *     stats: { wordsSolved, galaxiesSolved, hintsUsed, shufflesUsed }
 *   }
 * ========================================================================= */

function getStorage() {
  try {
    if (
      window.CrazyGames &&
      window.CrazyGames.SDK &&
      window.CrazyGames.SDK.data
    ) {
      return window.CrazyGames.SDK.data;
    }
  } catch (_) {}

  return window.localStorage;
}


(function (global) {
  "use strict";

  const STORAGE_KEY = "word_galaxy_save_v1";

  const DEFAULT_SAVE = {
    coins: 500,
    unlockedGalaxy: 1,
    solvedGalaxies: [],
    dailyCompleted: [],
    stats: {
      wordsSolved: 0,
      galaxiesSolved: 0,
      hintsUsed: 0,
      shufflesUsed: 0
    }
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  class SaveManager {
    constructor() {
      this.data = this.load();
    }

    load() {
      let parsed = null;
      try {
        const storage = getStorage();
        const raw = storage.getItem(STORAGE_KEY);
        if (raw) parsed = JSON.parse(raw);
      } catch (e) {
        console.warn("[SaveManager] Could not read save, starting fresh.", e);
      }

      // Merge onto defaults so missing keys are filled in (forward-compatible).
      const data = deepClone(DEFAULT_SAVE);
      if (parsed && typeof parsed === "object") {
        Object.assign(data, parsed);
        data.stats = Object.assign(deepClone(DEFAULT_SAVE.stats), parsed.stats || {});
        if (!Array.isArray(data.solvedGalaxies)) data.solvedGalaxies = [];
        if (!Array.isArray(data.dailyCompleted)) data.dailyCompleted = [];
      }
      return data;
    }

    save() {
      try {
        const storage = getStorage();
        storage.setItem(
          STORAGE_KEY,
          JSON.stringify(this.data)
        );
      } catch (e) {
        // Private mode / quota errors shouldn't crash gameplay.
        console.warn("[SaveManager] Could not persist save.", e);
      }
    }

    reset() {
      this.data = deepClone(DEFAULT_SAVE);
      this.save();
    }

    // ---- coins ----------------------------------------------------------
    getCoins() {
      return this.data.coins;
    }

    addCoins(amount) {
      this.data.coins += amount;
      this.save();
      return this.data.coins;
    }

    spendCoins(amount) {
      if (this.data.coins < amount) return false;
      this.data.coins -= amount;
      this.save();
      return true;
    }

    // ---- progression ----------------------------------------------------
    isSolved(galaxyId) {
      return this.data.solvedGalaxies.includes(galaxyId);
    }

    isUnlocked(galaxyId) {
      return galaxyId <= this.data.unlockedGalaxy;
    }

    markGalaxySolved(galaxyId, totalGalaxies) {
      if (!this.isSolved(galaxyId)) {
        this.data.solvedGalaxies.push(galaxyId);
        this.data.stats.galaxiesSolved += 1;
      }
      // Unlock the next galaxy, capped at the amount of content available.
      const next = Math.min(galaxyId + 1, totalGalaxies);
      if (next > this.data.unlockedGalaxy) {
        this.data.unlockedGalaxy = next;
      }
      this.save();
    }

    // ---- daily puzzle ---------------------------------------------------
    isDailyCompleted(dayKey) {
      return this.data.dailyCompleted.includes(dayKey);
    }

    markDailyCompleted(dayKey) {
      if (!this.isDailyCompleted(dayKey)) {
        this.data.dailyCompleted.push(dayKey);
        this.save();
      }
    }

    // ---- stats ----------------------------------------------------------
    incStat(key, by) {
      if (this.data.stats[key] === undefined) this.data.stats[key] = 0;
      this.data.stats[key] += by === undefined ? 1 : by;
      this.save();
    }

    getStats() {
      return this.data.stats;
    }
  }

  global.WG = global.WG || {};
  global.WG.SaveManager = SaveManager;
})(window);
