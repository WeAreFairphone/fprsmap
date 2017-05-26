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
  var layerControls;
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
    repairshops: {
      title: "Repair Shops",
      overlay: L.featureGroup.subGroup(cluster),
    },
    shops: {
      title: "Shops & Showrooms",
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

  function isEmbedded() {
    if (window.self !== window.top) return true;

    return false;
  }

  function isValidOverlayQueries(overlaysData,defaultOverlays){
    return defaultOverlays.reduce(function(validQuery,currentQuery){
      return validQuery || Object.keys(overlaysData).includes(currentQuery);
    }, false);
  }

  function getInitialLayers(overlaysData, defaultOverlays, permanentLayers) {
    return Object.keys(overlaysData)
      .filter(function(currentOverlay) {
        if (!defaultOverlays || !isValidOverlayQueries(overlaysData,defaultOverlays)) return true;

        return defaultOverlays.indexOf(currentOverlay) !== -1;
      })
      .reduce(function(layers, currentOverlay) {
        layers.push(overlaysData[currentOverlay].overlay);
        return layers;
      }, permanentLayers || []);
  }

  function initMap(defaultOverlays) {
    var baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a> | &copy; <a href="https://github.com/WeAreFairphone/fprsmap" target="_blank">WeAreFairphone</a> (<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GPLv3</a>)',
      maxZoom: 18,
    });

    map = L.map('mapid', {
      center: [49.8158683, 6.1296751],
      zoom: 2,
      minZoom: 2,
      layers: getInitialLayers(overlaysData, defaultOverlays, [baseLayer, cluster]),
      worldCopyJump: true,
    });

    if (isEmbedded()) {
      map.scrollWheelZoom.disable();
      map.attributionControl.setPrefix('<a href="https://wearefairphone.github.io/fprsmap/" target="_blank">See bigger map</a> | Leaflet');
    } else {
      map.addControl(new L.Control.Fullscreen());
    }
  }

  function initControls() {
    layerControls = L.control.layers(null, getAllOverlays(overlaysData), {
      collapsed: false,
    });
    layerControls.addTo(map);
  }

  function getDefaultOverlays() {
    var overlays = getQueries().show; //all queries after "show="
    if (!overlays) return null;

    return overlays.split(',');
  }

  function onMovestart(e) {
    if(!layerControls.collapsed) {
      layerControls.collapse();
    }
  }

  function onMousedown(e) {
    if(!map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.enable();
    }
  }

  function onMouseout(e) {
    if(map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.disable();
    }
  }

  /* Main */
  var defaultOverlays = getDefaultOverlays();
  initMap(defaultOverlays);
  initControls();

  // Add listeners
  map.on('movestart', onMovestart);
  if (isEmbedded()) {
    map.on('mousedown', onMousedown);
    map.on('mouseout', onMouseout);
  }

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

  // Populate Repairshops overlay
  fetchJSON('data/repairshops.json')
    .then(function(json) {
      // Add a marker per repairshop
      json.list.forEach(function(repairshop) {
        var marker = L.marker(repairshop.lat_lng, { icon: MARKERICONS.green, riseOnHover: true })
          .bindPopup(
            '<a href="' + repairshop.website + '" target="_blank">' + repairshop.name + '</a><br><div class="shopinfo">' +
              repairshop.address + '<br>' +
              repairshop.zipcode + ' ' + repairshop.city + '</div>',
            { offset: new L.Point(0, -25) }
          );
        marker.addTo(overlaysData.repairshops.overlay);
      });
    });

  //Populate Fairphone shops
  fetchJSON('data/shops.json')
    .then(function(json) {
      json.shopslist.forEach(function(shop) {
        if(shop.location) {
          var popup = '<a href="' + shop.site + '" target="_blank">' + shop["Name Retailer/Venue/Museum"] + '</a><br><div class="shopinfo">' +
            shop["Address"] + '<br>' +
            shop["Zipcode"] + ' ' + shop["City"] + '</div>';
          if(shop["Opening hours"]) {
            var openingHoursList = shop["Opening hours"].replace(/([0-9])( |\n)([a-z])/gi, '$1</li><li>$3').replace(/ - /gi,'-');
            popup = popup + '<div class="shopinfo">Opening hours:<br><li>' + openingHoursList + '</li></div>';
          };
          var marker = L.marker(shop.location, { icon: MARKERICONS.red, riseOnHover: true })
            .bindPopup(popup, { offset: new L.Point(0, -25)});
          marker.addTo(overlaysData.shops.overlay);
        };
      });
    });

}(this));
