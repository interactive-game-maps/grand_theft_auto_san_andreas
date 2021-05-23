// Create list
var cop_bribes_list = document.createElement('ul');
cop_bribes_list.className = 'collectibles_list';

// Create marker group
var cop_bribes_cluster = L.markerClusterGroup({
    maxClusterRadius: 40
});

L.geoJSON(cop_bribes, {
    pointToLayer: function (feature, latlng) {
        // custom marker
        var marker = L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'cyan'
            }),
            interactive: false
        });

        // Add marker to list
        if (!add_checkbox_for_marker(feature, marker, cop_bribes_list, "cop_bribes", cop_bribes_cluster)) {
            return null;
        }
        return marker;
    },
}).addTo(cop_bribes_cluster);

// Add list to sidebar
sidebar.addPanel({
    id: 'cop_bribes',
    tab: '⭐',
    title: 'Cop Bribes',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('cop_bribes').appendChild(cop_bribes_list);
