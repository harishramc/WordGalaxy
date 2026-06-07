/* =========================================================================
 * MainMenu screen
 *   PLAY  -> Galaxy Map
 *   DAILY -> the rotating daily galaxy
 * ========================================================================= */

(function (global) {
  "use strict";
  const WG = (global.WG = global.WG || {});
  WG.Screens = WG.Screens || {};

  WG.Screens.MainMenu = {
    render(engine) {
      const root = document.createElement("div");
      root.className = "menu";

      const daily = engine.getDailyGalaxy();
      const dailyDone = engine.save.isDailyCompleted(engine.getDailyKey());
      const stats = engine.save.getStats();

      root.innerHTML = `
        <div class="menu__top">
          <div class="coin-pill" title="Coins">
            <span class="coin-pill__icon">★</span>
            <span class="coin-pill__value">${engine.getCoins()}</span>
          </div>
        </div>

        <div class="menu__center">
          <div class="logo">
            <div class="logo__word">WORD</div>
            <div class="logo__galaxy">GALAXY</div>
          </div>
          <p class="tagline">Connect the stars. Discover the words. Reveal the galaxy.</p>

          <div class="menu__buttons">
            <button class="btn btn--primary" data-action="play">
              <span class="btn__icon">▶</span> Play
            </button>
            <button class="btn btn--ghost" data-action="daily">
              <span class="btn__icon">☀</span> Daily Puzzle
              ${dailyDone ? '<span class="badge badge--done">Done</span>' : '<span class="badge">Galaxy ' + daily.id + "</span>"}
            </button>
          </div>
        </div>

        <div class="menu__footer">
          <div class="menu__stats">
            <span>${stats.galaxiesSolved} galaxies</span>
            <span class="dot">•</span>
            <span>${stats.wordsSolved} words</span>
          </div>
          <div class="menu__settings">
            <button class="icon-btn" data-action="sound" title="Toggle sound">🔊</button>
            <button class="icon-btn" data-action="reset" title="Reset progress">↺</button>
          </div>
        </div>
      `;

      root.querySelector('[data-action="play"]').addEventListener("click", () => {
        engine.sound.select();
        engine.showGalaxyMap();
      });

      root.querySelector('[data-action="daily"]').addEventListener("click", () => {
        engine.sound.select();
        engine.playDaily();
      });

      const soundBtn = root.querySelector('[data-action="sound"]');
      soundBtn.addEventListener("click", () => {
        engine.sound.enabled = !engine.sound.enabled;
        soundBtn.textContent = engine.sound.enabled ? "🔊" : "🔇";
        if (engine.sound.enabled) engine.sound.tick();
      });

      root.querySelector('[data-action="reset"]').addEventListener("click", () => {
        if (global.confirm("Reset all progress and coins?")) {
          engine.save.reset();
          engine.showMainMenu();
        }
      });

      return root;
    }
  };
})(window);
