// Create list
var tags_list = document.createElement('ul');
tags_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: 'tags',
    tab: '<i class="fas fa-spray-can"></i>',
    title: 'Spray Tags',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('tags').appendChild(tags_list);

// Create marker group
var tags_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(tags, {
    pointToLayer: (feature, latlng) => {
        // custom marker
        return L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'red'
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, tags_group, tags_list, "tags", true);
    }
}).addTo(tags_group);
marker.get("tags").set("group", tags_group);
