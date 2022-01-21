class InteractiveMap {
    #cluster_group;
    #map;
    #sidebar;
    #custom_layers;
    #user_layers;
    #website_subdir = '';
    #tile_layers = new Object();
    #overlay_maps = new Object();
    #share_marker;

    #interactive_layers = new Map();

    #common_attribution = `
    <li><a href="https://github.com/Leaflet/Leaflet" title="Leaflet">Leaflet</a> under <a href="https://github.com/Leaflet/Leaflet/blob/ee71642691c2c71605bacff69456760cfbc80a2a/LICENSE">BSD2</a>.</li>
    <li><a href="https://github.com/Leaflet/Leaflet.markercluster" title="Leaflet.markercluster">Leaflet.markercluster</a> under <a href="https://github.com/Leaflet/Leaflet.markercluster/blob/31360f226e1a40c03c71d68b016891beb5e63370/MIT-LICENCE.txt">MIT</a>.</li>
    <li><a href="https://github.com/ghybs/Leaflet.FeatureGroup.SubGroup" title="Leaflet.FeatureGroup.SubGroup">Leaflet.FeatureGroup.SubGroup</a> under <a href="https://github.com/ghybs/Leaflet.FeatureGroup.SubGroup/blob/c7ec78b0cf13be39b00d46beb50c954b8b4c78bb/LICENSE">BSD2</a>.</li>
    <li><a href="https://github.com/noerw/leaflet-sidebar-v2" title="leaflet-sidebar-v2">leaflet-sidebar-v2</a> under <a href="https://github.com/noerw/leaflet-sidebar-v2/blob/4ceb0006647c33afff9982502fb5e572eb514158/LICENSE">MIT</a>.</li>
    <li><a href="https://github.com/geoman-io/leaflet-geoman" title="Leaflet-Geoman">Leaflet-Geoman</a> under <a href="https://github.com/geoman-io/leaflet-geoman/blob/1fdc918fa39ffa84327fdf639fa75865168f716d/LICENSE">MIT</a>.</li>
    <li>Icons from <a href="https://fontawesome.com/" title="Font Awesome">Font Awesome</a> under <a href="https://fontawesome.com/license">CCA4</a>.</li>
    `

    constructor(id, args) {
        let defaults = {
            maxClusterRadius: 20,
            attribution: '',
            max_good_zoom: 5,
            website_source: '',
            website_subdir: '',
            max_map_zoom: 8
        }
        let params = { ...defaults, ...args };

        this.#map = L.map(id, {
            crs: L.CRS.Simple,
            maxZoom: params.max_map_zoom,
        });;
        this.MAX_ZOOM = params.max_good_zoom;
        this.#website_subdir = params.website_subdir;

        this.#cluster_group = L.markerClusterGroup({
            spiderfyOnMaxZoom: true,
            maxClusterRadius: params.maxClusterRadius
        }).addTo(this.#map);

        this.#setUpToolbar();
        this.#setUpSidebar(params.attribution, params.website_source, this.#website_subdir);

        this.#user_layers = JSON.parse(localStorage.getItem(`${this.#website_subdir}:user_layers`));

        // clicking sets a marker that can be shared
        this.#share_marker = new ShareMarker([0, 0], this, {
            icon: Utils.getCustomIcon('fa-share-alt'),
            riseOnHover: true,
            draggable: true,
            pmIgnore: true
        });
        Utils.share_marker = this.#share_marker;

        this.#custom_layers = new CustomLayers(this);

        this.#map.on('overlayadd', event => {
            this.addUserLayer(event.name);
        });
        this.#map.on('overlayremove ', event => {
            this.removeUserLayer(event.name);

            if (this.hasLayer(this.#getLayerByName(event.name))) {
                this.#getLayerByName(event.name).removeAllHighlights();
            }
        });
    }

    addTileLayer(name, args, url = `map_tiles/{z}/{x}/{y}.png`) {
        let defaults = {
            minNativeZoom: 3,
            maxNativeZoom: 5,
            noWrap: true,
            detectRetina: true
        }
        let params = { ...defaults, ...args };
        params.maxNativeZoom = L.Browser.retina ? params.maxNativeZoom - 1 : params.maxNativeZoom; // 1 level LOWER for high pixel ratio device.


        // Use tiled maps if possible, allows better zooming
        // Make sure tiling scheme is growing downwards!
        // https://github.com/Leaflet/Leaflet/issues/4333#issuecomment-199753161
        // https://github.com/commenthol/gdal2tiles-leaflet
        // ./gdal2tiles.py -l -p raster -w none -z 2-5 full_map.jpg map_tiles
        var tile_layer = new L.tileLayer(url, params);

        // Make first base layer visible by default
        if (Object.keys(this.#tile_layers).length < 1) {
            tile_layer.addTo(this.#map);
        }

        this.#tile_layers[name] = tile_layer;
    }

    addInteractiveLayer(layer) {
        this.#interactive_layers.set(layer.id, layer);
    }

    hasLayer(id) {
        return this.#interactive_layers.has(id);
    }

    getLayer(id) {
        if (!this.#interactive_layers.has(id)) {
            return undefined;
        }

        return this.#interactive_layers.get(id);
    }

    #getLayerByName(name) {
        var interactive_layer = undefined;
        this.#interactive_layers.forEach((layer, id) => {
            if (layer.name == name) {
                interactive_layer = layer;
            }
        });

        return interactive_layer;
    }

    getLayers() {
        return this.#interactive_layers;
    }
    getClusterGroup() {
        return this.#cluster_group;
    }

    getMap() {
        return this.#map;
    }

    getSidebar() {
        return this.#sidebar;
    }

    getWebsiteSubdir() {
        return this.#website_subdir;
    }

    getMaxZoom() {
        return this.MAX_ZOOM;
    }

    getUserLayers() {
        return this.#user_layers;
    }

    removeUserLayer(name) {
        this.#user_layers = this.#user_layers.filter((value, index, array) => {
            return value != name;
        });
        localStorage.setItem(`${this.#website_subdir}:user_layers`, JSON.stringify(this.#user_layers));
    }

    addUserLayer(name) {
        if (!this.#user_layers.includes(name)) {
            this.#user_layers.push(name);
        }
        localStorage.setItem(`${this.#website_subdir}:user_layers`, JSON.stringify(this.#user_layers));
    }

    /**
     *
     * @param {L.LatLngBounds | L.LatLng[] | L.Point[] | Array[]} bounds Bounds to zoom to. Can be an array of points.
     */
    zoomToBounds(bounds) {
        this.#map.fitBounds(bounds, {
            maxZoom: this.MAX_ZOOM
        });
    }

    #setUpToolbar() {
        // Disable general editing
        L.PM.setOptIn(true);

        this.#map.pm.Toolbar.createCustomControl({
            name: 'add_layer',
            block: 'custom',
            title: 'Add custom layer',
            className: 'fas fa-plus',
            toggle: false,
            onClick: () => {
                this.#custom_layers.createLayer();
            }
        });
        this.#map.pm.Toolbar.createCustomControl({
            name: 'remove_layer',
            block: 'custom',
            title: 'Remove custom layer',
            className: 'fas fa-trash',
            toggle: false,
            onClick: () => {
                this.#custom_layers.removeLayer();
            }
        });
        this.#map.pm.Toolbar.createCustomControl({
            name: 'export_layer',
            block: 'custom',
            title: 'Export custom layer',
            className: 'fas fa-file-download',
            toggle: false,
            onClick: () => {
                this.#custom_layers.exportLayer();
            }
        });
        this.#map.pm.addControls({
            position: 'bottomright',
            drawCircleMarker: false,
            oneBlock: false
        });
        this.#map.pm.toggleControls(); // hide by default
    }

    #setUpSidebar(attribution, website, website_subdir) {
        this.#sidebar = L.control.sidebar({
            autopan: true,
            closeButton: true,
            container: 'sidebar',
            position: 'left'
        }).addTo(this.#map);

        // make resetting localStorage possible
        this.#sidebar.addPanel({
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

        this.#sidebar.addPanel({
            id: 'edit',
            tab: '<i class="fas fa-map-marked"></i>',
            title: 'Add or edit marker',
            position: 'bottom',
            button: () => {
                if (!CustomLayers.edit_mode) {
                    this.#custom_layers.enableEditing();
                } else {
                    this.#custom_layers.disableEditing();
                }
            }
        });

        this.#sidebar.addPanel({
            id: 'attributions',
            tab: '<i class="fas fa-info-circle"></i>',
            title: 'Attributions',
            position: 'bottom',
            pane: `<h3>This project uses:</h3><ul>${attribution}${this.#common_attribution}</ul>`
        });

        this.#sidebar.addPanel({
            id: 'visit-github',
            tab: '<i class="fab fa-github"></i>',
            position: 'bottom',
            button: website
        });

        this.#sidebar.addPanel({
            id: 'go-back',
            tab: '<i class="fas fa-arrow-left"></i>',
            position: 'bottom',
            button: 'https://interactive-game-maps.github.io/'
        });

        // make group visible on pane opening
        this.#sidebar.on('content', event => {
            if (event.id == 'attributions') return;

            this.#map.addLayer(this.#interactive_layers.get(event.id).getGroup());
            Utils.setHistoryState(event.id);
        });

        this.#sidebar.on('closing', () => {
            Utils.setHistoryState(undefined, undefined, this.#website_subdir);
        })
    }

    /**
     * Get the outer bounds of all layers on a map, including currently hidden layers
     * @returns L.LatLngBounds
     */
    #getBounds() {
        var bounds = L.latLngBounds();

        this.getLayers().forEach((layer, k) => {
            bounds.extend(layer.getGroupBounds());
        });

        return bounds;
    }

    finalize() {
        // Defining overlay maps - markers
        this.getLayers().forEach((layer, key) => {
            this.#overlay_maps[layer.name] = layer.getGroup();
        });

        // Add layer selection to map
        L.control.layers(this.#tile_layers, this.#overlay_maps, {
            hideSingleBase: true
        }).addTo(this.#map);

        // Add custom layers to map
        this.#custom_layers.showControls();

        // Show remembered layers
        if (!this.#user_layers) {
            this.#user_layers = new Array();
            this.getLayers().forEach((layer, id) => {
                if (layer.isDefault()) {
                    this.#user_layers.push(layer.name);
                }
            });
        }
        this.getLayers().forEach((layer, id) => {
            if (this.#user_layers.includes(layer.name)) {
                layer.show();
            }
        });
        this.#user_layers.forEach(layer => {
            if (this.#custom_layers.hasLayer(layer)) {
                this.#map.addLayer(this.#custom_layers.getLayer(layer));
            }
        });

        // Center view over map
        this.zoomToBounds(this.#getBounds());

        // hide all previously checked marker
        this.getLayers().forEach((layer, layer_id) => {
            layer.getAllLayers().forEach((array, feature_id) => {
                array.forEach(feature => {
                    // Remove if checked
                    if (localStorage.getItem(`${this.#website_subdir}:${layer_id}:${feature_id}`)) {
                        layer.removeLayer(feature);
                    }
                });
            });
        });

        // Search in url for marker and locate them
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if (urlParams.has('share')) {
            const share = urlParams.get('share');

            let latlng = share.split(",");
            this.#share_marker.move([latlng[1], latlng[0]]);

            this.#share_marker.highlight();
            this.#share_marker.zoomTo();
        } else if (urlParams.has('list')) {
            const list = urlParams.get('list');

            if (this.hasLayer(list)) {
                var layer = this.getLayer(list);;

                // make group visible
                layer.show();

                if (!urlParams.has('id')) {
                    layer.zoomTo();

                    // if no id open sidebar
                    this.#sidebar._tabitems.every(element => {
                        if (element._id == list) {
                            this.#sidebar.open(list);
                            return false;
                        }
                        return true;
                    });
                } else {
                    const id = urlParams.get('id');

                    if (layer.hasFeature(id)) {
                        layer.highlightFeature(id);
                        layer.zoomToFeature(id);
                        this.#map.on('click', Utils.removeAllHighlights);
                    }

                    // TODO: unhide?
                }
            }
        }


        // Update popup locations after image loading
        // https://github.com/Leaflet/Leaflet/issues/5484#issuecomment-299949921
        document.querySelector(".leaflet-popup-pane").addEventListener("load", function (event) {
            var tagName = event.target.tagName,
                popup = this.#map._popup; // Last open Popup.

            if (tagName === "IMG" && popup && !popup._updated) {
                popup._updated = true; // Assumes only 1 image per Popup.
                popup.update();
            }
        }.bind(this), true); // Capture the load event, because it does not bubble.
    }
}
