/**
 * A general interactive map layer which includes marker and polygons created from geoJSON features.
 */
class InteractiveLayer {
    #create_checkbox;
    #ignore_next_resize = new Set(); // set of entries to skip initial resize call
    #feature_group;
    #geojsons = new Array();
    #highlighted_layers = new Array();
    #interactive_map;
    #is_default;
    #layers = new Map();
    #polygon_style_highlights = new Map();
    #resize_observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            let feature_id = entry.target.closest('.popup-id').id.split(':')[2];

            // The observer also fires when it gets added so ignore that resize 'event'
            // or else we'll get a infinite loop
            if (this.#ignore_next_resize.has(feature_id)) {
                this.#ignore_next_resize.delete(feature_id);
                continue;
            }

            this.#getLayers(feature_id).forEach(layer => {
                if (layer.isPopupOpen()) {
                    this.#resize_observer.unobserve(entry.target);

                    // This changes the content of the element and the observer looses track of it because of that
                    // That's why we're re-adding the observer
                    layer.getPopup().update();

                    // The observer also fires when it gets added so ignore that resize 'event'
                    // or else we'll get a infinite loop
                    this.#ignore_next_resize.add(feature_id);
                    for (const element of document.getElementById(`popup:${this.id}:${feature_id}`).getElementsByClassName('popup-media')) {
                        this.#resize_observer.observe(element);
                    }
                }
            });
        }
    });
    #sidebar;
    #sidebar_list_html = undefined;
    #website_subdir;

    #default_onEachFeature = function (feature, layer) { };
    #default_pointToLayer = function (feature, latlng) {
        return L.marker(latlng, {
            icon: Utils.getCustomIcon(this.id),
            riseOnHover: true
        });
    };
    #default_polygon_style = function (feature) { return {}; };
    #default_polygon_style_highlight = function () {
        return {
            opacity: 1.0,
            fillOpacity: 0.7
        }
    };
    #default_sidebar_icon_html = function () {
        return `<img class="sidebar-image" src="images/icons/${this.id}.png" />`;
    };

    /**
     * A layer containing marker and polygons created from geoJSON features.
     * Multiple features can form a logical combined feature by having the same feature ID.
     * @param {string} id Unique layer id
     * @param {string} geojson geoJSON including features to add to the layer
     * @param {InteractiveMap} interactive_map Interactive map
     * @param {object} [args] Object containing various optional arguments
     * @param {string} [args.name=this.id] Human readable display name of the layer. Default: `this.id`
     * @param {boolean} [args.create_checkbox=false] Create a sidebar with a trackable list. Default: false
     * @param {boolean} [args.create_feature_popup=false] Create a popup for the first batch of geoJSON features. Default: false
     * @param {boolean} [args.is_default=false] Show this layer by default if a user visits the map for the first time. Default: false
     * @param {string | function} [args.sidebar_icon_html=function () { return `<img class="sidebar-image" src="images/icons/${this.id}.png" />`; }] A html string for the sidebar icon. Can be a function which returns a html string. The function has access to values of this layer e.g. the `this.id`.
     * @param {function} [args.onEachFeature=function (feature, layer) { }] A function with stuff to do on each feature. Has access to values of this layer e.g. `this.id`. Default: `function (feature, layer) { }`
     * @param {function} [args.pointToLayer=function (feature, latlng) { return L.marker(latlng, { icon: Utils.getCustomIcon(this.id), riseOnHover: true }); }] A function describing what to do when putting a geoJSON point to a layer.
     * @param {function} [args.coordsToLatLng=L.GeoJSON.coordsToLatLng] A function describing converting geoJSON coordinates to leaflets latlng.
     * @param {object | function} [args.polygon_style=function (feature) { return {}; }] An object or function returning an object with L.Path options. https://leafletjs.com/reference.html#path
     * @param {object | function} [args.polygon_style_highlight=function () { return { opacity: 1.0, fillOpacity: 0.7 }}] An object or function returning an object with L.Path options. https://leafletjs.com/reference.html#path
     * @param {L.LayerGroup} [args.feature_group=L.featureGroup.subGroup(this.#interactive_map.getClusterGroup())] The group all geoJson features get added to. Defaults to the default marker cluster.
     */
    constructor(id, geojson, interactive_map, args) {
        let defaults = {
            name: id,
            create_checkbox: false,
            create_feature_popup: false,
            is_default: false,
            sidebar_icon_html: this.#default_sidebar_icon_html,
            pointToLayer: this.#default_pointToLayer,
            onEachFeature: this.#default_onEachFeature,
            polygon_style: this.#default_polygon_style,
            polygon_style_highlight: this.#default_polygon_style_highlight,
            coordsToLatLng: L.GeoJSON.coordsToLatLng
        };

        let params = { ...defaults, ...args };

        this.id = id;
        this.name = params.name;
        this.#interactive_map = interactive_map;

        this.#create_checkbox = params.create_checkbox;
        this.#is_default = params.is_default;
        this.#feature_group = params.feature_group ? params.feature_group : L.featureGroup.subGroup(this.#interactive_map.getClusterGroup());
        this.#sidebar = this.#interactive_map.getSidebar();
        this.#website_subdir = this.#interactive_map.getWebsiteSubdir();

        if (this.#create_checkbox) {
            this.#sidebar_list_html = this.#createSidebarTab(params.sidebar_icon_html);
        }

        this.addGeoJson(geojson, {
            create_feature_popup: params.create_feature_popup,
            pointToLayer: params.pointToLayer,
            onEachFeature: params.onEachFeature,
            polygon_style: params.polygon_style,
            polygon_style_highlight: params.polygon_style_highlight,
            coordsToLatLng: params.coordsToLatLng
        });
    }

    /**
     * Add another geoJSON to this layer group.
     * @param {string} geojson geoJSON containing the features to add
     * @param {object} [args] Optional arguments
     * @param {boolean} [args.create_feature_popup=false] Create a popup for each feature
     * @param {function} [args.onEachFeature=function (feature, layer) { }] A function with stuff to do on each feature. Has access to values of this layer e.g. `this.id`. Default: `function (feature, layer) { }`
     * @param {function} [args.pointToLayer=function (feature, latlng) { return L.marker(latlng, { icon: Utils.getCustomIcon(this.id), riseOnHover: true }); }] A function describing what to do when putting a geoJSON point to a layer.
     * @param {function} [args.coordsToLatLng=L.GeoJSON.coordsToLatLng] A function describing converting geoJSON coordinates to leaflets latlng.
     * @param {object | function} [args.polygon_style=function (feature) { return {}; }] An object or function returning an object with L.Path options. https://leafletjs.com/reference.html#path
     * @param {object | function} [args.polygon_style_highlight=function () { return { opacity: 1.0, fillOpacity: 0.7 }}] An object or function returning an object with L.Path options. https://leafletjs.com/reference.html#path
     */
    addGeoJson(geojson, args) {
        let defaults = {
            create_feature_popup: false,
            pointToLayer: this.#default_pointToLayer,
            onEachFeature: this.#default_onEachFeature,
            polygon_style: this.#default_polygon_style,
            polygon_style_highlight: this.#default_polygon_style_highlight,
            coordsToLatLng: L.GeoJSON.coordsToLatLng
        };

        let params = { ...defaults, ...args };
        var onEachFeature = params.onEachFeature.bind(this);

        var geojson_layer = L.geoJSON(geojson, {
            pointToLayer: params.pointToLayer.bind(this),
            onEachFeature: (feature, layer) => {
                if (this.#create_checkbox) {
                    this.#createSidebarCheckbox(feature);
                }

                if (params.create_feature_popup) {
                    this.#createFeaturePopup(feature, layer);
                }

                onEachFeature(feature, layer);

                this.#setFeature(feature.properties.id, layer);
            },
            coordsToLatLng: params.coordsToLatLng.bind(this),
            style: params.polygon_style
        });

        this.#geojsons.push(geojson_layer);

        if (params.polygon_style_highlight instanceof Function) {
            this.#polygon_style_highlights.set(geojson_layer, params.polygon_style_highlight.bind(this));
        } else {
            this.#polygon_style_highlights.set(geojson_layer, params.polygon_style_highlight);
        }

        this.#feature_group.addLayer(geojson_layer);
        geojson_layer.eachLayer(layer => {
            layer.feature._origin = this.#feature_group.getLayerId(geojson_layer);
        });
    }

    /**
     * Get a map of all layers.
     * @returns Map<id, layers[]>
     */
    getAllLayers() {
        return this.#layers;
    }

    /**
     * Get the group layer which contains all markers and polygons.
     * @returns L.LayerGroup
     */
    getGroup() {
        return this.#feature_group;
    }

    /**
     * Get the outer bounds of this entire layer group.
     * @returns L.LatLngBounds
     */
    getGroupBounds() {
        var bounds = L.latLngBounds();

        this.#layers.forEach((layers, key) => {
            bounds.extend(this.#getLayerBounds(key));
        });

        return bounds;
    }

    /**
     * Check if this layer group has a feature.
     * @param {string} id Feature ID
     * @returns boolean
     */
    hasFeature(id) {
        return this.#layers.has(id);
    }

    /**
     * Highlight a feature.
     * @param {string} id Feature ID
     */
    highlightFeature(id) {
        this.#getLayers(id).forEach(layer => {
            if (layer instanceof L.Path) {
                this.#highlightPolygon(layer);
            } else {
                // Marker
                this.#highlightPoint(layer);
            }
        });

        this.#interactive_map.getMap().on('click', () => { this.removeFeatureHighlight(id); });
    }

    /**
     * Check if this is a lay which should be visible by default.
     * @returns boolean
     */
    isDefault() {
        return this.#is_default;
    }

    /**
     * Remove all currently active highlights for this layer group.
     */
    removeAllHighlights() {
        this.#highlighted_layers.forEach(layer => {
            if (layer instanceof L.Path) {
                this.#removePolygonHighlight(layer);
            } else {
                this.#removePointHighlight(layer);
            }
        });

        this.#highlighted_layers = [];
        this.#interactive_map.getMap().off('click', this.removeAllHighlights, this);
    }

    /**
     * Remove a active highlight for a feature.
     * @param {string} id Feature ID
     */
    removeFeatureHighlight(id) {
        // Remove from the same array that gets iterated
        // https://stackoverflow.com/a/24813338
        var layers = this.#getLayers(id);

        for (const index of this.#reverseKeys(this.#highlighted_layers)) {
            var layer = this.#highlighted_layers[index];

            if (!layers.includes(layer)) {
                continue;
            }

            if (layer instanceof L.Path) {
                this.#removePolygonHighlight(layer);
                this.#highlighted_layers.splice(index, 1);
            } else {
                this.#removePointHighlight(layer);
                this.#highlighted_layers.splice(index, 1);
            }
        }

        this.#interactive_map.getMap().off('click', () => { this.removeFeatureHighlight(id); });
    }

    /**
     * Remove a layer from the layer group.
     * @param {L.Layer} layer L.Layer to remove.
     */
    removeLayer(layer) {
        this.#getGroupForEdit(layer).removeLayer(layer);
    }

    /**
     * Set the amount of columns of the sidebar grid.
     * @returns Nothing
     */
    setSidebarColumnCount() {
        if (!this.#sidebar_list_html) {
            return;
        }

        var length = 4;
        var columns = 1;

        this.#layers.forEach((layer, id) => {
            if (id.length > length) {
                length = id.length;
            }
        });

        if (length < 5) {
            columns = 3;
        } else if (length < 15) {
            columns = 2;
        }

        this.#sidebar_list_html.setAttribute('style', `grid-template-columns: repeat(${columns}, auto)`);
    }

    /**
     * Show this layer group on the map.
     */
    show() {
        this.getGroup().addTo(this.#interactive_map.getMap());
    }

    /**
     * Zoom to this layer group.
     */
    zoomTo() {
        this.#interactive_map.zoomToBounds(this.getGroupBounds());
    }

    /**
     * Zoom to a specific feature.
     * @param {string} id Feature ID
     * @returns Nothing
     */
    zoomToFeature(id) {
        var layers = this.#getLayers(id);

        if (layers.length > 1) {
            // Multiple features
            this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
            return;
        }

        var layer = layers[0];

        if (layer instanceof L.Path) {
            // Polygon
            this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
            return;
        }

        var group = this.#getGroupForEdit(layer);

        if (group instanceof L.MarkerClusterGroup && group.hasLayer(layer)) {
            // Single Point
            group.zoomToShowLayer(layer, () => {
                // Zoom in further if we can
                window.setTimeout(() => {
                    if (this.#interactive_map.getMap().getZoom() < this.#interactive_map.getMaxZoom()) {
                        this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
                    }
                }, 300);
            });
            return;
        }

        // not visible
        this.#interactive_map.zoomToBounds(this.#getLayerBounds(id));
    }

    /**
     * Add a layer back to the group it belongs to. That should be the original L.geoJSON but has to be the the parent MarkerCluster if the geoJSON was added to a marker cluster.
     * @param {L.Layer} layer L.Layer
     */
    #addLayer(layer) {
        this.#getGroupForEdit(layer).addLayer(layer);
    }

    /**
     * Create a popup for a feature.
     * @param {object} feature Original feature object
     * @param {L.Layer} layer Resulting layer
     */
    #createFeaturePopup(feature, layer) {
        let content = function (layer) {
            var html = document.createElement('div');
            html.className = 'popup-id';
            html.id = `popup:${this.id}:${feature.properties.id}`;

            var title = document.createElement('h2');
            title.className = 'popup-title';
            title.innerHTML = feature.properties.name ? feature.properties.name : feature.properties.id;

            html.appendChild(title);

            let media_html = getPopupMedia(feature, this.id);
            if (media_html) {
                html.appendChild(media_html);
            }

            if (feature.properties.description) {
                var description = document.createElement('p');
                description.className = 'popup-description';
                var span = document.createElement('span');
                span.setAttribute('style', 'white-space: pre-wrap');
                span.appendChild(document.createTextNode(feature.properties.description));
                description.appendChild(span);

                html.appendChild(description);
            }

            // Checkbox requires a global counterpart
            if (this.#create_checkbox && document.getElementById(this.id + ':' + feature.properties.id)) {
                var label = document.createElement('label');
                label.className = 'popup-checkbox is-fullwidth';

                var label_text = document.createTextNode('Hide this marker');

                var checkbox = document.createElement('input');
                checkbox.type = 'checkbox';

                if (localStorage.getItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`)) {
                    checkbox.checked = true;
                }

                checkbox.addEventListener('change', element => {
                    if (element.target.checked) {
                        // check global checkbox
                        document.getElementById(this.id + ':' + feature.properties.id).checked = true;
                        // remove all with ID from map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#getGroupForEdit(l).removeLayer(l);
                        });
                        // save to localStorage
                        localStorage.setItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`, true);
                    } else {
                        // uncheck global checkbox
                        document.getElementById(this.id + ':' + feature.properties.id).checked = false;
                        // add all with ID to map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#addLayer(l);
                        });
                        // remove from localStorage
                        localStorage.removeItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`);
                    }
                });

                label.appendChild(checkbox);
                label.appendChild(label_text);
                html.appendChild(label);
            }

            return html;
        }.bind(this);

        layer.bindPopup(content, { maxWidth: "auto" });

        layer.on('popupopen', event => {
            this.#interactive_map.getShareMarker().removeMarker();
            Utils.setHistoryState(this.id, feature.properties.id);

            // Listen for size changes and update when it does
            for (const entry of document.getElementById(`popup:${this.id}:${feature.properties.id}`).getElementsByClassName('popup-media')) {
                this.#resize_observer.observe(entry);
            }
        }, this);

        layer.on('popupclose', event => {
            this.#interactive_map.getShareMarker().prevent();
            Utils.setHistoryState(undefined, undefined, this.#website_subdir);
            this.#resize_observer.disconnect();
        }, this);
    }

    /**
     * Create a sidebar checkbox for a feature if it doesn't already exist.
     * @param {object} feature Original feature object
     */
    #createSidebarCheckbox(feature) {
        if (!document.getElementById(this.id + ':' + feature.properties.id)) {
            var list_entry = document.createElement('li');
            list_entry.className = 'flex-grow-1';

            var leave_function = () => { this.removeFeatureHighlight(feature.properties.id); };
            list_entry.addEventListener('mouseenter', () => { this.highlightFeature(feature.properties.id); });
            list_entry.addEventListener('mouseleave', leave_function);

            var checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.id = this.id + ':' + feature.properties.id;
            checkbox.className = 'flex-grow-0';

            var label = document.createElement('label')
            label.appendChild(document.createTextNode(feature.properties.id + ' '));
            label.htmlFor = checkbox.id;
            label.className = 'flex-grow-1';

            var icon = document.createElement('i');
            icon.className = 'fas fa-crosshairs fa-xs';

            var locate_button = document.createElement('button');
            locate_button.innerHTML = icon.outerHTML;
            locate_button.addEventListener('click', () => {
                // Close sidebar if it spans over the complete view
                if (window.matchMedia('(max-device-width: 767px)').matches) {
                    this.#sidebar.close();
                }

                // rewrite url for easy copy pasta
                Utils.setHistoryState(this.id, feature.properties.id);

                this.#interactive_map.removeAllHighlights();
                this.highlightFeature(feature.properties.id);
                this.zoomToFeature(feature.properties.id);

                // tmp disable after button click
                list_entry.removeEventListener('mouseleave', leave_function);
                window.setTimeout(() => {
                    list_entry.addEventListener('mouseleave', leave_function);
                }, 3000);
            });
            locate_button.className = 'flex-grow-0';

            list_entry.appendChild(checkbox);
            list_entry.appendChild(label);
            list_entry.appendChild(locate_button);
            this.#sidebar_list_html.appendChild(list_entry);

            // hide if checked previously
            if (localStorage.getItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`)) {
                checkbox.checked = true;
            }

            // watch global checkbox
            if (document.getElementById(this.id + ':' + feature.properties.id) != null) {
                // if not a marker try to assign to the same checkbox as the corresponding marker
                document.getElementById(this.id + ':' + feature.properties.id).addEventListener('change', element => {
                    if (element.target.checked) {
                        // remove all layers with ID from map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#getGroupForEdit(l).removeLayer(l);
                        });
                        // save to localStorage
                        localStorage.setItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`, true);
                    } else {
                        // add all layers with ID to map
                        this.#getLayers(feature.properties.id).forEach(l => {
                            this.#addLayer(l);
                        });
                        // remove from localStorage
                        localStorage.removeItem(`${this.#website_subdir}:${this.id}:${feature.properties.id}`);
                    }
                });
            }
        }
    }

    /**
     * Create a sidebar tab for this layer group.
     * @param {string} icon_html Icon html
     * @returns HTMLUListElement
     */
    #createSidebarTab(icon_html) {
        var list = document.createElement('ul');
        list.className = 'collectibles_list';

        var icon = icon_html;

        if (icon_html instanceof Function) {
            icon = icon_html.bind(this);
            icon = icon();
        }

        // Add list to sidebar
        this.#sidebar.addPanel({
            id: this.id,
            tab: icon,
            title: this.name,
            pane: '<p></p>' // placeholder to get a proper pane
        });
        document.getElementById(this.id).appendChild(list);

        return list;
    }

    /**
     * Get the layer group for adding and removing layers. This can differ from their original layer group.
     * @param {L.Layer} layer Layer
     * @returns L.LayerGroup
     */
    #getGroupForEdit(layer) {
        // The group is the GeoJSON FeatureGroup
        var group = this.#feature_group.getLayer(layer.feature._origin);
        var parent_group = this.#feature_group;

        // Subgroups can be nested, get top level
        while (parent_group instanceof L.FeatureGroup.SubGroup) {
            parent_group = this.#feature_group.getParentGroup();
        }

        // There's an issue with marker from a geojson with marker cluster so we have use parent cluster then
        if (parent_group instanceof L.MarkerClusterGroup) {
            group = parent_group;
        }

        return group;
    }

    /**
     * Get all layers with a specific feature ID.
     * @param {string} id ID of features to retrieve.
     * @returns Array of layers with that feature ID.
     */
    #getLayers(id) {
        return this.#layers.get(id);
    }

    /**
     * Get the bounds of all layers with a feature ID
     * @param {string} id Feature ID
     * @returns L.LatLngBounds
     */
    #getLayerBounds(id) {
        var bounds = L.latLngBounds();

        this.#getLayers(id).forEach(layer => {
            if (layer instanceof L.Polyline) {
                // Polygons
                bounds.extend(layer.getBounds());
            } else if (layer instanceof L.Circle) {
                // FIXME: This somehow fails:
                // bounds.extend(layer.getBounds());
                // Do this in the meantime:
                var position = layer._latlng;
                var radius = layer._mRadius;
                bounds.extend([[position.lat - radius, position.lng - radius], [position.lat + radius, position.lng + radius]]);
            } else {
                // Point
                bounds.extend([layer.getLatLng()]);
            }
        });

        return bounds;
    }

    /**
     * Highlight a point (marker)
     * @param {L.Layer} layer Marker
     * @returns Nothing
     */
    #highlightPoint(layer) {
        if (this.#highlighted_layers.includes(layer)) {
            return;
        }

        var icon = layer.getIcon();
        icon.options.html = `<div class="map-marker-ping"></div>${icon.options.html}`;
        layer.setIcon(icon);

        this.#highlighted_layers.push(layer);
    }

    /**
     * Highlight a polygon
     * @param {L.Layer} layer Polygon
     * @returns Nothing
     */
    #highlightPolygon(layer) {
        if (this.#highlighted_layers.includes(layer)) {
            return;
        }

        this.#polygon_style_highlights.forEach((style, geojson) => {
            if (geojson.hasLayer(layer)) {
                if (style instanceof Function) {
                    layer.setStyle(style(layer.feature));
                } else {
                    layer.setStyle(style);
                }
            }
        });


        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }

        this.#highlighted_layers.push(layer);
    }

    /**
     * Remove a highlight from a point (marker)
     * @param {L.Layer} layer Marker
     * @returns Nothing
     */
    #removePointHighlight(layer) {
        if (!this.#highlighted_layers.includes(layer)) {
            return;
        }

        var icon = layer.getIcon();
        icon.options.html = icon.options.html.replace('<div class="map-marker-ping"></div>', '');
        layer.setIcon(icon);
    }

    /**
     * Remove a highlight from a polygon. If no layer is specified the whole geoJson will remove the highlight.
     * @param {L.Layer} [layer=undefined] Polygon
     * @returns Nothing
     */
    #removePolygonHighlight(layer = undefined) {
        if (layer) {
            if (!this.#highlighted_layers.includes(layer)) {
                return;
            }

            this.#geojsons.forEach(geojson => {
                if (geojson.hasLayer(layer)) {
                    geojson.resetStyle(layer);
                    return;
                }
            });
            return;
        }

        this.#geojsons.forEach(geojson => {
            geojson.resetStyle(layer);
        });
    }

    // For removeFeatureHighlight()
    // https://stackoverflow.com/a/24813338
    * #reverseKeys(arr) {
        var key = arr.length - 1;

        while (key >= 0) {
            yield key;
            key -= 1;
        }
    }

    /**
     * Map a layer to a feature ID.
     * @param {string} id Feature ID
     * @param {L.Layer} layer Feature layer
     */
    #setFeature(id, layer) {
        if (!this.#layers.has(id)) {
            this.#layers.set(id, new Array());
        }

        this.#layers.get(id).push(layer);
    }
}
