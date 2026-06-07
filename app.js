/* =========================================================================
 * app.js — entry point
 * -------------------------------------------------------------------------
 * Wires everything together once the DOM is ready, then shows the main menu.
 * All modules attach to the global `window.WG` namespace and are loaded as
 * plain scripts (no bundler, no ES-module CORS issues), so the game runs by
 * simply opening index.html — locally, on CrazyGames/Yandex, or inside a
 * Capacitor WebView.
 * ========================================================================= */

(function (global) {
  "use strict";

  function boot() {
    const WG = global.WG || {};
    const root = document.getElementById("app");

    if (!root) {
      console.error("[app] #app container not found.");
      return;
    }
    if (!WG.GameEngine || !WG.SaveManager || !WG.GALAXIES) {
      console.error("[app] Core modules failed to load. Check script order.");
      return;
    }

    const save = new WG.SaveManager();
    const engine = new WG.GameEngine(root, save, WG.GALAXIES);

    // expose for debugging in the console
    global.WordGalaxy = { engine, save };

    engine.start();

    // hide the boot splash, if present
    const splash = document.getElementById("boot-splash");
    if (splash) splash.classList.add("hidden");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
