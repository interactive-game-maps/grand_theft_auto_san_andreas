// Create list
var oysters_list = document.createElement('ul');
oysters_list.className = 'collectibles_list';

// Create marekr group
var oyster_cluster = L.markerClusterGroup({
    maxClusterRadius: 40
});

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

        // Add collectibles to list
        if (!add_checkbox_for_marker(feature, marker, oysters_list, "oysters", oyster_cluster)) {
            return null;
        }
        return marker;
    }
}).addTo(oyster_cluster);

// Add list to sidebar
sidebar.addPanel({
    id: 'oysters',
    tab: '🦪',
    title: 'Oysters',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('oysters').appendChild(oysters_list);
