/* global WF */
(function () {
  var GEOJSON_URL = 'data/wfigs-ytd-snapshot.geojson';
  var resizeTimer = null;

  function showMapError(message) {
    var section = document.getElementById('wfigs-map-section');
    var el = document.getElementById('map-wfigs-ytd');
    if (section) section.hidden = false;
    if (!el) return;
    el.classList.add('is-ready');
    var top = document.querySelector('.home-top');
    if (top) top.classList.add('is-ready');
    el.innerHTML =
      '<div class="wfigs-fallback">' +
      '<p>' + message + '</p>' +
      '<p><a href="explore.html">Enter the briefing</a> for charts that do not need this map.</p></div>';
  }

  function onResize() {
    if (typeof WF === 'undefined' || typeof WF.invalidateWfigsMap !== 'function') return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(WF.invalidateWfigsMap, 120);
  }

  function boot() {
    if (window.location.protocol === 'file:') {
      showMapError('Maps need a local server. Run python3 -m http.server 8000 and open http://localhost:8000/');
      return;
    }
    if (typeof WF === 'undefined' || typeof WF.renderWfigsMap !== 'function') {
      showMapError('Map script did not load.');
      return;
    }
    fetch(GEOJSON_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (geojson) {
        WF.renderWfigsMap(geojson);
      })
      .catch(function () {
        showMapError('Could not load the year-to-date perimeter snapshot.');
      });

    window.addEventListener('resize', onResize);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
