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
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-custom marker-snapshots',
                html: feature.properties.id,
                iconAnchor: new L.point(20, 20),
                iconSize: new L.point(40, 40)
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, snapshots_group, snapshots_list, "snapshots", true);
    }
}).addTo(snapshots_group);
marker.get("snapshots").set("group", snapshots_group);
