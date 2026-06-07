/* =========================================================================
 * GalaxyMap screen
 *   The player progresses through galaxies (not "levels"). Each node shows
 *   its state: solved (⭐), playable (▶) or locked (🔒). The theme stays
 *   hidden until the galaxy is discovered, so nodes read "Galaxy N".
 * ========================================================================= */

(function (global) {
  "use strict";
  const WG = (global.WG = global.WG || {});
  WG.Screens = WG.Screens || {};

  WG.Screens.GalaxyMap = {
    render(engine) {
      const root = document.createElement("div");
      root.className = "map";

      const nodes = engine.galaxies
        .map((g) => {
          const solved = engine.save.isSolved(g.id);
          const unlocked = engine.save.isUnlocked(g.id);
          const state = solved ? "solved" : unlocked ? "play" : "locked";
          const icon = solved ? "⭐" : unlocked ? "▶" : "🔒";
          // Discovered galaxies reveal their theme; others stay mysterious.
          const sub = solved
            ? g.theme
            : unlocked
            ? "Tap to explore"
            : "Locked";
          return `
            <button class="galaxy-node galaxy-node--${state}"
                    data-id="${g.id}" ${state === "locked" ? "disabled" : ""}>
              <span class="galaxy-node__orb">${icon}</span>
              <span class="galaxy-node__label">
                <span class="galaxy-node__name">Galaxy ${g.id}</span>
                <span class="galaxy-node__sub">${sub}</span>
              </span>
              <span class="galaxy-node__reward">+${g.reward}</span>
            </button>`;
        })
        .join('<div class="galaxy-link"></div>');

      root.innerHTML = `
        <header class="topbar">
          <button class="icon-btn" data-action="back" title="Back">←</button>
          <h2 class="topbar__title">Galaxy Map</h2>
          <div class="coin-pill">
            <span class="coin-pill__icon">★</span>
            <span class="coin-pill__value">${engine.getCoins()}</span>
          </div>
        </header>

        <div class="map__scroll">
          <div class="map__path">${nodes}</div>
        </div>
      `;

      root.querySelector('[data-action="back"]').addEventListener("click", () => {
        engine.sound.tick();
        engine.showMainMenu();
      });

      root.querySelectorAll(".galaxy-node").forEach((btn) => {
        if (btn.disabled) return;
        btn.addEventListener("click", () => {
          engine.sound.select();
          engine.playGalaxy(Number(btn.dataset.id));
        });
      });

      return root;
    }
  };
})(window);
