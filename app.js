/* =========================================================================
 * app.js — entry point
 * -------------------------------------------------------------------------
 * Wires everything together once the DOM is ready, then shows the main menu.
 * Supports:
 *   - Browser play
 *   - GitHub Pages
 *   - CrazyGames
 *   - Yandex Games
 *   - Capacitor
 * ========================================================================= */

(function (global) {
  "use strict";

  async function initCrazyGames() {
    try {
      if (
        global.CrazyGames &&
        global.CrazyGames.SDK
      ) {
        await global.CrazyGames.SDK.init();

        console.log(
          "[Word Galaxy] CrazyGames SDK initialized"
        );
      } else {
        console.log(
          "[Word Galaxy] CrazyGames SDK not detected"
        );
      }
    } catch (err) {
      console.warn(
        "[Word Galaxy] CrazyGames SDK initialization failed",
        err
      );
    }
  }

  async function boot() {
    const WG = global.WG || {};
    const root = document.getElementById("app");

    if (!root) {
      console.error(
        "[Word Galaxy] #app container not found"
      );
      return;
    }

    if (!WG.GameEngine) {
      console.error(
        "[Word Galaxy] GameEngine missing"
      );
      return;
    }

    if (!WG.SaveManager) {
      console.error(
        "[Word Galaxy] SaveManager missing"
      );
      return;
    }

    if (!WG.GALAXIES) {
      console.error(
        "[Word Galaxy] GALAXIES data missing"
      );
      return;
    }

    // Initialize CrazyGames BEFORE save manager
    await initCrazyGames();

    const save = new WG.SaveManager();

    const engine = new WG.GameEngine(
      root,
      save,
      WG.GALAXIES
    );

    // Debug helper
    global.WordGalaxy = {
      engine,
      save
    };

    // Start game
    engine.start();

    // Hide splash if present
    const splash =
      document.getElementById("boot-splash");

    if (splash) {
      splash.classList.add("hidden");
    }

    console.log(
      "[Word Galaxy] Boot complete"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    boot();
  }

})(window);