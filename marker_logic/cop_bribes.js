// Create list
var cop_bribes_list = document.createElement('ul');
cop_bribes_list.className = 'collectibles_list';

// Add list to sidebar
sidebar.addPanel({
    id: 'cop_bribes',
    tab: '⭐',
    title: 'Cop Bribes',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('cop_bribes').appendChild(cop_bribes_list);

// Create marker group
var cop_bribes_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(cop_bribes, {
    pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
            icon: L.divIcon({
                className: 'marker-custom marker-cop_bribes',
                html: feature.properties.id,
                iconAnchor: new L.point(20, 20),
                iconSize: new L.point(40, 40)
            }),
            interactive: false
        });
    },
    onEachFeature: (feature, layer) => {
        onEachFeature(feature, layer, cop_bribes_group, cop_bribes_list, "cop_bribes", true);
    }
}).addTo(cop_bribes_group);
marker.get("cop_bribes").set("group", cop_bribes_group);
