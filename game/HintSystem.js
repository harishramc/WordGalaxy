/* =========================================================================
 * HintSystem
 * -------------------------------------------------------------------------
 * Reveals the answer one letter at a time, left to right.
 *
 *   GALAXY  ->  G _ _ _ _ _  ->  G A _ _ _ _  ->  G A L _ _ _  ...
 *
 * Each reveal costs HINT_COST coins. When the player has no coins the
 * GameEngine can instead grant a free reveal via a rewarded ad (the ad hook
 * lives in GameEngine; HintSystem only does the letter math).
 *
 * The system is stateless across words: the GameEngine tells it the target
 * word and how many letters are already revealed.
 * ========================================================================= */

(function (global) {
  "use strict";

  const HINT_COST = 100;

  const HintSystem = {
    COST: HINT_COST,

    /**
     * How many letters of `word` are revealed for a given reveal count.
     * Returns an array the same length as the word, e.g.
     *   revealed("GALAXY", 2) -> ["G","A",null,null,null,null]
     */
    revealedSlots(word, revealedCount) {
      const slots = [];
      for (let i = 0; i < word.length; i++) {
        slots.push(i < revealedCount ? word[i] : null);
      }
      return slots;
    },

    /** True when there is still a letter left to reveal. */
    canReveal(word, revealedCount) {
      return revealedCount < word.length;
    },

    /** The next reveal count after buying one hint. */
    nextRevealCount(word, revealedCount) {
      return Math.min(revealedCount + 1, word.length);
    }
  };

  global.WG = global.WG || {};
  global.WG.HintSystem = HintSystem;
})(window);
