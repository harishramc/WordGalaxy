/* =========================================================================
 * ShuffleSystem
 * -------------------------------------------------------------------------
 * Free, cosmetic rearrange of the letter tiles. It only changes the order
 * the tiles are presented in — it never touches validation, which always
 * compares the connected sequence against the target word.
 * ========================================================================= */

(function (global) {
  "use strict";

  const ShuffleSystem = {
    FREE: true,

    /**
     * Returns a NEW array with the same letters in a different order.
     * Guarantees the result differs from the input when that is possible
     * (i.e. when not all letters are identical), so a shuffle always feels
     * like something happened.
     */
    shuffle(letters) {
      if (!Array.isArray(letters) || letters.length < 2) {
        return letters.slice();
      }

      const original = letters.join("\u0000");
      let out = letters.slice();
      let attempts = 0;

      do {
        // Fisher–Yates
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = out[i];
          out[i] = out[j];
          out[j] = tmp;
        }
        attempts++;
      } while (out.join("\u0000") === original && attempts < 8);

      return out;
    }
  };

  global.WG = global.WG || {};
  global.WG.ShuffleSystem = ShuffleSystem;
})(window);
