// Create list
var cop_bribes_list = document.createElement('ul');
cop_bribes_list.className = 'collectibles_list';

// Create marker group
var cop_bribes_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

// save all marker in a map so we can access them later
var cop_bribes_map = new Map();

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

        // Add marker to lists
        cop_bribes_map.set(feature.properties.id.toString(), marker);
        if (!add_checkbox_for_marker(feature, marker, cop_bribes_list, "cop_bribes", cop_bribes_group)) {
            return null;
        }
        return marker;
    },
}).addTo(cop_bribes_group);
cop_bribes_map.set("group", cop_bribes_group);

// save local list in global list of lists
marker.set("cop_bribes", cop_bribes_map);

// Add list to sidebar
sidebar.addPanel({
    id: 'cop_bribes',
    tab: '⭐',
    title: 'Cop Bribes',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('cop_bribes').appendChild(cop_bribes_list);
