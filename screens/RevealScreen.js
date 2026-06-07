/* =========================================================================
 * RevealScreen
 * -------------------------------------------------------------------------
 * Shown after the final word of a galaxy is solved. This is the payoff:
 * the previously hidden theme is revealed, the words found are listed, coins
 * are tallied, and an interesting fact is shown. A rewarded-ad button lets
 * the player double the coin reward.
 * ========================================================================= */

(function (global) {
  "use strict";
  const WG = (global.WG = global.WG || {});
  WG.Screens = WG.Screens || {};

  WG.Screens.RevealScreen = {
    render(engine, params) {
      const galaxy = params.galaxy;
      let reward = params.reward || 0;
      let doubled = false;

      const root = document.createElement("div");
      root.className = "reveal";

      const wordsFound = galaxy.puzzles
        .map((p) => `<li class="reveal__word">✓ <span>${p.word}</span></li>`)
        .join("");

      root.innerHTML = `
        <div class="reveal__burst"></div>
        <div class="reveal__card">
          <div class="reveal__eyebrow">Galaxy Discovered</div>
          <h1 class="reveal__theme">${galaxy.theme}</h1>

          <ul class="reveal__words">${wordsFound}</ul>

          <div class="reveal__reward ${reward ? "" : "reveal__reward--none"}">
            <span class="reveal__coin">★</span>
            <span data-reward>${reward ? "+" + reward : "Already claimed"}</span>
          </div>

          <div class="reveal__fact">
            <span class="reveal__fact-label">Did you know?</span>
            <p>${galaxy.fact}</p>
          </div>

          <div class="reveal__actions">
            ${
              reward
                ? `<button class="btn btn--double" data-action="double">
                     <span class="btn__icon">▶</span> Watch Ad · Double to ${reward * 2}
                   </button>`
                : ""
            }
            <button class="btn btn--primary" data-action="continue">Continue</button>
          </div>
        </div>
      `;

      const rewardEl = root.querySelector("[data-reward]");
      const doubleBtn = root.querySelector('[data-action="double"]');

      if (doubleBtn) {
        doubleBtn.addEventListener("click", () => {
          if (doubled) return;
          engine.watchAdToDouble(galaxy, reward, (didDouble) => {
            if (didDouble) {
              doubled = true;
              const newTotal = reward * 2;
              rewardEl.textContent = "+" + newTotal;
              rewardEl.classList.add("reveal__pop");
              doubleBtn.disabled = true;
              doubleBtn.textContent = "Reward doubled!";
              doubleBtn.classList.add("btn--claimed");
            }
          });
        });
      }

      root.querySelector('[data-action="continue"]').addEventListener("click", () => {
        engine.sound.select();
        // Daily sessions return to the menu; campaign sessions go to the map.
        if (engine.isDaily) engine.showMainMenu();
        else engine.showGalaxyMap();
      });

      // little entrance pop on the reward
      requestAnimationFrame(() => {
        engine.sound.reveal();
        rewardEl.classList.add("reveal__pop");
      });

      return root;
    }
  };
})(window);
