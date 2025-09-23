(function(){
  try {
    // Provide a harmless global in case the app references it
    window.DisableDevtool = window.DisableDevtool || {};
    window.DisableDevtool.start = function(){};
    window.DisableDevtool.stop = function(){};
  } catch (e) {}
})();
