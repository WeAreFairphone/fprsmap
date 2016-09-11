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

  var CUSTOM_MARKER = L.icon({
    iconUrl: 'resources/FairphoneMarker_blue.png',
    iconSize: [31.8, 50],
    iconAnchor: [15.9, 49],
  });

  /* Variables (state) */
  var map;
  var groups = {
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
  function getMapOverlays(groups, defaultOverlays) {
    return Object.keys(groups)
      .reduce(function(overlays, currentGroup){
        overlays[groups[currentGroup].title] = groups[currentGroup].overlay;
        return overlays;
      }, defaultOverlays || {});
  }

  function getMapLayers(groups, layersToShow, defaultLayers) {
    return Object.keys(groups)
      .filter(function(group) {
        if (!layersToShow) return true;

        return layersToShow.indexOf(group) !== -1;
      })
      .reduce(function(layers, currentGroup) {
        layers.push(groups[currentGroup].overlay);
        return layers;
      }, defaultLayers || []);
  }

  function initMap(layers) {
    var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPLv3</a>',
      maxZoom: 18,
    });

    map = L.map('mapid', {
      center: [49.8158683, 6.1296751],
      zoom: 4,
      layers: getMapLayers(groups, layers, [baseLayer]),
    });
  }

  function initControls() {
    L.control.layers(null, getMapOverlays(groups), {
      collapsed: false,
    }).addTo(map);
  }

  function getDefaultLayers() {
    var layers = getQueries().show;
    if (!layers) return null;

    return layers.split(',');
  }

  /* Main */
  var defaultLayers = getDefaultLayers();
  initMap(defaultLayers);
  initControls();

  // Populate Fairphoners Groups overlay
  fetchJSON('data/communities.json')
    .then(function(json) {
      // Add a marker per Local Fairphone Community
      json.list.forEach(function(group) {
        var marker = L.marker(group.lat_lng, { icon: CUSTOM_MARKER, riseOnHover: true })
          .bindPopup(
            '<a href="' + FORUM_THREAD_URL + group.post_nr + '" target="_blank">' + group.location + '</a>',
            { offset: new L.Point(0, -25) }
          );
        marker.addTo(groups.communities.overlay);
      });
    });

}(this));
