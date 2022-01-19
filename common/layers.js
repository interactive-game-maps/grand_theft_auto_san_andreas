// global list to access marker later on
var interactive_layers = new Map();

// initialize default layers variable where the layers can be added to later on
var default_layers = [];

var common_attribution = `
<li><a href="https://github.com/Leaflet/Leaflet" title="Leaflet">Leaflet</a> under <a href="https://github.com/Leaflet/Leaflet/blob/ee71642691c2c71605bacff69456760cfbc80a2a/LICENSE">BSD2</a>.</li>
<li><a href="https://github.com/Leaflet/Leaflet.markercluster" title="Leaflet.markercluster">Leaflet.markercluster</a> under <a href="https://github.com/Leaflet/Leaflet.markercluster/blob/31360f226e1a40c03c71d68b016891beb5e63370/MIT-LICENCE.txt">MIT</a>.</li>
<li><a href="https://github.com/ghybs/Leaflet.FeatureGroup.SubGroup" title="Leaflet.FeatureGroup.SubGroup">Leaflet.FeatureGroup.SubGroup</a> under <a href="https://github.com/ghybs/Leaflet.FeatureGroup.SubGroup/blob/c7ec78b0cf13be39b00d46beb50c954b8b4c78bb/LICENSE">BSD2</a>.</li>
<li><a href="https://github.com/noerw/leaflet-sidebar-v2" title="leaflet-sidebar-v2">leaflet-sidebar-v2</a> under <a href="https://github.com/noerw/leaflet-sidebar-v2/blob/4ceb0006647c33afff9982502fb5e572eb514158/LICENSE">MIT</a>.</li>
<li><a href="https://github.com/geoman-io/leaflet-geoman" title="Leaflet-Geoman">Leaflet-Geoman</a> under <a href="https://github.com/geoman-io/leaflet-geoman/blob/1fdc918fa39ffa84327fdf639fa75865168f716d/LICENSE">MIT</a>.</li>
<li>Icons from <a href="https://fontawesome.com/" title="Font Awesome">Font Awesome</a> under <a href="https://fontawesome.com/license">CCA4</a>.</li>
`

var marker_cluster = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    maxClusterRadius: 20
}).addTo(map);

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
            custom_layers.createLayer();
        }
    });
    map.pm.Toolbar.createCustomControl({
        name: 'remove_layer',
        block: 'custom',
        title: 'Remove custom layer',
        className: 'fas fa-trash',
        toggle: false,
        onClick: () => {
            custom_layers.removeLayer();
        }
    });
    map.pm.Toolbar.createCustomControl({
        name: 'export_layer',
        block: 'custom',
        title: 'Export custom layer',
        className: 'fas fa-file-download',
        toggle: false,
        onClick: () => {
            custom_layers.exportLayer();
        }
    });
    map.pm.addControls({
        position: 'bottomright',
        drawCircleMarker: false,
        oneBlock: false
    });
    map.pm.toggleControls(); // hide by default
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

            window.onbeforeunload = () => { };

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
            if (!CustomLayers.edit_mode) {
                custom_layers.enableEditing();
            } else {
                custom_layers.disableEditing();
            }
        }
    });

    sidebar.addPanel({
        id: 'attributions',
        tab: '<i class="fas fa-info-circle"></i>',
        title: 'Attributions',
        position: 'bottom',
        pane: `<h3>This project uses:</h3><ul>${attribution}${common_attribution}</ul>`
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

        map.addLayer(interactive_layers.get(event.id).feature_group);
        setHistoryState(event.id);
    });

    sidebar.on('closing', () => {
        setHistoryState();
    })
}
