// Center view over map
map.fitBounds(getOuterBoundsMap());

// Defining overlay maps - markers
var overlayMaps = {};
marker.forEach((value, key) => {
    overlayMaps[value.get('name')] = value.get('group');
});

// Add user selection to map
L.control.layers(baseMaps, overlayMaps, {
    hideSingleBase: true
}).addTo(map);

{// Add custom layers to map
    // https://stackoverflow.com/a/51484131
    // Add method to layer control class
    L.Control.Layers.include({
        getOverlays: (args = {}) => {
            var defaults = {
                only_active: false
            };
            var params = { ...defaults, ...args } // right-most object overwrites

            // create hash to hold all layers
            var control, layers;
            layers = {};
            // control = this;
            control = custom_layer_controls;

            // loop thru all layers in control
            control._layers.forEach(function (obj) {
                var layerName;

                // check if layer is an overlay
                if (obj.overlay) {
                    // get name of overlay
                    layerName = obj.name;
                    // store whether it's present on the map or not
                    if (params.only_active && !map.hasLayer(obj.layer)) {
                        return;
                    }
                    return layers[layerName] = map.hasLayer(obj.layer);
                }
            });

            return layers;
        }
    });

    var custom_layers = {};
    if (localStorage.getItem(`${website_subdir}:custom_layers`)) {
        JSON.parse(localStorage.getItem(`${website_subdir}:custom_layers`)).forEach(element => {
            if (!localStorage.getItem(`${website_subdir}:${element}`)) {
                return;
            }

            var custom_layer = L.geoJSON(JSON.parse(localStorage.getItem(`${website_subdir}:${element}`)), {
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, {
                        icon: getCustomIcon(element.substring(0, 2)),
                        riseOnHover: true
                    });
                },
                onEachFeature: (feature, layer) => {
                    createEditablePopup(layer);
                },
                pmIgnore: false
            });
            custom_layers[element] = custom_layer;
        });
    }

    var custom_layer_controls;
    custom_layer_controls = new L.control.layers(null, custom_layers, {
        collapsed: false
    });
    showCustomLayerControls();

    map.on('overlayadd', e => {
        if (!user_layers.includes(e.name)) {
            user_layers.push(e.name);
        }

        localStorage.setItem(`${website_subdir}:user_layers`, JSON.stringify(user_layers));
    });
    map.on('overlayremove ', e => {
        user_layers = user_layers.filter((value, index, array) => {
            return value != e.name;
        });

        localStorage.setItem(`${website_subdir}:user_layers`, JSON.stringify(user_layers));
    });
}

// Show remembered layers
var user_layers = JSON.parse(localStorage.getItem(`${website_subdir}:user_layers`));
if (!user_layers) {
    user_layers = default_layers;
}
// iterate over all lists
marker.forEach((value, key) => {
    // iterate over all IDs
    if (user_layers.includes(value.get('name'))) {
        map.addLayer(value.get('group'));
    }
});
Object.keys(custom_layers).forEach(element => {
    if (user_layers.includes(element)) {
        map.addLayer(custom_layers[element]);
    }
});

// hide all previously checked marker
// iterate over all lists
marker.forEach((v, k) => {
    // iterate over all IDs
    v.forEach((value, key) => {
        if (key == 'group' ||
            key == 'name') return;

        // iterate over all features with that ID
        value.forEach(item => {
            // Remove if checked
            if (localStorage.getItem(`${website_subdir}:${k}:${key}`)) {
                v.get("group").removeLayer(item);
            }
        });
    });
});

{ // clicking sets a marker that can be shared
    var share_marker = L.marker([0, 0], {
        icon: getCustomIcon('fa-share-alt'),
        riseOnHover: true,
        draggable: true,
        pmIgnore: true
    });
    share_marker.on('moveend', e => {
        highlightMarkerRemove(share_marker);
        history.replaceState({}, "", `?share=${e.target._latlng.lng},${e.target._latlng.lat}`);
    });
    share_marker.bindPopup(() => {
        var html = document.createElement('div');

        var title = document.createElement('h2');
        title.className = 'popup-title';
        title.innerHTML = 'Share marker';
        html.appendChild(title);

        var button = document.createElement('button');
        button.innerHTML = 'Remove';
        button.className = 'popup-checkbox is-fullwidth';
        html.appendChild(button);

        button.addEventListener('click', () => {
            setHistoryState();
        });

        return html;
    });

    function moveShareMarker(e) {
        share_marker.setLatLng(e.latlng);
        share_marker.addTo(map);
        history.replaceState({}, "", `?share=${e.latlng.lng},${e.latlng.lat}`);
    }
    map.on('click', moveShareMarker);
}

// Search in url for marker and locate them
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('share')) {
    const share = urlParams.get('share');

    let latlng = share.split(",");
    share_marker.setLatLng([latlng[1], latlng[0]]);
    share_marker.addTo(map);
    let bounds = [];
    bounds.push([share_marker._latlng.lat, share_marker._latlng.lng]);
    highlightMarker(share_marker);
    zoomToBounds(bounds);
} else if (urlParams.has('list')) {
    const list = urlParams.get('list');

    // make group visible
    if (marker.get(list).has('group')) {
        map.addLayer(marker.get(list).get('group'));
    }

    if (!urlParams.has('id')) {
        map.fitBounds(marker.get(list).get('group').getBounds());

        // if no id open sidebar
        sidebar._tabitems.every(element => {
            if (element._id == list) {
                sidebar.open(list);
                return false;
            }
            return true;
        });
    } else {
        const id = urlParams.get('id');
        if (marker.has(list) && marker.get(list).has(id)) {
            highlightFeatureID(list, id);
            zoomToFeature(list, id);
        }

        // TODO: unhide?
    }
}

// Update popup locations after image loading
// https://github.com/Leaflet/Leaflet/issues/5484#issuecomment-299949921
document.querySelector(".leaflet-popup-pane").addEventListener("load", function (event) {
    var tagName = event.target.tagName,
        popup = map._popup; // Last open Popup.

    if (tagName === "IMG" && popup && !popup._updated) {
        popup._updated = true; // Assumes only 1 image per Popup.
        popup.update();
    }
}, true); // Capture the load event, because it does not bubble.
