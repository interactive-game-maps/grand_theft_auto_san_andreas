// Create list
var snapshots_list = document.createElement('ul');
snapshots_list.className = 'collectibles_list';

// Create list
var snapshots_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

// save all marker in a map so we can access them later
var snapshots_map = new Map();

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

        // Add marker to lists
        snapshots_map.set(feature.properties.id.toString(), marker);
        if (!add_checkbox_for_marker(feature, marker, snapshots_list, "snapshots", snapshots_group)) {
            return null;
        }
        return marker;
    }
}).addTo(snapshots_group);
snapshots_map.set("group", snapshots_group);

// save local list in global list of lists
marker.set("snapshots", snapshots_map);

// Add list to sidebar
sidebar.addPanel({
    id: 'snapshots',
    tab: '<i class="fas fa-camera"></i>',
    title: 'Snapshots',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('snapshots').appendChild(snapshots_list);
