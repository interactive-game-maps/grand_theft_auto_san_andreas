{ // Edit toolbar
    // Disable general editing
    L.PM.setOptIn(true);

    map.pm.Toolbar.createCustomControl({
        name: 'add_layer',
        block: 'custom',
        title: 'Add custom layer',
        className: 'fas fa-plus',
        toggle: false,
        onClick: () => {
            if (!createCustomLayer()) {
                return;
            }

            var active_custom_layers = custom_layer_controls.getOverlays({
                only_active: true
            });
            var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]];
            map.off('pm:create');

            // Disable current active layer
            map.removeLayer(active_custom_layer);
            L.PM.setOptIn(true);
            L.PM.reInitLayer(active_custom_layer);

            active_custom_layers = custom_layer_controls.getOverlays({
                only_active: true
            });
            active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]];

            L.PM.setOptIn(true);
            L.PM.reInitLayer(active_custom_layer);

            map.on('pm:create', e => {
                createEditablePopup(e.layer);
            });
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

            localStorage.removeItem(`${website_subdir}:${Object.keys(active_custom_layers)[0]}`);
            custom_layer_controls.removeLayer(active_custom_layer);
            map.removeLayer(active_custom_layer);
            delete custom_layers[Object.keys(active_custom_layers)[0]];

            // Remove layer from controls
            showCustomLayerControls();
            edit_mode = false;
            map.pm.toggleControls();

            // make sure editing is disabled
            map.pm.disableDraw();
            map.pm.disableGlobalEditMode();
            map.pm.disableGlobalDragMode();
            map.pm.disableGlobalRemovalMode();
            map.pm.disableGlobalCutMode();
            map.pm.disableGlobalRotateMode();
        }
    });
    map.pm.Toolbar.createCustomControl({
        name: 'export_layer',
        block: 'custom',
        title: 'Export custom layer',
        className: 'fas fa-file-download',
        toggle: false,
        onClick: () => {
            // should be only one because we're in edit mode
            var active_custom_layers = custom_layer_controls.getOverlays({
                only_active: true
            });

            var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]]

            console.log(active_custom_layer.toGeoJSON());
            download(Object.keys(active_custom_layers)[0] + '.json', JSON.stringify(active_custom_layer.toGeoJSON(), null, '    '));
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
            localStorage.removeItem(`${website_subdir}:custom_layers`);
            return;
        }

        Object.keys(custom_layers).forEach(key => {
            localStorage.setItem(`${website_subdir}:${key}`, JSON.stringify(custom_layers[key].toGeoJSON()));
            array.push(key);
        });

        localStorage.setItem(`${website_subdir}:custom_layers`, JSON.stringify(array));
    };

    // The unload method seems unreliable so also save every 5 minutes
    var interval = window.setInterval(() => {
        var array = [];

        if (Object.keys(custom_layers).length < 1) {
            localStorage.removeItem(`${website_subdir}:custom_layers`);
            return;
        }

        Object.keys(custom_layers).forEach(key => {
            localStorage.setItem(`${website_subdir}:${key}`, JSON.stringify(custom_layers[key].toGeoJSON()));
            array.push(key);
        });

        localStorage.setItem(`${website_subdir}:custom_layers`, JSON.stringify(array));
    }, 300000);
}

{// Add sidebar to map
    var sidebar = L.control.sidebar({
        autopan: true,
        closeButton: true,
        container: 'sidebar',
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

            for (var key in localStorage) {
                if (key.startsWith(`${website_subdir}:`)) {
                    localStorage.removeItem(key);
                }
            };

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
                    if (!createCustomLayer()) {
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

                // Enable general editing for new markers
                L.PM.setOptIn(false);
                L.PM.reInitLayer(active_custom_layer);

                map.pm.setGlobalOptions({
                    layerGroup: active_custom_layer,
                    markerStyle: {
                        icon: getCustomIcon(Object.keys(active_custom_layers)[0].substring(0, 2))
                    }
                });

                map.on('pm:create', e => {
                    createEditablePopup(e.layer);
                });

                edit_mode = true;
                hideCustomLayerControls();
                map.off('click', moveShareMarker);
                setHistoryState();
            } else {
                var active_custom_layers = custom_layer_controls.getOverlays({
                    only_active: true
                });

                var active_custom_layer = custom_layers[Object.keys(active_custom_layers)[0]];

                // Disable general editing for new markers
                L.PM.setOptIn(true);
                L.PM.reInitLayer(active_custom_layer);

                // make sure editing is disabled
                map.pm.disableDraw();
                map.pm.disableGlobalEditMode();
                map.pm.disableGlobalDragMode();
                map.pm.disableGlobalRemovalMode();
                map.pm.disableGlobalCutMode();
                map.pm.disableGlobalRotateMode();

                edit_mode = false;
                showCustomLayerControls();

                map.off('pm:create');
                map.on('click', moveShareMarker);
            }
            map.pm.toggleControls();
        }
    });

    sidebar.addPanel({
        id: 'attributions',
        tab: '<i class="fas fa-info-circle"></i>',
        title: 'Attributions',
        position: 'bottom',
        pane: attribution
    });

    sidebar.addPanel({
        id: 'visit-github',
        tab: '<i class="fab fa-github"></i>',
        position: 'bottom',
        button: website
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
        setHistoryState(event.id);
    });

    sidebar.on('closing', () => {
        setHistoryState();
    })
}

// global list to access marker later on
var marker = new Map();

// initialize default layers variable where the layers can be added to later on
var default_layers = [];
