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

  var MARKERS = ["blue", "brown", "green", "grey", "orange", "pink", "red"]
    .reduce(function(markers, color) {
      markers[color] = L.icon({
          iconUrl: 'resources/FairphoneMarker_' + color + '.png',
          iconSize: [31.8, 50],
          iconAnchor: [15.9, 49],
        });
      return markers;
    }, {});

  /* Variables (state) */
  var map;
  var layersData = {
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
  function getMapOverlays(data, defaultOverlays) {
    return Object.keys(data)
      .reduce(function(overlays, currentLayer){
        overlays[data[currentLayer].title] = data[currentLayer].overlay;
        return overlays;
      }, defaultOverlays || {});
  }

  function getMapLayers(data, layersToShow, defaultLayers) {
    return Object.keys(data)
      .filter(function(currentLayer) {
        if (!layersToShow) return true;

        return layersToShow.indexOf(currentLayer) !== -1;
      })
      .reduce(function(layers, currentLayer) {
        layers.push(data[currentLayer].overlay);
        return layers;
      }, defaultLayers || []);
  }

  function initMap(layersToShow) {
    var baseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors, <a href="https://www.gnu.org/licenses/gpl-3.0.en.html">GNU GPLv3</a>',
      maxZoom: 18,
    });

    map = L.map('mapid', {
      center: [49.8158683, 6.1296751],
      zoom: 4,
      minZoom: 2,
      layers: getMapLayers(layersData, layersToShow, [baseLayer]),
    });
  }

  function initControls() {
    L.control.layers(null, getMapOverlays(layersData), {
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
        var marker = L.marker(group.lat_lng, { icon: MARKERS.blue, riseOnHover: true })
          .bindPopup(
            '<a href="' + FORUM_THREAD_URL + group.post_nr + '" target="_blank">' + group.location + '</a>',
            { offset: new L.Point(0, -25) }
          );
        marker.addTo(layersData.communities.overlay);
      });
    });

}(this));
