// Defining overlay maps - markers
var overlayMaps = {
    "Spray Tags": tags_group,
    "Snapshots": snapshots_group,
    "Horseshoes": horseshoes_group,
    "Oysters": oyster_group,
    "Cob Bribes": cop_bribes_group,
    "Busted Warps": busted_warps_group,
    "Death Warps": death_warps_group
};

// Make overlay layer visible by default
map.addLayer(tags_group);
map.addLayer(snapshots_group);
map.addLayer(horseshoes_group);
map.addLayer(oyster_group);

// Center view over map
map.fitBounds([[0, 0], [-192, 192]]);

// Add user selection to map
L.control.layers(baseMaps, overlayMaps).addTo(map);

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
        sidebar.open(list);
    }
    else {
        const id = urlParams.get('id');
        if (marker.has(list) && marker.get(list).has(id)) {
            // center and zoom id
            map.fitBounds(L.latLngBounds([marker.get(list).get(id).getLatLng()]));
        }
    }
}
