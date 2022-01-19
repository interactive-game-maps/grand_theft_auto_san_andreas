class CustomLayers {
    #custom_layers;
    #custom_layer_controls;
    static edit_mode = false;

    constructor() {
        this.#custom_layers = new Map();

        this.#loadFromStorage();

        this.#extendDefaultLayerControl();
        this.#custom_layer_controls = new L.control.layers(null, Object.fromEntries(this.#custom_layers), {
            collapsed: false
        });
        this.showControls();

        // Save manual edits before leaving
        window.onbeforeunload = this.#saveToStorage.bind(this);
        // The unload method seems sometimes unreliable so also save every 5 minutes
        window.setInterval(this.#saveToStorage.bind(this), 300000);
    }

    #loadFromStorage() {
        if (localStorage.getItem(`${website_subdir}:custom_layers`)) {
            JSON.parse(localStorage.getItem(`${website_subdir}:custom_layers`)).forEach(id => {
                if (!localStorage.getItem(`${website_subdir}:${id}`)) {
                    return;
                }

                var geojson = JSON.parse(localStorage.getItem(`${website_subdir}:${id}`));

                var layer = L.geoJSON(geojson, {
                    pointToLayer: (feature, latlng) => {
                        return L.marker(latlng, {
                            icon: getCustomIcon(id.substring(0, 2)),
                            riseOnHover: true
                        });
                    },
                    onEachFeature: (feature, l) => {
                        this.#createPopup(l);
                    },
                    pmIgnore: false
                });
                this.#custom_layers.set(id, layer);
            });
        }
    }

    getCount() {
        return this.#custom_layers.size;
    }

    #saveToStorage() {
        var array = new Array();

        if (this.getCount() < 1) {
            localStorage.removeItem(`${website_subdir}:custom_layers`);
            return;
        }

        this.#custom_layers.forEach((layer, id) => {
            localStorage.setItem(`${website_subdir}:${id}`, JSON.stringify(layer.toGeoJSON()));
            array.push(id);
        });

        localStorage.setItem(`${website_subdir}:custom_layers`, JSON.stringify(array));
    }

    #getActiveLayerCount() {
        var active_layers = this.#custom_layer_controls.getOverlays({
            only_active: true
        });

        return Object.keys(active_layers).length;
    }

    #getActiveLayer() {
        if (this.#getActiveLayerCount() != 1) {
            return undefined;
        }

        return this.#custom_layers.get(this.#getActiveLayerId());
    }

    #getActiveLayerId() {
        var active_layers = this.#custom_layer_controls.getOverlays({
            only_active: true
        });

        return Object.keys(active_layers)[0];
    }

    showControls() {
        if (this.getCount() > 0) {
            // Don't know why I have to create a new control but adding the old one is giving me an exception
            this.#custom_layer_controls = new L.control.layers(null, Object.fromEntries(this.#custom_layers), {
                collapsed: false
            });
            map.addControl(this.#custom_layer_controls);
        } else {
            this.hideControls();
        }
    }

    hideControls() {
        map.removeControl(this.#custom_layer_controls);
    }

    hasLayer(id) {
        return this.#custom_layers.has(id);
    }

    getLayer(id) {
        return this.#custom_layers.get(id);
    }

    enableEditing() {
        if (this.#getActiveLayerCount() < 1) {
            if (!this.createLayer()) {
                return;
            }
        } else if (this.#getActiveLayerCount() > 1) {
            alert('Please select only one custom layer to edit');
            return;
        }

        var active_layer = this.#getActiveLayer();
        if (!active_layer) {
            return;
        }

        // Enable general editing for new markers
        L.PM.setOptIn(false);
        L.PM.reInitLayer(active_layer);

        map.pm.toggleControls();
        map.pm.setGlobalOptions({
            layerGroup: active_layer,
            markerStyle: {
                icon: getCustomIcon(this.#getActiveLayerId().substring(0, 2))
            }
        });

        CustomLayers.edit_mode = true;
        this.hideControls();
        share_marker.turnOff();
        setHistoryState();

        map.on('pm:create', event => {
            this.#createPopup(event.layer);
        });
    }

    disableEditing() {
        L.PM.setOptIn(true);

        var active_layer = this.#getActiveLayer();
        if (active_layer) {
            L.PM.reInitLayer(active_layer);
        }

        map.pm.disableDraw();
        map.pm.disableGlobalEditMode();
        map.pm.disableGlobalDragMode();
        map.pm.disableGlobalRemovalMode();
        map.pm.disableGlobalCutMode();
        map.pm.disableGlobalRotateMode();
        map.pm.toggleControls();

        CustomLayers.edit_mode = false;
        this.showControls();
        map.off('pm:create');
        share_marker.turnOn();
    }

    createLayer() {
        var active_layer = this.#getActiveLayer();

        var layer_id = prompt("Unique new layer name");

        if (layer_id == null || layer_id == '' || layer_id in custom_layers) {
            return false;
        }

        var new_layer = L.featureGroup(null, {
            pmIgnore: false
        });

        this.#custom_layers.set(layer_id, new_layer);

        // Refresh layer to controls
        this.#custom_layer_controls.addOverlay(new_layer, layer_id);

        // Display new layer and active
        new_layer.addTo(map);

        map.pm.setGlobalOptions({
            layerGroup: new_layer
        });

        if (CustomLayers.edit_mode) {
            this.#switchLayer(active_layer, new_layer);
        }

        return true;
    }

    #switchLayer(old_layer, new_layer) {
        // We should be in edit mode here
        map.off('pm:create');

        // Disable current active layer
        map.removeLayer(old_layer);
        L.PM.setOptIn(true);
        L.PM.reInitLayer(old_layer);

        L.PM.setOptIn(false);
        L.PM.reInitLayer(new_layer);

        map.on('pm:create', event => {
            this.#createPopup(event.layer);
        });
    }

    removeLayer() {
        if (!CustomLayers.edit_mode) {
            return;
        }

        if (!confirm('Really delete the current custom marker layer?')) {
            return;
        }

        // should be only one because we're in edit mode
        var active_layer = this.#getActiveLayer();

        if (active_layer) {
            var active_layer_id = this.#getActiveLayerId();
            localStorage.removeItem(`${website_subdir}:${active_layer_id}`);
            this.#custom_layer_controls.removeLayer(active_layer);
            map.removeLayer(active_layer);
            this.#custom_layers.delete(active_layer_id);

            // Manually trigger the events that should fire in 'overlayremove'
            {
                user_layers = user_layers.filter((value, index, array) => {
                    return value != active_layer_id;
                });
                localStorage.setItem(`${website_subdir}:user_layers`, JSON.stringify(user_layers));
            }
        }

        this.disableEditing();
    }

    exportLayer() {
        var active_layer = this.#getActiveLayer();

        if (!active_layer) {
            return;
        }

        download(this.#getActiveLayerId() + '.json', JSON.stringify(active_layer.toGeoJSON(), null, '    '));
    }

    #createPopup(layer) {
        layer.bindPopup(() => {
            var html = document.createElement('div');

            var id_p = document.createElement('p');

            var id_input = document.createElement('input');
            id_input.setAttribute('type', 'text');
            id_input.id = layer._leaflet_id + ':id';

            var id_label = document.createElement('label');
            id_label.htmlFor = id_input.id;
            id_label.innerHTML = 'ID: ';

            if (!layer.feature) {
                layer.feature = {};
                layer.feature.type = 'Feature';
            }

            if (!layer.feature.properties) {
                layer.feature.properties = {};
            }

            if (layer.feature.properties.id) {
                id_input.value = layer.feature.properties.id;
            }

            id_input.addEventListener('change', event => {
                layer.feature.properties.id = event.target.value;
            });

            id_p.appendChild(id_label);
            id_p.appendChild(id_input);
            html.appendChild(id_p);

            var image_id_p = document.createElement('p');

            var image_id_input = document.createElement('input');
            image_id_input.setAttribute('type', 'text');
            image_id_input.id = layer._leaflet_id + ':image_id';

            var image_id_label = document.createElement('label');
            image_id_label.htmlFor = image_id_input.id;
            image_id_label.innerHTML = 'Image ID: ';

            if (layer.feature.properties.image_id) {
                image_id_input.value = layer.feature.properties.image_id;
            }

            image_id_input.addEventListener('change', event => {
                layer.feature.properties.image_id = event.target.value;
            });

            image_id_p.appendChild(image_id_label);
            image_id_p.appendChild(image_id_input);
            html.appendChild(image_id_p);

            var image_url_p = document.createElement('p');

            var image_url_input = document.createElement('input');
            image_url_input.setAttribute('type', 'text');
            image_url_input.id = layer._leaflet_id + ':name';

            var image_url_label = document.createElement('label');
            image_url_label.htmlFor = image_url_input.id;
            image_url_label.innerHTML = 'Name: ';

            if (layer.feature.properties.image_link) {
                image_url_input.value = layer.feature.properties.image_link;
            }

            image_url_input.addEventListener('change', event => {
                layer.feature.properties.image_link = event.target.value;
            });

            image_url_p.appendChild(image_url_label);
            image_url_p.appendChild(image_url_input);
            html.appendChild(image_url_p);

            var video_id_p = document.createElement('p');

            var video_id_input = document.createElement('input');
            video_id_input.setAttribute('type', 'text');
            video_id_input.id = layer._leaflet_id + ':video_id';

            var video_id_label = document.createElement('label');
            video_id_label.htmlFor = video_id_input.id;
            video_id_label.innerHTML = 'Video ID: ';

            if (layer.feature.properties.video_id) {
                video_id_input.value = layer.feature.properties.video_id;
            }

            video_id_input.addEventListener('change', event => {
                layer.feature.properties.video_id = event.target.value;
            });

            video_id_p.appendChild(video_id_label);
            video_id_p.appendChild(video_id_input);
            html.appendChild(video_id_p);

            var description_p = document.createElement('p');

            var description_input = document.createElement('input');
            description_input.setAttribute('type', 'text');
            description_input.id = layer._leaflet_id + ':description';

            var description_label = document.createElement('label');
            description_label.htmlFor = description_input.id;
            description_label.innerHTML = 'Description: ';

            if (layer.feature.properties.description) {
                description_input.value = layer.feature.properties.description;
            }

            description_input.addEventListener('change', event => {
                layer.feature.properties.description = event.target.value;
            });

            description_p.appendChild(description_label);
            description_p.appendChild(description_input);
            html.appendChild(description_p);

            return html;
        });

        layer.on('popupopen', event => {
            setHistoryState();
            share_marker.turnOff();
        });

        layer.on('popupclose', event => {
            if (CustomLayers.edit_mode) return;

            share_marker.prevent();
        });
    }

    #extendDefaultLayerControl() {
        // Add method to layer control class
        // https://stackoverflow.com/a/51484131
        L.Control.Layers.include({
            getOverlays: function (args = {}) {
                var defaults = {
                    only_active: false
                };
                var params = { ...defaults, ...args } // right-most object overwrites

                // create hash to hold all layers
                var control, layers;
                layers = {};
                control = this;

                // loop thru all layers in control
                control._layers.forEach(function (obj) {
                    var layerName;

                    // check if layer is an overlay
                    if (obj.overlay) {
                        // get name of overlay
                        layerName = obj.name;
                        // store whether it's present on the map or not
                        if (params.only_active && !map.hasLayer(obj.layer)) {
                            return;
                        }
                        return layers[layerName] = map.hasLayer(obj.layer);
                    }
                });

                return layers;
            }
        });
    }
}
