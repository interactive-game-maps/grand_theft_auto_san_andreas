// Create list
var horseshoes_list = document.createElement('ul');
horseshoes_list.className = 'collectibles_list';

// Create marker group
var horseshoes_group = L.markerClusterGroup({
    maxClusterRadius: 40
});

// save all marker in a map so we can access them later
var horseshoes_map = new Map();

L.geoJSON(horseshoes, {
    pointToLayer: function (feature, latlng) {
        // custom marker
        var marker = L.marker(latlng, {
            // Simple symbols and text/numbers on markers: https://github.com/coryasilva/Leaflet.ExtraMarkers
            icon: L.ExtraMarkers.icon({
                icon: 'fa-number',
                number: feature.properties.id,
                shape: 'square',
                markerColor: 'black'
            }),
            interactive: false
        });

        // Add marker to lists
        horseshoes_map.set(feature.properties.id.toString(), marker);
        if (!add_checkbox_for_marker(feature, marker, horseshoes_list, "horseshoes", horseshoes_group)) {
            return null;
        }
        return marker;
    }
}).addTo(horseshoes_group);
horseshoes_map.set("group", horseshoes_group);

// save local list in global list of lists
marker.set("horseshoes", horseshoes_map);

// Add list to sidebar
sidebar.addPanel({
    id: 'horseshoes',
    tab: '<i class="fas fa-horse"></i>',
    title: 'Horseshoes',
    pane: '<p></p>' // placeholder to get a proper pane
});
document.getElementById('horseshoes').appendChild(horseshoes_list);
