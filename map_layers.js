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
    attribution: '<a href="https://old.reddit.com/r/sanandreas/comments/9856u1/high_resolution_map_for_grand_theft_auto_san/">Map from TheCynicalAutist</a>, <a href="https://ehgames.com/gta/maplist/">Marker locations from ehgames.com</a>',
    noWrap: true,
    detectRetina: true
});

var baseMaps = {
    "Ingame map": tiled_map
};

// Make one base layer visible by default
tiled_map.addTo(map);

{ // Edit toolbar
    // Disable general editing
    // L.PM.setOptIn(true);

    // edit_layer.pm.applyOptionsToAllChilds({
    //     allowEditing: true
    // });

    map.pm.Toolbar.createCustomControl({
        name: 'add_layer',
        block: 'custom',
        title: 'Add custom layer',
        className: 'fas fa-plus',
        toggle: false,
        onClick: () => {
            if (!create_custom_layer()) {
                return;
            }

            var active_custom_layers = custom_layer_controls.getOverlays({
                only_active: true
            });

            var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]]

            // Disable current active layer
            map.removeLayer(active_custom_layer);
        }
    });
    map.pm.Toolbar.createCustomControl({
        name: 'remove_layer',
        block: 'custom',
        title: 'Remove custom layer',
        className: 'fas fa-trash',
        toggle: false,
        onClick: () => {
            if (!confirm('Really delete the current custom marker layer?')) {
                return;
            }

            // should be only one because we're in edit mode
            var active_custom_layers = custom_layer_controls.getOverlays({
                only_active: true
            });
            var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]]

            localStorage.removeItem(Object.keys(active_custom_layers)[0]);
            custom_layer_controls.removeLayer(active_custom_layer);
            map.removeLayer(active_custom_layer);
            delete custom_layers[Object.keys(active_custom_layers)[0]];

            // Remove layer from controls
            show_custom_layer_controls();
            edit_mode = false;
            map.pm.toggleControls();
        }
    });
    map.pm.Toolbar.createCustomControl({
        name: 'export_layer',
        block: 'custom',
        title: 'Export custom layer',
        className: 'fas fa-file-download',
        toggle: false,
        onClick: () => {
            var active_custom_layers = custom_layer_controls.getOverlays({
                only_active: true
            });

            var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]]

            console.log(active_custom_layer.toGeoJSON());
            window.prompt("Copy to clipboard: Ctrl+C, Enter", JSON.stringify(active_custom_layer.toGeoJSON()));
        }
    });
    map.pm.addControls({
        position: 'bottomright',
        drawCircleMarker: false,
        oneBlock: false
    });
    map.pm.toggleControls(); // hide as default

    // Save manual edits before leaving
    window.onbeforeunload = () => {
        var array = [];

        if (Object.keys(custom_layers).length < 1) {
            localStorage.removeItem('custom_layers');
            return;
        }

        Object.keys(custom_layers).forEach(key => {
            localStorage.setItem(key, JSON.stringify(custom_layers[key].toGeoJSON()));
            array.push(key);
        });

        localStorage.setItem('custom_layers', JSON.stringify(array));
    };
}

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
            if (!confirm('Really delete all marked locations and all custom marker layers?')) {
                return;
            }

            custom_layers = {};
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
                var active_custom_layers = custom_layer_controls.getOverlays({
                    only_active: true
                });

                if (Object.keys(active_custom_layers).length < 1) {
                    if (!create_custom_layer()) {
                        return;
                    }
                } else if (Object.keys(active_custom_layers).length > 1) {
                    alert('Please select only one custom layer to edit');
                    return;
                }

                active_custom_layers = custom_layer_controls.getOverlays({
                    only_active: true
                });

                var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]];

                map.pm.setGlobalOptions({
                    layerGroup: active_custom_layer
                });

                edit_mode = true;
                hide_custom_layer_controls();
            } else {
                edit_mode = false;
                show_custom_layer_controls();
            }
            map.pm.toggleControls();
        }
    });

    sidebar.addPanel({
        id: 'attributions',
        tab: '<i class="fas fa-info-circle"></i>',
        title: 'Attributions',
        position: 'bottom',
        pane: `
            <div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
            <div>Icons made by <a href="https://gtaforums.com/topic/893039-remastered-radar-icons-sa/" title="CRRPGMykael">CRRPGMykael</a> from <a href="https://gtaforums.com/" title="GTAFORUMS">https://gtaforums.com/</a></div>
            <div>Spray tag and Snapshot images from <a href="https://gta.fandom.com/wiki/" title="https://gta.fandom.com/">https://gta.fandom.com/</a></div>
            <div>Horseshoe and Oyster images from <a href="http://en.wikigta.org/wiki/Main_Page" title="http://en.wikigta.org/wiki/Main_Page">http://en.wikigta.org/wiki/Main_Page</a></div>
            `
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
        if (event.id == 'attributions') return;

        map.addLayer(marker.get(event.id).get('group'));
        history.replaceState({}, "", "index.html?list=" + event.id);
    });
}

// global list to access marker later on
var marker = new Map();
