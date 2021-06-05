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
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-custom marker-tags',
                html: feature.properties.id,
                iconAnchor: new L.point(20, 20),
                iconSize: new L.point(40, 40)
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, tags_group, tags_list, "tags", true);
    }
}).addTo(tags_group);
marker.get("tags").set("group", tags_group);
