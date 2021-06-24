// Defining overlay maps - markers
var overlayMaps = {};
marker.forEach((value, key) => {
    overlayMaps[value.get('name')] = value.get('group');
});

// Center view over map
map.fitBounds([[0, 0], [-192, 192]]);

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
    if (localStorage.getItem('custom_layers')) {
        JSON.parse(localStorage.getItem('custom_layers')).forEach(element => {
            if (!localStorage.getItem(element)) {
                return;
            }

            var custom_layer = L.geoJSON(JSON.parse(localStorage.getItem(element)), {
                onEachFeature: (feature, layer) => {
                    create_editable_popup(layer);
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
    show_custom_layer_controls();

    map.on('overlayadd', e => {
        if (!user_layers.includes(e.name)) {
            user_layers.push(e.name);
        }

        localStorage.setItem('user_layers', JSON.stringify(user_layers));
    });
    map.on('overlayremove ', e => {
        user_layers = user_layers.filter((value, index, array) => {
            return value != e.name;
        });

        localStorage.setItem('user_layers', JSON.stringify(user_layers));
    });
}

// Show remembered layers
var user_layers = JSON.parse(localStorage.getItem('user_layers'));
if (!user_layers) {
    user_layers = [
        tags_group_name,
        snapshots_group_name,
        horseshoes_group_name,
        oysters_group_name
    ];
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
            if (localStorage.getItem(k + ":" + key)) {
                v.get("group").removeLayer(item);
            }
        });
    });
});

// Search in url for marker and locate them
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('list')) {
    const list = urlParams.get('list');
    if (marker.get(list).has('group')) {
        // make group visible
        map.addLayer(marker.get(list).get('group'));
    }
    if (!urlParams.has('id')) {
        // if no id open sidebar
        map.fitBounds(marker.get(list).get('group').getBounds());
        sidebar.open(list);
    }
    else {
        const id = urlParams.get('id');
        if (marker.has(list) && marker.get(list).has(id)) {
            // center and zoom id
            var bounds = [];
            marker.get(list).get(id).forEach(element => {
                if (element._latlngs) {
                    // Polygons
                    element._latlngs.forEach(latlng => {
                        bounds.push(latlng);
                    });
                    element.setStyle({
                        color: 'blue',
                        opacity: 1.0
                    });
                } else {
                    // Marker
                    bounds.push(element._latlng);
                }
            });

            map.fitBounds(L.latLngBounds(bounds), {
                maxZoom: 6
            });
        }

        // TODO: unhide?
    }
}
