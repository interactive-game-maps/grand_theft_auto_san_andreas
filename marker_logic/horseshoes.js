// Create list
var horseshoes_list = document.createElement('ul');
horseshoes_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: 'horseshoes',
    tab: '<i class="fas fa-horse"></i>',
    title: 'Horseshoes',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('horseshoes').appendChild(horseshoes_list);

// Create marker group
var horseshoes_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(horseshoes, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-custom marker-horseshoes',
                html: feature.properties.id,
                iconAnchor: new L.point(20, 20),
                iconSize: new L.point(40, 40)
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, horseshoes_group, horseshoes_list, "horseshoes", true);
    }
}).addTo(horseshoes_group);
marker.get("horseshoes").set("group", horseshoes_group);
