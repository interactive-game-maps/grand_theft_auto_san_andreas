// Defining overlay maps - markers
var overlayMaps = {
    "Spray Tags": tags_group,
    "Snapshots": snapshots_group,
    "Horseshoes": horseshoes_group,
    "Oysters": oysters_group,
    "Unique Stunt Jumps": stunt_jumps_group,
    "Cob Bribes": cop_bribes_group,
    "Busted Warps": busted_warps_group,
    "Death Warps": death_warps_group,
    "Race Tournaments": race_tournaments_group
};

// Make overlay layer visible by default
map.addLayer(tags_group);
map.addLayer(snapshots_group);
map.addLayer(horseshoes_group);
map.addLayer(oysters_group);

// Center view over map
map.fitBounds([[0, 0], [-192, 192]]);

// Add user selection to map
L.control.layers(baseMaps, overlayMaps).addTo(map);

// hide all previously checked marker
// iterate over all lists
marker.forEach((v, k) => {
    // iterate over all IDs
    v.forEach((value, key) => {
        if (key == "group") return;

        // iterate over all features with that ID
        value.forEach(item => {
            // Remove if checked
            if (localStorage.getItem(k + ":" + key)) {
                v.get("group").removeLayer(item);
            }
        });
    });
});

// Search in url for marker and locate them
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
if (urlParams.has('list')) {
    const list = urlParams.get('list');
    if (marker.get(list).has('group')) {
        // make group visible
        map.addLayer(marker.get(list).get('group'));
    }
    if (!urlParams.has('id')) {
        // if no id open sidebar
        map.fitBounds(marker.get(list).get('group').getBounds());
        sidebar.open(list);
    }
    else {
        const id = urlParams.get('id');
        if (marker.has(list) && marker.get(list).has(id)) {
            // center and zoom id
            var bounds = [];
            marker.get(list).get(id).forEach(element => {
                if (element._latlngs) {
                    // Polygons
                    element._latlngs.forEach(latlng => {
                        bounds.push(latlng);
                    });
                    element.setStyle({
                        color: 'blue',
                        opacity: 1.0
                    });
                } else {
                    // Marker
                    bounds.push(element._latlng);
                }
            });

            map.fitBounds(L.latLngBounds(bounds), {
                maxZoom: 6
            });
        }

        // TODO: unhide?
    }
}
