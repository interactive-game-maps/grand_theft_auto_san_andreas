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
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-custom marker-oysters',
                html: feature.properties.id,
                iconAnchor: new L.point(20, 20),
                iconSize: new L.point(40, 40)
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, oysters_group, oysters_list, "oysters", true);
    }
}).addTo(oysters_group);
marker.get("oysters").set("group", oysters_group);
