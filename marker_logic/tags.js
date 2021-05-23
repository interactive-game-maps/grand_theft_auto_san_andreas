// Create list
var tags_list = document.createElement('ul');
tags_list.className = 'collectibles_list';

// Create marker group
var tags_cluster = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(tags, {
    pointToLayer: function (feature, latlng) {
        // custom marker
        var marker = L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'red'
            }),
            interactive: false
        });

        // Add marker to list
        if (!add_checkbox_for_marker(feature, marker, tags_list, "tags", tags_cluster)) {
            return null;
        }
        return marker;
    }
}).addTo(tags_cluster);

// Add list to sidebar
sidebar.addPanel({
    id: 'tags',
    tab: '<i class="fas fa-spray-can"></i>',
    title: 'Spray Tags',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('tags').appendChild(tags_list);
