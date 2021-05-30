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
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'black'
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, horseshoes_group, horseshoes_list, "horseshoes", true);
    }
}).addTo(horseshoes_group);
marker.get("horseshoes").set("group", horseshoes_group);
