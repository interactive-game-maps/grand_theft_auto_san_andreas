var map = L.map('map', {
    crs: L.CRS.Simple,
    // minZoom: 0,
    maxZoom: 8,
    zoom: 3
});

// Use tiled maps if possible, allows better zooming
// Make sure tiling scheme is growing downwards!
// https://github.com/Leaflet/Leaflet/issues/4333#issuecomment-199753161
// https://github.com/commenthol/gdal2tiles-leaflet
// ./gdal2tiles.py -l -p raster -w none -z 2-5 full_map.jpg map_tiles
var tiled_map = new L.tileLayer('map_tiles/{z}/{x}/{y}.png', {
    minNativeZoom: 2,
    maxNativeZoom: 5,
    attribution: '<a href="https://old.reddit.com/r/sanandreas/comments/9856u1/high_resolution_map_for_grand_theft_auto_san/">Map from TheCynicalAutist</a>, <a href="https://ehgames.com/gta/maplist/">Markers from ehgames.com</a>',
    noWrap: true,
    detectRetina: true
});

var baseMaps = {
    "Ingame map": tiled_map
};

// Make one base layer visible by default
tiled_map.addTo(map);

// Disable general editing
// L.PM.setOptIn(true);
var edit_layer = L.featureGroup(null, {
    pmIgnore: false
});
// edit_layer.pm.applyOptionsToAllChilds({
//     allowEditing: true
// });
map.pm.Toolbar.createCustomControl({
    name: 'export',
    block: 'custom',
    title: 'Export',
    toggle: false,
    onClick: () => {
        console.log(edit_layer.toGeoJSON());
        window.prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(edit_layer.toGeoJSON(), null, '    '));
    }
});
map.pm.addControls({
    position: 'bottomright',
    drawCircleMarker: false,
    oneBlock: true
});
map.pm.toggleControls(); // hide as default
map.pm.setGlobalOptions({
    layerGroup: edit_layer
});

{// Add sidebar to map
    var sidebar = L.control.sidebar({
        autopan: true,
        closeButton: true,
        contianer: 'sidebar',
        position: 'left'
    }).addTo(map);

    // make resetting localStorage possible
    sidebar.addPanel({
        id: 'reset',
        tab: '<i class="fas fa-trash"></i>',
        position: 'bottom',
        button: () => {
            localStorage.clear();
            location.reload();
        }
    });

    var edit_mode = false;
    sidebar.addPanel({
        id: 'edit',
        tab: '<i class="fas fa-map-marked"></i>',
        title: 'Add or edit marker',
        position: 'bottom',
        button: () => {
            if (!edit_mode) {
                // coordinate_finder.addTo(map);
                // coordinate_finder.setLatLng(map.getCenter());
                // coordinate_finder.bindPopup('Coordinate Finder').openPopup();
                edit_layer.addTo(map);
                // edit_layer.pm.enable();
                edit_mode = true;
            } else {
                // map.removeLayer(coordinate_finder);
                edit_layer.removeFrom(map);
                // edit_layer.pm.disable();
                edit_mode = false;
            }
            map.pm.toggleControls();
        }
    });

    sidebar.addPanel({
        id: 'visit-github',
        tab: '<i class="fab fa-github"></i>',
        position: 'bottom',
        button: 'https://github.com/interactive-game-maps/grand_theft_auto_san_andreas'
    });

    sidebar.addPanel({
        id: 'go-back',
        tab: '<i class="fas fa-arrow-left"></i>',
        position: 'bottom',
        button: 'https://interactive-game-maps.github.io/'
    });

    // make group visible on pane opening
    sidebar.on('content', (event) => {
        map.addLayer(marker.get(event.id).get('group'));
        history.replaceState({}, "", "index.html?list=" + event.id);
    });
}

// global list to access marker later on
var marker = new Map();
