(function(global) {
  'use strict';

  /* Utils */
  function fetchJSON(url) {
    return fetch(url)
      .then(function(response) {
        return response.json();
      });
  }

  function getQueries() {
    if(!location.search) return {};

    return location.search
      .replace('?', '')
      .split('&')
      .reduce(function(queries, current) {
        var splitted = current.split('=');
        queries[splitted[0]] = splitted[1];
        return queries;
      }, {});
  }

  /* Constants */
  // Local Fairphone Communities forum thread
  var FORUM_THREAD_URL = 'https://forum.fairphone.com/t/pencil2-local-fairphoners-address-book-fairphone-communities/3815/';

  var MARKERICONS = ["blue", "brown", "green", "grey", "orange", "pink", "red"]
    .reduce(function(markericons, color) {
      markericons[color] = L.icon({
          iconUrl: 'resources/FairphoneMarker_' + color + '.png',
          iconSize: [31.8, 50],
          iconAnchor: [15.9, 49],
        });
      return markericons;
    }, {});

  /* Variables (state) */
  var map;
  var overlaysData = {
    angels: {
      title: "Fairphone Angels",
      overlay: L.layerGroup(),
    },
    communities: {
      title: "Fairphoners Groups",
      overlay: L.layerGroup(),
    },
    meetups: {
      title: "Meetups & Events",
      overlay: L.layerGroup(),
    },
    shops: {
      title: "T-Mobile Shops",
      overlay: L.layerGroup(),
    },
  }

  /* Functions */
  function getAllOverlays(overlaysData) {
    return Object.keys(overlaysData)
      .reduce(function(overlays, currentOverlay){
        overlays[overlaysData[currentOverlay].title] = overlaysData[currentOverlay].overlay;
        return overlays;
      }, {});
  }

  function getInitialLayers(overlaysData, defaultOverlays, permanentLayers) {
    return Object.keys(overlaysData)
      .filter(function(currentOverlay) {
        if (!defaultOverlays) return true;

        return defaultOverlays.indexOf(currentOverlay) !== -1;
      })
      .reduce(function(layers, currentOverlay) {
        layers.push(overlaysData[currentOverlay].overlay);
        return layers;
      }, permanentLayers || []);
  }

  function initMap(defaultOverlays) {
    var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPLv3</a>',
      maxZoom: 18,
    });

    map = L.map('mapid', {
      center: [49.8158683, 6.1296751],
      zoom: 4,
      minZoom: 2,
      layers: getInitialLayers(overlaysData, defaultOverlays, [baseLayer]),
    });
  }

  function initControls() {
    L.control.layers(null, getAllOverlays(overlaysData), {
      collapsed: false,
    }).addTo(map);
  }

  function getDefaultOverlays() {
    var overlays = getQueries().show;
    if (!overlays) return null;

    return overlays.split(',');
  }

  /* Main */
  var defaultOverlays = getDefaultOverlays();
  initMap(defaultOverlays);
  initControls();

  // Populate Fairphoners Groups overlay
  fetchJSON('data/communities.json')
    .then(function(json) {
      // Add a marker per Local Fairphone Community
      json.list.forEach(function(group) {
        var marker = L.marker(group.lat_lng, { icon: MARKERICONS.blue, riseOnHover: true })
          .bindPopup(
            '<a href="' + FORUM_THREAD_URL + group.post_nr + '" target="_blank">' + group.location + '</a>',
            { offset: new L.Point(0, -25) }
          );
        marker.addTo(overlaysData.communities.overlay);
      });
    });

}(this));
