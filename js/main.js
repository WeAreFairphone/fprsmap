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
  var COMMUNITY_DOMAIN = 'fairphone.community'
  var TOPIC_URL = 'https://forum.fairphone.com/t/'

  var MARKERICONS = ["blue", "brown", "green", "grey", "orange", "pink", "red"]
    .reduce(function(markericons, color) {
      markericons[color] = L.icon({
          iconUrl: 'resources/FairphoneMarker_' + color + '.png',
          iconAnchor: [15.9, 49],
        });
      return markericons;
    }, {});

  var EXCLUDED_LAYERS = [];

  var DEFAULTMAPCENTER = [49.8158683, 6.1296751];

  var DEFAULTZOOMLEVEL = 2;

  /* Variables (state) */
  var map;
  var layerControls;
  var cluster = L.markerClusterGroup({
    disableClusteringAtZoom: 4,
    spiderfyOnMaxZoom: false
  });
  var overlaysData = {
    angels: {
      title: "Fairphone Angels",
      overlay: L.featureGroup.subGroup(cluster),
    },
    events: {
      title: "Meetups & Events",
      overlay: L.featureGroup.subGroup(cluster),
    },
  }
  var activeLayers = Object.keys(overlaysData).filter(function(key){
    return !EXCLUDED_LAYERS.includes(key);
  });
  var currentMapCenter = DEFAULTMAPCENTER;
  var currentZoomLevel = DEFAULTZOOMLEVEL;
  var embedTextareaContent;
  var queryParams = getQueries();

  /* Functions */
  function getAllOverlays(overlaysData) {
    return Object.keys(overlaysData)
      .reduce(function(overlays, currentOverlay){
        overlays[overlaysData[currentOverlay].title] = overlaysData[currentOverlay].overlay;
        return overlays;
      }, {});
  }

  function titleToKey(title) {
    return Object.keys(overlaysData)
      .filter(function(key){
        return (overlaysData[key].title == title)
      })
      .toString();
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

  function getInitialLayers(overlays, permanentLayers) {
    return overlays.reduce(function(layers, currentOverlay) {
          layers.push(overlaysData[currentOverlay].overlay);
        return layers;
      }, permanentLayers || []);
  }

  function getEffectiveOverlays(overlaysData, defaultOverlays) {
    return Object.keys(overlaysData)
      .filter(function(currentOverlay) {
        if ((!defaultOverlays || !isValidOverlayQueries(overlaysData,defaultOverlays)) && EXCLUDED_LAYERS.includes(currentOverlay)) return false;
        if (!defaultOverlays || !isValidOverlayQueries(overlaysData,defaultOverlays)) return true;

        return defaultOverlays.indexOf(currentOverlay) !== -1;
      });
  }

  function initMap(initialMapCenter, initialZoomLevel, defaultOverlays) {
    var baseLayer = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a> | &copy; <a href="https://github.com/WeAreFairphone/fprsmap" target="_blank">WeAreFairphone</a> (<a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank">GPLv3</a>)',
      maxZoom: 18,
    });

    var effectiveOverlays = getEffectiveOverlays(overlaysData, defaultOverlays);

    map = L.map('mapid', {
      center: initialMapCenter,
      zoom: initialZoomLevel,
      minZoom: 2,
      layers: getInitialLayers(effectiveOverlays, [baseLayer, cluster]),
      worldCopyJump: true,
    });

    activeLayers = effectiveOverlays;
    currentZoomLevel = initialZoomLevel;
    currentMapCenter = initialMapCenter;

    if (isEmbedded()) {
      map.scrollWheelZoom.disable();
      map.attributionControl.setPrefix('<a href="https://map.fairphone.community/" target="_blank">See bigger map</a> | Leaflet');
    } else {
      map.addControl(new L.Control.Fullscreen());
    }
  }

  function addPopupWithEmbedCode() {
    updateEmbedTextareaContentAndBrowserUrl();
    var embedPopupContent = 'Embed code:<br>' +
      '<textarea autofocus cols="35" id="embed-textarea" readonly rows="3" wrap="off">' + embedTextareaContent + '</textarea>';
    L.popup({className: 'embed-popup'})
    .setLatLng(map.getCenter())
    .setContent(embedPopupContent)
    .openOn(map);
  }

  function updateEmbedTextareaContentAndBrowserUrl() {
    var queryParams = '?center=' + currentMapCenter[0] + ',' + currentMapCenter[1] + '&zoom=' + currentZoomLevel + '&show=' + activeLayers.toString();
    embedTextareaContent = '<iframe src="https://map.fairphone.community/' + queryParams + '" width="100%" height="400" allowfullscreen="true" frameborder="0">\n' +
    '<p><a href="https://map.fairphone.community/' + queryParams + '" target="_blank">See the Fairphone Community Map!</a></p>\n' +
    '</iframe>';
    try {
      if (window.history.replaceState) {
        window.history.replaceState({}, null, queryParams);
      }
      document.getElementById('embed-textarea').value = embedTextareaContent;
    } catch(e) {
    };
  }

  function initControls() {
    layerControls = L.control.layers(null, getAllOverlays(overlaysData), {
      collapsed: false,
    });
    layerControls.addTo(map);

    // Add embed Control
    L.easyButton('<img src="resources/embed-icon.png">', function(btn,map){
      addPopupWithEmbedCode();
    },'Embed the map!').addTo(map);
  }

  function getInitialMapCenter() {
    var mapcenter = queryParams.center; // all queries after "center="
    if(!mapcenter) {
      return DEFAULTMAPCENTER;
    }

    var initialCoordinates = mapcenter.split(',');
    if ((initialCoordinates.length === 2) && parseFloat(initialCoordinates[0]) && parseFloat(initialCoordinates[1])) {
      return [parseFloat(initialCoordinates[0]), parseFloat(initialCoordinates[1])];
    }

    return DEFAULTMAPCENTER;
  }

  function getInitialZoomLevel() {
    var zoomlevel = queryParams.zoom; // all queries after "zoom="
    if (!zoomlevel) {
      return DEFAULTZOOMLEVEL;
    }

    if ((parseFloat(zoomlevel) >= 2) && (parseFloat(zoomlevel) <= 18)) {
      return parseFloat(zoomlevel);
    }

    return DEFAULTZOOMLEVEL;
  }

  function getDefaultOverlays() {
    var overlays = queryParams.show; // all queries after "show="
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

  function onOverlayadd(e) {
    activeLayers.push(titleToKey(e.name));
    updateEmbedTextareaContentAndBrowserUrl();
  }

  function onOverlayremove(e) {
    activeLayers = activeLayers.filter(function(layer){
      return layer != titleToKey(e.name);
    });
    updateEmbedTextareaContentAndBrowserUrl();
  }

  function onZoomend(e) {
    currentZoomLevel = map.getZoom();
    updateEmbedTextareaContentAndBrowserUrl();
  }

  function onMoveend(e) {
    var center = map.getCenter();
    currentMapCenter = [center.lat, center.lng];
    updateEmbedTextareaContentAndBrowserUrl();
  }

  /* Main */
  var defaultOverlays = getDefaultOverlays();
  var initialMapCenter = getInitialMapCenter();
  var initialZoomLevel = getInitialZoomLevel();
  initMap(initialMapCenter, initialZoomLevel, defaultOverlays);
  initControls();

  // Add listeners
  map.on('movestart', onMovestart);
  if (isEmbedded()) {
    map.on('mousedown', onMousedown);
    map.on('mouseout', onMouseout);
  }
  map.on('overlayadd', onOverlayadd);
  map.on('overlayremove', onOverlayremove);
  map.on('zoomend', onZoomend);
  map.on('moveend', onMoveend);

  // Populate Fairphone Angels overlay
  fetchJSON('data/angels.json')
    .then(function(json) {
      // Add a marker per Heaven
      json.heavens.forEach(function(heaven) {
        console.log(heaven.exists, heaven.active)
        if(heaven.exists && heaven.active) {
          heaven.coordinates.forEach(function(lat_lng) {
            var circle = L.circle(lat_lng, { radius: 30000, color: '#2ca7df', stroke:false, fillOpacity: 0.5 })
            .bindPopup(
              '<a href="mailto:' + heaven.location.toLowerCase() + '@' + COMMUNITY_DOMAIN + '">' + heaven.location + '<br>@' + COMMUNITY_DOMAIN + '<a>',
            );
            circle.addTo(overlaysData.angels.overlay);
          })
        }
      });
    });

    //Populate Events & Meetups overlay (events fetched from Fairphone Forum agenda)
    // https://forum.fairphone.com/agenda.json
    fetchJSON('data/events.json')
      .then(function(topics) {
        topics.forEach(function(topic) {
          if(topic.event && topic.location && topic.location.geo_location) {
            var e = topic.event,
                l = topic.location.geo_location,
                name = topic.location.name

            var popup = '<a href="' + TOPIC_URL + topic.id + '" target="_blank">' + (topic.unicode_title || topic.title) + '</a>' +
              '<br><div class="shopinfo">Start: ' +
              new Date(e.start).toLocaleDateString() + ' | ' +
              new Date(e.start).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            if(e.end) {
              popup += '<br>End: ' +
              new Date(e.end).toLocaleDateString() + ' | ' +
              new Date(e.end).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>';
            }
            popup += '</div>';

            popup += '<div class="shopinfo">Where: '
            if(name) popup += name + '<br>' + '&emsp;'
            popup += l.postalcode + ' ' + (l.city || l.state) + ', ' + l.country + '</div>';

            var marker = L.marker([l.lat,l.lon], { icon: MARKERICONS.orange, riseOnHover: true })
              .bindPopup(popup, { offset: new L.Point(0, -25)});
            marker.addTo(overlaysData.events.overlay);
          }
        })
        /*
        json.list.forEach(function(area) {
          var nextEvent;
          if(area.events) {
            //discard all events that took place before today
            area.events = area.events.filter(function(event) {
              event.date = new Date(event.date[0], event.date[1]-1, event.date[2], event.date[3], event.date[4]);
              return event.date.getTime() > CURRENTDATE.getTime();
            });
            //find the one closest to today
            if(area.events.length > 0) {
              nextEvent = area.events.reduce(function(nextEvent, currentEvent) {
                if(currentEvent.date.getTime() < nextEvent.date.getTime()) {
                  return currentEvent;
                } else {
                  return nextEvent;
                };
              });
            };
            if(nextEvent) {
              var popup = '<a href="' + nextEvent.url + '" target="_blank">' + nextEvent.name + '</a>' +
                '<br><div class="shopinfo">When: ' +
                nextEvent.date.toLocaleDateString() + ' | ' + nextEvent.date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) + '</div>';
              if(nextEvent.venue || nextEvent.address) {
                popup = popup + '<div class="shopinfo">Where: ';
                if(nextEvent.venue) {
                  popup = popup + nextEvent.venue;
                }
                if(nextEvent.address) {
                  popup = popup + '<br>' +
                    '&emsp;' + nextEvent.address + '<br>' +
                    '&emsp;' + nextEvent.zipcode + ' ' + nextEvent.city;
                };
                popup = popup + '</div>';
              };
              var marker = L.marker(nextEvent.lat_lng, { icon: MARKERICONS.orange, riseOnHover: true })
                .bindPopup(popup, { offset: new L.Point(0, -25)});
              marker.addTo(overlaysData.events.overlay);
            };
          };
        });*/
      });
}(this));
