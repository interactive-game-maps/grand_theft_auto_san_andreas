// Center view over map
zoomToBounds(getMapBounds());

// Defining overlay maps - markers
var overlayMaps = {};
interactive_layers.forEach((layer, key) => {
    overlayMaps[layer.name] = layer.feature_group;
});

// Add layer selection to map
L.control.layers(baseMaps, overlayMaps, {
    hideSingleBase: true
}).addTo(map);

// Add custom layers to map
var custom_layers = new CustomLayers();

map.on('overlayadd', event => {
    if (!user_layers.includes(event.name)) {
        user_layers.push(event.name);
    }

    localStorage.setItem(`${website_subdir}:user_layers`, JSON.stringify(user_layers));
});
map.on('overlayremove ', event => {
    user_layers = user_layers.filter((value, index, array) => {
        return value != event.name;
    });

    localStorage.setItem(`${website_subdir}:user_layers`, JSON.stringify(user_layers));
});

// Show remembered layers
var user_layers = JSON.parse(localStorage.getItem(`${website_subdir}:user_layers`));
if (!user_layers) {
    user_layers = default_layers;
}
interactive_layers.forEach((layer, id) => {
    if (user_layers.includes(layer.name)) {
        layer.showLayer();
    }
});
user_layers.forEach(layer => {
    if (custom_layers.hasLayer(layer)) {
        map.addLayer(custom_layers.getLayer(layer));
    }
});

// hide all previously checked marker
interactive_layers.forEach((layer, layer_id) => {
    layer.getAllFeatures().forEach((array, feature_id) => {
        array.forEach(feature => {
            // Remove if checked
            if (localStorage.getItem(`${website_subdir}:${layer_id}:${feature_id}`)) {
                layer.marker_cluster.removeLayer(feature);
            }
        });
    });
});

// clicking sets a marker that can be shared
var share_marker = new ShareMarker([0, 0], {
    icon: getCustomIcon('fa-share-alt'),
    riseOnHover: true,
    draggable: true,
    pmIgnore: true
});

// Search in url for marker and locate them
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('share')) {
    const share = urlParams.get('share');

    let latlng = share.split(",");
    share_marker.move([latlng[1], latlng[0]]);

    share_marker.highlight();
    share_marker.zoomTo();
} else if (urlParams.has('list')) {
    const list = urlParams.get('list');

    if (interactive_layers.has(list)) {
        var layer = interactive_layers.get(list);;

        // make group visible
        layer.showLayer();

        if (!urlParams.has('id')) {
            layer.zoomTo();

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

            if (layer.hasFeature(id)) {
                layer.highlightFeature(id);
                layer.zoomToFeature(id);
                map.on('click', removeAllHighlights);
            }

            // TODO: unhide?
        }
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
