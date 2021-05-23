// Create list
var snapshots_list = document.createElement('ul');
snapshots_list.className = 'collectibles_list';

// Create list
var snapshots_cluster = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(snapshots, {
    pointToLayer: function (feature, latlng) {
        // custom marker
        var marker = L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'green'
            }),
            interactive: false
        });

        // Add marker to list
        if (!add_checkbox_for_marker(feature, marker, snapshots_list, "snapshots", snapshots_cluster)) {
            return null;
        }
        return marker;
    }
}).addTo(snapshots_cluster);

// Add list to sidebar
sidebar.addPanel({
    id: 'snapshots',
    tab: '<i class="fas fa-camera"></i>',
    title: 'Snapshots',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('snapshots').appendChild(snapshots_list);
