// Create list
var snapshots_list = document.createElement('ul');
snapshots_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: 'snapshots',
    tab: '<i class="fas fa-camera"></i>',
    title: 'Snapshots',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('snapshots').appendChild(snapshots_list);

// Create list
var snapshots_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(snapshots, {
    pointToLayer: (feature, latlng) => {
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'green'
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, snapshots_group, snapshots_list, "snapshots", true);
    }
}).addTo(snapshots_group);
marker.get("snapshots").set("group", snapshots_group);
