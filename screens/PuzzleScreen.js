/* =========================================================================
 * PuzzleScreen
 * -------------------------------------------------------------------------
 * The core loop. The player connects letters on a circular "constellation"
 * wheel to spell the current word. Three words per galaxy (Easy / V1).
 *
 *   - Drag across tiles to build the word; a glowing line links them.
 *   - Release on the correct word to solve it.
 *   - Hint reveals letters left-to-right (100 coins, or a rewarded ad when
 *     broke). A hint that completes the word auto-solves it.
 *   - Shuffle rearranges the tiles for free.
 *
 * Validation always compares the connected sequence to the target word —
 * shuffling and tile positions never affect it.
 * ========================================================================= */

(function (global) {
  "use strict";
  const WG = (global.WG = global.WG || {});
  WG.Screens = WG.Screens || {};

  WG.Screens.PuzzleScreen = {
    render(engine, params) {
      gameplayStart();
      const galaxy = engine.currentGalaxy;
      const puzzle = engine.getCurrentPuzzle();
      const word = puzzle.word;

      // mutable per-screen state ----------------------------------------
      let letters = WG.ShuffleSystem.shuffle(puzzle.letters); // tile chars
      let selection = []; // indexes into `letters`
      let active = false;
      let solvedLock = false; // ignore input while resolving

      // ---- DOM ---------------------------------------------------------
      const root = document.createElement("div");
      root.className = "puzzle";

      const total = galaxy.puzzles.length;
      const dots = galaxy.puzzles
        .map((_, i) => {
          const done = engine.sessionSolved.indexOf(i) !== -1;
          const cur = i === engine.currentPuzzleIndex;
          return `<span class="pdot ${done ? "pdot--done" : ""} ${cur ? "pdot--cur" : ""}"></span>`;
        })
        .join("");

      const solvedList = engine.sessionSolved
        .map((i) => `<span class="solved-chip">✓ ${galaxy.puzzles[i].word}</span>`)
        .join("");

      root.innerHTML = `
        <header class="topbar">
          <button class="icon-btn" data-action="back" title="Back">←</button>
          <div class="topbar__center">
            <div class="topbar__title">Galaxy ${galaxy.id}${engine.isDaily ? " · Daily" : ""}</div>
            <div class="pdots">${dots}</div>
          </div>
          <div class="coin-pill">
            <span class="coin-pill__icon">★</span>
            <span class="coin-pill__value" data-coins>${engine.getCoins()}</span>
          </div>
        </header>

        <div class="puzzle__solved">${solvedList}</div>

        <div class="slots" data-slots></div>

        <div class="preview" data-preview></div>

        <div class="wheel-wrap">
          <div class="wheel" data-wheel>
            <svg class="wheel__svg" data-svg xmlns="http://www.w3.org/2000/svg"></svg>
          </div>
        </div>

        <div class="controls">
          <button class="ctrl ctrl--shuffle" data-action="shuffle">
            <span class="ctrl__icon">⤮</span><span>Shuffle</span>
            <span class="ctrl__tag">Free</span>
          </button>
          <button class="ctrl ctrl--hint" data-action="hint">
            <span class="ctrl__icon">💡</span><span>Hint</span>
            <span class="ctrl__tag" data-hint-tag></span>
          </button>
        </div>
      `;

      const slotsEl = root.querySelector("[data-slots]");
      const previewEl = root.querySelector("[data-preview]");
      const wheelEl = root.querySelector("[data-wheel]");
      const svgEl = root.querySelector("[data-svg]");
      const coinsEl = root.querySelector("[data-coins]");
      const hintTagEl = root.querySelector("[data-hint-tag]");
      const hintBtn = root.querySelector('[data-action="hint"]');

      // tile elements + fractional positions kept in sync with `letters`
      let tileEls = [];
      let tilePos = []; // {fx,fy} fractions of wheel box

      /* ---- build answer slots ---------------------------------------- */
      function renderSlots() {
        slotsEl.innerHTML = "";
        for (let i = 0; i < word.length; i++) {
          const box = document.createElement("div");
          box.className = "slot";
          let ch = "";
          if (i < selection.length) {
            ch = letters[selection[i]];
            box.classList.add("slot--preview");
          } else if (engine.revealedCount > i) {
            ch = word[i];
            box.classList.add("slot--hint");
          }
          box.textContent = ch;
          slotsEl.appendChild(box);
        }
      }

      /* ---- build the letter wheel ------------------------------------ */
      function buildWheel() {
        // remove old tiles (keep the svg)
        tileEls.forEach((t) => t.remove());
        tileEls = [];
        tilePos = [];

        const n = letters.length;
        const radius = n <= 3 ? 0.3 : 0.36; // fraction of box
        const startAngle = -Math.PI / 2; // first tile at top

        for (let i = 0; i < n; i++) {
          const ang = startAngle + (i * 2 * Math.PI) / n;
          const fx = 0.5 + radius * Math.cos(ang);
          const fy = 0.5 + radius * Math.sin(ang);
          tilePos.push({ fx, fy });

          const tile = document.createElement("div");
          tile.className = "tile";
          tile.textContent = letters[i];
          tile.style.left = fx * 100 + "%";
          tile.style.top = fy * 100 + "%";
          tile.dataset.index = String(i);
          wheelEl.appendChild(tile);
          tileEls.push(tile);
        }
        syncSvgSize();
      }

      function syncSvgSize() {
        const r = wheelEl.getBoundingClientRect();
        svgEl.setAttribute("width", r.width);
        svgEl.setAttribute("height", r.height);
        svgEl.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
      }

      function tileCenterPx(i) {
        const r = wheelEl.getBoundingClientRect();
        return {
          x: tilePos[i].fx * r.width,
          y: tilePos[i].fy * r.height
        };
      }

      /* ---- selection line -------------------------------------------- */
      function drawLine(pointer) {
        // pointer is {x,y} in wheel-local px, or null
        let d = "";
        const pts = selection.map((i) => tileCenterPx(i));
        if (pts.length) {
          d = pts.map((p) => `${p.x},${p.y}`).join(" ");
        }
        let svgInner = "";
        if (pts.length >= 1) {
          // glow polyline through selected centers
          if (pts.length >= 2) {
            svgInner += `<polyline points="${d}" class="trace-line" />`;
          }
          // live segment to the finger
          if (pointer) {
            const last = pts[pts.length - 1];
            svgInner += `<line x1="${last.x}" y1="${last.y}" x2="${pointer.x}" y2="${pointer.y}" class="trace-line trace-line--live" />`;
          }
          // node dots
          pts.forEach((p) => {
            svgInner += `<circle cx="${p.x}" cy="${p.y}" r="6" class="trace-node" />`;
          });
        }
        svgEl.innerHTML = svgInner;
      }

      function updateTileStates() {
        tileEls.forEach((t, i) => {
          t.classList.toggle("tile--on", selection.indexOf(i) !== -1);
        });
      }

      function updatePreview() {
        const str = selection.map((i) => letters[i]).join("");
        previewEl.textContent = str;
        previewEl.classList.toggle("preview--show", str.length > 0);
      }

      function refreshSelectionUI(pointer) {
        updateTileStates();
        renderSlots();
        updatePreview();
        drawLine(pointer);
      }

      /* ---- pointer interaction --------------------------------------- */
      function localPoint(e) {
        const r = wheelEl.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
      }

      function hitTest(e) {
        const r = wheelEl.getBoundingClientRect();
        const px = e.clientX - r.left;
        const py = e.clientY - r.top;
        const hit = tileEls.length ? tileEls[0].offsetWidth * 0.62 : 24;
        let best = -1;
        let bestD = hit;
        for (let i = 0; i < tilePos.length; i++) {
          const c = { x: tilePos[i].fx * r.width, y: tilePos[i].fy * r.height };
          const dist = Math.hypot(px - c.x, py - c.y);
          if (dist < bestD) {
            bestD = dist;
            best = i;
          }
        }
        return best;
      }

      // function addIndex(i) {
      //   if (i < 0) return;
      //   const at = selection.indexOf(i);
      //   if (at === -1) {
      //     selection.push(i);
      //     engine.sound.select();
      //   } else if (at === selection.length - 2) {
      //     // backtrack: dragging onto the previous tile erases the last
      //     selection.pop();
      //     engine.sound.tick();
      //   } else {
      //     return;
      //   }
      //   refreshSelectionUI();
      // }

      function addIndex(i) {
        if (i < 0) return;

        const at = selection.indexOf(i);

        if (at === -1) {

          selection.push(i);

          engine.sound.swipeStep(
            selection.length - 1
          );

        } else if (at === selection.length - 2) {

          selection.pop();

          engine.sound.tick();

        } else {
          return;
        }

        refreshSelectionUI();
      }

      function onDown(e) {
        if (solvedLock) return;
        const i = hitTest(e);
        if (i < 0) return;
        active = true;
        selection = [];
        try { wheelEl.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
        addIndex(i);
        refreshSelectionUI(localPoint(e));
      }

      function onMove(e) {
        if (!active) return;
        e.preventDefault();
        const i = hitTest(e);
        if (i >= 0) addIndex(i);
        refreshSelectionUI(localPoint(e));
      }

      function onUp(e) {
        if (!active) return;
        active = false;
        try { wheelEl.releasePointerCapture(e.pointerId); } catch (_) {}
        evaluate();
      }

      function evaluate() {
        const attempt = selection.map((i) => letters[i]).join("");
        if (attempt === word) {
          solveSuccess();
        } else {
          if (attempt.length) failAttempt();
          selection = [];
          refreshSelectionUI(null);
        }
      }

      function solveSuccess() {
        solvedLock = true;
        // fill + flash slots green
        renderSlots();
        slotsEl.querySelectorAll(".slot").forEach((s) => {
          s.classList.remove("slot--preview");
          s.classList.add("slot--correct");
        });
        previewEl.classList.remove("preview--show");
        drawLine(null);
        setTimeout(() => engine.onWordSolved(), 520);
        gameplayStop();
      }

      function failAttempt() {
        engine.sound.wrong();
        slotsEl.querySelectorAll(".slot").forEach((s) => {
          s.classList.add("slot--wrong");
        });
        previewEl.classList.add("preview--wrong");
        setTimeout(() => {
          previewEl.classList.remove("preview--wrong");
        }, 320);
      }

      wheelEl.addEventListener("pointerdown", onDown);
      wheelEl.addEventListener("pointermove", onMove);
      wheelEl.addEventListener("pointerup", onUp);
      wheelEl.addEventListener("pointercancel", onUp);

      /* ---- hint button ----------------------------------------------- */
      function refreshHintTag() {
        const canReveal = WG.HintSystem.canReveal(word, engine.revealedCount);
        if (!canReveal) {
          hintTagEl.textContent = "—";
          hintBtn.disabled = true;
          hintBtn.classList.add("ctrl--disabled");
          return;
        }
        hintBtn.disabled = false;
        hintBtn.classList.remove("ctrl--disabled");
        if (engine.getCoins() >= WG.HintSystem.COST) {
          hintTagEl.innerHTML = `★${WG.HintSystem.COST}`;
        } else {
          hintTagEl.innerHTML = `▶ Ad`;
        }
      }

      function afterHint(res) {
        coinsEl.textContent = engine.getCoins();
        renderSlots();
        refreshHintTag();
        if (res && res.fullyRevealed) {
          // last letter revealed -> auto solve. Map the answer onto tile
          // indexes so the winning constellation line draws correctly.
          selection = findTileFor();
          solveSuccess();
        }
      }

      // map answer letters onto distinct tile indexes (for the final line)
      function findTileFor() {
        // simpler: just use order of tiles that spell the word; since letters
        // is an anagram, greedily match.
        const used = [];
        const result = [];
        for (let p = 0; p < word.length; p++) {
          for (let t = 0; t < letters.length; t++) {
            if (used.indexOf(t) === -1 && letters[t] === word[p]) {
              used.push(t);
              result.push(t);
              break;
            }
          }
        }
        return result;
      }

      hintBtn.addEventListener("click", () => {
        if (solvedLock) return;
        const res = engine.buyHint();
        if (res.ok) {
          // need full mapping when fully revealed
          if (res.fullyRevealed) {
            selection = findTileFor();
          }
          afterHint(res);
        } else if (res.needAd) {
          if (global.confirm("Out of coins. Watch a short ad to reveal a letter?")) {
            engine.watchAdForHint((adRes) => {
              if (adRes && adRes.ok) {
                if (adRes.fullyRevealed) selection = findTileFor();
                afterHint(adRes);
              }
            });
          }
        } else if (res.exhausted) {
          refreshHintTag();
        }
      });

      /* ---- shuffle button -------------------------------------------- */
      root.querySelector('[data-action="shuffle"]').addEventListener("click", () => {
        if (solvedLock) return;
        letters = engine.shuffle(letters);
        selection = [];
        buildWheel();
        refreshSelectionUI(null);
      });

      /* ---- back button ----------------------------------------------- */
      root.querySelector('[data-action="back"]').addEventListener("click", () => {
        gameplayStop();
        engine.sound.tick();
        engine.showGalaxyMap();
      });

      /* ---- resize handling ------------------------------------------- */
      const onResize = () => {
        // self-clean once this screen is no longer in the document
        if (!document.body.contains(wheelEl)) {
          global.removeEventListener("resize", onResize);
          return;
        }
        syncSvgSize();
        drawLine(null);
      };
      global.addEventListener("resize", onResize);

      /* ---- first paint (after layout settles) ------------------------ */
      requestAnimationFrame(() => {
        buildWheel();
        refreshSelectionUI(null);
        refreshHintTag();
      });

      return root;
    }
  };
})(window);
