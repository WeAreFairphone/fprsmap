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

  function applyTemplate(templateId, view) {
    var template = document.getElementById(templateId).innerHTML;
    return Mustache.render(template, view);
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
  var cluster = L.markerClusterGroup();
  var overlaysData = {
    angels: {
      title: "Fairphone Angels",
      overlay: L.featureGroup.subGroup(cluster),
    },
    communities: {
      title: "Fairphoners Groups",
      overlay: L.featureGroup.subGroup(cluster),
    },
    meetups: {
      title: "Meetups & Events",
      overlay: L.featureGroup.subGroup(cluster),
    },
    shops: {
      title: "T-Mobile Shops",
      overlay: L.featureGroup.subGroup(cluster),
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

    var fairphoneHqLocation = [52.3771591, 4.9206593];

    var fairphoneHqMarker = L.marker(
        fairphoneHqLocation,
        { icon: MARKERICONS.red, riseOnHover: true }
      )
      .bindPopup(
        applyTemplate('popup-content-template', {
          title: 'Fairphone Headquarters',
          address: 'Jollemanhof 17\n1019 GW Amsterdam\nThe Netherlands'.replace(/\n/g, '<br>'),
          website: 'https://fairphone.com/',
          phone: {
            readable: '+31 (0)20-788 4400',
            plain: '+31207884400',
            supportHours: 'Mon-Fri 9:30-17:30',
          },
        }),
        { offset: new L.Point(0, -25) }
      );

    var permanentLayers = [baseLayer, fairphoneHqMarker, cluster];

    map = L.map('mapid', {
      center: fairphoneHqLocation,
      zoom: 4,
      minZoom: 2,
      layers: getInitialLayers(overlaysData, defaultOverlays, permanentLayers),
    });

    fairphoneHqMarker.openPopup();
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
