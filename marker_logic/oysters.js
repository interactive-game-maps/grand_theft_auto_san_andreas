// Create list
var oysters_list = document.createElement('ul');
oysters_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: 'oysters',
    tab: '🦪',
    title: 'Oysters',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('oysters').appendChild(oysters_list);

// Create marker group
var oysters_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(oysters, {
    pointToLayer: (feature, latlng) => {
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'orange'
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, oysters_group, oysters_list, "oysters", true);
    }
}).addTo(oysters_group);
marker.get("oysters").set("group", oysters_group);
