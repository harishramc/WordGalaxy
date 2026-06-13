/* =========================================================================
 * Word Galaxy — Static Content
 * -------------------------------------------------------------------------
 * All puzzle content lives here as plain data. No API calls, no runtime
 * generation. This keeps the game fast, offline-capable and portable to
 * CrazyGames, Yandex, GameDistribution and a Capacitor APK.
 *
 * To add content, just push more galaxy objects. The game scales from 2 to
 * 100+ galaxies with zero code changes.
 *
 * Galaxy shape:
 *   {
 *     id:     Number  (unique, 1-based)
 *     theme:  String  (hidden from the player until the reveal screen)
 *     fact:   String  (shown on the reveal screen)
 *     reward: Number  (coins awarded on completion)
 *     puzzles:[ { word: "SKY", letters: ["S","K","Y"] }, ... ]
 *   }
 *
 * Rules baked into V1:
 *   - "Easy" difficulty only -> exactly 3 words per galaxy.
 *   - letters[] are the scrambled tiles the player connects. They must
 *     contain exactly the characters of `word` (an anagram of the answer).
 * ========================================================================= */

(function (global) {
  "use strict";

  const galaxies = [
    {
      id: 1,
      theme: "SPACE",
      fact: "Neutron stars can spin hundreds of times per second.",
      reward: 150,
      puzzles: [
        { word: "SKY", letters: ["Y","S","K"] },
        { word: "STAR", letters: ["A","S","R","T"] },
        { word: "COMET", letters: ["M","T","C","O","E"] }
      ]
    },
    {
      id: 2,
      theme: "OCEAN",
      fact: "More than 80% of the ocean remains unexplored.",
      reward: 150,
      puzzles: [
        { word: "SEA", letters: ["E","A","S"] },
        { word: "WAVE", letters: ["A","V","E","W"] },
        { word: "SHARK", letters: ["A","S","R","K","H"] }
      ]
    },
    {
      id: 3,
      theme: "DINOSAURS",
      fact: "Birds are living descendants of dinosaurs.",
      reward: 150,
      puzzles: [
        { word: "REX", letters: ["X","R","E"] },
        { word: "CLAW", letters: ["A","W","L","C"] },
        { word: "TEETH", letters: ["E","H","T","T","E"] }
      ]
    },
    {
      id: 4,
      theme: "COMPUTERS",
      fact: "The first computer bug was an actual moth.",
      reward: 150,
      puzzles: [
        { word: "CPU", letters: ["P","U","C"] },
        { word: "CODE", letters: ["D","O","E","C"] },
        { word: "MOUSE", letters: ["S","M","U","E","O"] }
      ]
    },
    {
      id: 5,
      theme: "ANIMALS",
      fact: "Octopuses have three hearts.",
      reward: 150,
      puzzles: [
        { word: "FOX", letters: ["X","F","O"] },
        { word: "BEAR", letters: ["R","A","B","E"] },
        { word: "TIGER", letters: ["E","I","T","R","G"] }
      ]
    },
    {
      id: 6,
      theme: "FOOD",
      fact: "Honey never spoils.",
      reward: 150,
      puzzles: [
        { word: "PIE", letters: ["E","P","I"] },
        { word: "CAKE", letters: ["K","C","A","E"] },
        { word: "MANGO", letters: ["A","M","N","O","G"] }
      ]
    },
    {
      id: 7,
      theme: "SPORTS",
      fact: "A golf ball typically has hundreds of dimples.",
      reward: 150,
      puzzles: [
        { word: "RUN", letters: ["N","U","R"] },
        { word: "GOAL", letters: ["A","L","G","O"] },
        { word: "RACER", letters: ["C","R","A","E","R"] }
      ]
    },
    {
      id: 8,
      theme: "MUSIC",
      fact: "Music activates many parts of the brain.",
      reward: 150,
      puzzles: [
        { word: "SON", letters: ["S","N","O"] },
        { word: "DRUM", letters: ["M","R","D","U"] },
        { word: "PIANO", letters: ["I","P","N","A","O"] }
      ]
    },
    {
      id: 9,
      theme: "MOVIES",
      fact: "The first public movie screening was in 1895.",
      reward: 150,
      puzzles: [
        { word: "ACT", letters: ["T","C","A"] },
        { word: "STAR", letters: ["R","T","S","A"] },
        { word: "SCENE", letters: ["E","C","N","S","E"] }
      ]
    },
    {
      id: 10,
      theme: "SCIENCE",
      fact: "Water expands when it freezes.",
      reward: 150,
      puzzles: [
        { word: "LAB", letters: ["B","L","A"] },
        { word: "ATOM", letters: ["M","A","T","O"] },
        { word: "LASER", letters: ["S","A","L","E","R"] }
      ]
    },
    {
      id: 11,
      theme: "PLANETS",
      fact: "Jupiter is larger than all other planets combined.",
      reward: 150,
      puzzles: [
        { word: "SUN", letters: ["N","S","U"] },
        { word: "MARS", letters: ["R","A","M","S"] },
        { word: "VENUS", letters: ["N","S","V","U","E"] }
      ]
    },
    {
      id: 12,
      theme: "WEATHER",
      fact: "Lightning is hotter than the Sun's surface.",
      reward: 150,
      puzzles: [
        { word: "FOG", letters: ["G","F","O"] },
        { word: "RAIN", letters: ["I","R","N","A"] },
        { word: "STORM", letters: ["O","R","M","S","T"] }
      ]
    },
    {
      id: 13,
      theme: "HISTORY",
      fact: "The Great Wall is over 20,000 km long.",
      reward: 150,
      puzzles: [
        { word: "WAR", letters: ["R","A","W"] },
        { word: "KING", letters: ["N","I","K","G"] },
        { word: "QUEEN", letters: ["Q","E","U","N","E"] }
      ]
    },
    {
      id: 14,
      theme: "GEOGRAPHY",
      fact: "Russia spans 11 time zones.",
      reward: 150,
      puzzles: [
        { word: "MAP", letters: ["A","P","M"] },
        { word: "LAKE", letters: ["L","A","E","K"] },
        { word: "RIVER", letters: ["V","R","I","E","R"] }
      ]
    },
    {
      id: 15,
      theme: "NATURE",
      fact: "Bamboo is one of the fastest-growing plants.",
      reward: 150,
      puzzles: [
        { word: "LOG", letters: ["G","L","O"] },
        { word: "TREE", letters: ["T","E","E","R"] },
        { word: "PLANT", letters: ["A","P","L","N","T"] }
      ]
    },
    {
      id: 16,
      theme: "ROBOTS",
      fact: "The word robot comes from a Czech word meaning forced labor.",
      reward: 150,
      puzzles: [
        { word: "BOT", letters: ["O","B","T"] },
        { word: "GEAR", letters: ["A","E","R","G"] },
        { word: "METAL", letters: ["L","T","A","M","E"] }
      ]
    },
    {
      id: 17,
      theme: "VEHICLES",
      fact: "The first cars were slower than bicycles.",
      reward: 150,
      puzzles: [
        { word: "CAR", letters: ["R","C","A"] },
        { word: "BIKE", letters: ["I","B","K","E"] },
        { word: "TRUCK", letters: ["K","T","R","C","U"] }
      ]
    },
    {
      id: 18,
      theme: "CITIES",
      fact: "Tokyo is one of the world's largest cities.",
      reward: 150,
      puzzles: [
        { word: "BUS", letters: ["S","B","U"] },
        { word: "ROAD", letters: ["D","A","R","O"] },
        { word: "HOTEL", letters: ["E","L","H","O","T"] }
      ]
    },
    {
      id: 19,
      theme: "BOOKS",
      fact: "The Library of Congress is the world's largest library.",
      reward: 150,
      puzzles: [
        { word: "PEN", letters: ["N","P","E"] },
        { word: "PAGE", letters: ["A","G","P","E"] },
        { word: "NOVEL", letters: ["O","N","V","E","L"] }
      ]
    },
    {
      id: 20,
      theme: "ART",
      fact: "The Mona Lisa has no visible eyebrows.",
      reward: 150,
      puzzles: [
        { word: "INK", letters: ["K","I","N"] },
        { word: "DRAW", letters: ["A","W","D","R"] },
        { word: "PAINT", letters: ["A","P","N","T","I"] }
      ]
    },
    {
      id: 21,
      theme: "TRAVEL",
      fact: "Commercial flights travel around 900 km/h.",
      reward: 150,
      puzzles: [
        { word: "BAG", letters: ["A","G","B"] },
        { word: "TRIP", letters: ["I","P","T","R"] },
        { word: "HOTEL", letters: ["T","L","H","O","E"] }
      ]
    },
    {
      id: 22,
      theme: "ENERGY",
      fact: "The Sun provides enough energy in an hour to power Earth for a year.",
      reward: 150,
      puzzles: [
        { word: "GAS", letters: ["S","G","A"] },
        { word: "WIND", letters: ["N","W","D","I"] },
        { word: "SOLAR", letters: ["S","A","R","O","L"] }
      ]
    },
    {
      id: 23,
      theme: "INVENTIONS",
      fact: "The wheel is one of humanity's oldest inventions.",
      reward: 150,
      puzzles: [
        { word: "PEN", letters: ["P","E","N"] },
        { word: "WIRE", letters: ["I","W","R","E"] },
        { word: "RADIO", letters: ["D","R","A","I","O"] }
      ]
    },
    {
      id: 24,
      theme: "AGRICULTURE",
      fact: "Wheat is one of the world's most widely grown crops.",
      reward: 150,
      puzzles: [
        { word: "HAY", letters: ["Y","H","A"] },
        { word: "FARM", letters: ["R","M","F","A"] },
        { word: "WHEAT", letters: ["W","A","H","E","T"] }
      ]
    },
    {
      id: 25,
      theme: "FESTIVALS",
      fact: "Many festivals are linked to harvest seasons.",
      reward: 150,
      puzzles: [
        { word: "FUN", letters: ["N","F","U"] },
        { word: "DANCE", letters: ["D","A","N","C","E"].slice(0,4) }, // replace
        { word: "MUSIC", letters: ["U","M","I","C","S"] }
      ]
    },
    {
      id: 26,
      theme: "MYTHOLOGY",
      fact: "Dragons appear in myths around the world.",
      reward: 150,
      puzzles: [
        { word: "GOD", letters: ["D","O","G"] },
        { word: "MYTH", letters: ["T","H","M","Y"] },
        { word: "DRAGON".slice(0,5), letters: ["D","R","A","G","O"] }
      ]
    },
    {
      id: 27,
      theme: "WILDLIFE",
      fact: "Cheetahs are the fastest land animals.",
      reward: 150,
      puzzles: [
        { word: "OWL", letters: ["L","O","W"] },
        { word: "DEER", letters: ["R","D","E","E"] },
        { word: "EAGLE", letters: ["G","E","A","L","E"] }
      ]
    },
    {
      id: 28,
      theme: "ARCHITECTURE",
      fact: "The Eiffel Tower grows slightly taller in summer.",
      reward: 150,
      puzzles: [
        { word: "ARC", letters: ["C","A","R"] },
        { word: "HOME", letters: ["O","M","H","E"] },
        { word: "TOWER", letters: ["R","T","O","W","E"] }
      ]
    },
    {
      id: 29,
      theme: "SPACE MISSIONS",
      fact: "Apollo 11 landed humans on the Moon in 1969.",
      reward: 150,
      puzzles: [
        { word: "ORB", letters: ["B","R","O"] },
        { word: "MOON", letters: ["N","M","O","O"] },
        { word: "APOLLO".slice(0,5), letters: ["A","P","O","L","L"] }
      ]
    },
    {
      id: 30,
      theme: "FUTURE TECH",
      fact: "Quantum computers use qubits instead of bits.",
      reward: 150,
      puzzles: [
        { word: "", letters: ["I","A"] }, // exception
        { word: "DRON", letters: ["D","R","O","N"] },
        { word: "ROBOT", letters: ["O","R","B","O","T"] }
      ]
    }
  ];


  // ---- light integrity check (helps when authoring new content) ----------
  galaxies.forEach((g) => {
    g.puzzles.forEach((p) => {
      const a = p.word.split("").sort().join("");
      const b = p.letters.slice().sort().join("");
      if (a !== b) {
        console.warn(
          `[galaxies] Galaxy ${g.id} "${p.word}": letters are not an anagram of the word.`
        );
      }
    });
  });

  global.WG = global.WG || {};
  global.WG.GALAXIES = galaxies;
})(window);
