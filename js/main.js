(function (global) {
  'use strict';

  /* Utils */
  function fetchJSON(url) {
    return fetch(url)
      .then(function (response) {
    return response.json();
      });
  }

  function getQueries() {
    if (!location.search) return {};

    return location.search
      .replace('?', '')
      .split('&')
      .reduce(function (queries, current) {
    var splitted = current.split('=');
    queries[splitted[0]] = splitted[1];
    return queries;
    }, {});
  }

  /* Constants */
  var COMMUNITY_DOMAIN = 'tzm.one'
  var FORUM_URL = 'https://tzm.one/'
  var GROUP_URL = 'https://tzm.one/g'

  var EXCLUDED_LAYERS = [];

  var DEFAULTMAPCENTER = [25, 0];

  var DEFAULTZOOMLEVEL = 2;

  /* Variables (state) */
  var map;
  var layerControls;
  var cluster = L.markerClusterGroup({
    disableClusteringAtZoom: 4,
    spiderfyOnMaxZoom: false
  });
  var overlaysData = {
    chapters: {
      title: "Chapters",
      overlay: L.featureGroup.subGroup(cluster),
    },
    events: {
      title: "Events",
      overlay: L.featureGroup.subGroup(cluster),
    },
  }
  var activeLayers = Object.keys(overlaysData).filter(function (key) {
    return !EXCLUDED_LAYERS.includes(key);
  });
  var currentMapCenter = DEFAULTMAPCENTER;
  var currentZoomLevel = DEFAULTZOOMLEVEL;
  var embedTextareaContent;
  var queryParams = getQueries();

  /* Functions */
  function getAllOverlays(overlaysData) {
    return Object.keys(overlaysData)
      .reduce(function (overlays, currentOverlay) {
        overlays[overlaysData[currentOverlay].title] = overlaysData[currentOverlay].overlay;
    return overlays;
    }, {});
  }

  function titleToKey(title) {
    return Object.keys(overlaysData)
      .filter(function (key) {
    return (overlaysData[key].title == title)
    })
      .toString();
  }

  function isEmbedded() {
    if (window.self !== window.top) return true;

    return false;
  }

  function isValidOverlayQueries(overlaysData, defaultOverlays) {
    return defaultOverlays.reduce(function (validQuery, currentQuery) {
      return validQuery || Object.keys(overlaysData).includes(currentQuery);
    }, false);
  }

  function getInitialLayers(overlays, permanentLayers) {
    return overlays.reduce(function (layers, currentOverlay) {
      layers.push(overlaysData[currentOverlay].overlay);
      return layers;
    }, permanentLayers || []);
  }

  function getEffectiveOverlays(overlaysData, defaultOverlays) {
    return Object.keys(overlaysData)
      .filter(function (currentOverlay) {
        if ((!defaultOverlays || !isValidOverlayQueries(overlaysData, defaultOverlays)) && EXCLUDED_LAYERS.includes(currentOverlay)) return false;
        if (!defaultOverlays || !isValidOverlayQueries(overlaysData, defaultOverlays)) return true;

      return defaultOverlays.indexOf(currentOverlay) !== -1;
    });
  }

  function initMap(initialMapCenter, initialZoomLevel, defaultOverlays) {
    var baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    });

    var effectiveOverlays = getEffectiveOverlays(overlaysData, defaultOverlays);

    map = L.map('mapid', {
      center: initialMapCenter,
      zoom: initialZoomLevel,
      gestureHandling: true,
      minZoom: 2,
      layers: getInitialLayers(effectiveOverlays, [baseLayer, cluster]),
      worldCopyJump: true,
      fullscreenControl: true,
    });

    activeLayers = effectiveOverlays;
    currentZoomLevel = initialZoomLevel;
    currentMapCenter = initialMapCenter;

    if (isEmbedded()) {
      map.scrollWheelZoom.disable();
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
    try {
    if (window.history.replaceState) {
        window.history.replaceState({}, null, queryParams);
      }
      document.getElementById('embed-textarea').value = embedTextareaContent;
    } catch (e) {
    }
    ;
  }

  function initControls() {
    layerControls = L.control.layers(null, getAllOverlays(overlaysData), {
      collapsed: false,
    });
    layerControls.addTo(map);
  }

  function getInitialMapCenter() {
    var mapcenter = queryParams.center; // all queries after "center="
    if (!mapcenter) {
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
    if (!layerControls.collapsed) {
      layerControls.collapse();
    }
  }

  function onMousedown(e) {
    if (!map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.enable();
    }
  }

  function onMouseout(e) {
    if (map.scrollWheelZoom.enabled()) {
      map.scrollWheelZoom.disable();
    }
  }

  function onOverlayadd(e) {
    activeLayers.push(titleToKey(e.name));
    updateEmbedTextareaContentAndBrowserUrl();
  }

  function onOverlayremove(e) {
    activeLayers = activeLayers.filter(function (layer) {
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

  function getChapterEmailAddress(chapter_name) {
    var email_address = chapter_name.replace(/_/g, "-");
    return email_address + '@' + COMMUNITY_DOMAIN;
  }

  function updateTagLink(bio_excerpt) {
    const re = /\/tag\/(?<html_tag>\w+)|#(?<tag>\w+)/;
    const match = bio_excerpt.match(re);

    for (const name in match.groups) {
      if(match.groups[name] && typeof match.groups[name] !== "undefined") {
        var new_bio_excerpt = bio_excerpt.replace(/<a class="(hashtag-cooked|hashtag)" href=".*<\/a>/, '<a target="_blank" class="hashtag" href="https://tzm.one/tag/' + match.groups[name] + '">' + "#" + match.groups[name] + '</a>');
        return new_bio_excerpt
      }
    }
  }

  function setTargetBlank(bio_excerpt) {
    var new_bio_excerpt = bio_excerpt.replace(/<a href=/g, '<a target=\"_blank\" href=');
    return new_bio_excerpt
  }

  function conditionalChapterMemberFormat(member_count) {
    if (member_count > 1) {
      return 'members'
    } else {
      return 'member'
    }
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

  map.attributionControl.setPrefix('<a href="https://tzm.one/powered-by" title="This map was made possible by the open-source community" target="_blank">Powered by</a>');

  fetchJSON('current_chapters.json')
    .then(function(json) {
      json.forEach(function(chapter) {
        if (chapter.custom_fields.show_map && chapter.custom_fields.lat && chapter.custom_fields.lon) {
          var contact_by_email = chapter.custom_fields.contact_by_email;
          var member_count = chapter.user_count;
          var member_format = conditionalChapterMemberFormat(member_count);
          var email_address = getChapterEmailAddress(chapter.name.toLowerCase());
          var lat_lng = [
            chapter.custom_fields.lat,
            chapter.custom_fields.lon
          ]

          // Remove relative forum link and include full link
          var new_bio_excerpt = updateTagLink(chapter.bio_excerpt);
          if (!new_bio_excerpt) {
            new_bio_excerpt = chapter.bio_excerpt
          }

          // Include `target is blank` for all URLs so that CSP plays nice
          new_bio_excerpt = setTargetBlank(new_bio_excerpt);

          // Dynamically generate marker label text based on context from group attributes such as members and bio
          if (member_count !== 0) {
            var introduction =
              '<b>' + chapter.title + '</b>' +
              '<br><div class="shopinfo">' + new_bio_excerpt + ' You can also contact ' + member_count + ' ' + member_format + ' via our <a target="_blank" href="' + GROUP_URL + '/' + chapter.name + '">forum group</a>';
          } else {
            var introduction =
                '<b>' + chapter.title + '</b>' +
                '<br><div class="shopinfo">' + new_bio_excerpt + ' We currently have no members in our <a target="_blank" href="' + GROUP_URL + '/' + chapter.name + '">forum group</a>';
          }

          if (contact_by_email && member_count >= 1) {
            var extra_contact_details = ' which you can also reach via <a href="mailto:' + email_address + '">' + 'email</a>.</div>';
          } else {
            var extra_contact_details = ".</div>";
          }

          // Concatenate text
          var map_text = introduction.concat(extra_contact_details);

          var iconOptions = {
            iconUrl: 'resources/ZeitgeistMarker.svg',
            iconSize: [32, 50],
            iconAnchor: [15.9, 49]
          }

          var customIcon = L.icon(iconOptions);

          var markerOptions = {
            riseOnHover: true,
            icon: customIcon
          }

          // Create marker and drop marker at geo location with set text from forum group
          var marker = L.marker(lat_lng, markerOptions)
            .bindPopup(map_text, { offset: new L.Point(0, -25)});

          // Add marker to chapters overlay
          marker.addTo(overlaysData.chapters.overlay);
      }
    });
  });

/* Fetch Events */
  fetchJSON('current_events.json')
    .then(function(json) {
      // GeoJSON standard wrapper check
      if (json.features) {
        json.features.forEach(function(feature) {

          var props = feature.properties;
          var geom = feature.geometry;

          // Only proceed if we have valid coordinates
          if (geom && geom.coordinates && geom.coordinates.length === 2) {

            var lat_lng = [geom.coordinates[1], geom.coordinates[0]];

            // Construct the Popup Content
            var map_text =
              '<b>' + props.name + '</b>' +
              '<br><div class="shopinfo">' +
              'Date: ' + (props.date ? props.date : 'TBA') + '<br>' +
              'Address: ' + (props.address ? props.address : 'Online') + '<br>' +
              '<a target="_blank" href="' + props.url + '">More information</a>' +
              '</div>';

            // Orange Icon Configuration
            var iconOptions = {
              iconUrl: 'resources/ZeitgeistMarker.svg',
              iconSize: [32, 50],
              iconAnchor: [15.9, 49],
              className: 'event-marker-orange'
            };

            var customIcon = L.icon(iconOptions);

            var markerOptions = {
              riseOnHover: true,
              icon: customIcon
            };

            // Create the marker
            var marker = L.marker(lat_lng, markerOptions)
              .bindPopup(map_text, { offset: new L.Point(0, -25)});

            // Add to the existing 'events' overlay group
            marker.addTo(overlaysData.events.overlay);
          }
        });
      }
    });
}(this));
