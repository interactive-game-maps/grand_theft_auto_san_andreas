// Create list
var oysters_list = document.createElement('ul');
oysters_list.className = 'collectibles_list';

// Create marekr group
var oyster_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

// save all marker in a map so we can access them later
var oysters_map = new Map();

L.geoJSON(oysters, {
    pointToLayer: function (feature, latlng) {
        // custom marker
        var marker = L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'orange'
            }),
            interactive: false
        });

        // Add collectibles to lists
        oysters_map.set(feature.properties.id.toString(), marker);
        if (!add_checkbox_for_marker(feature, marker, oysters_list, "oysters", oyster_group)) {
            return null;
        }
        return marker;
    }
}).addTo(oyster_group);
oysters_map.set("group", oysters_cluster);

// save local list in global list of lists
marker.set("oysters", oysters_map);

// Add list to sidebar
sidebar.addPanel({
    id: 'oysters',
    tab: '🦪',
    title: 'Oysters',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('oysters').appendChild(oysters_list);
