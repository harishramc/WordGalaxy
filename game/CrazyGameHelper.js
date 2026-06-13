(function(global) {

  global.gameplayStart = function() {
    try {
      global.CrazyGames?.SDK?.game?.gameplayStart();
    } catch (_) {}
  };

  global.gameplayStop = function() {
    try {
      global.CrazyGames?.SDK?.game?.gameplayStop();
    } catch (_) {}
  };

})(window);